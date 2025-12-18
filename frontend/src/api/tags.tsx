import axios from "axios";
import { encryptString, decryptTagTree } from "./encryption";
import { useAuthStore } from "../stores/authStore";
axios.defaults.withCredentials = true;
const API_URL = (import.meta as any).env.PROD
  ? "/api"
  : "http://localhost:8000/api";

export interface Tag {
  id: string;
  name: string;
  parent_id?: number;
  created_at: string;
  children: Tag[];
  parent_path: string;
}

export interface TagCreate {
  name: string;
  parent_id?: number;
}

const fetchTags = async () => {
  const encryptionKey = useAuthStore.getState().encryptionKey;
  if (!encryptionKey) throw new Error("Not authenticated");

  const { data } = await axios.get(`${API_URL}/tags/tree`);
  const tags = decryptTagTree(data.tags, encryptionKey);
  console.log(await tags);
  return tags;
};

const createTag = async (tag: TagCreate, noteId?: number) => {
  const encryptionKey = useAuthStore.getState().encryptionKey;
  if (!encryptionKey) throw new Error("Not authenticated");

  const tagName = await encryptString(tag.name, encryptionKey);
  const encryptedTag = {
    name: tagName,
    parent_id: tag.parent_id,
  };

  const r = await axios.post(`${API_URL}/tags/`, encryptedTag);
  console.log(r);

  if (noteId) {
    return await addTagToNote(r.data.id, noteId);
  }
};

const addTagToNote = async (tagId: number, noteId: number) => {
  return axios.post(`${API_URL}/tags/note/${noteId}/tag/${tagId}`);
};

const deleteTag = async (tagId: number) => {
  return axios.delete(`${API_URL}/tags/${tagId}`);
};

export const tagsApi = {
  list: async () => await fetchTags(),
  create: (tag: TagCreate, noteId?: number) => createTag(tag, noteId),
  delete: (tagId: number) => deleteTag(tagId),
};
