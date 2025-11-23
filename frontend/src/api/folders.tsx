import axios from "axios";

const API_URL = import.meta.env.PROD ? "/api" : "http://localhost:8000/api";

export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  created_at: string;
}

export interface NoteRead {
  id: number;
  title: string;
  content: string;
  folder_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface FolderTreeNode {
  id: number;
  name: string;
  notes: NoteRead[];
  children: FolderTreeNode[];
}

export interface FolderTreeResponse {
  folders: FolderTreeNode[];
  orphaned_notes: NoteRead[];
}

export interface FolderCreate {
  name: string;
  parent_id: number | null;
}

export const folderApi = {
  tree: () => axios.get<FolderTreeResponse>(`${API_URL}/folders/tree`),
  list: () => axios.get<Folder[]>(`${API_URL}/folders`),
  create: (folder: FolderCreate) =>
    axios.post<Folder>(`${API_URL}/folders`, folder),
  delete: (id: number) => axios.delete(`${API_URL}/folders/${id}`),
};
