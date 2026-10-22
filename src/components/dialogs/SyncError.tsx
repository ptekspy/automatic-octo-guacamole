import type { NotesStore } from "../../store/NotesStore";
import type { StoreView } from "../../store/types";
import { Button } from "../ui/Button";

export function SyncError({
  view,
  store,
}: {
  view: StoreView;
  store: NotesStore;
}) {
  if (!view.localError && !view.syncError) return null;
  return (
    <div className="my-3.5 rounded-lg border border-[#e5c9b9] bg-[#f6e8e1] p-[15px]">
      {view.localError && (
        <>
          <p className="mb-3 text-xs leading-[1.8] text-[#895f4b]">
            {view.localError}
          </p>
          <Button variant="text" onClick={store.acceptLocalStorage}>
            Use the current board for local saving
          </Button>
        </>
      )}
      {view.syncError && (
        <>
          <p className="mb-3 text-xs leading-[1.8] text-[#895f4b]">
            {view.syncError}
          </p>
          {view.status === "conflict" ? (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  void store.keepLocal();
                }}
              >
                Keep this board
              </Button>
              <Button onClick={store.useRemote}>Use remote board</Button>
            </div>
          ) : (
            <Button onClick={store.retry}>Retry sync</Button>
          )}
        </>
      )}
    </div>
  );
}
