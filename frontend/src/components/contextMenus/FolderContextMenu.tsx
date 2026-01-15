import React, { useState } from "react";
import { FolderTreeNode } from "../../api/folders";
import {
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
} from "../../hooks/useFolders";

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
  const createFolderMutation = useCreateFolder();
  const updateFolderMutation = useUpdateFolder();
  const deleteFolderMutation = useDeleteFolder();

  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);

  const handleDelete = async () => {
    if (!confirm(`Delete "${folder.name}" and all its contents?`)) {
      return;
    }
    try {
      await deleteFolderMutation.mutateAsync(folder.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
  };

  const handleRename = async () => {
    if (newName.trim() && newName !== folder.name) {
      try {
        await updateFolderMutation.mutateAsync({
          folderId: folder.id,
          folder: { name: newName },
        });
      } catch (error) {
        console.error("Failed to rename folder:", error);
      }
    }
    setIsRenaming(false);
    onClose();
  };

  const handleCreateSubfolder = async () => {
    try {
      await createFolderMutation.mutateAsync({
        name: "New Folder",
        parentId: folder.id,
      });
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
        className="bg-overlay0 border border-surface1 rounded-md shadow-lg p-2 min-w-[200px] z-50"
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
          className="w-full px-2 py-1 bg-surface1 border border-surface1 rounded text-sm text-text focus:outline-none focus:border-accent"
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
      className="bg-overlay0 border border-surface1 rounded-md shadow-lg py-1 min-w-[160px] z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setIsRenaming(true)}
        className="w-full text-left px-3 py-1.5 hover:bg-surface1 text-sm text-text transition-colors"
      >
        Rename
      </button>
      <button
        onClick={handleCreateSubfolder}
        className="w-full text-left px-3 py-1.5 hover:bg-surface1 text-sm text-text transition-colors"
      >
        New Subfolder
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
