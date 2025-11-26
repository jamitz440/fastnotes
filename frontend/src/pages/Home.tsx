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
import CheckIcon from "../assets/fontawesome/svg/circle-check.svg?react";
import SpinnerIcon from "../assets/fontawesome/svg/rotate.svg?react";

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
  const [content, setContent] = useState("");
  const [newFolder, setNewFolder] = useState(false);
  const [newFolderText, setNewFolderText] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [encrypted, setEncrypted] = useState(false);
  const [updating, setUpdating] = useState(false);

  const pointer = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 30,
    },
  });
  const sensors = useSensors(pointer);

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

  const loadFolderTree = async () => {
    const data = await folderApi.tree();
    setFolderTree(data);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    const newNote: NoteCreate = {
      title,
      content,
      folder_id: selectedFolder,
      encrypted,
    };
    await notesApi.create(newNote);
    setTitle("");
    setContent("");
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
    loadFolderTree();
    setTimeout(() => {
      setUpdating(false);
    }, 1000);
  };

  const handleDelete = async (id: number) => {
    await notesApi.delete(id);
    loadFolderTree();
    clearSelection();
  };

  const selectNote = (note: NoteRead) => {
    setSelectedNote(note);
    setTitle(note.title);

    let cleanContent = note.content.replace(/\\([_\-\[\]\(\)])/g, "$1");
    cleanContent = cleanContent.replace(/^```\s*$/gm, "");
    setContent(cleanContent);
  };

  const clearSelection = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    await notesApi.update(active.id as number, {
      folder_id: over.id as number,
    });

    loadFolderTree();
  };

  return (
    <DndContext onDragEnd={handleDragEnd} autoScroll={false} sensors={sensors}>
      <div className="flex bg-ctp-base h-screen text-ctp-text overflow-hidden">
        {/* Sidebar */}
        <div
          className="bg-ctp-mantle border-r border-ctp-surface2 w-[300px] p-4 overflow-y-auto sm:block hidden flex-shrink-0 flex flex-col gap-3"
          onDragOver={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
        >
          {/* Header */}
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
          {folderTree?.orphaned_notes &&
            folderTree.orphaned_notes.length > 0 && (
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-0 py-3 mb-4 text-3xl font-semibold bg-transparent border-b border-ctp-surface2 focus:outline-none focus:border-ctp-mauve transition-colors placeholder:text-ctp-overlay0 text-ctp-text"
            />

            {/* Editor */}
            <div className="flex-1">
              <MDXEditor
                markdown={content}
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
                        <DiffSourceToggleWrapper />
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

            {/* Encryption toggle */}
            {/*<label className="flex items-center gap-2 ml-auto cursor-pointer group">
              <input
                type="checkbox"
                checked={encrypted}
                onChange={() => setEncrypted(!encrypted)}
                className="w-4 h-4 rounded border-ctp-surface2 text-ctp-mauve focus:ring-ctp-mauve focus:ring-offset-ctp-base cursor-pointer"
              />
              <span className="text-sm text-ctp-subtext0 group-hover:text-ctp-text transition-colors">
                Encrypt
              </span>
            </label>*/}
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
    </DndContext>
  );
}

export default Home;

interface RenderFolderProps {
  folder: FolderTreeNode;
  depth?: number;
  setSelectedFolder: React.Dispatch<SetStateAction<number | null>>;
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
