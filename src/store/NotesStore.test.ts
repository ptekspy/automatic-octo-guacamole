import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBoardApi } from "../data/boardApi";
import { MockService } from "../data/mockService";
import { NotesStore } from "./NotesStore";
import { INITIAL_NOTES } from "../domain/seed";
import { LOCAL_STORAGE_KEY as STORAGE_KEY } from "../domain/constants";
import { readSnapshot, writeSnapshot } from "../data/localSnapshot";

function setup() {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  const mock = new MockService(storage, 200);
  const api = createBoardApi(mock.transport, "https://notes.test");
  const store = new NotesStore(storage, api);
  return { values, storage, api, store, mock };
}
describe("local-first synchronization", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("never overwrites edits made during the initial load", async () => {
    const { store, storage } = setup();
    const stop = store.start();
    store.dispatch({
      type: "update",
      id: "welcome",
      patch: { text: "While loading" },
    });
    await vi.advanceTimersByTimeAsync(1000);
    expect(store.getSnapshot().status).toBe("synced");
    expect(readSnapshot(storage).notes[0]?.text).toBe("While loading");
    stop();
  });
  it("serializes saves and syncs edits made during an in-flight request", async () => {
    const { store, storage, api } = setup();
    const stop = store.start();
    await vi.advanceTimersByTimeAsync(1000);
    store.dispatch({ type: "update", id: "welcome", patch: { text: "First" } });
    await vi.advanceTimersByTimeAsync(550);
    expect(store.getSnapshot().status).toBe("syncing");
    store.dispatch({
      type: "update",
      id: "welcome",
      patch: { text: "Newest" },
    });
    await vi.advanceTimersByTimeAsync(1000);
    expect(readSnapshot(storage).dirty).toBe(false);
    const remotePromise = api.load(new AbortController().signal);
    await vi.advanceTimersByTimeAsync(200);
    expect((await remotePromise)?.notes[0]?.text).toBe("Newest");
    stop();
  });
  it("keeps failed edits across reload and recovers on retry", async () => {
    const { store, storage, api, mock } = setup();
    const stop = store.start();
    await vi.advanceTimersByTimeAsync(1000);
    mock.failNextRequest();
    store.dispatch({
      type: "update",
      id: "welcome",
      patch: { text: "Keep this safe" },
    });
    await vi.advanceTimersByTimeAsync(1000);
    expect(store.getSnapshot().status).toBe("error");
    expect(readSnapshot(storage).dirty).toBe(true);
    stop();
    const restored = new NotesStore(storage, api);
    const stopRestored = restored.start();
    expect(restored.getSnapshot().notes[0]?.text).toBe("Keep this safe");
    await vi.advanceTimersByTimeAsync(1000);
    expect(restored.getSnapshot().status).toBe("synced");
    stopRestored();
  });
  it("detects a stale revision and requires an explicit resolution", async () => {
    const { store, storage, api } = setup();
    const stop = store.start();
    await vi.advanceTimersByTimeAsync(1000);
    const external = api.save(INITIAL_NOTES, 1, new AbortController().signal);
    await vi.advanceTimersByTimeAsync(200);
    await external;
    store.dispatch({
      type: "update",
      id: "welcome",
      patch: { text: "Local version" },
    });
    await vi.advanceTimersByTimeAsync(1000);
    expect(store.getSnapshot().status).toBe("conflict");
    expect(readSnapshot(storage).notes[0]?.text).toBe("Local version");
    const resolve = store.keepLocal();
    await vi.advanceTimersByTimeAsync(1000);
    await resolve;
    expect(store.getSnapshot().status).toBe("synced");
    stop();
  });
  it("preserves corrupt original storage until the user chooses recovery", async () => {
    const { storage, api } = setup();
    storage.setItem(STORAGE_KEY, "broken");
    const store = new NotesStore(storage, api);
    const stop = store.start();
    store.dispatch({
      type: "update",
      id: "welcome",
      patch: { text: "Recovered" },
    });
    await vi.advanceTimersByTimeAsync(1000);
    expect(storage.getItem(STORAGE_KEY)).toBe("broken");
    expect(store.getSnapshot().localError).toBeTruthy();
    store.acceptLocalStorage();
    expect(readSnapshot(storage).notes[0]?.text).toBe("Recovered");
    stop();
  });
  it("restores a newer remote board when the local snapshot is clean", async () => {
    const { storage, api } = setup();
    const save = api.save(
      [{ ...INITIAL_NOTES[0]!, text: "Remote version" }],
      0,
      new AbortController().signal,
    );
    await vi.advanceTimersByTimeAsync(200);
    await save;
    writeSnapshot(storage, { notes: INITIAL_NOTES, revision: 0, dirty: false });
    const store = new NotesStore(storage, api);
    const stop = store.start();
    await vi.advanceTimersByTimeAsync(200);
    expect(store.getSnapshot().notes[0]?.text).toBe("Remote version");
    stop();
  });
  it("aborts an unmounted load without starting a save", async () => {
    const { store, storage } = setup();
    const stop = store.start();
    stop();
    await vi.advanceTimersByTimeAsync(3000);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });
  it("rejects one of two saves with the same revision", async () => {
    const { api } = setup();
    const results = Promise.allSettled([
      api.save(INITIAL_NOTES, 0, new AbortController().signal),
      api.save([], 0, new AbortController().signal),
    ]);
    await vi.advanceTimersByTimeAsync(200);
    const settled = await results;
    expect(
      settled.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      settled.filter((result) => result.status === "rejected"),
    ).toHaveLength(1);
  });
});
