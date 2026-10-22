import type { ComponentProps } from "react";

export function IconButton({
  size = "normal",
  className = "",
  ...props
}: ComponentProps<"button"> & { size?: "normal" | "small" | "large" }) {
  const sizes = {
    normal: "h-[30px] w-[30px]",
    small: "h-[27px] w-[25px]",
    large: "h-9 w-9",
  };
  return (
    <button
      type="button"
      className={`inline-flex shrink-0 items-center justify-center rounded-md bg-transparent p-0 ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
