import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderTreeNode, NoteRead } from "../../api/folders";
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
            <div className="ml-2 pl-3 border-l border-ctp-surface2">
              {/* Notes */}
              <div className="flex flex-col gap-0.5">
                {folder.notes.map((note) => (
                  <DraggableNote key={note.id} note={note} />
                ))}
              </div>

              {/* Child Folders */}
              {folder.children.map((child) => (
                <RecursiveFolder
                  key={child.id}
                  folder={child}
                  depth={depth + 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
