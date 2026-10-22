import type { Note } from "./model";
export const INITIAL_NOTES: Note[] = [
  {
    id: "welcome",
    x: 70,
    y: 65,
    width: 280,
    height: 258,
    color: "butter",
    text: "A little space for\nyour next big idea.\n\nClick here and make it yours. ✨",
  },
  {
    id: "ideas",
    x: 397,
    y: 112,
    width: 268,
    height: 244,
    color: "sage",
    text: "Good things start\nwith a small note.\n\nA thought. A reminder.\nSomething worth keeping.",
  },
  {
    id: "how-to",
    x: 725,
    y: 52,
    width: 250,
    height: 300,
    color: "rose",
    text: "Make yourself at home\n\n↗ Drag the top to move\n↘ Pull a corner to resize\n✎ Click the text to edit\n\nDrop in the trash to delete.",
  },
];
