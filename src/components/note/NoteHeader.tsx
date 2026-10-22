import { useEffect, useRef, useState } from "react";
import type { NoteCardProps } from "./types";
import { Icon } from "../ui/Icon";
import { IconButton } from "../ui/IconButton";
import { ColorPicker } from "../ui/ColorPicker";

type Props = Pick<
  NoteCardProps,
  "note" | "index" | "onColor" | "onDelete" | "onGesture" | "onKey"
>;
export function NoteHeader({
  note,
  index,
  onColor,
  onDelete,
  onGesture,
  onKey,
}: Props) {
  const [palette, setPalette] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null),
    paletteRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (palette)
      paletteRef.current
        ?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
        ?.focus();
  }, [palette]);
  const close = () => {
    setPalette(false);
    buttonRef.current?.focus({ preventScroll: true });
  };
  return (
    <>
      <div className="flex h-[41px] shrink-0 items-center rounded-t-[3px] border-b border-[#5362410c] bg-white/5 pr-[9px] pl-2">
        <button
          type="button"
          data-testid="move-handle"
          data-note-handle={note.id}
          className="flex min-w-0 flex-1 cursor-grab touch-none items-center gap-[5px] self-stretch bg-transparent p-0 text-[#526146] active:cursor-grabbing"
          aria-label={`Move note ${index + 1}. Use arrow keys; Delete to remove.`}
          title="Drag to move · Arrow keys to move"
          onPointerDown={(event) => onGesture(event, note, "move")}
          onKeyDown={(event) => onKey(event, note, "move")}
        >
          <span className="opacity-55">
            <Icon name="grip" size={18} />
          </span>
          <span className="text-[8px] tracking-[1.7px] whitespace-nowrap opacity-65">
            NOTE {String(index + 1).padStart(2, "0")}
          </span>
        </button>
        <div className="flex items-center gap-0.5 text-[#58684f]">
          <button
            ref={buttonRef}
            type="button"
            className="grid h-[27px] w-[25px] place-items-center rounded-md bg-transparent opacity-65 hover:bg-white/25 hover:opacity-100"
            aria-label={`Change color of note ${index + 1}`}
            aria-expanded={palette}
            title="Change color"
            onClick={() => setPalette((value) => !value)}
          >
            <span className="size-[11px] rounded-full border-[1.3px] border-current shadow-[inset_0_0_0_2px_#ffffff4a]" />
          </button>
          <IconButton
            size="small"
            className="opacity-65 hover:bg-white/25 hover:opacity-100"
            aria-label={`Delete note ${index + 1}`}
            title="Delete note"
            onClick={() => onDelete(note.id)}
          >
            <Icon name="close" size={15} />
          </IconButton>
        </div>
      </div>
      {palette && (
        <div
          ref={paletteRef}
          className="absolute top-[39px] right-2.5 z-1 rounded-lg border border-[#a4b09b66] bg-[#fafbf5] p-3 shadow-[0_5px_14px_#34452f25]"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              close();
            }
          }}
        >
          <ColorPicker
            compact
            value={note.color}
            onChange={(color) => {
              onColor(note.id, color);
              close();
            }}
          />
        </div>
      )}
    </>
  );
}
