import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderCreate,
  FolderTreeNode,
  FolderTreeResponse,
  FolderUpdate,
  folderApi,
} from "@/api/folders";
import { NoteRead, NoteCreate, notesApi } from "@/api/notes";
import { useAuthStore } from "@/stores/authStore";

export const useFolderTree = () => {
  const { encryptionKey } = useAuthStore();

  return useQuery({
    queryKey: ["folders", "tree"],
    queryFn: folderApi.tree,
    enabled: !!encryptionKey,
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folder: FolderCreate) => folderApi.create(folder),

    onMutate: async (newFolder) => {
      await queryClient.cancelQueries({ queryKey: ["folders", "tree"] });

      const previousFolderTree = queryClient.getQueryData(["folders", "tree"]);

      queryClient.setQueryData(
        ["folders", "tree"],
        (old: FolderTreeResponse | undefined) => {
          const prev = old || { folders: [], orphanedNotes: [] };

          const tempFolder: FolderTreeNode = {
            id: -Date.now(),
            name: newFolder.name,
            notes: [],
            children: [],
          };
          if (!newFolder.parentId) {
            return {
              ...prev,
              folders: [...prev.folders, tempFolder],
            };
          }

          const addToParent = (folders: FolderTreeNode[]): FolderTreeNode[] => {
            return folders.map((folder) => {
              if (folder.id === newFolder.parentId) {
                return {
                  ...folder,
                  children: [...folder.children, tempFolder],
                };
              }
              return { ...folder, children: addToParent(folder.children) };
            });
          };

          return { ...prev, folders: addToParent(prev.folders) };
        },
      );
      return { previousFolderTree };
    },
    onError: (err, newFolder, context) => {
      queryClient.setQueryData(
        ["folders", "tree"],
        context?.previousFolderTree,
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", "tree"] });
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      folderId,
      folder,
    }: {
      folderId: number;
      folder: FolderUpdate;
    }) => folderApi.update(folderId, folder),

    onMutate: async ({ folderId, folder }) => {
      await queryClient.cancelQueries({ queryKey: ["folders", "tree"] });

      const previousFolderTree = queryClient.getQueryData(["folders", "tree"]);

      queryClient.setQueryData(
        ["folders", "tree"],
        (old: FolderTreeResponse | undefined) => {
          const prev = old || { folders: [], orphanedNotes: [] };

          const updateInTree = (
            folders: FolderTreeNode[],
          ): FolderTreeNode[] => {
            return folders.map((f) => {
              if (f.id == folderId) {
                return {
                  ...f,
                  ...folder,
                };
              }
              return {
                ...f,
                children: updateInTree(f.children),
              };
            });
          };
          return { ...prev, folders: updateInTree(prev.folders) };
        },
      );
      return { previousFolderTree };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["folders", "tree"],
        context?.previousFolderTree,
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", "tree"] });
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteId,
      note,
    }: {
      noteId: number;
      note: Partial<NoteRead>;
    }) => notesApi.update(noteId, note),

    onMutate: async ({ noteId, note }) => {
      await queryClient.cancelQueries({ queryKey: ["folders", "tree"] });

      const previousFolderTree = queryClient.getQueryData(["folders", "tree"]);

      queryClient.setQueryData(
        ["folders", "tree"],
        (old: FolderTreeResponse | undefined) => {
          const prev = old || { folders: [], orphanedNotes: [] };

          const updateNoteInTree = (
            folders: FolderTreeNode[],
          ): FolderTreeNode[] => {
            return folders.map((folder) => ({
              ...folder,
              notes: folder.notes.map((n) =>
                n.id === noteId ? { ...n, ...note } : n,
              ),
              children: updateNoteInTree(folder.children),
            }));
          };

          return {
            folders: updateNoteInTree(prev.folders),
            orphanedNotes: prev.orphanedNotes.map((n) =>
              n.id === noteId ? { ...n, ...note } : n,
            ),
          };
        },
      );

      return { previousFolderTree };
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["folders", "tree"],
        context?.previousFolderTree,
      );
      console.log(err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", "tree"] });
    },
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (note: NoteCreate) => notesApi.create(note),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", "tree"] });
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: number) => notesApi.delete(noteId),

    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["folders", "tree"] });

      const previousFolderTree = queryClient.getQueryData(["folders", "tree"]);

      queryClient.setQueryData(
        ["folders", "tree"],
        (old: FolderTreeResponse | undefined) => {
          const prev = old || { folders: [], orphanedNotes: [] };

          const removeNoteFromTree = (
            folders: FolderTreeNode[],
          ): FolderTreeNode[] => {
            return folders.map((folder) => ({
              ...folder,
              notes: folder.notes.filter((n) => n.id !== noteId),
              children: removeNoteFromTree(folder.children),
            }));
          };

          return {
            folders: removeNoteFromTree(prev.folders),
            orphanedNotes: prev.orphanedNotes.filter((n) => n.id !== noteId),
          };
        },
      );

      return { previousFolderTree };
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["folders", "tree"],
        context?.previousFolderTree,
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", "tree"] });
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: number) => folderApi.delete(folderId),

    onMutate: async (folderId) => {
      await queryClient.cancelQueries({ queryKey: ["folders", "tree"] });

      const previousFolderTree = queryClient.getQueryData(["folders", "tree"]);

      queryClient.setQueryData(
        ["folders", "tree"],
        (old: FolderTreeResponse | undefined) => {
          const prev = old || { folders: [], orphanedNotes: [] };

          const removeFolderFromTree = (
            folders: FolderTreeNode[],
          ): FolderTreeNode[] => {
            return folders
              .filter((folder) => folder.id !== folderId)
              .map((folder) => ({
                ...folder,
                children: removeFolderFromTree(folder.children),
              }));
          };

          return {
            folders: removeFolderFromTree(prev.folders),
            orphanedNotes: prev.orphanedNotes,
          };
        },
      );

      return { previousFolderTree };
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["folders", "tree"],
        context?.previousFolderTree,
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", "tree"] });
    },
  });
};
