import { Note, NoteRead } from "@/api/notes";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Login } from "@/pages/Login";

interface HSL {
  H: Number;
  S: Number;
  L: Number;
}

export interface ColourState {
  base: string;
  surface0: string;
  surface1: string;
  overlay0: string;
  overlay1: string;
  text: string;
  subtext: string;
  accent: string;
  warn: string;
  success: string;
  danger: string;
}

interface UIState {
  updating: boolean;
  setUpdating: (update: boolean) => void;

  showModal: boolean;
  setShowModal: (show: boolean) => void;

  modalContent: React.ComponentType | null;
  setModalContent: (content: React.ComponentType) => void;

  sideBarResize: number;
  setSideBarResize: (size: number) => void;

  sideBarView: string;
  setSideBarView: (view: string) => void;

  editorView: string;
  setEditorView: (view: string) => void;

  selectedNote: NoteRead | null;
  setSelectedNote: (note: NoteRead | null) => void;

  selectedFolder: number | null;
  setSelectedFolder: (id: number | null) => void;

  colourScheme: ColourState;
  setColourScheme: (colors: ColourState) => void;
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
      modalContent: null,
      setModalContent: (content) => {
        set({ modalContent: content });
      },
      sideBarResize: 300,
      setSideBarResize: (size) => {
        set({ sideBarResize: size });
      },
      sideBarView: "folders",
      setSideBarView: (view) => {
        set({ sideBarView: view });
      },
      editorView: "parsed",
      setEditorView: (view) => {
        set({ editorView: view });
      },
      selectedNote: null,

      setSelectedNote: (id: NoteRead | null) => {
        set({ selectedNote: id });
      },
      selectedFolder: null,

      setSelectedFolder: (id: number | null) => {
        set({ selectedFolder: id });
      },

      colourScheme: {
        base: "#24273a",
        surface0: "#1e2030",
        surface1: "#181926",
        overlay0: "#363a4f",
        overlay1: "#494d64",
        text: "#cad3f5",
        subtext: "#b8c0e0",
        accent: "#e2a16f",
        danger: "#e26f6f",
        success: "#6fe29b",
        warn: "#e2c56f",
      },

      setColourScheme: (colors: ColourState) => {
        set({ colourScheme: colors });

        Object.entries(colors).forEach(([key, value]) => {
          document.documentElement.style.setProperty(`--color-${key}`, value);
        });
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
