import { useDraggable } from "@dnd-kit/core";
import { useContextMenu } from "@/contexts/ContextMenuContext";
import { useUIStore } from "@/stores/uiStore";
import { NoteRead } from "@/api/notes";

export const DraggableNote = ({ note }: { note: NoteRead }) => {
  const { selectedNote, setSelectedNote } = useUIStore();
  const { openContextMenu } = useContextMenu();

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: note.id,
      data: { type: "note", note },
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <button
      className="z-20"
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onContextMenu={(e) => {
        e.preventDefault();
        openContextMenu(e.clientX, e.clientY, "note", note);
      }}
    >
      <div
        key={note.id}
        onClick={() => {
          setSelectedNote(note);
        }}
        className={` rounded-sm px-2 mb-0.5 select-none cursor-pointer font-light transition-all duration-150 flex items-center gap-1 ${
          selectedNote?.id === note.id
            ? "bg-accent-500 text-base font-medium"
            : "hover:bg-surface1"
        }`}
      >
        <span className="truncate">
          {selectedNote?.id == note.id ? selectedNote.title : note.title}
        </span>
      </div>
    </button>
  );
};
