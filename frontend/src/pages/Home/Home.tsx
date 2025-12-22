import { useEffect, useRef, useState } from "react";
import "../../main.css";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { Login } from "../Login";
import { TiptapEditor } from "../TipTap";
import { Sidebar } from "./components/sidebar/SideBar";
import { StatusIndicator } from "./components/StatusIndicator";
import { useCreateTag, useTagTree } from "@/hooks/useTags";
import { useFolderTree, useUpdateNote } from "@/hooks/useFolders";
import { Note } from "@/api/notes";
import { DecryptedTagNode } from "@/api/encryption";

function Home() {
  const [newFolder] = useState(false);

  // Local state for editing the current note
  const [editingNote, setEditingNote] = useState<Note | null>(null);
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
      {showModal && <Modal />}

      <Sidebar />
      {/*<div className="flex flex-col">
        <input
          type="text"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
        />
        {tags.map((tag) => (
          <button onClick={() => deleteTag(tag.id)} key={tag.id}>
            {tag.name}
          </button>
        ))}
      </div>*/}

      {/* Main editor area */}
      <div className="flex flex-col w-full h-screen overflow-hidden">
        {/*<Editor />*/}
        <input
          type="text"
          placeholder="Untitled note..."
          value={editingNote?.title || ""}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 text-3xl font-semibold bg-transparentfocus:outline-none focus:border-ctp-mauve transition-colors placeholder:text-ctp-overlay0 text-ctp-text"
        />
        <div className="px-4 py-2 border-b border-ctp-surface2 flex items-center gap-2 flex-wrap">
          {editingNote?.tags &&
            editingNote.tags.map((tag) => (
              <button
                onClick={() => null}
                key={tag.id}
                className="bg-ctp-surface0 px-1.5 text-sm rounded-full"
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
      onClick={() => setShowModal(false)}
      className="absolute h-screen w-screen flex items-center justify-center bg-ctp-crust/60 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-2/3 h-2/3 bg-ctp-base rounded-xl border-ctp-surface2 border p-5"
      >
        <Login />
        {/*<TagSelector />*/}
      </div>
    </motion.div>
  );
};

export const TagSelector = () => {
  const [value, setValue] = useState("");

  const { data: tagTree, isLoading, error } = useTagTree();
  const createTag = useCreateTag();

  const handleEnter = async () => {
    createTag.mutate({ name: value });
  };

  return (
    <div>
      <input
        type="text"
        value={value}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleEnter();
        }}
        onChange={(e) => setValue(e.target.value)}
      />
      {tagTree && tagTree.map((tag) => <TagTree tag={tag} />)}
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
    <div key={tag.id} className="flex flex-col relative">
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
