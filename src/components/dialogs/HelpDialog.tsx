import { Dialog } from "../ui/Dialog";
import { Icon } from "../ui/Icon";

const GUIDE = [
  {
    icon: "plus",
    title: "Make a note",
    text: "Choose a color, hit New note, then draw anywhere on the board. A click uses a default size.",
  },
  {
    icon: "grip",
    title: "Find its place",
    text: "Drag the top to move. Pull the bottom-right corner to resize. Click a note to bring it forward.",
  },
  {
    icon: "note",
    title: "Make it yours",
    text: "Click the text to write. Use the color circle to change its color. Your changes save automatically.",
  },
  {
    icon: "trash",
    title: "Let it go",
    text: "Drag the top until your pointer is inside the trash zone, then release. Undo brings it back.",
  },
] as const;
export function HelpDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="A home for your thoughts."
      eyebrow="A QUICK GUIDE"
    >
      <p className="text-[13px] leading-[1.75] text-[#7b8775]">
        Everything you need, with a little room to play.
      </p>
      <div className="my-[27px] grid grid-cols-2 gap-x-8 gap-y-[25px]">
        {GUIDE.map((item) => (
          <div key={item.title}>
            <span className="text-[#7d936e]">
              <Icon name={item.icon} />
            </span>
            <h3 className="mt-[9px] mb-1.5 text-[13px] font-[650]">
              {item.title}
            </h3>
            <p className="text-xs leading-[1.8] text-[#7a8573]">{item.text}</p>
          </div>
        ))}
      </div>
      <div className="rounded-[9px] bg-[#edf0e5] px-[18px] pt-3 pb-4">
        <h3 className="mt-[3px] mb-2 text-[13px] font-[650]">
          Prefer the keyboard?
        </h3>
        <p className="text-xs leading-[1.8] text-[#7a8573]">
          <kbd>N</kbd> creates a note. After New note, <kbd>Enter</kbd> places
          it in the center. Tab to a move or resize handle and use arrow keys (5
          px); hold Shift for 20 px. Delete removes a focused handle’s note.
          Ctrl/Cmd + Z restores the last deleted note outside text fields.
          Escape cancels a drag.
        </p>
      </div>
    </Dialog>
  );
}
