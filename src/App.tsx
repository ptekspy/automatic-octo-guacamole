import { useCallback, useRef, useState } from "react";
import type { NoteColor } from "./domain/model";
import { createServices } from "./data/services";
import { downloadBackup } from "./data/downloadBackup";
import { useNotesStore } from "./hooks/useNotesStore";
import { useBoardActions } from "./hooks/useBoardActions";
import { usePointerGesture } from "./hooks/usePointerGesture";
import { useBoardBounds } from "./hooks/useBoardBounds";
import { useNoteKeyboard } from "./hooks/useNoteKeyboard";
import { useBoardShortcuts } from "./hooks/useBoardShortcuts";
import { BoardHeader } from "./components/board/BoardHeader";
import { CreationToolbar } from "./components/board/CreationToolbar";
import { BoardCanvas } from "./components/board/BoardCanvas";
import { BoardFooter } from "./components/board/BoardFooter";
import { UndoToast } from "./components/board/UndoToast";
import { HelpDialog } from "./components/dialogs/HelpDialog";
import { SyncDialog } from "./components/dialogs/SyncDialog";

export function App() {
  const [{ store, mock }] = useState(createServices);
  const view = useNotesStore(store);
  const [color, setColor] = useState<NoteColor>("butter");
  const [modal, setModal] = useState<"help" | "sync" | null>(null);
  const boardRef = useRef<HTMLDivElement>(null),
    trashRef = useRef<HTMLDivElement>(null);
  const actions = useBoardActions(store, boardRef, color);
  const gesture = usePointerGesture({
    boardRef,
    trashRef,
    store,
    add: actions.addNote,
    front: actions.front,
    remove: actions.remove,
    announce: actions.announce,
  });
  useBoardBounds(boardRef, store, gesture.cancel);
  const onNoteKey = useNoteKeyboard(
    store,
    boardRef,
    actions.remove,
    actions.announce,
  );
  const { cancel: cancelGesture } = gesture;
  const { stopCreating } = actions;
  const cancel = useCallback(() => {
    cancelGesture();
    stopCreating();
  }, [cancelGesture, stopCreating]);
  const onKeyDown = useBoardShortcuts({
    cancel,
    create: actions.quickNote,
    undo: actions.undo,
    modalOpen: modal !== null,
    canUndo: view.undo !== null,
  });
  const onDownload = () => downloadBackup(view.notes);
  return (
    <div
      onKeyDown={onKeyDown}
      className="relative h-screen min-h-[768px] bg-[#fafbf7] bg-[radial-gradient(#cbd3c1_0.8px,transparent_0.8px)] bg-size-[20px_20px] bg-position-[9px_9px]"
    >
      <BoardHeader
        count={view.notes.length}
        onHelp={() => setModal("help")}
        onFocusBoard={() => boardRef.current?.focus()}
      />
      <main className="absolute inset-0">
        <CreationToolbar
          color={color}
          creating={actions.creating}
          onColor={setColor}
          onToggle={actions.toggleCreation}
        />
        <section
          aria-label="Sticky notes workspace"
          className="absolute inset-0"
        >
          <BoardCanvas
            boardRef={boardRef}
            notes={view.notes}
            creating={actions.creating}
            color={color}
            activeId={actions.activeId}
            gesture={gesture}
            onDeselect={actions.deselect}
            onQuickNote={actions.quickNote}
            noteEvents={{
              onFront: actions.front,
              onText: actions.text,
              onColor: actions.recolor,
              onDelete: actions.remove,
              onGesture: gesture.startNote,
              onKey: onNoteKey,
            }}
          />
          <BoardFooter
            view={view}
            trashRef={trashRef}
            dragging={gesture.preview?.id != null}
            overTrash={gesture.overTrash}
            onSync={() => setModal("sync")}
            onDownload={onDownload}
          />
        </section>
      </main>
      {view.undo && <UndoToast onUndo={actions.undo} />}
      <div className="sr-only" role="status" aria-live="polite">
        {actions.notice}
      </div>
      <HelpDialog open={modal === "help"} onClose={() => setModal(null)} />
      <SyncDialog
        open={modal === "sync"}
        onClose={() => setModal(null)}
        view={view}
        store={store}
        mock={mock}
        onDownload={onDownload}
      />
    </div>
  );
}
