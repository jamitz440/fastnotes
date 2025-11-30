import React from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Folder, NoteRead } from "../../api/folders";

export const DroppableFolder = ({
  folder,
  setSelectedFolder,
  selectedFolder,
  selectedNote,
  setCollapse,
  collapse,
}: {
  folder: Partial<Folder>;
  setSelectedFolder: (id: number | null) => void;
  selectedFolder: number | null;
  selectedNote: NoteRead | null;
  setCollapse: React.Dispatch<React.SetStateAction<boolean>>;
  collapse: boolean;
}) => {
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: folder.id!,
    data: { type: "folder", folder },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `folder-${folder.id}`,
    data: { type: "folder", folder },
  });

  const setNodeRef = (node: HTMLElement | null) => {
    setDroppableRef(node);
    setDraggableRef(node);
  };

  const style = {
    color: isOver ? "green" : undefined,
    opacity: isDragging ? 0.5 : 1,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
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
        {...listeners}
        {...attributes}
      >
        <i className="fadr fa-folder text-sm"></i>
        {folder.name}
        <div
          onClick={(e) => {
            e.stopPropagation(); // Prevent dragging when clicking the collapse button
            setCollapse(!collapse);
          }}
          className="ml-auto"
        >
          x
        </div>
      </div>
    </div>
  );
};
