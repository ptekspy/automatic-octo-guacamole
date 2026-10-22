import { MAX_NOTES } from "./constants";
import { fitNote, sameRect } from "./geometry";
import type { Note, NotePatch, Size } from "./model";
import { isNote } from "./validation";

export interface BoardState {
  notes: Note[];
  undo: { note: Note; index: number } | null;
}
export type BoardAction =
  | { type: "add"; note: Note }
  | { type: "update"; id: string; patch: NotePatch }
  | { type: "front"; id: string }
  | { type: "delete"; id: string }
  | { type: "undo" }
  | { type: "fit"; bounds: Size };

export function boardReducer(
  state: BoardState,
  action: BoardAction,
): BoardState {
  switch (action.type) {
    case "add": {
      if (
        state.notes.length >= MAX_NOTES ||
        !isNote(action.note) ||
        state.notes.some((note) => note.id === action.note.id)
      )
        return state;
      const notes = [...state.notes, action.note];
      // Filling the last slot consumes deletion undo, so every offered restore is valid.
      return { notes, undo: notes.length === MAX_NOTES ? null : state.undo };
    }
    case "update": {
      const index = state.notes.findIndex((note) => note.id === action.id);
      const original = state.notes[index];
      if (!original) return state;
      const updated = { ...original, ...action.patch };
      if (
        !isNote(updated) ||
        (sameRect(original, updated) &&
          original.text === updated.text &&
          original.color === updated.color)
      )
        return state;
      const notes = [...state.notes];
      notes[index] = updated;
      return { ...state, notes };
    }
    case "front": {
      const note = state.notes.find((item) => item.id === action.id);
      return !note || state.notes.at(-1)?.id === action.id
        ? state
        : {
            ...state,
            notes: [
              ...state.notes.filter((item) => item.id !== action.id),
              note,
            ],
          };
    }
    case "delete": {
      const index = state.notes.findIndex((note) => note.id === action.id);
      const note = state.notes[index];
      return note
        ? {
            notes: state.notes.filter((item) => item.id !== action.id),
            undo: { note, index },
          }
        : state;
    }
    case "undo": {
      if (!state.undo || state.notes.length >= MAX_NOTES) return state;
      const notes = [...state.notes];
      notes.splice(state.undo.index, 0, state.undo.note);
      return { notes, undo: null };
    }
    case "fit": {
      let changed = false;
      const notes = state.notes.map((note) => {
        const fitted = fitNote(note, action.bounds);
        if (sameRect(note, fitted)) return note;
        changed = true;
        return fitted;
      });
      return changed ? { ...state, notes } : state;
    }
  }
}
