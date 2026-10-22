import type { StoreView } from "../../store/types";
import { SYNC_LABELS } from "../../store/types";
import { StatusDot } from "../ui/StatusDot";

export function SaveIndicator({
  view,
  onOpen,
}: {
  view: StoreView;
  onOpen: () => void;
}) {
  return (
    <div className="pointer-events-auto flex h-[54px] w-max max-w-[300px] min-w-[195px] flex-col justify-center gap-[5px] rounded-[10px] border border-[#dfe4d9] bg-white/93 px-4 py-2.5 shadow-[0_3px_15px_#344c2b05]">
      <button
        type="button"
        className="flex w-max max-w-[260px] items-center gap-[7px] bg-transparent p-0 text-[10px] font-[550]"
        onClick={onOpen}
      >
        <StatusDot status={view.localError ? "error" : view.status} />
        {view.localError
          ? "Local saving needs attention"
          : SYNC_LABELS[view.status]}
      </button>
      <span className="ml-3 text-[9px] text-[#8b9583]">
        {view.localError
          ? "Download a backup to keep your work"
          : "On this device + demo API"}
      </span>
    </div>
  );
}
