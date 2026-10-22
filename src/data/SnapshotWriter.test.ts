import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SnapshotWriter } from "./SnapshotWriter";
import { INITIAL_NOTES } from "../domain/seed";

describe("bounded local persistence", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  function setup() {
    const setItem = vi.fn(),
      onError = vi.fn(),
      onSuccess = vi.fn();
    const writer = new SnapshotWriter({
      storage: { getItem: () => null, setItem },
      snapshot: () => ({ notes: INITIAL_NOTES, revision: 0, dirty: true }),
      onError,
      onSuccess,
    });
    return { writer, setItem, onError };
  }
  it("coalesces rapid edits into one serialization and write", () => {
    const { writer, setItem } = setup();
    for (let index = 0; index < 100; index++) {
      writer.schedule();
      vi.advanceTimersByTime(1);
    }
    expect(setItem).not.toHaveBeenCalled();
    vi.advanceTimersByTime(150);
    expect(setItem).toHaveBeenCalledTimes(1);
  });
  it("writes within the maximum wait during continuous typing", () => {
    const { writer, setItem } = setup();
    for (let index = 0; index < 20; index++) {
      writer.schedule();
      vi.advanceTimersByTime(50);
    }
    expect(setItem).toHaveBeenCalledTimes(1);
  });
  it("flushes pending work immediately when leaving the page", () => {
    const { writer, setItem } = setup();
    writer.schedule();
    writer.flush();
    expect(setItem).toHaveBeenCalledTimes(1);
    vi.runAllTimers();
    expect(setItem).toHaveBeenCalledTimes(1);
  });
  it("reports storage failures without throwing", () => {
    const { writer, setItem, onError } = setup();
    setItem.mockImplementation(() => {
      throw new Error("Quota");
    });
    writer.schedule();
    expect(() => writer.flush()).not.toThrow();
    expect(onError).toHaveBeenCalledOnce();
  });
});
