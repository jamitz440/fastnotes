import { create } from "zustand";

interface UIState {
  updating: boolean;
  setUpdating: (update: boolean) => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
  updating: false,
  setUpdating: (update) => {
    set({ updating: update });
  },
}));
