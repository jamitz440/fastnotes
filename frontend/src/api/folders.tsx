import axios from "axios";
import { decryptFolderTree, deriveKey } from "./encryption";

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

export interface FolderUpdate {
  name?: string;
  parent_id?: number | null;
}

const getFolderTree = async () => {
  const { data } = await axios.get<FolderTreeResponse>(
    `${API_URL}/folders/tree`,
  );
  var key = await deriveKey("Test");
  const decryptedFolderTree = await decryptFolderTree(data, key);

  return decryptedFolderTree;
};

const updateFolder = async (id: number, folder: FolderUpdate) => {
  console.log(`Updating folder ${id} with:`, folder);
  try {
    const response = await axios.patch(`${API_URL}/folders/${id}`, folder);
    console.log(`Folder ${id} update response:`, response.data);
    return response;
  } catch (error) {
    console.error(`Failed to update folder ${id}:`, error);
    throw error;
  }
};

export const folderApi = {
  tree: () => getFolderTree(),
  list: () => axios.get<Folder[]>(`${API_URL}/folders`),
  create: (folder: FolderCreate) =>
    axios.post<Folder>(`${API_URL}/folders`, folder),
  delete: (id: number) => axios.delete(`${API_URL}/folders/${id}`),
  update: (id: number, updateData: FolderUpdate) =>
    updateFolder(id, updateData),
};
