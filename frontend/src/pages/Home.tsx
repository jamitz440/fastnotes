import {
  codeBlockPlugin,
  codeMirrorPlugin,
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  SandpackConfig,
  sandpackPlugin,
  thematicBreakPlugin,
} from "@mdxeditor/editor";
import { useEffect, useRef, useState } from "react";
import {
  folderApi,
  FolderCreate,
  FolderTreeNode,
  FolderTreeResponse,
  NoteRead,
} from "../api/folders";
import { NoteCreate, notesApi } from "../api/notes";
import "../main.css";
import { DndContext, DragEndEvent } from "@dnd-kit/core";

import "@mdxeditor/editor/style.css";
import { DroppableFolder } from "../components/sidebar/DroppableFolder";
import { DraggableNote } from "../components/sidebar/DraggableNote";

const simpleSandpackConfig: SandpackConfig = {
  defaultPreset: "react",
  presets: [
    {
      label: "React",
      name: "react",
      meta: "live react",
      sandpackTemplate: "react",
      sandpackTheme: "dark",
      snippetFileName: "/App.js",
      snippetLanguage: "jsx",
    },
  ],
};

function Home() {
  const [folderTree, setFolderTree] = useState<FolderTreeResponse | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteRead | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("#");
  const [newFolder, setNewFolder] = useState(false);
  const [newFolderText, setNewFolderText] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);

  useEffect(() => {
    loadFolderTree();
  }, []);

  const loadFolderTree = async () => {
    const { data } = await folderApi.tree();
    setFolderTree(data);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    const newNote: NoteCreate = { title, content, folder_id: selectedFolder };
    await notesApi.create(newNote);
    setTitle("");
    setContent("#");
    loadFolderTree();
  };

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

  const handleUpdate = async () => {
    if (!selectedNote) return;
    await notesApi.update(selectedNote.id, { title, content });
    setSelectedNote(null);
    setTitle("");
    setContent("#");
    loadFolderTree();
  };

  const handleDelete = async (id: number) => {
    await notesApi.delete(id);
    loadFolderTree();
  };

  const selectNote = (note: NoteRead) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const clearSelection = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("#");
  };

  const newFolderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newFolder && newFolderRef.current) {
      newFolderRef.current.focus();
    }
  }, [newFolder]);

  const renderFolder = (folder: FolderTreeNode, depth: number = 0) => (
    <div
      key={folder.id}
      style={{ marginLeft: depth > 0 ? "1rem" : "0" }}
      className="flex flex-col"
    >
      <DroppableFolder
        key={folder.id}
        folder={folder}
        setSelectedFolder={setSelectedFolder}
        selectedFolder={selectedFolder}
        selectedNote={selectedNote}
      />
      {folder.notes.map((note) => (
        <DraggableNote
          key={note.id}
          note={note}
          selectNote={selectNote}
          selectedNote={selectedNote}
        />
      ))}
      {folder.children.map((child) => renderFolder(child, depth + 1))}
    </div>
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    console.log(active.data);
    console.log(over.data);

    await notesApi.update(active.id as number, {
      folder_id: over.id as number,
    });

    loadFolderTree();
  };

  return (
    <DndContext onDragEnd={handleDragEnd} autoScroll={false}>
      <div className="flex bg-ctp-base min-h-screen text-ctp-text">
        <div
          className="bg-ctp-mantle border-r-ctp-surface2 border-r overflow-hidden"
          style={{
            width: "300px",
            padding: "1rem",
            overflowY: "auto",
          }}
          onDragOver={(e) => e.preventDefault()} // Add this
          onTouchMove={(e) => e.preventDefault()} // And this for touch devices
        >
          <h2>Notes</h2>
          <button
            onClick={clearSelection}
            style={{ marginBottom: "1rem", width: "100%" }}
          >
            New Note
          </button>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => {
                if (newFolder && newFolderRef.current) {
                  newFolderRef.current.focus();
                }
                setNewFolder(true);
              }}
              className="hover:bg-ctp-mauve group transition-colors rounded-md p-1 text-center flex"
            >
              <i className="fadr fa-folder-plus text-xl text-ctp-mauve group-hover:text-ctp-base transition-colors"></i>
            </button>
            <button
              onClick={clearSelection}
              className="hover:bg-ctp-mauve group transition-colors rounded-md p-1 text-center flex"
            >
              <i className="fadr fa-file-circle-plus text-xl text-ctp-mauve group-hover:text-ctp-base transition-colors"></i>
            </button>
          </div>

          {newFolder && (
            <div className="px-1 mb-1">
              <input
                onBlur={() => setNewFolder(false)}
                onChange={(e) => setNewFolderText(e.target.value)}
                value={newFolderText}
                type="text"
                placeholder="new folder"
                className="border-ctp-mauve border rounded-md px-2 w-full focus:outline-none focus:ring-1 focus:ring-ctp-mauve focus:border-ctp-mauve bg-ctp-base"
                ref={newFolderRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateFolder();
                  }
                }}
              />
            </div>
          )}

          {/* Render folder tree */}
          {folderTree?.folders.map((folder) => renderFolder(folder))}

          {/* Render orphaned notes */}
          {folderTree?.orphaned_notes &&
            folderTree.orphaned_notes.length > 0 && (
              <div className="mt-4">
                <div className="text-ctp-subtext0 text-sm mb-1">Unsorted</div>
                {folderTree.orphaned_notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => selectNote(note)}
                    className={`rounded-md px-2 mb-0.5 select-none cursor-pointer font-light transition-all duration-150 flex items-center gap-1 ${
                      selectedNote?.id === note.id
                        ? "bg-ctp-mauve text-ctp-base"
                        : "hover:bg-ctp-surface1"
                    }`}
                  >
                    <i className="fadr fa-file text-xs"></i>
                    <span>{note.title}</span>
                  </div>
                ))}
              </div>
            )}
        </div>
        <div
          style={{
            flex: 1,
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: "0.5rem",
              marginBottom: "1rem",
              fontSize: "1.5rem",
              border: "1px solid #ccc",
            }}
          />
          <MDXEditor
            markdown={content}
            key={selectedNote?.id || "new"}
            onChange={setContent}
            className="prose text-ctp-text"
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              linkPlugin(),
              codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
              sandpackPlugin({ sandpackConfig: simpleSandpackConfig }),
              codeMirrorPlugin({
                codeBlockLanguages: { js: "JavaScript", css: "CSS" },
              }),
              markdownShortcutPlugin(),
            ]}
          />
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
            {selectedNote ? (
              <>
                <button onClick={handleUpdate}>Update Note</button>
                <button
                  onClick={() => handleDelete(selectedNote.id)}
                  className="bg-ctp-red rounded-md px-1 text-ctp-crust"
                >
                  Delete
                </button>
                <button onClick={clearSelection}>Cancel</button>
              </>
            ) : (
              <button onClick={handleCreate}>Create Note</button>
            )}
          </div>
        </div>
      </div>
    </DndContext>
  );
}

export default Home;
