import { describe, expect, it } from "vitest";
import { boardReducer, type BoardState } from "./board";
import { MAX_NOTES } from "./constants";
import { INITIAL_NOTES } from "./seed";
import { decodeNotes } from "./validation";

describe("board invariants", () => {
  const fullBoard = (): BoardState => ({
    notes: Array.from({ length: MAX_NOTES }, (_, index) => ({
      ...INITIAL_NOTES[0]!,
      id: `note-${index}`,
    })),
    undo: null,
  });
  it("keeps a full board reloadable after delete, replacement, and undo", () => {
    let state = fullBoard();
    state = boardReducer(state, { type: "delete", id: "note-0" });
    state = boardReducer(state, {
      type: "add",
      note: { ...INITIAL_NOTES[0]!, id: "replacement" },
    });
    expect(state.undo).toBeNull();
    state = boardReducer(state, { type: "undo" });
    expect(state.notes).toHaveLength(MAX_NOTES);
    expect(
      decodeNotes(JSON.stringify({ version: 1, notes: state.notes })),
    ).toEqual(state.notes);
  });
  it("enforces capacity and unique identifiers in the reducer itself", () => {
    const full = fullBoard();
    expect(
      boardReducer(full, {
        type: "add",
        note: { ...INITIAL_NOTES[0]!, id: "overflow" },
      }),
    ).toBe(full);
    const state = { notes: INITIAL_NOTES, undo: null };
    expect(boardReducer(state, { type: "add", note: INITIAL_NOTES[0]! })).toBe(
      state,
    );
  });
  it("does not create changes for missing IDs, invalid edits, or unchanged geometry", () => {
    const state = { notes: INITIAL_NOTES, undo: null };
    expect(
      boardReducer(state, {
        type: "update",
        id: "missing",
        patch: { text: "test" },
      }),
    ).toBe(state);
    expect(
      boardReducer(state, {
        type: "update",
        id: "welcome",
        patch: { width: -1 },
      }),
    ).toBe(state);
    expect(
      boardReducer(state, {
        type: "update",
        id: "welcome",
        patch: { x: INITIAL_NOTES[0]!.x },
      }),
    ).toBe(state);
  });
});
