import { describe, expect, it } from "vitest";
import { decodeNotes } from "./validation";
import { drawnRect, fitNote } from "./geometry";
import { INITIAL_NOTES } from "./seed";
import { boardReducer, type BoardState } from "./board";
import { readSnapshot, writeSnapshot } from "../data/localSnapshot";

describe("geometry", () => {
  it("draws backwards and clamps the minimum rectangle to board edges", () => {
    expect(
      drawnRect(
        { x: 980, y: 690 },
        { x: 970, y: 680 },
        { width: 1000, height: 700 },
      ),
    ).toEqual({ x: 820, y: 540, width: 180, height: 160 });
    expect(
      drawnRect(
        { x: 500, y: 500 },
        { x: 200, y: 100 },
        { width: 1000, height: 700 },
      ),
    ).toEqual({ x: 200, y: 100, width: 300, height: 400 });
  });
  it("fits a large restored note into a smaller viewport without hiding it", () => {
    const note = fitNote(
      { ...INITIAL_NOTES[0]!, x: 900, y: 700, width: 1200, height: 900 },
      { width: 800, height: 450 },
    );
    expect(note).toMatchObject({ x: 0, y: 0, width: 800, height: 450 });
  });
});

describe("board transitions", () => {
  const initial: BoardState = { notes: INITIAL_NOTES, undo: null };
  it("brings a note forward without changing other relative order", () => {
    const next = boardReducer(initial, { type: "front", id: "welcome" });
    expect(next.notes.map((note) => note.id)).toEqual([
      "ideas",
      "how-to",
      "welcome",
    ]);
    expect(boardReducer(next, { type: "front", id: "welcome" })).toBe(next);
    expect(initial.notes.map((note) => note.id)).toEqual([
      "welcome",
      "ideas",
      "how-to",
    ]);
  });
  it("restores deleted content and its stacking position, preserving other edits", () => {
    let state = boardReducer(initial, { type: "delete", id: "ideas" });
    state = boardReducer(state, {
      type: "update",
      id: "welcome",
      patch: { text: "Changed" },
    });
    state = boardReducer(state, { type: "undo" });
    expect(state.notes[1]).toEqual(INITIAL_NOTES[1]);
    expect(state.notes[0]?.text).toBe("Changed");
    expect(state.undo).toBeNull();
  });
});

describe("local data boundary", () => {
  it("rejects malformed, duplicate, unsupported, and non-finite data", () => {
    for (const raw of [
      "{",
      "{}",
      JSON.stringify({ version: 2, notes: [] }),
      JSON.stringify({
        version: 1,
        notes: [INITIAL_NOTES[0], INITIAL_NOTES[0]],
      }),
      JSON.stringify({
        version: 1,
        notes: [{ ...INITIAL_NOTES[0], width: null }],
      }),
      JSON.stringify({
        version: 1,
        notes: [{ ...INITIAL_NOTES[0], color: "invalid" }],
      }),
    ])
      expect(decodeNotes(raw)).toBeNull();
  });
  it("preserves an intentionally empty board", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    };
    writeSnapshot(storage, { notes: [], revision: 4, dirty: true });
    expect(readSnapshot(storage)).toEqual({
      notes: [],
      revision: 4,
      dirty: true,
    });
  });
});
