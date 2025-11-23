import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Note } from "../../api/notes";
import { NoteRead } from "../../api/folders";

export const DraggableNote = ({
  note,
  selectNote,
  selectedNote,
}: {
  note: NoteRead;
  selectNote: (note: NoteRead) => void;
  selectedNote: NoteRead | null;
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: note.id,
    data: { type: "note", note },
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div
        key={note.id}
        onClick={() => selectNote(note)}
        className={`ml-5 rounded-md px-2 mb-0.5 select-none cursor-pointer font-light transition-all duration-150 flex items-center gap-1 ${
          selectedNote?.id === note.id
            ? "bg-ctp-mauve text-ctp-base"
            : "hover:bg-ctp-surface1"
        }`}
      >
        <span>{note.title}</span>
      </div>
    </button>
  );
};
