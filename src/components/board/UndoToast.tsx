import { Icon } from "../ui/Icon";

export function UndoToast({ onUndo }: { onUndo: () => void }) {
  return (
    <div
      role="status"
      className="fixed bottom-[90px] left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-[9px] bg-[#2e4739] px-4 py-[13px] text-xs text-[#edf3e9] shadow-[0_5px_20px_#253d3426]"
    >
      <Icon name="trash" size={17} />
      <span>Note deleted</span>
      <button
        type="button"
        className="ml-2.5 flex items-center gap-[7px] border-l border-white/20 bg-transparent py-0.5 pr-0.5 pl-3.5 text-xs font-semibold text-[#e9e1b5]"
        onClick={onUndo}
      >
        <Icon name="undo" size={16} />
        Undo
      </button>
    </div>
  );
}
