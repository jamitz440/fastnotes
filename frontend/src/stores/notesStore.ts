import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  folderApi,
  FolderCreate,
  FolderTreeResponse,
  NoteRead,
} from "../api/folders";
import { Note, NoteCreate, notesApi } from "../api/notes";
import { getSelectedNode } from "@mdxeditor/editor";

interface NoteState {
  folderTree: FolderTreeResponse | null;
  selectedFolder: number | null;
  selectedNote: NoteRead | null;

  setContent: (content: string) => void;
  setTitle: (title: string) => void;
  loadFolderTree: () => Promise<void>;
  createNote: (note: NoteCreate) => Promise<void>;
  updateNote: (id: number) => Promise<void>;
  createFolder: (folder: FolderCreate) => Promise<void>;
  setSelectedFolder: (id: number | null) => void;
  setSelectedNote: (id: NoteRead | null) => void;
}

export const useNoteStore = create<NoteState>()((set, get) => ({
  folderTree: null,
  selectedFolder: null,
  selectedNote: null,

  setContent: (content) => {
    const currentNote = get().selectedNote;
    if (currentNote) {
      set({ selectedNote: { ...currentNote, content: content } });
    }
  },

  setTitle: (title) => {
    const currentNote = get().selectedNote;
    if (currentNote) {
      set({ selectedNote: { ...currentNote, title: title } });
    }
  },

  loadFolderTree: async () => {
    const data = await folderApi.tree();
    set({ folderTree: data });
  },

  createNote: async (note: NoteCreate) => {
    await notesApi.create(note);
    await get().loadFolderTree();
  },

  createFolder: async (folder: FolderCreate) => {
    await folderApi.create(folder);
    await get().loadFolderTree();
  },

  updateNote: async (id: number) => {
    const note = get().selectedNote as Partial<Note>;
    await notesApi.update(id, note);
    await get().loadFolderTree();
  },

  setSelectedFolder: (id: number | null) => {
    set({ selectedFolder: id });
  },

  setSelectedNote: (id: NoteRead | null) => {
    set({ selectedNote: id });
  },
}));
