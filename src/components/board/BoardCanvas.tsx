import { useMemo, type RefObject } from "react";
import type { Note, NoteColor } from "../../domain/model";
import type { usePointerGesture } from "../../hooks/usePointerGesture";
import type { NoteCardProps } from "../note/types";
import { NoteCard } from "../note/NoteCard";
import { EmptyBoard } from "./EmptyBoard";
import { CreationHint } from "./CreationHint";
import { DrawPreview } from "./DrawPreview";

interface Props {
  boardRef: RefObject<HTMLDivElement | null>;
  notes: Note[];
  creating: boolean;
  color: NoteColor;
  activeId: string | null;
  gesture: ReturnType<typeof usePointerGesture>;
  onDeselect: () => void;
  onQuickNote: () => void;
  noteEvents: Pick<
    NoteCardProps,
    "onFront" | "onText" | "onColor" | "onDelete" | "onGesture" | "onKey"
  >;
}
export function BoardCanvas({
  boardRef,
  notes,
  creating,
  color,
  activeId,
  gesture,
  onDeselect,
  onQuickNote,
  noteEvents,
}: Props) {
  // Stable DOM order preserves editor focus while CSS stacking changes.
  const rendered = useMemo(
    () =>
      notes
        .map((note, index) => ({ note, index }))
        .sort((a, b) => a.note.id.localeCompare(b.note.id)),
    [notes],
  );
  const { preview } = gesture;
  return (
    <div
      ref={boardRef}
      role="region"
      data-testid="board"
      tabIndex={0}
      aria-label={
        creating
          ? "Draw a note here, or press Enter to create one in the center"
          : "Notes board. Press N to create a note."
      }
      className={`absolute inset-x-6 top-[104px] bottom-[94px] isolate overflow-hidden outline-offset-[-3px] focus-visible:outline-[#91a383] ${creating ? "cursor-crosshair [&>article]:pointer-events-none [&>article]:opacity-72" : ""} ${preview ? "touch-none select-none" : ""}`}
      onPointerDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (creating) gesture.start(event, { kind: "draw" });
        else onDeselect();
      }}
      onPointerMove={gesture.move}
      onPointerUp={gesture.end}
      onPointerCancel={gesture.cancel}
      onLostPointerCapture={gesture.cancel}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          creating &&
          event.key === "Enter"
        ) {
          event.preventDefault();
          onQuickNote();
        }
      }}
    >
      {rendered.map(({ note, index }) => (
        <NoteCard
          key={note.id}
          note={
            preview?.id === note.id
              ? {
                  ...note,
                  x: preview.x,
                  y: preview.y,
                  width: preview.width,
                  height: preview.height,
                }
              : note
          }
          index={index}
          active={activeId === note.id}
          dragging={preview?.id === note.id}
          {...noteEvents}
        />
      ))}
      {notes.length === 0 && !creating && <EmptyBoard onCreate={onQuickNote} />}
      {creating && !preview && <CreationHint />}
      {preview?.id === null && <DrawPreview rect={preview} color={color} />}
    </div>
  );
}
