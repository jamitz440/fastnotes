import { useEffect, useRef, useState } from "react";
import "../../main.css";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { Login } from "../Login";
import { TiptapEditor } from "../TipTap";
import { Sidebar } from "./components/sidebar/SideBar";
import { StatusIndicator } from "./components/StatusIndicator";
import { useUpdateNote } from "@/hooks/useFolders";
import { NoteRead } from "@/api/notes";
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
      </motion.div>
    </motion.div>
  );
};
