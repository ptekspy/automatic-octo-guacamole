import type { NotesStore } from "../../store/NotesStore";
import { SYNC_LABELS, type StoreView } from "../../store/types";
import type { MockService } from "../../data/mockService";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { StatusDot } from "../ui/StatusDot";
import { MockSettings } from "./MockSettings";
import { SyncError } from "./SyncError";

interface Props {
  open: boolean;
  onClose: () => void;
  view: StoreView;
  store: NotesStore;
  mock: MockService;
  onDownload: () => void;
}
export function SyncDialog({
  open,
  onClose,
  view,
  store,
  mock,
  onDownload,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Your ideas, kept safe."
      eyebrow="SAVING & SYNC"
    >
      <p className="text-[13px] leading-[1.75] text-[#7b8775]">
        Local saving is batched briefly while you type and flushed when you
        leave. The asynchronous demo API syncs after you pause editing.
      </p>
      <div className="mt-6 mb-[15px] flex items-center gap-2.5 rounded-lg bg-[#eef2e9] p-4 text-[13px]">
        <StatusDot status={view.status} />
        <strong>{SYNC_LABELS[view.status]}</strong>
      </div>
      <SyncError view={view} store={store} />
      <Button variant="text" className="mb-3" onClick={onDownload}>
        <Icon name="download" size={18} />
        Download a JSON backup
      </Button>
      <MockSettings service={mock} />
    </Dialog>
  );
}
