import { SNAPSHOT_VERSION } from "../domain/constants";
import type { Note } from "../domain/model";

export function downloadBackup(notes: Note[]): void {
  const blob = new Blob(
    [JSON.stringify({ version: SNAPSHOT_VERSION, notes }, null, 2)],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob),
    anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "little-notes-backup.json";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
