import { useLayoutEffect, type RefObject } from "react";
import type { NotesStore } from "../store/NotesStore";

export function useBoardBounds(
  boardRef: RefObject<HTMLDivElement | null>,
  store: NotesStore,
  cancelGesture: () => void,
) {
  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const fit = () => {
      if (store.getSnapshot().status !== "loading")
        store.dispatch({
          type: "fit",
          bounds: { width: board.clientWidth, height: board.clientHeight },
        });
    };
    const observer = new ResizeObserver(() => {
      cancelGesture();
      fit();
    });
    observer.observe(board);
    let wasLoading = store.getSnapshot().status === "loading";
    const unsubscribe = store.subscribe(() => {
      const loading = store.getSnapshot().status === "loading";
      const finishedLoading = wasLoading && !loading;
      wasLoading = loading;
      if (finishedLoading) fit();
    });
    fit();
    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, [boardRef, store, cancelGesture]);
}
