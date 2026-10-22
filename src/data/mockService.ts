import { MOCK_STORAGE_KEY, SNAPSHOT_VERSION } from "../domain/constants";
import { parseRemoteBoard } from "../domain/validation";
import type { FetchPort } from "./boardApi";
import type { StoragePort } from "./localSnapshot";

interface MockSettings {
  latency: number;
  failNext: boolean;
}
function delay(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const cancel = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", cancel);
      resolve();
    }, milliseconds);
    signal.addEventListener("abort", cancel, { once: true });
  });
}

export class MockService {
  private settings: MockSettings;
  private listeners = new Set<() => void>();
  constructor(
    private storage: StoragePort,
    latency = 650,
  ) {
    this.settings = { latency, failNext: false };
  }
  getSnapshot = (): MockSettings => this.settings;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  setLatency = (latency: number): void => {
    this.update({ latency });
  };
  failNextRequest = (): void => {
    this.update({ failNext: true });
  };
  private update(patch: Partial<MockSettings>): void {
    this.settings = { ...this.settings, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  // An injected asynchronous transport keeps the production REST client independent of the demo.
  transport: FetchPort = async (request) => {
    await delay(this.settings.latency, request.signal);
    if (this.settings.failNext) {
      this.update({ failNext: false });
      return new Response(null, { status: 503 });
    }
    if (new URL(request.url).pathname !== "/api/notes")
      return new Response(null, { status: 404 });
    if (request.method !== "GET" && request.method !== "PUT")
      return new Response(null, { status: 405 });
    let incoming = null;
    if (request.method === "PUT") {
      try {
        const value: unknown = await request.json();
        incoming = parseRemoteBoard(value);
      } catch {
        return new Response(null, { status: 400 });
      }
      if (!incoming) return new Response(null, { status: 400 });
    }
    try {
      const raw = this.storage.getItem(MOCK_STORAGE_KEY);
      const value: unknown = raw === null ? null : JSON.parse(raw);
      const remote = raw === null ? null : parseRemoteBoard(value);
      if (raw !== null && !remote) return new Response(null, { status: 500 });
      if (!incoming)
        return raw === null
          ? new Response(null, { status: 404 })
          : new Response(raw);
      if (incoming.revision !== (remote?.revision ?? 0))
        return new Response(null, { status: 409 });
      const body = JSON.stringify({
        version: SNAPSHOT_VERSION,
        notes: incoming.notes,
        revision: incoming.revision + 1,
      });
      this.storage.setItem(MOCK_STORAGE_KEY, body);
      return new Response(body, {
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(null, { status: 500 });
    }
  };
}
