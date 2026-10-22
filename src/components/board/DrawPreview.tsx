import type { NoteColor, Rect } from "../../domain/model";
import { NOTE_COLORS } from "../ui/noteColors";

export function DrawPreview({ rect, color }: { rect: Rect; color: NoteColor }) {
  return (
    <div
      className={`pointer-events-none absolute z-[1001] rounded-[3px_3px_16px_3px] border-[1.5px] border-dashed border-[#5d7452] opacity-80 ${NOTE_COLORS[color]}`}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
      }}
    >
      <span className="inline-block rounded-br-[5px] bg-forest px-2.5 py-1.5 text-[11px] text-white">
        {Math.round(rect.width)} × {Math.round(rect.height)}
      </span>
    </div>
  );
}
