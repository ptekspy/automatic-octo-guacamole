import type { RefObject } from "react";
import { Icon } from "../ui/Icon";

export function TrashZone({
  trashRef,
  dragging,
  over,
}: {
  trashRef: RefObject<HTMLDivElement | null>;
  dragging: boolean;
  over: boolean;
}) {
  const state = over
    ? "border-[#a95745] bg-[#edc9bb] text-[#7f3428] shadow-[0_0_0_3px_#edc9bb55]"
    : dragging
      ? "border-[#bd8f7f] bg-[#faf1eb] text-[#9c6554]"
      : "border-[#b6c2ac] bg-[#fafbf7eb] text-[#74836b]";
  return (
    <div
      ref={trashRef}
      aria-label="Trash zone. Release the move pointer here to delete."
      className={`pointer-events-auto flex h-[49px] min-w-[265px] items-center justify-center gap-[11px] rounded-[10px] border border-dashed text-[11px] transition-colors select-none motion-reduce:transition-none ${state}`}
    >
      <Icon name="trash" size={20} />
      <span>
        {over ? "Release to delete" : "Drop a note here to let it go"}
      </span>
    </div>
  );
}
