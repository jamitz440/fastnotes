import axios from "axios";
import { NoteRead } from "./folders";
import { encryptString, decryptString } from "./encryption";
import { useAuthStore } from "../stores/authStore";
axios.defaults.withCredentials = true;
const API_URL = (import.meta as any).env.PROD
  ? "/api"
  : "http://localhost:8000/api";

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
  const encryptionKey = useAuthStore.getState().encryptionKey;
  if (!encryptionKey) throw new Error("Not authenticated");

  var noteContent = await encryptString(note.content, encryptionKey);
  var noteTitle = await encryptString(note.title, encryptionKey);

  var encryptedNote = {
    title: noteTitle,
    content: noteContent,
    folder_id: note.folder_id,
  };

  console.log(encryptedNote);
  return axios.post(`${API_URL}/notes/`, encryptedNote);
};
const fetchNotes = async () => {
  const encryptionKey = useAuthStore.getState().encryptionKey;
  if (!encryptionKey) throw new Error("Not authenticated");

  const { data } = await axios.get(`${API_URL}/notes/`);

  console.log(data);
  const decryptedNotes = await Promise.all(
    data.map(async (note: Note) => ({
      ...note,
      title: await decryptString(note.title, encryptionKey),
      content: await decryptString(note.content, encryptionKey),
    })),
  );

  return decryptedNotes;
};

const updateNote = async (id: number, note: Partial<Note>) => {
  const encryptionKey = useAuthStore.getState().encryptionKey;
  if (!encryptionKey) throw new Error("Not authenticated");

  var encryptedNote: Partial<Note> = {};
  if (note.content) {
    encryptedNote.content = await encryptString(note.content, encryptionKey);
  }
  if (note.title) {
    encryptedNote.title = await encryptString(note.title, encryptionKey);
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
