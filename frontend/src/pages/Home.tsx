import { useEffect, useRef, useState } from "react";
import { notesApi } from "../api/notes";
import "../main.css";
import { motion } from "framer-motion";
import "@mdxeditor/editor/style.css";
// @ts-ignore
import CheckIcon from "../assets/fontawesome/svg/circle-check.svg?react";
// @ts-ignore
import SpinnerIcon from "../assets/fontawesome/svg/rotate.svg?react";
// @ts-ignore
import WarningIcon from "../assets/fontawesome/svg/circle-exclamation.svg?react";
import { useNoteStore } from "../stores/notesStore";
import { Sidebar } from "../components/sidebar/SideBar";
import { useUIStore } from "../stores/uiStore";
import { TiptapEditor } from "./TipTap";
import { useAuthStore } from "../stores/authStore";
import { Login } from "./Login";

function Home() {
  const [newFolder, setNewFolder] = useState(false);
  const [lastSavedNote, setLastSavedNote] = useState<{
    id: number;
    title: string;
    content: string;
  } | null>(null);

  const {
    loadFolderTree,
    updateNote,
    setSelectedNote,
    setContent,
    selectedNote,
    setTitle,
  } = useNoteStore();

  const { isAuthenticated, encryptionKey } = useAuthStore();

  const { showModal, setShowModal } = useUIStore();

  const newFolderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // if (!isAuthenticated) return;
    console.log(encryptionKey);
    loadFolderTree();
  }, []);

  useEffect(() => {
    if (newFolder && newFolderRef.current) {
      newFolderRef.current.focus();
    }
  }, [newFolder]);

  const clearSelection = () => {
    setSelectedNote(null);
  };

  const { updating, setUpdating } = useUIStore();

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

  return (
    <div className="flex bg-ctp-base h-screen text-ctp-text overflow-hidden">
      {/* Sidebar */}
      {showModal && <Modal />}

      <Sidebar clearSelection={clearSelection} />

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
        <TiptapEditor
          key={selectedNote?.id}
          content={selectedNote?.content || ""}
          onChange={setContent}
        />
      </div>

      {/* Status indicator */}
      <div
        className="fixed bottom-2 right-3 bg-ctp-surface0 border border-ctp-surface2 rounded-sm px-2 py-0.5 flex items-center gap-2.5 shadow-lg backdrop-blur-sm"
        onClick={() => {
          if (!encryptionKey) {
            setShowModal(true);
          }
        }}
      >
        {!encryptionKey ? (
          <WarningIcon className="h-4 w-4 my-1 [&_.fa-primary]:fill-ctp-yellow [&_.fa-secondary]:fill-ctp-orange" />
        ) : updating ? (
          <>
            <SpinnerIcon className="animate-spin h-4 w-4 [&_.fa-primary]:fill-ctp-blue [&_.fa-secondary]:fill-ctp-sapphire" />
            <span className="text-sm text-ctp-subtext0 font-medium">
              Saving...
            </span>
          </>
        ) : (
          <>
            <CheckIcon className="h-4 w-4 [&_.fa-primary]:fill-ctp-green [&_.fa-secondary]:fill-ctp-teal" />
            <span className="text-sm text-ctp-subtext0 font-medium">Saved</span>
          </>
        )}
      </div>
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
      </div>
    </motion.div>
  );
};
