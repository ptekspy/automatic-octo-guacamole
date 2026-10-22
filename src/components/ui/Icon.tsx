type IconName =
  | "plus"
  | "trash"
  | "arrow"
  | "close"
  | "resize"
  | "grip"
  | "check"
  | "help"
  | "settings"
  | "undo"
  | "download"
  | "note";
const paths: Record<IconName, React.ReactNode> = {
  plus: <path d="M12 5v14M5 12h14" />,
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7M14 10v7" />
    </>
  ),
  arrow: <path d="m5 16 12-9M7 7h10v10" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  resize: <path d="m9 19 10-10M15 19l4-4" />,
  grip: (
    <>
      <circle cx="9" cy="7" r=".7" />
      <circle cx="15" cy="7" r=".7" />
      <circle cx="9" cy="12" r=".7" />
      <circle cx="15" cy="12" r=".7" />
      <circle cx="9" cy="17" r=".7" />
      <circle cx="15" cy="17" r=".7" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 16.5v.1" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h16M4 17h16" />
      <circle cx="9" cy="7" r="3" />
      <circle cx="15" cy="17" r="3" />
    </>
  ),
  undo: <path d="M8 5 3 10l5 5M3 10h11a6 6 0 0 1 0 12" />,
  download: <path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4" />,
  note: (
    <>
      <path d="M5 3h14v13l-5 5H5zM14 21v-5h5M8 8h8M8 12h6" />
    </>
  ),
};
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
