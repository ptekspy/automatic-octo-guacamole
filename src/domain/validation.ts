import {
  MAX_NOTES,
  MAX_TEXT_LENGTH,
  MIN_NOTE_SIZE,
  SNAPSHOT_VERSION,
} from "./constants";
import { COLORS, type Note, type RemoteBoard } from "./model";

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
export const isRevision = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
export function isNote(value: unknown): value is Note {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    /^[a-zA-Z0-9-]{1,80}$/.test(value.id) &&
    typeof value.text === "string" &&
    value.text.length <= MAX_TEXT_LENGTH &&
    COLORS.some((color) => color === value.color) &&
    finite(value.x) &&
    value.x >= 0 &&
    finite(value.y) &&
    value.y >= 0 &&
    finite(value.width) &&
    value.width >= MIN_NOTE_SIZE.width &&
    finite(value.height) &&
    value.height >= MIN_NOTE_SIZE.height
  );
}
export function parseNotes(value: unknown): Note[] | null {
  if (
    !isRecord(value) ||
    value.version !== SNAPSHOT_VERSION ||
    !Array.isArray(value.notes)
  )
    return null;
  const notes: unknown[] = value.notes;
  if (notes.length > MAX_NOTES || !notes.every(isNote)) return null;
  return new Set(notes.map((note) => note.id)).size === notes.length
    ? notes
    : null;
}
export function parseRemoteBoard(value: unknown): RemoteBoard | null {
  const notes = parseNotes(value);
  return notes && isRecord(value) && isRevision(value.revision)
    ? { notes, revision: value.revision }
    : null;
}
export function decodeNotes(raw: string): Note[] | null {
  try {
    const value: unknown = JSON.parse(raw);
    return parseNotes(value);
  } catch {
    return null;
  }
}
