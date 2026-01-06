import { Folder, FolderTreeNode, FolderTreeResponse } from "@/api/folders";
import { NoteRead } from "@/api/notes";

export const createNoteMap = (
  folderTree: FolderTreeResponse,
): Map<number, NoteRead> => {
  const flatenedNotes = flattenNotes(folderTree);
  const noteMap = new Map();

  for (const note of flatenedNotes) {
    noteMap.set(note.id, note);
  }

  return noteMap;
};

export const flattenNotes = (response: FolderTreeResponse): NoteRead[] => {
  const allNotes = [...response.orphanedNotes];

  const processFolder = (folder: FolderTreeNode) => {
    allNotes.push(...folder.notes);
    folder.children.forEach(processFolder);
  };

  response.folders.forEach(processFolder);

  return allNotes;
};
