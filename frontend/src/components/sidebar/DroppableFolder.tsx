import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Folder, NoteRead } from "../../api/folders";

export const DroppableFolder = ({
  folder,
  setSelectedFolder,
  selectedFolder,
  selectedNote,
}: {
  folder: Partial<Folder>;
  setSelectedFolder: React.Dispatch<React.SetStateAction<number | null>>;
  selectedFolder: number | null;
  selectedNote: NoteRead | null;
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: folder.id!,
    data: { type: "folder", folder },
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        onClick={() => setSelectedFolder(folder.id as number)}
        className={`font-semibold mb-1 flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${
          selectedFolder === folder.id &&
          (selectedNote?.folder_id == folder.id || selectedNote == null)
            ? "bg-ctp-surface1"
            : "hover:bg-ctp-surface0"
        }`}
      >
        <i className="fadr fa-folder text-sm"></i>
        {folder.name}
      </div>
    </div>
  );
};
