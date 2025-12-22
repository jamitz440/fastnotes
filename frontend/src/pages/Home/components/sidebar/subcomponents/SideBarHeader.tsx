import { SetStateAction } from "react";
// @ts-ignore
import FolderPlusIcon from "@assets/fontawesome/svg/folder-plus.svg?react";
// @ts-ignore
import TagsIcon from "@assets/fontawesome/svg/tags.svg?react";
// @ts-ignore
import FileCirclePlusIcon from "@assets/fontawesome/svg/file-circle-plus.svg?react";
import { useUIStore } from "@/stores/uiStore";
import { useCreateNote } from "@/hooks/useFolders";
import { NoteCreate } from "@/api/notes";

export const SidebarHeader = ({
  setNewFolder,
}: {
  setNewFolder: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const { setSideBarView, sideBarView, selectedFolder } = useUIStore();
  const createNote = useCreateNote();
  const handleCreate = async () => {
    createNote.mutate({
      title: "Untitled",
      content: "",
      folder_id: selectedFolder,
    } as NoteCreate);
  };
  return (
    <div className="w-full p-2 border-b border-ctp-surface2 bg-ctp-mantle">
      <div className="flex items-center justify-around bg-ctp-surface0 rounded-lg p-0.5">
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
    </div>
  );
};
