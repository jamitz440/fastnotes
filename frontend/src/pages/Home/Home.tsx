import {
  ChangeEvent,
  ChangeEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
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
  const { showModal, setUpdating, selectedNote, editorView } = useUIStore();
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

  const setUnparsedContent = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (editingNote) {
      setEditingNote({ ...editingNote, content: event.target.value });
    }
  };

  return (
    <div className="flex bg-base h-screen text-text overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>{showModal && <Modal />}</AnimatePresence>

      <Sidebar />

      {/* Main editor area */}
      <div className="flex flex-col w-full h-screen overflow-hidden">
        {" "}
        {editingNote ? (
          <>
            <input
              type="text"
              id="noteTitle"
              placeholder="Untitled note..."
              value={editingNote.title || ""}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full self-center p-4 pb-2 pt-2 text-3xl font-semibold focus:outline-none border-transparent focus:border-accent-500 transition-colors placeholder:text-overlay0 text-text bg-surface1"
            />
            <div className="h-full w-full  overflow-y-hidden">
              {" "}
              {editorView == "parsed" ? (
                <TiptapEditor
                  key={editingNote.id}
                  content={editingNote.content || ""}
                  onChange={setContent}
                />
              ) : (
                <textarea
                  value={editingNote.content || ""}
                  className="w-full font-mono p-4 bg-transparent focus:outline-none resize-none text-text"
                  style={{
                    minHeight: "calc(100vh - 55px)",
                  }}
                  onChange={setUnparsedContent}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-overlay0">
            <div className="text-center">
              <PlusIcon className="w-16 h-16 mx-auto mb-4 fill-current opacity-50" />
              <p className="text-lg">Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>

      <StatusIndicator />
    </div>
  );
}

export default Home;

const Modal = () => {
  const { setShowModal, modalContent, showModal } = useUIStore();
  const ModalContent = modalContent;
  if (!showModal || !ModalContent) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowModal(false)}
      className="fixed inset-0 h-screen w-screen flex items-center justify-center bg-crust/70 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md mx-4 bg-base rounded-xl border-surface1 border p-8 shadow-2xl"
      >
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 p-2 hover:bg-surface0 rounded-sm transition-colors group"
          aria-label="Close modal"
        >
          <XmarkIcon className="w-5 h-5 fill-overlay0 group-hover:fill-text transition-colors" />
        </button>
        <ModalContent />
        {/*<Login />*/}
      </motion.div>
    </motion.div>
  );
};
