import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

export function EmptyBoard({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-1/2 text-center">
      <span className="mx-auto grid h-[86px] w-[78px] -rotate-7 place-items-center rounded-[8px_8px_22px_8px] bg-[#f5e9bc] text-[#a19562] shadow-[0_8px_14px_#48543812]">
        <Icon name="note" size={44} />
      </span>
      <h2 className="mt-[22px] mb-2 font-display text-[25px] font-bold tracking-[-.7px]">
        A fresh start.
      </h2>
      <p className="text-[13px] text-[#86917e]">
        Your next idea has plenty of room.
      </p>
      <Button variant="text" className="mt-2" onClick={onCreate}>
        Make your first note <Icon name="arrow" size={17} />
      </Button>
    </div>
  );
}
