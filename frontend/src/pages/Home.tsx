import {
  BoldItalicUnderlineToggles,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  SandpackConfig,
  sandpackPlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  DiffSourceToggleWrapper,
} from "@mdxeditor/editor";
import { SetStateAction, useEffect, useRef, useState } from "react";
import {
  folderApi,
  FolderCreate,
  FolderTreeNode,
  FolderTreeResponse,
  NoteRead,
} from "../api/folders";
import { NoteCreate, notesApi } from "../api/notes";
import "../main.css";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import "@mdxeditor/editor/style.css";
import { DroppableFolder } from "../components/sidebar/DroppableFolder";
import { DraggableNote } from "../components/sidebar/DraggableNote";
// @ts-ignore
import CheckIcon from "../assets/fontawesome/svg/circle-check.svg?react";
// @ts-ignore
import SpinnerIcon from "../assets/fontawesome/svg/rotate.svg?react";
import { useNoteStore } from "../stores/notesStore";
import { create } from "zustand";
import { Sidebar } from "../components/sidebar/SideBar";

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
  // const [folderTree, setFolderTree] = useState<FolderTreeResponse | null>(null);
  // const [selectedNote, setSelectedNote] = useState<NoteRead | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [newFolder, setNewFolder] = useState(false);
  const [newFolderText, setNewFolderText] = useState("");
  // const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [encrypted, setEncrypted] = useState(false);
  const [updating, setUpdating] = useState(false);

  const {
    setSelectedFolder,
    selectedFolder,
    folderTree,
    loadFolderTree,
    createNote,
    createFolder,
    updateNote,
    setSelectedNote,
    selectedNote,
  } = useNoteStore();



  const newFolderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFolderTree();
  }, []);

  useEffect(() => {
    if (newFolder && newFolderRef.current) {
      newFolderRef.current.focus();
    }
  }, [newFolder]);

  useEffect(() => {
    if (!selectedNote) return;

    const timer = setTimeout(async () => {
      setUpdating(true);
      handleUpdate();
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, title]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createNote({ title, content, folder_id: null });
  };

  const handleUpdate = async () => {
    if (!selectedNote) return;
    await updateNote(selectedNote.id, { title, content });

    setTimeout(() => {
      setUpdating(false);
    }, 1000);
  };

  const handleDelete = async (id: number) => {
    await notesApi.delete(id);
    loadFolderTree();
    clearSelection();
  };

  const clearSelection = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
  };



  return (

      <div className="flex bg-ctp-base h-screen text-ctp-text overflow-hidden">
        {/* Sidebar */}

        <Sidebar clearSelection={clearSelection} />

        {/* Main editor area */}
        <div className="flex flex-col w-full h-screen overflow-hidden">
          {/* Top accent bar */}
          <div className="w-full bg-ctp-crust h-1 shrink-0"></div>

          {/* Content area with padding */}
          <div className="flex-1 flex flex-col overflow-y-auto px-8 py-6">
            {/* Title input */}
            <input
              type="text"
              placeholder="Untitled note..."
              value={selectedNote?.title || ""}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-0 py-3 mb-4 text-3xl font-semibold bg-transparent border-b border-ctp-surface2 focus:outline-none focus:border-ctp-mauve transition-colors placeholder:text-ctp-overlay0 text-ctp-text"
            />

            {/* Editor */}
            <div className="flex-1">
              <MDXEditor
                markdown={selectedNote?.content || ""}
                key={selectedNote?.id || "new"}
                onChange={setContent}
                className="prose prose-invert max-w-none text-ctp-text h-full dark-editor dark-mode"
                plugins={[
                  headingsPlugin(),
                  toolbarPlugin({
                    toolbarClassName: "toolbar",
                    toolbarContents: () => (
                      <>
                        <UndoRedo />
                        <BoldItalicUnderlineToggles />
                      </>
                    ),
                  }),

                  tablePlugin(),
                  listsPlugin(),
                  quotePlugin(),
                  thematicBreakPlugin(),
                  linkPlugin(),
                  codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
                  sandpackPlugin({ sandpackConfig: simpleSandpackConfig }),
                  codeMirrorPlugin({
                    codeBlockLanguages: {
                      js: "JavaScript",
                      css: "CSS",
                      python: "Python",
                      typescript: "TypeScript",
                      html: "HTML",
                    },
                  }),
                  imagePlugin(),
                  markdownShortcutPlugin(),
                  diffSourcePlugin({
                    viewMode: "rich-text",
                    diffMarkdown: "boo",
                  }),
                ]}
              />
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-3 px-8 py-4 border-t border-ctp-surface2 bg-ctp-mantle shrink-0">
            {selectedNote ? (
              <>
                <button
                  onClick={handleUpdate}
                  className="px-2 py-0.5 bg-ctp-blue text-ctp-base rounded-lg hover:bg-ctp-sapphire transition-colors font-medium shadow-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => handleDelete(selectedNote.id)}
                  className="px-2 py-0.5 bg-ctp-red text-ctp-base rounded-lg hover:bg-ctp-maroon transition-colors font-medium shadow-sm"
                >
                  Delete
                </button>
                <button
                  onClick={clearSelection}
                  className="px-2 py-0.5 bg-ctp-surface0 text-ctp-text rounded-lg hover:bg-ctp-surface1 transition-colors font-medium"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleCreate}
                className="px-2 py-0.5 bg-ctp-green text-ctp-base rounded-lg hover:bg-ctp-teal transition-colors font-medium shadow-sm"
              >
                Create Note
              </button>
            )}
          </div>
        </div>

        {/* Status indicator */}
        <div className="fixed bottom-4 right-4 bg-ctp-surface0 border border-ctp-surface2 rounded-lg px-2 py-0.5 flex items-center gap-2.5 shadow-lg backdrop-blur-sm">
          {updating ? (
            <>
              <SpinnerIcon className="animate-spin h-4 w-4 [&_.fa-primary]:fill-ctp-blue [&_.fa-secondary]:fill-ctp-sapphire" />
              <span className="text-sm text-ctp-subtext0 font-medium">
                Saving...
              </span>
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4 [&_.fa-primary]:fill-ctp-green [&_.fa-secondary]:fill-ctp-teal" />
              <span className="text-sm text-ctp-subtext0 font-medium">
                Saved
              </span>
            </>
          )}
        </div>
      </div>
  );
}

