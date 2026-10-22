import { LOCAL_SAVE_DELAY, LOCAL_SAVE_MAX_WAIT } from "../domain/constants";
import type { Snapshot } from "../domain/model";
import { writeSnapshot, type StoragePort } from "./localSnapshot";

interface WriterOptions {
  storage: StoragePort;
  snapshot: () => Snapshot;
  onSuccess: () => void;
  onError: () => void;
}
export class SnapshotWriter {
  private quietTimer: ReturnType<typeof setTimeout> | undefined;
  private maxTimer: ReturnType<typeof setTimeout> | undefined;
  private pending = false;
  constructor(private options: WriterOptions) {}
  schedule(): void {
    this.pending = true;
    clearTimeout(this.quietTimer);
    this.quietTimer = setTimeout(this.flush, LOCAL_SAVE_DELAY);
    this.maxTimer ??= setTimeout(this.flush, LOCAL_SAVE_MAX_WAIT);
  }
  flush = (): void => {
    clearTimeout(this.quietTimer);
    clearTimeout(this.maxTimer);
    this.quietTimer = undefined;
    this.maxTimer = undefined;
    if (!this.pending) return;
    this.pending = false;
    try {
      writeSnapshot(this.options.storage, this.options.snapshot());
      this.options.onSuccess();
    } catch {
      this.options.onError();
    }
  };
}
