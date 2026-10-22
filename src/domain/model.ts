export const COLORS = ["butter", "rose", "sage", "sky", "lavender"] as const;
export type NoteColor = (typeof COLORS)[number];
export interface Point {
  x: number;
  y: number;
}
export interface Size {
  width: number;
  height: number;
}
export type Rect = Point & Size;
export interface Note extends Rect {
  id: string;
  text: string;
  color: NoteColor;
}
export interface RemoteBoard {
  notes: Note[];
  revision: number;
}
export interface Snapshot extends RemoteBoard {
  dirty: boolean;
}
export type NotePatch = Partial<Omit<Note, "id">>;
