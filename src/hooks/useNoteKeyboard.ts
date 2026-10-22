import { useCallback, type KeyboardEvent, type RefObject } from "react";
import { moveRect, resizeRect } from "../domain/geometry";
import type { Note, Point } from "../domain/model";
import type { NotesStore } from "../store/NotesStore";

const DIRECTIONS: Readonly<Record<string, Point>> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};
export function useNoteKeyboard(
  store: NotesStore,
  boardRef: RefObject<HTMLDivElement | null>,
  remove: (id: string) => void,
  announce: (message: string) => void,
) {
  return useCallback(
    (
      event: KeyboardEvent<HTMLButtonElement>,
      note: Note,
      kind: "move" | "resize",
    ) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        remove(note.id);
        return;
      }
      const direction = DIRECTIONS[event.key],
        board = boardRef.current;
      if (!direction || !board) return;
      event.preventDefault();
      const step = event.shiftKey ? 20 : 5;
      const delta = { x: direction.x * step, y: direction.y * step };
      const rect = (kind === "move" ? moveRect : resizeRect)(note, delta, {
        width: board.clientWidth,
        height: board.clientHeight,
      });
      store.dispatch({ type: "update", id: note.id, patch: rect });
      announce(
        kind === "move"
          ? `Note position ${Math.round(rect.x)}, ${Math.round(rect.y)}.`
          : `Note size ${Math.round(rect.width)} by ${Math.round(rect.height)}.`,
      );
    },
    [store, boardRef, remove, announce],
  );
}
