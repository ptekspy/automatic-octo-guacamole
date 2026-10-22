import { useCallback, useState, type RefObject } from "react";
import { DEFAULT_NOTE_SIZE, MAX_NOTES } from "../domain/constants";
import { fitRect } from "../domain/geometry";
import type { NoteColor, Rect } from "../domain/model";
import type { NotesStore } from "../store/NotesStore";
import { useNoteFocus } from "./useNoteFocus";

export function useBoardActions(
  store: NotesStore,
  boardRef: RefObject<HTMLDivElement | null>,
  color: NoteColor,
) {
  const [creating, setCreating] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const focusNote = useNoteFocus(boardRef);
  const addNote = useCallback(
    (rect: Rect) => {
      setCreating(false);
      if (store.getSnapshot().notes.length >= MAX_NOTES) {
        setNotice(
          "This board holds up to 1,000 notes. Delete a note to make room.",
        );
        return;
      }
      const note = { ...rect, id: crypto.randomUUID(), text: "", color };
      if (!store.dispatch({ type: "add", note })) return;
      setActiveId(note.id);
      setNotice("Note created. Start typing.");
      focusNote(note.id, "editor");
    },
    [store, color, focusNote],
  );
  const quickNote = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;
    const offset = (store.getSnapshot().notes.length % 6) * 22;
    addNote(
      fitRect(
        {
          ...DEFAULT_NOTE_SIZE,
          x: board.clientWidth / 2 - DEFAULT_NOTE_SIZE.width / 2 + offset,
          y: board.clientHeight / 2 - DEFAULT_NOTE_SIZE.height / 2 + offset / 2,
        },
        { width: board.clientWidth, height: board.clientHeight },
      ),
    );
  }, [addNote, boardRef, store]);
  const front = useCallback(
    (id: string) => {
      setActiveId(id);
      store.dispatch({ type: "front", id });
    },
    [store],
  );
  const text = useCallback(
    (id: string, text: string) => {
      store.dispatch({ type: "update", id, patch: { text } });
    },
    [store],
  );
  const recolor = useCallback(
    (id: string, color: NoteColor) => {
      store.dispatch({ type: "update", id, patch: { color } });
    },
    [store],
  );
  const remove = useCallback(
    (id: string) => {
      if (!store.dispatch({ type: "delete", id })) return;
      setActiveId(null);
      setNotice("Note deleted. Undo is available.");
      boardRef.current?.focus({ preventScroll: true });
    },
    [store, boardRef],
  );
  const undo = useCallback(() => {
    const note = store.getSnapshot().undo?.note;
    if (!store.dispatch({ type: "undo" }) || !note) return;
    const board = boardRef.current;
    if (board)
      store.dispatch({
        type: "fit",
        bounds: { width: board.clientWidth, height: board.clientHeight },
      });
    setNotice("Note restored.");
    setActiveId(note.id);
    focusNote(note.id, "handle");
  }, [store, focusNote, boardRef]);
  const toggleCreation = useCallback(() => {
    setCreating((value) => !value);
    setNotice("Draw on the board, or press Enter for a centered note.");
    boardRef.current?.focus();
  }, [boardRef]);
  const stopCreating = useCallback(() => {
    setCreating(false);
  }, []);
  const deselect = useCallback(() => {
    setActiveId(null);
  }, []);
  return {
    creating,
    activeId,
    notice,
    announce: setNotice,
    addNote,
    quickNote,
    front,
    text,
    recolor,
    remove,
    undo,
    toggleCreation,
    stopCreating,
    deselect,
  };
}
