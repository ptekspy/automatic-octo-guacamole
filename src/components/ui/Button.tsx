import type { ComponentProps } from "react";

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "secondary" | "text" }) {
  const variants = {
    primary:
      "flex h-[47px] items-center gap-[9px] rounded-lg bg-forest px-[17px] text-[13px] font-[550] text-white shadow-sm hover:bg-[#244633] aria-pressed:bg-[#244633]",
    secondary:
      "rounded-md border border-[#cbd4c1] bg-[#fffefa] px-3 py-[9px] text-[11px] leading-normal",
    text: "inline-flex items-center gap-2 bg-transparent py-1.5 text-xs font-semibold text-[#416448]",
  };
  return (
    <button
      type="button"
      className={`${variants[variant]} ${className}`}
      {...props}
    />
  );
}
