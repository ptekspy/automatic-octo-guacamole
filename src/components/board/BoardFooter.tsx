import type { RefObject } from "react";
import type { StoreView } from "../../store/types";
import { SaveIndicator } from "./SaveIndicator";
import { TrashZone } from "./TrashZone";
import { Icon } from "../ui/Icon";
import { IconButton } from "../ui/IconButton";

export function BoardFooter({
  view,
  trashRef,
  dragging,
  overTrash,
  onSync,
  onDownload,
}: {
  view: StoreView;
  trashRef: RefObject<HTMLDivElement | null>;
  dragging: boolean;
  overTrash: boolean;
  onSync: () => void;
  onDownload: () => void;
}) {
  return (
    <footer className="pointer-events-none absolute right-6 bottom-5 left-6 grid h-[54px] grid-cols-[1fr_auto_1fr] items-center gap-5">
      <SaveIndicator view={view} onOpen={onSync} />
      <TrashZone trashRef={trashRef} dragging={dragging} over={overTrash} />
      <div className="pointer-events-auto flex items-center justify-end gap-[13px] text-[10px] text-[#7c8973]">
        <span className="max-[1100px]:hidden">
          Drag to move · Pull a corner to resize
        </span>
        <IconButton
          aria-label="Download board backup"
          title="Download board backup"
          onClick={onDownload}
        >
          <Icon name="download" size={18} />
        </IconButton>
      </div>
    </footer>
  );
}
