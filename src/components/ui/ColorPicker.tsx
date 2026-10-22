import { COLORS, type NoteColor } from "../../domain/model";
import { NOTE_COLORS } from "./noteColors";
import { Icon } from "./Icon";

interface Props {
  value: NoteColor;
  onChange: (color: NoteColor) => void;
  label?: string;
  compact?: boolean;
}
export function ColorPicker({
  value,
  onChange,
  label = "Note color",
  compact = false,
}: Props) {
  return (
    <div
      className={`flex ${compact ? "gap-[7px]" : "gap-2"}`}
      role="group"
      aria-label={label}
    >
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={`relative grid place-items-center rounded-full border border-black/5 p-0 text-[#374c3f] aria-pressed:outline aria-pressed:outline-offset-[3px] aria-pressed:outline-[#7f8c77] ${compact ? "size-[21px]" : "size-6"} ${NOTE_COLORS[color]}`}
          aria-label={label === "New note color" ? `${label}: ${color}` : color}
          aria-pressed={value === color}
          title={color}
          onClick={() => onChange(color)}
        >
          {value === color && <Icon name="check" size={compact ? 14 : 15} />}
        </button>
      ))}
    </div>
  );
}
