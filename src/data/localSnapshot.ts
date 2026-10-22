import { LOCAL_STORAGE_KEY, SNAPSHOT_VERSION } from "../domain/constants";
import type { Snapshot } from "../domain/model";
import { INITIAL_NOTES } from "../domain/seed";
import { isRecord, isRevision, parseNotes } from "../domain/validation";

export type StoragePort = Pick<Storage, "getItem" | "setItem">;
export function readSnapshot(storage: StoragePort): Snapshot {
  const raw = storage.getItem(LOCAL_STORAGE_KEY);
  if (raw === null) return { notes: INITIAL_NOTES, revision: 0, dirty: false };
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error(
      "Saved notes could not be read. Your original saved data has been kept.",
    );
  }
  const notes = parseNotes(value);
  if (!notes || !isRecord(value))
    throw new Error(
      "Saved notes could not be read. Your original saved data has been kept.",
    );
  return {
    notes,
    revision: isRevision(value.revision) ? value.revision : 0,
    dirty: value.dirty === true,
  };
}
export function writeSnapshot(storage: StoragePort, snapshot: Snapshot): void {
  storage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({ version: SNAPSHOT_VERSION, ...snapshot }),
  );
}
