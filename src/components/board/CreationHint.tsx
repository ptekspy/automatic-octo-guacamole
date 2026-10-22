import { Icon } from "../ui/Icon";

export function CreationHint() {
  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 flex w-[440px] -translate-1/2 flex-wrap items-center justify-center gap-2.5 rounded-xl border border-[#ccd5c1] bg-[#fbfcf7ed] px-[30px] py-[22px] text-[#4b6748] shadow-[0_6px_20px_#63714c0a]">
      <Icon name="plus" size={21} />
      <span className="text-[15px] font-medium">
        Click & drag to make a note
      </span>
      <small className="mt-[3px] text-[10px] whitespace-nowrap text-[#819073]">
        Click for a default size · Enter to place in the center · Esc to cancel
      </small>
    </div>
  );
}
