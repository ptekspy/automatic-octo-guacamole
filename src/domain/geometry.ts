import { MIN_NOTE_SIZE } from "./constants";
import type { Note, Point, Rect, Size } from "./model";

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), Math.max(min, max));
export function fitRect(rect: Rect, bounds: Size): Rect {
  const width = clamp(rect.width, MIN_NOTE_SIZE.width, bounds.width);
  const height = clamp(rect.height, MIN_NOTE_SIZE.height, bounds.height);
  return {
    width,
    height,
    x: clamp(rect.x, 0, bounds.width - width),
    y: clamp(rect.y, 0, bounds.height - height),
  };
}
export function fitNote(note: Note, bounds: Size): Note {
  return { ...note, ...fitRect(note, bounds) };
}
export function moveRect(rect: Rect, delta: Point, bounds: Size): Rect {
  return fitRect({ ...rect, x: rect.x + delta.x, y: rect.y + delta.y }, bounds);
}
export function resizeRect(rect: Rect, delta: Point, bounds: Size): Rect {
  return {
    x: rect.x,
    y: rect.y,
    width: clamp(
      rect.width + delta.x,
      MIN_NOTE_SIZE.width,
      bounds.width - rect.x,
    ),
    height: clamp(
      rect.height + delta.y,
      MIN_NOTE_SIZE.height,
      bounds.height - rect.y,
    ),
  };
}
export function drawnRect(start: Point, end: Point, bounds: Size): Rect {
  return fitRect(
    {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    },
    bounds,
  );
}
export function containsPoint(rect: Rect, point: Point): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}
export function sameRect(a: Rect, b: Rect): boolean {
  return (
    a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
  );
}
