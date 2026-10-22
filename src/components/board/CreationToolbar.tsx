import type { NoteColor } from "../../domain/model";
import { Button } from "../ui/Button";
import { ColorPicker } from "../ui/ColorPicker";
import { Icon } from "../ui/Icon";

export function CreationToolbar({
  color,
  creating,
  onColor,
  onToggle,
}: {
  color: NoteColor;
  creating: boolean;
  onColor: (color: NoteColor) => void;
  onToggle: () => void;
}) {
  return (
    <section
      aria-label="Board controls"
      className="absolute top-6 right-6 z-20 h-16 rounded-xl border border-[#dfe4d9] bg-white/93 shadow-[0_3px_15px_#344c2b08]"
    >
      <div className="flex h-full items-center gap-[22px] py-2.5 pr-[11px] pl-5 max-[1100px]:gap-[18px]">
        <ColorPicker label="New note color" value={color} onChange={onColor} />
        <Button variant="primary" aria-pressed={creating} onClick={onToggle}>
          <Icon name="plus" size={19} />
          New note
          <kbd className="ml-3 rounded border border-white/20 bg-transparent px-[5px] py-[3px] text-[10px] text-[#dce7db]">
            N
          </kbd>
        </Button>
      </div>
    </section>
  );
}
