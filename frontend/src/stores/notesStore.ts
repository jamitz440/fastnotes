import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  folderApi,
  FolderCreate,
  FolderTreeNode,
  FolderTreeResponse,
  NoteRead,
} from "../api/folders";
import { Note, NoteCreate, notesApi } from "../api/notes";

// Helper function to update a note within the folder tree
const updateNoteInTree = (
  tree: FolderTreeResponse | null,
  updatedNote: NoteRead,
): FolderTreeResponse | null => {
  if (!tree) return null;

  const updateNotesInFolder = (folder: FolderTreeNode): FolderTreeNode => ({
    ...folder,
    notes: folder.notes.map((note) =>
      note.id === updatedNote.id ? updatedNote : note,
    ),
    children: folder.children.map(updateNotesInFolder),
  });

  return {
    folders: tree.folders.map(updateNotesInFolder),
    orphaned_notes: tree.orphaned_notes.map((note) =>
      note.id === updatedNote.id ? updatedNote : note,
    ),
  };
};

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
  moveNoteToFolder: (noteId: number, folderId: number) => Promise<void>;
  moveFolderToFolder: (folderId: number, newParentId: number) => Promise<void>;
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      folderTree: null,
      selectedFolder: null,
      selectedNote: null,

      setContent: (content) => {
        const currentNote = get().selectedNote;
        if (currentNote) {
          const updatedNote = { ...currentNote, content: content };
          set({
            selectedNote: updatedNote,
            folderTree: updateNoteInTree(get().folderTree, updatedNote),
          });
        }
      },

      setTitle: (title) => {
        const currentNote = get().selectedNote;
        if (currentNote) {
          const updatedNote = { ...currentNote, title: title };
          set({
            selectedNote: updatedNote,
            folderTree: updateNoteInTree(get().folderTree, updatedNote),
          });
        }
      },

      loadFolderTree: async () => {
        const data = await folderApi.tree();
        console.log("getting tree");
        set({ folderTree: data });
      },

      createNote: async (note: Partial<NoteRead>) => {
        const response = await notesApi.create(note as NoteCreate);
        const newNote = response.data as NoteRead;
        console.log(newNote.id);
        const noteToAppend: NoteRead = {
          ...newNote,
          title: note.title || "Untitled",
          content: note.content || "",
        };

        const tree = get().folderTree;
        if (!tree) return;

        if (note.folder_id) {
          const addNoteToFolder = (folder: FolderTreeNode): FolderTreeNode => {
            if (folder.id === note.folder_id) {
              return {
                ...folder,
                notes: [...folder.notes, noteToAppend],
                children: folder.children.map(addNoteToFolder),
              };
            }
            return {
              ...folder,
              children: folder.children.map(addNoteToFolder),
            };
          };

          set({
            folderTree: {
              folders: tree.folders.map(addNoteToFolder),
              orphaned_notes: tree.orphaned_notes,
            },
          });
        } else {
          // Add to orphaned notes
          set({
            folderTree: {
              folders: tree.folders,
              orphaned_notes: [...tree.orphaned_notes, noteToAppend],
            },
          });
        }
      },

      createFolder: async (folder: FolderCreate) => {
        const response = await folderApi.create(folder);
        const newFolder = response.data;
        const tree = get().folderTree;
        if (!tree) return;

        const newFolderNode: FolderTreeNode = {
          id: newFolder.id,
          name: newFolder.name,
          notes: [],
          children: [],
        };

        if (folder.parent_id) {
          // Add as child of parent folder
          const addToParent = (f: FolderTreeNode): FolderTreeNode => {
            if (f.id === folder.parent_id) {
              return {
                ...f,
                children: [...f.children, newFolderNode],
              };
            }
            return {
              ...f,
              children: f.children.map(addToParent),
            };
          };

          set({
            folderTree: {
              folders: tree.folders.map(addToParent),
              orphaned_notes: tree.orphaned_notes,
            },
          });
        } else {
          // Add as top-level folder
          set({
            folderTree: {
              folders: [...tree.folders, newFolderNode],
              orphaned_notes: tree.orphaned_notes,
            },
          });
        }
      },

      updateNote: async (id: number) => {
        const note = get().selectedNote as Partial<Note>;
        await notesApi.update(id, note);
        // await get().loadFolderTree();
      },

      setSelectedFolder: (id: number | null) => {
        set({ selectedFolder: id });
      },

      setSelectedNote: (id: NoteRead | null) => {
        set({ selectedNote: id });
      },

      moveNoteToFolder: async (noteId: number, folderId: number) => {
        const tree = get().folderTree;
        if (!tree) return;

        // Find and remove the note from its current location
        let noteToMove: NoteRead | null = null;

        // Check orphaned notes
        const orphanedIndex = tree.orphaned_notes.findIndex(
          (n) => n.id === noteId,
        );
        if (orphanedIndex !== -1) {
          noteToMove = tree.orphaned_notes[orphanedIndex];
        }

        // Check folders recursively
        const findAndRemoveNote = (folder: FolderTreeNode): FolderTreeNode => {
          const noteIndex = folder.notes.findIndex((n) => n.id === noteId);
          if (noteIndex !== -1) {
            noteToMove = folder.notes[noteIndex];
            return {
              ...folder,
              notes: folder.notes.filter((n) => n.id !== noteId),
              children: folder.children.map(findAndRemoveNote),
            };
          }
          return {
            ...folder,
            children: folder.children.map(findAndRemoveNote),
          };
        };

        // Add note to target folder
        const addNoteToFolder = (folder: FolderTreeNode): FolderTreeNode => {
          if (folder.id === folderId && noteToMove) {
            return {
              ...folder,
              notes: [...folder.notes, { ...noteToMove, folder_id: folderId }],
              children: folder.children.map(addNoteToFolder),
            };
          }
          return {
            ...folder,
            children: folder.children.map(addNoteToFolder),
          };
        };

        // Update local tree
        let newFolders = tree.folders.map(findAndRemoveNote);
        let newOrphaned = tree.orphaned_notes.filter((n) => n.id !== noteId);
        newFolders = newFolders.map(addNoteToFolder);

        set({
          folderTree: {
            folders: newFolders,
            orphaned_notes: newOrphaned,
          },
        });

        // Update backend
        await notesApi.update(noteId, { folder_id: folderId });
      },

      moveFolderToFolder: async (folderId: number, newParentId: number) => {
        const tree = get().folderTree;
        if (!tree) return;

        let folderToMove: FolderTreeNode | null = null;

        // Find and remove folder from current location
        const findAndRemoveFolder = (
          folders: FolderTreeNode[],
        ): FolderTreeNode[] => {
          return folders
            .filter((f) => {
              if (f.id === folderId) {
                folderToMove = f;
                return false;
              }
              return true;
            })
            .map((f) => ({
              ...f,
              children: findAndRemoveFolder(f.children),
            }));
        };

        // Add folder to new parent
        const addFolderToParent = (
          folders: FolderTreeNode[],
        ): FolderTreeNode[] => {
          return folders.map((f) => {
            if (f.id === newParentId && folderToMove) {
              return {
                ...f,
                children: [...f.children, folderToMove],
              };
            }
            return {
              ...f,
              children: addFolderToParent(f.children),
            };
          });
        };

        let newFolders = findAndRemoveFolder(tree.folders);
        newFolders = addFolderToParent(newFolders);

        set({
          folderTree: {
            folders: newFolders,
            orphaned_notes: tree.orphaned_notes,
          },
        });

        // Update backend
        await folderApi.update(folderId, { parent_id: newParentId });
      },
    }),
    {
      name: "notes-storage",
      partialize: (state) => ({
        folderTree: state.folderTree,
      }),
    },
  ),
);
