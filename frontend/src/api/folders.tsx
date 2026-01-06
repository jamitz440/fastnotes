import { decryptFolderTree } from "./encryption";
import { useAuthStore } from "../stores/authStore";
import { CamelCasedPropertiesDeep } from "type-fest";
import { components } from "@/types/api";
import client from "./client";

export type Folder = CamelCasedPropertiesDeep<components["schemas"]["Folder"]>;

export type FolderTreeNode = CamelCasedPropertiesDeep<
  components["schemas"]["FolderTreeNode"]
>;

export type FolderTreeResponse = CamelCasedPropertiesDeep<
  components["schemas"]["FolderTreeResponse"]
>;
export type FolderCreate = CamelCasedPropertiesDeep<
  components["schemas"]["FolderCreate"]
>;
export type FolderUpdate = CamelCasedPropertiesDeep<
  components["schemas"]["FolderUpdate"]
>;

const getFolderTree = async () => {
  const encryptionKey = useAuthStore.getState().encryptionKey;
  if (!encryptionKey) throw new Error("Not authenticated");

  const { data, error } = await client.GET("/folders/tree", {});

  const newData = data as unknown as FolderTreeResponse;

  const decryptedFolderTree = await decryptFolderTree(newData, encryptionKey);

  return decryptedFolderTree;
};

const updateFolder = async (id: number, folder: FolderUpdate) => {
  console.log(`Updating folder ${id} with:`, folder);
  try {
    const response = await client.PATCH("/folders/{folder_id}", {
      params: { path: { folder_id: id } },
      body: folder,
    });
    console.log(`Folder ${id} update response:`, response.data);
    return response;
  } catch (error) {
    console.error(`Failed to update folder ${id}:`, error);
    throw error;
  }
};

export const folderApi = {
  tree: () => getFolderTree(),
  list: () => client.GET("/folders/", {}),
  create: (folder: FolderCreate) => client.POST("/folders/", { body: folder }),
  delete: (id: number) =>
    client.DELETE("/folders/{folder_id}", {
      params: { path: { folder_id: id } },
    }),
  update: (id: number, updateData: FolderUpdate) =>
    updateFolder(id, updateData),
};
