import React from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Folder } from "../../api/folders";
import { useContextMenu } from "../../contexts/ContextMenuContext";
// @ts-ignore
import CaretRightIcon from "../../assets/fontawesome/svg/caret-right.svg?react";
// @ts-ignore
import FolderIcon from "../../assets/fontawesome/svg/folder.svg?react";

export const DroppableFolder = ({
  folder,
  setCollapse,
  collapse,
}: {
  folder: Partial<Folder>;
  setCollapse: React.Dispatch<React.SetStateAction<boolean>>;
  collapse: boolean;
}) => {
  const { openContextMenu } = useContextMenu();

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
    opacity: isDragging ? 0 : 1,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setCollapse(!collapse);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openContextMenu(e.clientX, e.clientY, "folder", folder);
        }}
        className={`font-semibold mb-1 flex items-center gap-1 pr-1 py-1 rounded cursor-pointer select-none`}
        {...listeners}
        {...attributes}
      >
        <CaretRightIcon
          className={`w-4 h-4 mr-1 transition-all duration-200 ease-in-out ${collapse ? "rotate-90" : ""} fill-ctp-mauve`}
        />
        <FolderIcon className="w-4 h-4 fill-ctp-mauve mr-1" />
        {folder.name}
      </div>
    </div>
  );
};
