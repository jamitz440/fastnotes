import React, { useEffect } from "react";
import { useContextMenu } from "../../contexts/ContextMenuContext";
import { NoteContextMenu } from "./NoteContextMenu";
import { FolderContextMenu } from "./FolderContextMenu";

export const ContextMenuRenderer: React.FC = () => {
  const { contextMenu, closeContextMenu } = useContextMenu();

  if (!contextMenu) return null;

  return (
    <>
      {contextMenu.type === "note" && (
        <NoteContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          note={contextMenu.data}
          onClose={closeContextMenu}
        />
      )}
      {contextMenu.type === "folder" && (
        <FolderContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          folder={contextMenu.data}
          onClose={closeContextMenu}
        />
      )}
    </>
  );
};
