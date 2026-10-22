import { Icon } from "../ui/Icon";
import { IconButton } from "../ui/IconButton";

export function BoardHeader({
  count,
  onHelp,
  onFocusBoard,
}: {
  count: number;
  onHelp: () => void;
  onFocusBoard: () => void;
}) {
  return (
    <header className="absolute top-6 left-6 z-20 flex h-16 items-center gap-[17px] rounded-xl border border-[#dfe4d9] bg-white/93 px-4 shadow-[0_3px_15px_#344c2b08]">
      <a
        href="#"
        aria-label="Little Notes home"
        className="flex items-center gap-[9px] font-display text-[21px] font-extrabold tracking-[-.8px] text-[#2e4639] no-underline"
        onClick={(event) => {
          event.preventDefault();
          onFocusBoard();
        }}
      >
        <span className="grid h-[35px] w-[31px] -rotate-7 place-items-center rounded-[7px_7px_11px_7px] bg-[#e6ebdf]">
          <Icon name="note" size={25} />
        </span>
        <span>
          little notes<span className="text-[#c4974d]">.</span>
        </span>
      </a>
      <span className="h-7 w-px bg-[#e1e6db]" />
      <div className="min-w-[65px]">
        <h1 className="mb-1 text-xs leading-[1.3] font-[650]">My board</h1>
        <span className="text-[10px] text-[#7b8773]">
          {count} {count === 1 ? "note" : "notes"}
        </span>
      </div>
      <IconButton
        size="large"
        className="ml-1 text-[#7e8b7c]"
        title="How it works"
        aria-label="How it works"
        onClick={onHelp}
      >
        <Icon name="help" size={22} />
      </IconButton>
    </header>
  );
}
