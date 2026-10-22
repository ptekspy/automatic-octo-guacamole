import { describe, expect, it } from "vitest";
import { moveRect, resizeRect } from "./geometry";
import { gestureRect, type Gesture } from "./gesture";
import { INITIAL_NOTES } from "./seed";

describe("shared pointer and keyboard constraints", () => {
  it("clamps resizing at both limits without moving the note origin", () => {
    const rect = { x: 100, y: 90, width: 270, height: 250 };
    const bounds = { width: 800, height: 500 };
    expect(resizeRect(rect, { x: -1000, y: -1000 }, bounds)).toEqual({
      x: 100,
      y: 90,
      width: 180,
      height: 160,
    });
    expect(resizeRect(rect, { x: 1000, y: 1000 }, bounds)).toEqual({
      x: 100,
      y: 90,
      width: 700,
      height: 410,
    });
    expect(moveRect(rect, { x: -1000, y: 1000 }, bounds)).toEqual({
      x: 0,
      y: 250,
      width: 270,
      height: 250,
    });
  });
  for (const kind of ["move", "resize"] as const) {
    it(`uses the same ${kind} bounds for both input methods`, () => {
      const note = INITIAL_NOTES[0]!,
        bounds = { width: 800, height: 500 },
        delta = { x: 1000, y: -1000 };
      const gesture: Gesture = {
        kind,
        note,
        bounds,
        pointerId: 1,
        start: { x: 120, y: 120 },
        origin: { x: 24, y: 104 },
      };
      expect(gestureRect(gesture, { x: 1120, y: -880 })).toEqual(
        (kind === "move" ? moveRect : resizeRect)(note, delta, bounds),
      );
    });
  }
});