export default Home;

interface RenderFolderProps {
  folder: FolderTreeNode;
  depth?: number;
  setSelectedFolder: (id: number | null) => void;
  selectedFolder: number | null;
  selectedNote: NoteRead | null;
  selectNote: (note: NoteRead) => void;
}

const RenderFolder = ({
  folder,
  depth = 0,
  setSelectedFolder,
  selectedFolder,
  selectedNote,
  selectNote,
}: RenderFolderProps) => {
  const [collapse, setCollapse] = useState(false);

  return (
    <div
      key={folder.id}
      className="flex flex-col"
      style={{ marginLeft: depth > 0 ? "1.5rem" : "0" }}
    >
      <DroppableFolder
        folder={folder}
        setSelectedFolder={setSelectedFolder}
        selectedFolder={selectedFolder}
        selectedNote={selectedNote}
        setCollapse={setCollapse}
        collapse={collapse}
      />
      {collapse && (
        <>
          <div className="flex flex-col gap-0.5 ml-6">
            {folder.notes.map((note) => (
              <DraggableNote
                key={note.id}
                note={note}
                selectNote={selectNote}
                selectedNote={selectedNote}
              />
            ))}
          </div>
          {folder.children.map((child) => (
            <RenderFolder
              key={child.id}
              folder={child}
              depth={depth + 1}
              setSelectedFolder={setSelectedFolder}
              selectedFolder={selectedFolder}
              selectedNote={selectedNote}
              selectNote={selectNote}
            />
          ))}
        </>
      )}
    </div>
  );
};
