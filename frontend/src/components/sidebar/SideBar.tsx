import { useState, useRef, useEffect } from "react";
import { FolderCreate, FolderTreeResponse, folderApi } from "../../api/folders";
import { DraggableNote } from "./DraggableNote";

export const Sidebar = () => {
  const [folderTree, setFolderTree] = useState<FolderTreeResponse | null>(null);
  const [newFolder, setNewFolder] = useState(false);
  const [newFolderText, setNewFolderText] = useState("");
  const newFolderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newFolder && newFolderRef.current) {
      newFolderRef.current.focus();
    }
  }, [newFolder]);

  useEffect(() => {
    loadFolderTree();
  }, []);

  const handleCreateFolder = async () => {
    if (!newFolderText.trim()) return;
    const newFolderData: FolderCreate = {
      name: newFolderText,
      parent_id: null,
    };
    await folderApi.create(newFolderData);
    setNewFolderText("");
    loadFolderTree();
    setNewFolder(false);
  };

  const loadFolderTree = async () => {
    const data = await folderApi.tree();
    setFolderTree(data);
  };

  return (
    <div
      className="bg-ctp-mantle border-r border-ctp-surface2 w-[300px] p-4 overflow-y-auto sm:block hidden  flex-col gap-3"
      onDragOver={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
    >
      <SidebarHeader />
      {/* New folder input */}
      {newFolder && (
        <div className="mb-2">
          <input
            onBlur={() => setNewFolder(false)}
            onChange={(e) => setNewFolderText(e.target.value)}
            value={newFolderText}
            type="text"
            placeholder="Folder name..."
            className="border border-ctp-mauve rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-ctp-mauve bg-ctp-base text-ctp-text placeholder:text-ctp-overlay0"
            ref={newFolderRef}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateFolder();
              }
              if (e.key === "Escape") {
                setNewFolder(false);
              }
            }}
          />
        </div>
      )}

      {/* Folder tree */}
      <div className="flex flex-col gap-1">
        {folderTree?.folders.map((folder) => (
          <RenderFolder
            key={folder.id}
            folder={folder}
            depth={0}
            setSelectedFolder={setSelectedFolder}
            selectedFolder={selectedFolder}
            selectedNote={selectedNote}
            selectNote={selectNote}
          />
        ))}
      </div>

      {/* Orphaned notes */}
      {folderTree?.orphaned_notes && folderTree.orphaned_notes.length > 0 && (
        <div className="mt-4 flex flex-col gap-1">
          {/*<div className="text-ctp-subtext0 text-sm font-medium mb-1 px-2">
            Unsorted
          </div>*/}
          {folderTree.orphaned_notes.map((note) => (
            <DraggableNote
              key={note.id}
              note={note}
              selectNote={selectNote}
              selectedNote={selectedNote}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const SidebarHeader = () => {
  return (
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-lg font-semibold text-ctp-text">FastNotes</h2>
      <div className="flex gap-2">
        <button
          onClick={() => setNewFolder(true)}
          className="hover:bg-ctp-mauve group transition-colors rounded-md p-1.5"
          title="New folder"
        >
          <i className="fadr fa-folder-plus text-base text-ctp-mauve group-hover:text-ctp-base transition-colors"></i>
        </button>
        <button
          onClick={clearSelection}
          className="hover:bg-ctp-mauve group transition-colors rounded-md p-1.5"
          title="New note"
        >
          <i className="fadr fa-file-circle-plus text-base text-ctp-mauve group-hover:text-ctp-base transition-colors"></i>
        </button>
      </div>
    </div>
  );
};
