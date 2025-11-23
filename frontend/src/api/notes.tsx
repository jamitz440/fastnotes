import axios from "axios";

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

export const notesApi = {
  list: () => axios.get(`${API_URL}/notes`),
  get: (id: number) => axios.get(`${API_URL}/notes/${id}`),
  create: (note: NoteCreate) => axios.post(`${API_URL}/notes`, note),
  update: (id: number, note: Partial) =>
    axios.patch(`${API_URL}/notes/${id}`, note),
  delete: (id: number) => axios.delete(`${API_URL}/notes/${id}`),
};
