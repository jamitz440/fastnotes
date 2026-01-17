import { SetStateAction } from "react";
// @ts-ignore
import FolderPlusIcon from "@assets/fontawesome/svg/folder-plus.svg?react";
// @ts-ignore
import TagsIcon from "@assets/fontawesome/svg/tags.svg?react";
// @ts-ignore
import FileCirclePlusIcon from "@assets/fontawesome/svg/file-circle-plus.svg?react";
// @ts-ignore
import GearIcon from "@assets/fontawesome/svg/gear.svg?react";
import { useUIStore } from "@/stores/uiStore";
import { useCreateNote } from "@/hooks/useFolders";
import { NoteCreate } from "@/api/notes";
import { Login } from "@/pages/Login";
import { ColourState } from "@/stores/uiStore";

const Test = () => {
  const { colourScheme, setColourScheme } = useUIStore();

  const handleColor = (key: string, value: string) => {
    setColourScheme({
      ...colourScheme,
      [key]: value,
    });
  };

  return (
    <>
      {Object.entries(colourScheme).map(([key, value]) => (
        <div key={key}>
          <label>{key}</label>
          <input
            type="color"
            value={value}
            onChange={(e) => handleColor(key, e.target.value)}
          />
        </div>
      ))}
    </>
  );
};

export const SidebarHeader = ({
  setNewFolder,
}: {
  setNewFolder: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const { selectedFolder, setShowModal, setModalContent } = useUIStore();
  const createNote = useCreateNote();
  const handleCreate = async () => {
    createNote.mutate({
      title: "Untitled",
      content: "",
      folder_id: selectedFolder,
    } as NoteCreate);
  };

  const handleSettings = () => {
    setModalContent(Test);
    setShowModal(true);
  };
  return (
    <div className="w-full p-2 border-b border-surface1 bg-surface1">
      <div className="flex items-center justify-around bg-surface0 rounded-lg p-1 gap-1">
        <button
          onClick={() => setNewFolder(true)}
          className="hover:bg-accent-500 active:scale-95 group transition-all duration-200 rounded-md p-2 hover:shadow-md"
          title="New folder"
        >
          <FolderPlusIcon className="w-5 h-5 group-hover:fill-base transition-all duration-200 fill-accent-500" />
        </button>
        <button
          onClick={handleCreate}
          className="hover:bg-accent-500 active:scale-95 group transition-all duration-200 rounded-md p-2 hover:shadow-md"
          title="New note"
        >
          <FileCirclePlusIcon className="w-5 h-5 group-hover:fill-base transition-all duration-200 fill-accent-500" />
        </button>
        <button
          onClick={handleSettings}
          className="hover:bg-accent-500 active:scale-95 group transition-all duration-200 rounded-md p-2 hover:shadow-md"
          title="New note"
        >
          <GearIcon className="w-5 h-5 group-hover:fill-base transition-all duration-200 fill-accent-500" />
        </button>
      </div>
    </div>
  );
};
