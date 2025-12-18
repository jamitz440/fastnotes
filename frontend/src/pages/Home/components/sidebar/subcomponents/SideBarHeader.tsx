import { SetStateAction } from "react";
// @ts-ignore
import FolderPlusIcon from "@assets/fontawesome/svg/folder-plus.svg?react";
// @ts-ignore
import TagsIcon from "@assets/fontawesome/svg/tags.svg?react";
// @ts-ignore
import FileCirclePlusIcon from "@assets/fontawesome/svg/file-circle-plus.svg?react";
import { useNoteStore } from "@/stores/notesStore";
import { useUIStore } from "@/stores/uiStore";

export const SidebarHeader = ({
  setNewFolder,
}: {
  setNewFolder: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const { createNote, selectedFolder } = useNoteStore();
  const { setSideBarView, sideBarView } = useUIStore();
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
        className="hover:bg-ctp-mauve group transition-colors rounded-sm p-1 m-1"
        title="New folder"
      >
        <FolderPlusIcon className="w-5 h-5 group-hover:fill-ctp-base transition-colors fill-ctp-mauve" />
      </button>
      <button
        onClick={() =>
          setSideBarView(sideBarView == "tags" ? "folders" : "tags")
        }
        className="hover:bg-ctp-mauve group transition-colors rounded-sm p-1 m-1"
        title="Tags"
      >
        <TagsIcon className="w-5 h-5 group-hover:fill-ctp-base transition-colors fill-ctp-mauve" />
      </button>
      <button
        onClick={handleCreate}
        className="hover:bg-ctp-mauve group transition-colors rounded-sm p-1 m-1 fill-ctp-mauve hover:fill-ctp-base"
        title="New note"
      >
        <FileCirclePlusIcon className="w-5 h-5 text-ctp-mauve group-hover:text-ctp-base transition-colors" />
      </button>
    </div>
  );
};
