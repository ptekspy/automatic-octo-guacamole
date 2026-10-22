import { useEffect, useSyncExternalStore } from "react";
import type { NotesStore } from "../store/NotesStore";

export function useNotesStore(store: NotesStore) {
  const view = useSyncExternalStore(store.subscribe, store.getSnapshot);
  useEffect(() => {
    const stop = store.start();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") store.flushLocal();
    };
    window.addEventListener("pagehide", store.flushLocal);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", store.flushLocal);
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [store]);
  return view;
}
