import type { SyncStatus } from "../../store/types";

export function StatusDot({ status }: { status: SyncStatus }) {
  const color =
    status === "error" || status === "conflict"
      ? "bg-[#bc6250]"
      : status === "synced"
        ? "bg-[#7b9970]"
        : "animate-pulse bg-[#c69b4c]";
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-[5px] shrink-0 rounded-full motion-reduce:animate-none ${color}`}
    />
  );
}
