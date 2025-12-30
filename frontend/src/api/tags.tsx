import { client } from "./client";
import { components } from "@/types/api";
import { encryptString, decryptTagTree } from "./encryption";
import { useAuthStore } from "../stores/authStore";
import { CamelCasedPropertiesDeep } from "type-fest";

export type Tag = CamelCasedPropertiesDeep<components["schemas"]["Tag"]>;

export type TagTreeNode = CamelCasedPropertiesDeep<
  components["schemas"]["TagTreeNode"]
>;
export type TagCreate = CamelCasedPropertiesDeep<
  components["schemas"]["TagCreate"]
>;
export type TagRead = CamelCasedPropertiesDeep<
  components["schemas"]["TagRead"]
>;
export type TagTreeResponse = CamelCasedPropertiesDeep<
  components["schemas"]["TagTreeResponse"]
>;

const fetchTags = async () => {
  const encryptionKey = useAuthStore.getState().encryptionKey;
  if (!encryptionKey) throw new Error("Not authenticated");

  const response = await client.GET("/api/tags/tree", {});

  if (response.error) throw new Error("Failed to fetch tags");
  if (!response.data) throw new Error("No data returned");

  const data = response.data;

  const tags = decryptTagTree(data.tags as any, encryptionKey);
  return tags;
};

const createTag = async (tag: TagCreate): Promise<TagTreeNode> => {
  const encryptionKey = useAuthStore.getState().encryptionKey;
  if (!encryptionKey) throw new Error("Not authenticated");

  const tagName = await encryptString(tag.name, encryptionKey);

  // Use the exact structure from TagCreate schema
  const { data, error } = await client.POST("/api/tags/", {
    body: {
      name: tagName,
      parentId: tag.parentId || null,
    },
  });

  if (error) throw new Error("Failed to create tag");
  return data as unknown as TagTreeNode;
};

const addTagToNote = async (tagId: number, noteId: number) => {
  const { data, error } = await client.POST(
    "/api/tags/note/{note_id}/tag/{tag_id}",
    {
      params: {
        path: {
          note_id: noteId,
          tag_id: tagId,
        },
      },
    },
  );

  if (error) throw new Error("Failed to add tag to note");
  return data;
};

const deleteTag = async (tagId: number) => {
  const { error } = await client.DELETE("/api/tags/{tag_id}", {
    params: {
      path: {
        tag_id: tagId,
      },
    },
  });

  if (error) throw new Error("Failed to delete tag");
};

export const tagsApi = {
  list: fetchTags,
  create: createTag,
  addToNote: addTagToNote,
  delete: deleteTag,
};
