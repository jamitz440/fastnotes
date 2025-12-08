import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  updating: boolean;
  setUpdating: (update: boolean) => void;

  showModal: boolean;
  setShowModal: (show: boolean) => void;

  sideBarResize: number;
  setSideBarResize: (size: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      updating: false,
      setUpdating: (update) => {
        set({ updating: update });
      },
      showModal: false,
      setShowModal: (show) => {
        set({ showModal: show });
      },
      sideBarResize: 300,
      setSideBarResize: (size) => {
        set({ sideBarResize: size });
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
