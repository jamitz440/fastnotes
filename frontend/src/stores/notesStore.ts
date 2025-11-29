import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { folderApi, FolderCreate, FolderTreeResponse } from "../api/folders";
import { Note, NoteCreate, notesApi } from "../api/notes";

interface NoteState {
  folderTree: FolderTreeResponse | null;
  selectedFolder: number | null;

  loadFolderTree: () => Promise<void>;
  createNote: (note: NoteCreate) => Promise<void>;
  createFolder: (folder: FolderCreate) => Promise<void>;
  updateNote: (id: number, note: Partial<Note>) => Promise<void>;
}

export const useNoteStore = create<NoteState>()((set, get) => ({
  folderTree: null,
  selectedFolder: null,

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

  updateNote: async (id: number, note: Partial<Note>) => {
    await notesApi.update(id, note);
    await get().loadFolderTree();
  },
}));
