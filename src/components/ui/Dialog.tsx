import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";

export function Dialog({
  open,
  title,
  eyebrow,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    titleId = useId();
  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClose={onClose}
      className="m-auto max-h-[85vh] w-[600px] overflow-auto rounded-2xl border border-[#d9dfd1] bg-[#fcfcf7] px-8 py-7 text-[#374335] shadow-[0_20px_100px_#253b3430] backdrop:bg-[#263b3359] backdrop:backdrop-blur-[3px]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[1.7px] text-[#7d8877]">
          LITTLE NOTES / {eyebrow}
        </span>
        <IconButton aria-label="Close dialog" onClick={onClose}>
          <Icon name="close" />
        </IconButton>
      </div>
      <h2
        id={titleId}
        className="mt-[19px] mb-2.5 font-display text-[27px] font-bold tracking-[-.9px]"
      >
        {title}
      </h2>
      {children}
    </dialog>
  );
}
