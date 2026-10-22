import { drawnRect, moveRect, resizeRect } from "./geometry";
import type { Note, Point, Rect, Size } from "./model";

export type GestureSubject =
  { kind: "draw" } | { kind: "move" | "resize"; note: Note };
export type Gesture = GestureSubject & {
  pointerId: number;
  start: Point;
  origin: Point;
  bounds: Size;
};
export function gestureRect(gesture: Gesture, point: Point): Rect {
  if (gesture.kind === "draw")
    return drawnRect(
      {
        x: gesture.start.x - gesture.origin.x,
        y: gesture.start.y - gesture.origin.y,
      },
      { x: point.x - gesture.origin.x, y: point.y - gesture.origin.y },
      gesture.bounds,
    );
  const delta = { x: point.x - gesture.start.x, y: point.y - gesture.start.y };
  return (gesture.kind === "move" ? moveRect : resizeRect)(
    gesture.note,
    delta,
    gesture.bounds,
  );
}
