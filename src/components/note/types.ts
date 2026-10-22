import type { KeyboardEvent, PointerEvent } from "react";
import type { Note, NoteColor } from "../../domain/model";
export interface NoteCardProps {
  note: Note;
  index: number;
  active: boolean;
  dragging: boolean;
  onFront: (id: string) => void;
  onText: (id: string, text: string) => void;
  onColor: (id: string, color: NoteColor) => void;
  onDelete: (id: string) => void;
  onGesture: (
    event: PointerEvent<HTMLButtonElement>,
    note: Note,
    kind: "move" | "resize",
  ) => void;
  onKey: (
    event: KeyboardEvent<HTMLButtonElement>,
    note: Note,
    kind: "move" | "resize",
  ) => void;
}
