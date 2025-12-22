import { Note } from "@/api/notes";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  updating: boolean;
  setUpdating: (update: boolean) => void;

  showModal: boolean;
  setShowModal: (show: boolean) => void;

  sideBarResize: number;
  setSideBarResize: (size: number) => void;

  sideBarView: string;
  setSideBarView: (view: string) => void;

  selectedNote: Note | null;
  setSelectedNote: (note: Note | null) => void;

  selectedFolder: number | null;
  setSelectedFolder: (id: number | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      updating: false,
      setUpdating: (update) => {
        set({ updating: update });
      },
      showModal: true,
      setShowModal: (show) => {
        set({ showModal: show });
      },
      sideBarResize: 300,
      setSideBarResize: (size) => {
        set({ sideBarResize: size });
      },
      sideBarView: "folders",
      setSideBarView: (view) => {
        set({ sideBarView: view });
      },
      selectedNote: null,

      setSelectedNote: (id: Note | null) => {
        set({ selectedNote: id });
      },
      selectedFolder: null,

      setSelectedFolder: (id: number | null) => {
        set({ selectedFolder: id });
      },
    }),

    {
      name: "ui-store",
      partialize: (state) => {
        return {
          sideBarResize: state.sideBarResize,
        };
      },
    },
  ),
);
