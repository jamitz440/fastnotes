import { encryptString, decryptString } from "./encryption";
import { useAuthStore } from "../stores/authStore";
import { CamelCasedPropertiesDeep } from "type-fest";
import { components } from "@/types/api";
import client from "./client";

export type NoteRead = CamelCasedPropertiesDeep<
  components["schemas"]["NoteRead"]
>;
export type NoteCreate = CamelCasedPropertiesDeep<
  components["schemas"]["NoteCreate"]
>;

const createNote = async (note: NoteCreate) => {
  const encryptionKey = useAuthStore.getState().encryptionKey;
  if (!encryptionKey) throw new Error("Not authenticated");

  var noteContent = await encryptString(note.content, encryptionKey);
  var noteTitle = await encryptString(note.title, encryptionKey);

  var encryptedNote = {
    title: noteTitle,
    content: noteContent,
    folderId: note.folderId,
  };

  console.log(encryptedNote);
  return client.POST(`/api/notes/`, { body: encryptedNote });
};
const fetchNotes = async () => {
  const encryptionKey = useAuthStore.getState().encryptionKey;
  if (!encryptionKey) throw new Error("Not authenticated");

  const { data } = await client.GET(`/api/notes/`);

  console.log(data);
  const decryptedNotes = await Promise.all(
    data.map(async (note: NoteRead) => ({
      ...note,
      title: await decryptString(note.title, encryptionKey),
      content: await decryptString(note.content, encryptionKey),
      tags: await Promise.all(
        note.tags.map(async (tag) => ({
          ...tag,
          name: await decryptString(tag.name, encryptionKey),
        })),
      ),
    })),
  );
  return decryptedNotes;
};

const updateNote = async (id: number, note: Partial<NoteRead>) => {
  const encryptionKey = useAuthStore.getState().encryptionKey;
  if (!encryptionKey) throw new Error("Not authenticated");

  var encryptedNote: Partial<NoteRead> = {};
  if (note.content) {
    encryptedNote.content = await encryptString(note.content, encryptionKey);
  }
  if (note.title) {
    encryptedNote.title = await encryptString(note.title, encryptionKey);
  }
  if (note.folderId) {
    encryptedNote.folderId = note.folderId;
  }
  // if (!note.folderId){
  //   throw new Error("Folder id missing from note.")
  // }
  const { data, error } = await client.PATCH(`/api/notes/{note_id}`, {
    body: encryptedNote,
    params: {
      path: {
        note_id: id,
      },
    },
  });

  if (data) {
    console.log(data);
  }
  if (error) {
    console.log(error);
  }
};

export const notesApi = {
  list: () => fetchNotes(),
  get: (id: number) =>
    client.GET(`/api/notes/{note_id}`, {
      params: {
        path: {
          note_id: id,
        },
      },
    }),
  create: (note: NoteCreate) => createNote(note),
  update: (id: number, note: Partial<NoteRead>) => updateNote(id, note),
  delete: (id: number) =>
    client.DELETE(`/api/notes/{note_id}`, {
      params: {
        path: {
          note_id: id,
        },
      },
    }),
};
