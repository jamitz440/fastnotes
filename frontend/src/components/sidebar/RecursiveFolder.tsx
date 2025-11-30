import { useState } from "react";
import { FolderTreeNode } from "../../api/folders";
import { DraggableNote } from "./DraggableNote";
import { DroppableFolder } from "./DroppableFolder";

interface RecursiveFolderProps {
  folder: FolderTreeNode;
  depth?: number;
}

export const RecursiveFolder = ({
  folder,
  depth = 0,
}: RecursiveFolderProps) => {
  const [collapse, setCollapse] = useState(false);

  return (
    <div
      key={folder.id}
      className="flex flex-col"
      style={{ marginLeft: depth > 0 ? "1.5rem" : "0" }}
    >
      <DroppableFolder
        folder={folder}
        setCollapse={setCollapse}
        collapse={collapse}
      />
      {collapse && (
        <>
          <div className="flex flex-col gap-0.5 ml-6">
            {folder.notes.map((note) => (
              <DraggableNote key={note.id} note={note} />
            ))}
          </div>
          {folder.children.map((child) => (
            <RecursiveFolder key={child.id} folder={child} depth={depth + 1} />
          ))}
        </>
      )}
    </div>
  );
};
