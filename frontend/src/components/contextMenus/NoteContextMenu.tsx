import React from "react";
import { Note } from "../../api/notes";
import { useCreateNote, useDeleteNote } from "../../hooks/useFolders";
import { useUIStore } from "../../stores/uiStore";

interface NoteContextMenuProps {
  x: number;
  y: number;
  note: Note;
  onClose: () => void;
}

export const NoteContextMenu: React.FC<NoteContextMenuProps> = ({
  x,
  y,
  note,
  onClose,
}) => {
  const { setSelectedNote } = useUIStore();
  const deleteNoteMutation = useDeleteNote();
  const createNoteMutation = useCreateNote();

  const handleDelete = async () => {
    try {
      await deleteNoteMutation.mutateAsync(note.id);
      // Clear selection if this note was selected
      setSelectedNote(null);
      onClose();
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const handleDuplicate = async () => {
    try {
      await createNoteMutation.mutateAsync({
        title: `${note.title} (Copy)`,
        content: note.content,
        folderId: note.folderId || null,
      });
      onClose();
    } catch (error) {
      console.error("Failed to duplicate note:", error);
    }
  };

  const handleRename = () => {
    setSelectedNote(note);
    onClose();
    // Focus will be handled by the editor
  };

  return (
    <div
      style={{
        position: "fixed",
        top: y,
        left: x,
      }}
      className="bg-overlay0 border border-surface1 rounded-md shadow-lg py-1 min-w-[160px] z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={handleRename}
        className="w-full text-left px-3 py-1.5 hover:bg-surface1 text-sm text-text transition-colors"
      >
        Rename
      </button>
      <button
        onClick={handleDuplicate}
        className="w-full text-left px-3 py-1.5 hover:bg-surface1 text-sm text-text transition-colors"
      >
        Duplicate
      </button>
      <div className="border-t border-surface1 my-1" />
      <button
        onClick={handleDelete}
        className="w-full text-left px-3 py-1.5 hover:bg-danger hover:text-base text-sm text-danger transition-colors"
      >
        Delete
      </button>
    </div>
  );
};
