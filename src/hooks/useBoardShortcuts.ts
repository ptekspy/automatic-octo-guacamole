import { useCallback, type KeyboardEvent } from "react";
interface Shortcuts {
  cancel: () => void;
  create: () => void;
  undo: () => void;
  modalOpen: boolean;
  canUndo: boolean;
}
export function useBoardShortcuts({
  cancel,
  create,
  undo,
  modalOpen,
  canUndo,
}: Shortcuts) {
  return useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (modalOpen || event.nativeEvent.isComposing) return;
      if (event.key === "Escape") {
        cancel();
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.closest("textarea, input, select") || target.isContentEditable)
      )
        return;
      if (
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey &&
        !event.altKey &&
        event.key.toLowerCase() === "z" &&
        canUndo
      ) {
        event.preventDefault();
        undo();
      }
      if (
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        event.key.toLowerCase() === "n"
      ) {
        event.preventDefault();
        create();
      }
    },
    [cancel, create, undo, modalOpen, canUndo],
  );
}
