import {
  boardReducer,
  type BoardAction,
  type BoardState,
} from "../domain/board";
import { REMOTE_SAVE_DELAY } from "../domain/constants";
import { INITIAL_NOTES } from "../domain/seed";
import { ConflictError, type BoardApi } from "../data/boardApi";
import { readSnapshot, type StoragePort } from "../data/localSnapshot";
import { SnapshotWriter } from "../data/SnapshotWriter";
import type { StoreView } from "./types";

export class NotesStore {
  private view: StoreView;
  private listeners = new Set<() => void>();
  private revision = 0;
  private dirty = false;
  private generation = 0;
  private running = false;
  private loading = true;
  private saving = false;
  private blockedLocal = false;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private controller: AbortController | undefined;
  private writer: SnapshotWriter;

  constructor(
    storage: StoragePort,
    private api: BoardApi,
  ) {
    let notes = INITIAL_NOTES;
    let localError: string | null = null;
    try {
      const snapshot = readSnapshot(storage);
      notes = snapshot.notes;
      this.revision = snapshot.revision;
      this.dirty = snapshot.dirty;
    } catch (error) {
      localError =
        error instanceof Error
          ? error.message
          : "Local storage is unavailable.";
      this.blockedLocal = true;
    }
    this.view = {
      notes,
      undo: null,
      status: "loading",
      localError,
      syncError: null,
    };
    this.writer = new SnapshotWriter({
      storage,
      snapshot: () => ({
        notes: this.view.notes,
        revision: this.revision,
        dirty: this.dirty,
      }),
      onSuccess: () => {
        if (this.view.localError) this.publish({ localError: null });
      },
      onError: () =>
        this.publish({
          localError:
            "Local saving is unavailable. Download a backup before closing this tab.",
        }),
    });
  }
  getSnapshot = (): StoreView => this.view;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private publish(patch: Partial<StoreView>): void {
    this.view = { ...this.view, ...patch };
    this.listeners.forEach((listener) => listener());
  }
  private persist(): void {
    if (!this.blockedLocal) this.writer.schedule();
  }
  flushLocal = (): void => {
    this.writer.flush();
  };

  dispatch = (action: BoardAction): boolean => {
    const next: BoardState = boardReducer(this.view, action);
    if (next === this.view) return false;
    this.generation++;
    this.dirty = true;
    const status =
      this.view.status === "conflict" || this.view.status === "error"
        ? this.view.status
        : this.loading
          ? "loading"
          : "pending";
    this.publish({ notes: next.notes, undo: next.undo, status });
    this.persist();
    this.schedule();
    return true;
  };
  start = (): (() => void) => {
    this.running = true;
    void this.load();
    return () => {
      this.flushLocal();
      this.running = false;
      clearTimeout(this.timer);
      this.controller?.abort();
    };
  };

  private async load(
    preference: "merge" | "local" | "remote" = "merge",
  ): Promise<void> {
    clearTimeout(this.timer);
    this.controller?.abort();
    const controller = new AbortController();
    this.controller = controller;
    this.loading = true;
    this.saving = false;
    this.publish({ status: "loading", syncError: null });
    const generation = this.generation;
    try {
      const remote = await this.api.load(controller.signal);
      if (controller.signal.aborted || !this.running) return;
      this.loading = false;
      const editedDuringLoad = generation !== this.generation;
      if (
        remote &&
        preference !== "local" &&
        (this.dirty || editedDuringLoad) &&
        !(preference === "remote" && !editedDuringLoad) &&
        remote.revision !== this.revision
      ) {
        this.publish({
          status: "conflict",
          syncError: new ConflictError().message,
        });
        return;
      }
      if (
        remote &&
        preference !== "local" &&
        !editedDuringLoad &&
        (!this.dirty || preference === "remote")
      ) {
        this.revision = remote.revision;
        this.dirty = false;
        this.publish({ notes: remote.notes, undo: null, status: "synced" });
      } else {
        this.revision = remote?.revision ?? 0;
        this.dirty = true;
        this.publish({ status: "pending" });
        this.schedule();
      }
      this.persist();
    } catch (error) {
      if (controller.signal.aborted || !this.running) return;
      this.loading = false;
      this.fail(error, "Could not load the remote board.");
    }
  }
  private schedule(): void {
    clearTimeout(this.timer);
    if (
      !this.running ||
      this.loading ||
      this.saving ||
      !this.dirty ||
      this.view.status === "conflict" ||
      this.view.status === "error"
    )
      return;
    this.timer = setTimeout(() => {
      void this.save();
    }, REMOTE_SAVE_DELAY);
  }
  private async save(): Promise<void> {
    if (!this.running || this.loading || this.saving) return;
    this.saving = true;
    const controller = new AbortController();
    this.controller = controller;
    const generation = this.generation;
    this.publish({ status: "syncing", syncError: null });
    try {
      const result = await this.api.save(
        this.view.notes,
        this.revision,
        controller.signal,
      );
      if (controller.signal.aborted || !this.running) return;
      this.revision = result.revision;
      this.dirty = generation !== this.generation;
      this.saving = false;
      this.publish({ status: this.dirty ? "pending" : "synced" });
      this.persist();
      this.schedule();
    } catch (error) {
      if (controller.signal.aborted || !this.running) return;
      this.saving = false;
      this.fail(error, "Could not save notes.");
    }
  }
  private fail(error: unknown, fallback: string): void {
    this.publish({
      status: error instanceof ConflictError ? "conflict" : "error",
      syncError: error instanceof Error ? error.message : fallback,
    });
  }
  retry = (): void => {
    void this.load();
  };
  acceptLocalStorage = (): void => {
    this.blockedLocal = false;
    this.persist();
    this.flushLocal();
  };
  keepLocal = (): Promise<void> => this.load("local");
  useRemote = (): void => {
    void this.load("remote");
  };
}
