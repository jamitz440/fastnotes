import React from "react";
import { NoteRead } from "../../api/folders";
import { useNoteStore } from "../../stores/notesStore";
import { notesApi } from "../../api/notes";

interface NoteContextMenuProps {
  x: number;
  y: number;
  note: NoteRead;
  onClose: () => void;
}

export const NoteContextMenu: React.FC<NoteContextMenuProps> = ({
  x,
  y,
  note,
  onClose,
}) => {
  const { loadFolderTree, setSelectedNote } = useNoteStore();

  const handleDelete = async () => {
    try {
      await notesApi.delete(note.id);
      await loadFolderTree();
      onClose();
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const handleDuplicate = async () => {
    try {
      await notesApi.create({
        title: `${note.title} (Copy)`,
        content: note.content,
        folder_id: note.folder_id,
      });
      await loadFolderTree();
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
      className="bg-ctp-surface0 border border-ctp-surface2 rounded-md shadow-lg py-1 min-w-[160px] z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={handleRename}
        className="w-full text-left px-3 py-1.5 hover:bg-ctp-surface1 text-sm text-ctp-text transition-colors"
      >
        Rename
      </button>
      <button
        onClick={handleDuplicate}
        className="w-full text-left px-3 py-1.5 hover:bg-ctp-surface1 text-sm text-ctp-text transition-colors"
      >
        Duplicate
      </button>
      <div className="border-t border-ctp-surface2 my-1" />
      <button
        onClick={handleDelete}
        className="w-full text-left px-3 py-1.5 hover:bg-ctp-red hover:text-ctp-base text-sm text-ctp-red transition-colors"
      >
        Delete
      </button>
    </div>
  );
};
