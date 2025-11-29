import axios from "axios";
import { NoteRead } from "./folders";
import { deriveKey, encryptString, decryptString } from "./encryption";

const API_URL = import.meta.env.PROD ? "/api" : "http://localhost:8000/api";

export interface Note {
  id: number;
  title: string;
  folder_id?: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface NoteCreate {
  title: string;
  content: string;
  folder_id: number | null;
}

const createNote = async (note: NoteCreate) => {
  var key = await deriveKey("Test");
  var noteContent = await encryptString(note.content, key);
  var noteTitle = await encryptString(note.title, key);

  var encryptedNote = {
    title: noteTitle,
    content: noteContent,
    folder_id: note.folder_id,
  };

  console.log(encryptedNote);
  return axios.post(`${API_URL}/notes`, encryptedNote);
};

const fetchNotes = async () => {
  const { data } = await axios.get(`${API_URL}/notes`);

  console.log(data);
  var key = await deriveKey("Test");
  const decryptedNotes = await Promise.all(
    data.map(async (note: Note) => ({
      ...note,
      title: await decryptString(note.title, key),
      content: await decryptString(note.content, key),
    })),
  );

  return decryptedNotes;
};

const updateNote = async (id: number, note: Partial<Note>) => {
  var key = await deriveKey("Test");
  var encryptedNote: Partial<Note> = {};
  if (note.content) {
    encryptedNote.content = await encryptString(note.content, key);
  }
  if (note.title) {
    encryptedNote.title = await encryptString(note.title, key);
  }
  if (note.folder_id) {
    encryptedNote.folder_id = note.folder_id;
  }

  return axios.patch(`${API_URL}/notes/${id}`, encryptedNote);
};

export const notesApi = {
  list: () => fetchNotes(),
  get: (id: number) => axios.get(`${API_URL}/notes/${id}`),
  create: (note: NoteCreate) => createNote(note),
  update: (id: number, note: Partial<Note>) => updateNote(id, note),
  delete: (id: number) => axios.delete(`${API_URL}/notes/${id}`),
};
