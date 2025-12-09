import React, { useState } from "react";
import { FolderTreeNode } from "../../api/folders";
import { useNoteStore } from "../../stores/notesStore";
import { folderApi } from "../../api/folders";

interface FolderContextMenuProps {
  x: number;
  y: number;
  folder: FolderTreeNode;
  onClose: () => void;
}

export const FolderContextMenu: React.FC<FolderContextMenuProps> = ({
  x,
  y,
  folder,
  onClose,
}) => {
  const { loadFolderTree, updateFolder } = useNoteStore();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);

  const handleDelete = async () => {
    if (!confirm(`Delete "${folder.name}" and all its contents?`)) {
      return;
    }
    try {
      await folderApi.delete(folder.id);
      await loadFolderTree();
      onClose();
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
  };

  const handleRename = async () => {
    if (newName.trim() && newName !== folder.name) {
      await updateFolder(folder.id, { name: newName });
    }
    setIsRenaming(false);
    onClose();
  };

  const handleCreateSubfolder = async () => {
    try {
      await folderApi.create({
        name: "New Folder",
        parent_id: folder.id,
      });
      await loadFolderTree();
      onClose();
    } catch (error) {
      console.error("Failed to create subfolder:", error);
    }
  };

  if (isRenaming) {
    return (
      <div
        style={{
          position: "fixed",
          top: y,
          left: x,
        }}
        className="bg-ctp-surface0 border border-ctp-surface2 rounded-md shadow-lg p-2 min-w-[200px] z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename();
            if (e.key === "Escape") {
              setIsRenaming(false);
              onClose();
            }
          }}
          onBlur={handleRename}
          autoFocus
          className="w-full px-2 py-1 bg-ctp-surface1 border border-ctp-surface2 rounded text-sm text-ctp-text focus:outline-none focus:border-ctp-mauve"
        />
      </div>
    );
  }

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
        onClick={() => setIsRenaming(true)}
        className="w-full text-left px-3 py-1.5 hover:bg-ctp-surface1 text-sm text-ctp-text transition-colors"
      >
        Rename
      </button>
      <button
        onClick={handleCreateSubfolder}
        className="w-full text-left px-3 py-1.5 hover:bg-ctp-surface1 text-sm text-ctp-text transition-colors"
      >
        New Subfolder
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
