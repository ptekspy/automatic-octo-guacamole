import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from "react";
import { DEFAULT_NOTE_SIZE } from "../domain/constants";
import { containsPoint, fitRect } from "../domain/geometry";
import {
  gestureRect,
  type Gesture,
  type GestureSubject,
} from "../domain/gesture";
import type { Note, Point, Rect } from "../domain/model";
import type { NotesStore } from "../store/NotesStore";

interface Options {
  boardRef: RefObject<HTMLDivElement | null>;
  trashRef: RefObject<HTMLDivElement | null>;
  store: NotesStore;
  add: (rect: Rect) => void;
  front: (id: string) => void;
  remove: (id: string) => void;
  announce: (message: string) => void;
}
export function usePointerGesture({
  boardRef,
  trashRef,
  store,
  add,
  front,
  remove,
  announce,
}: Options) {
  const session = useRef<Gesture | null>(null);
  const frame = useRef<number | null>(null);
  const [preview, setPreview] = useState<(Rect & { id: string | null }) | null>(
    null,
  );
  const [overTrash, setOverTrash] = useState(false);
  const clearFrame = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);
  const cancel = useCallback(() => {
    const gesture = session.current;
    session.current = null;
    clearFrame();
    setPreview(null);
    setOverTrash(false);
    if (gesture && boardRef.current?.hasPointerCapture(gesture.pointerId))
      boardRef.current.releasePointerCapture(gesture.pointerId);
  }, [boardRef, clearFrame]);
  useEffect(() => {
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("blur", cancel);
      clearFrame();
    };
  }, [cancel, clearFrame]);
  const hitsTrash = useCallback(
    (point: Point) => {
      const rect = trashRef.current?.getBoundingClientRect();
      return (
        !!rect &&
        containsPoint(
          { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
          point,
        )
      );
    },
    [trashRef],
  );
  const start = useCallback(
    (event: PointerEvent<HTMLElement>, subject: GestureSubject) => {
      const board = boardRef.current;
      if (event.button !== 0 || session.current || !board) return;
      event.preventDefault();
      event.stopPropagation();
      const rect = board.getBoundingClientRect();
      const gesture: Gesture = {
        ...subject,
        pointerId: event.pointerId,
        start: { x: event.clientX, y: event.clientY },
        origin: { x: rect.left, y: rect.top },
        bounds: { width: board.clientWidth, height: board.clientHeight },
      };
      session.current = gesture;
      if (gesture.kind !== "draw") {
        front(gesture.note.id);
        event.currentTarget.focus({ preventScroll: true });
      }
      board.setPointerCapture(event.pointerId);
      setPreview({
        ...gestureRect(gesture, gesture.start),
        id: gesture.kind === "draw" ? null : gesture.note.id,
      });
    },
    [boardRef, front],
  );
  const startNote = useCallback(
    (
      event: PointerEvent<HTMLButtonElement>,
      note: Note,
      kind: "move" | "resize",
    ) => start(event, { kind, note }),
    [start],
  );
  const move = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const gesture = session.current;
      if (!gesture || gesture.pointerId !== event.pointerId) return;
      const point = { x: event.clientX, y: event.clientY };
      clearFrame();
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        setPreview({
          ...gestureRect(gesture, point),
          id: gesture.kind === "draw" ? null : gesture.note.id,
        });
        setOverTrash(gesture.kind === "move" && hitsTrash(point));
      });
    },
    [clearFrame, hitsTrash],
  );
  const end = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const gesture = session.current;
      if (!gesture || gesture.pointerId !== event.pointerId) return;
      const point = { x: event.clientX, y: event.clientY },
        rect = gestureRect(gesture, point);
      cancel();
      if (gesture.kind === "draw") {
        const tiny =
          Math.hypot(point.x - gesture.start.x, point.y - gesture.start.y) < 8;
        add(
          tiny
            ? fitRect(
                {
                  ...DEFAULT_NOTE_SIZE,
                  x: gesture.start.x - gesture.origin.x,
                  y: gesture.start.y - gesture.origin.y,
                },
                gesture.bounds,
              )
            : rect,
        );
      } else if (gesture.kind === "move" && hitsTrash(point))
        remove(gesture.note.id);
      else {
        store.dispatch({ type: "update", id: gesture.note.id, patch: rect });
        announce(
          gesture.kind === "move"
            ? "Note moved."
            : `Note resized to ${Math.round(rect.width)} by ${Math.round(rect.height)} pixels.`,
        );
      }
    },
    [add, announce, cancel, hitsTrash, remove, store],
  );
  return { preview, overTrash, start, startNote, move, end, cancel };
}
