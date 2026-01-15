import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DraggableNote } from "./DraggableNote";
import { DroppableFolder } from "./DroppableFolder";
import { FolderTreeNode } from "../../../../../api/folders";

interface FolderTreeProps {
  folder: FolderTreeNode;
  depth?: number;
}

export const FolderTree = ({ folder, depth = 0 }: FolderTreeProps) => {
  const [collapse, setCollapse] = useState(false);

  return (
    <div key={folder.id} className="flex flex-col relative">
      <DroppableFolder
        folder={folder}
        setCollapse={setCollapse}
        collapse={collapse}
      />
      <AnimatePresence>
        {collapse && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden flex flex-col"
          >
            {/* The line container */}
            <div className="ml-2 pl-3 border-l border-surface1">
              {/* Notes */}
              <div className="flex flex-col gap-0.5">
                {folder.notes.map((note) => (
                  <DraggableNote key={note.id} note={note} />
                ))}
              </div>

              {/* Child Folders */}
              {folder.children.map((child) => (
                <FolderTree key={child.id} folder={child} depth={depth + 1} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
