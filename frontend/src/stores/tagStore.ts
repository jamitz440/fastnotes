import { tagsApi } from "@/api/tags";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Tag {
  id: string;
  name: string;
  parent_id?: number;
  created_at: string;
  parent_path: string;
  children: Tag[];
}

interface TagStore {
  tagTree: Tag[] | null;
  getTagTree: () => void;
}

export const useTagStore = create<TagStore>()(
  persist(
    (set, get) => ({
      tagTree: null,

      getTagTree: async () => {
        const tags = await tagsApi.list();
        set({ tagTree: tags });
      },
    }),
    {
      name: "tags-storage",
      partialize: (state) => ({
        tagTree: state.tagTree,
      }),
    },
  ),
);
