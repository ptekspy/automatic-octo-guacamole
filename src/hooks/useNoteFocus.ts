import { useCallback, useEffect, useRef, type RefObject } from "react";

export function useNoteFocus(boardRef: RefObject<HTMLDivElement | null>) {
  const frame = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );
  return useCallback(
    (id: string, target: "editor" | "handle") => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const article = boardRef.current?.querySelector(
          `[data-note-id="${id}"]`,
        );
        article
          ?.querySelector<HTMLElement>(
            target === "editor" ? "textarea" : "[data-note-handle]",
          )
          ?.focus({ preventScroll: true });
      });
    },
    [boardRef],
  );
}
