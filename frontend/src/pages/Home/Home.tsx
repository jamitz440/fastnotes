import { useEffect, useRef, useState } from "react";
import "../../main.css";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { Login } from "../Login";
import { TiptapEditor } from "../TipTap";
import { Sidebar } from "./components/sidebar/SideBar";
import { StatusIndicator } from "./components/StatusIndicator";
import { useAddTagToNote, useCreateTag, useTagTree } from "@/hooks/useTags";
import { useFolderTree, useUpdateNote } from "@/hooks/useFolders";
import { Note, NoteRead } from "@/api/notes";
import { DecryptedTagNode } from "@/api/encryption";
// @ts-ignore
import XmarkIcon from "@/assets/fontawesome/svg/xmark.svg?react";
// @ts-ignore
import PlusIcon from "@/assets/fontawesome/svg/plus.svg?react";

function Home() {
  const [newFolder] = useState(false);

  // Local state for editing the current note
  const [editingNote, setEditingNote] = useState<NoteRead | null>(null);
  const [lastSavedNote, setLastSavedNote] = useState<{
    id: number;
    title: string;
    content: string;
  } | null>(null);

  const { encryptionKey } = useAuthStore();
  const { showModal, setUpdating, selectedNote } = useUIStore();
  const newFolderRef = useRef<HTMLInputElement>(null);

  const folderTree = useFolderTree();
  const updateNoteMutation = useUpdateNote();

  // Sync editingNote with selectedNote when selection changes
  useEffect(() => {
    if (selectedNote) {
      setEditingNote(selectedNote);
      setLastSavedNote({
        id: selectedNote.id,
        title: selectedNote.title,
        content: selectedNote.content,
      });
    } else {
      setEditingNote(null);
      setLastSavedNote(null);
    }
  }, [selectedNote?.id]);
  useEffect(() => {
    if (newFolder && newFolderRef.current) {
      newFolderRef.current.focus();
    }
  }, [newFolder]);

  // Auto-save effect - watches editingNote for changes
  useEffect(() => {
    if (!editingNote) return;
    if (!encryptionKey) return;

    // Check if content or title actually changed
    const hasChanges =
      lastSavedNote &&
      lastSavedNote.id === editingNote.id &&
      (lastSavedNote.title !== editingNote.title ||
        lastSavedNote.content !== editingNote.content);

    if (!hasChanges) return;

    const timer = setTimeout(async () => {
      setUpdating(true);
      await handleUpdate();
      setLastSavedNote({
        id: editingNote.id,
        title: editingNote.title,
        content: editingNote.content,
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [editingNote?.title, editingNote?.content, encryptionKey]);

  const handleUpdate = async () => {
    if (!editingNote) return;
    if (!encryptionKey) {
      setUpdating(false);
      return;
    }

    try {
      if (!editingNote.id) throw new Error("Editing note has no id.");
      await updateNoteMutation.mutateAsync({
        noteId: editingNote.id,
        note: {
          title: editingNote.title,
          content: editingNote.content,
        },
      });
    } catch (error) {
      console.error("Failed to update note:", error);
    } finally {
      setTimeout(() => {
        setUpdating(false);
      }, 1000);
    }
  };

  const setTitle = (title: string) => {
    if (editingNote) {
      setEditingNote({ ...editingNote, title });
    }
  };

  const setContent = (content: string) => {
    if (editingNote) {
      setEditingNote({ ...editingNote, content });
    }
  };

  return (
    <div className="flex bg-ctp-base h-screen text-ctp-text overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>{showModal && <Modal />}</AnimatePresence>

      <Sidebar />

      {/* Main editor area */}
      <div className="flex flex-col w-full h-screen overflow-y-auto items-center justify-center">
        {/*<Editor />*/}
        <div className="h-full lg:w-3xl w-full">
          <input
            type="text"
            id="noteTitle"
            name=""
            placeholder="Untitled note..."
            value={editingNote?.title || ""}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 pb-0 text-3xl font-semibold bg-transparent focus:outline-none border-transparent focus:border-ctp-mauve transition-colors placeholder:text-ctp-overlay0 text-ctp-text"
          />
          <TagSelector
            editingNote={editingNote}
            setEditingNote={setEditingNote}
          />
          <div className="px-4 py-2  border-ctp-surface2 flex items-center gap-2 flex-wrap">
            {editingNote?.tags &&
              editingNote.tags.map((tag) => (
                <button
                  onClick={() => null}
                  key={tag.id}
                  className="bg-ctp-surface0 hover:bg-ctp-surface1 px-2 py-0.5 text-sm rounded-full transition-colors"
                >
                  {tag.parentId && "..."}
                  {tag.name}
                </button>
              ))}
          </div>

          <TiptapEditor
            key={editingNote?.id}
            content={editingNote?.content || ""}
            onChange={setContent}
          />
        </div>
      </div>

      <StatusIndicator />
    </div>
  );
}

export default Home;

const Modal = () => {
  const { setShowModal } = useUIStore();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowModal(false)}
      className="fixed inset-0 h-screen w-screen flex items-center justify-center bg-ctp-crust/70 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md mx-4 bg-ctp-base rounded-xl border-ctp-surface2 border p-8 shadow-2xl"
      >
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 p-2 hover:bg-ctp-surface0 rounded-sm transition-colors group"
          aria-label="Close modal"
        >
          <XmarkIcon className="w-5 h-5 fill-ctp-overlay0 group-hover:fill-ctp-text transition-colors" />
        </button>
        <Login />
        {/*<TagSelector />*/}
      </motion.div>
    </motion.div>
  );
};

export const TagSelector = ({
  editingNote,
  setEditingNote,
}: {
  editingNote: NoteRead | null;
  setEditingNote: (note: NoteRead | null) => void;
}) => {
  const [value, setValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: tagTree, isLoading, error } = useTagTree();
  const createTag = useCreateTag();
  const addTagToNote = useAddTagToNote();
  const [expanded, setExpanded] = useState(false);

  // Parse path from input (using > as separator)
  const parsedPath = value.includes(">")
    ? value
        .split(">")
        .map((part) => part.trim())
        .filter(Boolean)
    : null;

  // Filter existing tags based on search
  const filteredTags = tagTree
    ? tagTree.filter((tag) => {
        if (value === "") return false;
        // Don't show filtered tags if user is typing a path
        if (parsedPath) return false;
        return (tag.name + tag.parentPath)
          .toLowerCase()
          .includes(value.toLowerCase());
      })
    : [];

  // Close when clicking outside the entire component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (expanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [expanded]);

  // Focus input when expanded
  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  const handleEnter = () => {
    createTag.mutate(
      { name: value },
      {
        onSuccess: (createdTag) => {
          if (editingNote && createdTag.id) {
            addTagToNote.mutate(
              {
                tagId: createdTag.id,
                noteId: editingNote.id,
              },
              {
                onSuccess: () => {
                  setEditingNote({
                    ...editingNote,
                    tags: [
                      ...(editingNote.tags || []),
                      { ...createdTag, name: value },
                    ],
                  });
                },
              },
            );
          }
        },
      },
    );
  };

  const handleSelectExistingTag = (tag: DecryptedTagNode) => {
    if (editingNote && tag.id) {
      addTagToNote.mutate(
        {
          tagId: tag.id,
          noteId: editingNote.id,
        },
        {
          onSuccess: () => {
            setEditingNote({
              ...editingNote,
              tags: [
                ...(editingNote.tags || []),
                { id: tag.id, name: tag.name, parentId: tag.parentId },
              ],
            });
            setValue("");
            setExpanded(false);
          },
        },
      );
    }
  };

  function handleClose() {
    // If there's a value, submit it; otherwise just collapse
    if (value.trim()) {
      handleEnter();
    }
    setValue("");
    setExpanded(false);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleClose();
    } else if (e.key === "Escape") {
      // Abort without submitting
      setValue("");
      setExpanded(false);
    }
  }

  return (
    <div className="relative ml-4" ref={containerRef}>
      <div className="inline-flex bg-ctp-surface0 rounded-full px-1 py-0.5 items-center">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={`text-xs bg-transparent flex items-center justify-center
            focus:outline-none transition-all duration-200 ease-out whitespace-nowrap text-ctp-subtext0
            ${expanded ? "opacity-0 w-0 px-0 pointer-events-none overflow-hidden" : "opacity-100 px-0.5"}
          `}
        >
          <PlusIcon className="w-3 h-3 mr-1 fill-ctp-subtext0" />
          {"Add"}
        </button>

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder={"Type here…"}
          className={`text-xs z-30
            bg-transparent px-1.5
            focus:outline-none focus:ring-0
            transition-all duration-200 ease-out
            ${expanded ? "w-32 opacity-100" : "w-0 opacity-0 pointer-events-none"}
          `}
        />
      </div>

      {/* Dropdown */}
      {expanded && value && (
        <div className="absolute top-full left-0 mt-1 bg-ctp-surface0 rounded-lg shadow-lg border border-ctp-surface2 overflow-hidden min-w-[200px] max-w-[300px] z-20">
          {/* Show hierarchical preview if path is being typed */}
          {parsedPath && parsedPath.length > 0 && (
            <div className="p-3 border-b border-ctp-surface2">
              <div className="text-xs text-ctp-overlay1 mb-2">
                Create tag hierarchy:
              </div>
              <div className="flex flex-col gap-1">
                {parsedPath.map((part, index) => (
                  <div
                    key={index}
                    className="flex items-center text-xs text-ctp-text"
                    style={{ paddingLeft: `${index * 12}px` }}
                  >
                    {index > 0 && (
                      <span className="text-ctp-overlay0 mr-2">└─</span>
                    )}
                    <span className="bg-ctp-surface1 px-2 py-0.5 rounded">
                      {part}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-ctp-overlay0 mt-2">
                Press Enter to create
              </div>
            </div>
          )}

          {/* Show filtered existing tags */}
          {!parsedPath && filteredTags.length > 0 && (
            <div className="max-h-[200px] overflow-y-auto">
              {filteredTags.map((tag) => (
                <TagTreeClickable
                  key={tag.id}
                  tag={tag}
                  onSelect={handleSelectExistingTag}
                />
              ))}
            </div>
          )}

          {/* Show "create new" option for simple tags */}
          {!parsedPath && filteredTags.length === 0 && (
            <div className="p-2 text-xs text-ctp-overlay1">
              Press Enter to create "{value}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Clickable version of TagTree for selection
export const TagTreeClickable = ({
  tag,
  depth = 0,
  onSelect,
}: {
  tag: DecryptedTagNode;
  depth?: number;
  onSelect: (tag: DecryptedTagNode) => void;
}) => {
  const [collapse, setCollapse] = useState(false);

  return (
    <div key={tag.id} className="flex flex-col">
      <button
        onClick={() => onSelect(tag)}
        className="flex items-center px-3 py-2 hover:bg-ctp-surface1 transition-colors text-left text-xs"
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <span className="text-ctp-text">{tag.name}</span>
        {tag.parentPath && (
          <span className="ml-2 text-ctp-overlay0 text-[10px]">
            {tag.parentPath}
          </span>
        )}
      </button>

      {/* Show children */}
      {tag.children && tag.children.length > 0 && (
        <div>
          {tag.children.map((child) => (
            <TagTreeClickable
              key={child.id}
              tag={child}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TagTree = ({
  tag,
  depth = 0,
}: {
  tag: DecryptedTagNode;
  depth?: number;
}) => {
  const [collapse, setCollapse] = useState(false);

  return (
    <div
      key={tag.id}
      className="flex flex-col relative bg-ctp-surface0 pt-3 -translate-y-3 w-[136px]"
    >
      <div onClick={() => setCollapse(!collapse)}>{tag.name}</div>
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
              {/* Child tags */}
              {tag.children.map((child) => (
                <TagTree key={child.id} tag={child} depth={depth + 1} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
