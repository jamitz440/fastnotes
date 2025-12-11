import { SetStateAction } from "react";
// @ts-ignore
import FolderPlusIcon from "@assets/fontawesome/svg/folder-plus.svg?react";
// @ts-ignore
import FileCirclePlusIcon from "@assets/fontawesome/svg/file-circle-plus.svg?react";
import { useNoteStore } from "@/stores/notesStore";

export const SidebarHeader = ({
  setNewFolder,
}: {
  setNewFolder: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const { createNote, selectedFolder } = useNoteStore();
  const handleCreate = async () => {
    await createNote({
      title: "Untitled",
      content: "",
      folder_id: selectedFolder,
    });
  };
  return (
    <div className="flex items-center justify-center w-full gap-2 bg-ctp-mantle border-b border-ctp-surface0 p-1">
      <button
        onClick={() => setNewFolder(true)}
        className="hover:bg-ctp-mauve group transition-colors rounded-sm p-2"
        title="New folder"
      >
        <FolderPlusIcon className="w-4 h-4 group-hover:fill-ctp-base transition-colors fill-ctp-mauve" />
      </button>
      <button
        onClick={handleCreate}
        className="hover:bg-ctp-mauve group transition-colors rounded-sm p-2 fill-ctp-mauve hover:fill-ctp-base"
        title="New note"
      >
        <FileCirclePlusIcon className="w-4 h-4 text-ctp-mauve group-hover:text-ctp-base transition-colors" />
      </button>
    </div>
  );
};
