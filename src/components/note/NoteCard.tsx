import { memo } from "react";
import { MAX_TEXT_LENGTH } from "../../domain/constants";
import type { NoteCardProps } from "./types";
import { NoteHeader } from "./NoteHeader";
import { Icon } from "../ui/Icon";
import { NOTE_COLORS } from "../ui/noteColors";

export const NoteCard = memo(function NoteCard(props: NoteCardProps) {
  const { note, index, active, dragging, onFront, onText, onGesture, onKey } =
    props;
  const shadow = dragging
    ? "shadow-[0_0_0_1.5px_#5d735b90,0_14px_22px_#35442c28]"
    : active
      ? "shadow-[0_0_0_1.5px_#60705670,0_6px_15px_#404b2920]"
      : "shadow-[0_4px_6px_#4d553413,0_12px_18px_-12px_#3c462e3b]";
  return (
    <article
      data-note-id={note.id}
      data-color={note.color}
      aria-label={`Note ${index + 1}`}
      className={`absolute flex flex-col rounded-[3px_3px_16px_3px] border border-black/3 text-[#374335] transition-shadow motion-reduce:transition-none ${NOTE_COLORS[note.color]} ${shadow}`}
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        zIndex: index + 1,
      }}
      onPointerDown={() => onFront(note.id)}
      onFocus={() => onFront(note.id)}
    >
      <NoteHeader {...props} />
      <textarea
        aria-label={`Text of note ${index + 1}`}
        placeholder="Something on your mind?"
        value={note.text}
        maxLength={MAX_TEXT_LENGTH}
        spellCheck
        onChange={(event) => onText(note.id, event.target.value)}
        className="min-h-0 w-full flex-1 resize-none [scrollbar-width:thin] [scrollbar-color:#5f704540_transparent] border-0 bg-transparent px-5 pt-4 pb-1 text-base leading-[1.65] font-[450] tracking-[-.2px] text-[#384333] outline-offset-[-5px] placeholder:text-[#4e5f45a6] focus-visible:outline-1 focus-visible:outline-[#576c4d70] focus-visible:outline-dashed"
      />
      <div className="flex h-[29px] shrink-0 items-center justify-between pl-4">
        <span className="text-[9px] text-[#5e664e]">
          {note.text.length === MAX_TEXT_LENGTH
            ? "Character limit reached"
            : ""}
        </span>
        <button
          type="button"
          data-testid="resize-handle"
          aria-label={`Resize note ${index + 1}. Use arrow keys.`}
          title="Drag to resize · Arrow keys to resize"
          className="grid h-[29px] w-[31px] cursor-nwse-resize touch-none place-items-center bg-transparent p-0 text-[#64725380] hover:text-[#405139]"
          onPointerDown={(event) => onGesture(event, note, "resize")}
          onKeyDown={(event) => onKey(event, note, "resize")}
        >
          <Icon name="resize" size={23} />
        </button>
      </div>
    </article>
  );
});
