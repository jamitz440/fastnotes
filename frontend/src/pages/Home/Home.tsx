import { useEffect, useRef, useState } from "react";
import "../../main.css";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { useNoteStore } from "@/stores/notesStore";
import { useUIStore } from "@/stores/uiStore";
import { Login } from "../Login";
import { TiptapEditor } from "../TipTap";
import { Sidebar } from "./components/sidebar/SideBar";
import { StatusIndicator } from "./components/StatusIndicator";

import { Tag, tagsApi } from "@/api/tags";
import { useTagStore } from "@/stores/tagStore";

function Home() {
  const [newFolder] = useState(false);
  const [lastSavedNote, setLastSavedNote] = useState<{
    id: number;
    title: string;
    content: string;
  } | null>(null);

  const { loadFolderTree, updateNote, setContent, selectedNote, setTitle } =
    useNoteStore();

  const { encryptionKey } = useAuthStore();

  const { showModal, setUpdating } = useUIStore();

  const newFolderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!encryptionKey) return;
    loadFolderTree();
  }, []);

  useEffect(() => {
    if (newFolder && newFolderRef.current) {
      newFolderRef.current.focus();
    }
  }, [newFolder]);

  useEffect(() => {
    if (!selectedNote) return;
    if (!encryptionKey) return; // Don't try to save without encryption key

    // Check if content or title actually changed (not just selecting a different note)
    const hasChanges =
      lastSavedNote &&
      lastSavedNote.id === selectedNote.id &&
      (lastSavedNote.title !== selectedNote.title ||
        lastSavedNote.content !== selectedNote.content);

    // If it's a new note selection, just update lastSavedNote without saving
    if (!lastSavedNote || lastSavedNote.id !== selectedNote.id) {
      setLastSavedNote({
        id: selectedNote.id,
        title: selectedNote.title,
        content: selectedNote.content,
      });
      return;
    }

    if (!hasChanges) return;

    const timer = setTimeout(async () => {
      setUpdating(true);
      await handleUpdate();
      setLastSavedNote({
        id: selectedNote.id,
        title: selectedNote.title,
        content: selectedNote.content,
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [selectedNote, encryptionKey]);

  const handleUpdate = async () => {
    if (!selectedNote) return;
    if (!encryptionKey) {
      setUpdating(false);
      return;
    }

    try {
      await updateNote(selectedNote.id);
      console.log(selectedNote.id);
    } catch (error) {
      console.error("Failed to update note:", error);
    } finally {
      setTimeout(() => {
        setUpdating(false);
      }, 1000);
    }
  };

  const { getTagTree, tagTree } = useTagStore();
  const getTags = () => {
    getTagTree();
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
        <button onClick={createTag}>create</button>
        {tags.map((tag) => (
          <button onClick={() => deleteTag(tag.id)} key={tag.id}>
            {tag.name}
          </button>
        ))}
      </div>*/}
      <button onClick={() => getTags()}>Click</button>

      {/* Main editor area */}
      <div className="flex flex-col w-full h-screen overflow-hidden">
        {/*<Editor />*/}
        <input
          type="text"
          placeholder="Untitled note..."
          value={selectedNote?.title || ""}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 text-3xl font-semibold bg-transparentfocus:outline-none focus:border-ctp-mauve transition-colors placeholder:text-ctp-overlay0 text-ctp-text"
        />
        <div className="px-4 py-2 border-b border-ctp-surface2 flex items-center gap-2 flex-wrap">
          {selectedNote?.tags &&
            selectedNote.tags.map((tag) => (
              <button
                onClick={() => null}
                key={tag.id}
                className="bg-ctp-surface0 px-1.5 text-sm rounded-full"
              >
                {tag.parent_id && "..."}
                {tag.name}
              </button>
            ))}
        </div>

        <TiptapEditor
          key={selectedNote?.id}
          content={selectedNote?.content || ""}
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
        {/*<Login />*/}
        <TagSelector />
      </div>
    </motion.div>
  );
};

const TagSelector = () => {
  const { tagTree } = useTagStore();
  const [value, setValue] = useState("");
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {tagTree && tagTree.map((tag) => <TagTree tag={tag} />)}
    </div>
  );
};

export const TagTree = ({ tag, depth = 0 }: { tag: Tag; depth?: number }) => {
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
