import { useAuthStore } from "../../../stores/authStore";
import { useUIStore } from "../../../stores/uiStore";
// @ts-ignore
import CheckIcon from "../../../assets/fontawesome/svg/circle-check.svg?react";
// @ts-ignore
import SpinnerIcon from "../../../assets/fontawesome/svg/rotate.svg?react";
// @ts-ignore
import WarningIcon from "../../../assets/fontawesome/svg/circle-exclamation.svg?react";
import { Login } from "@/pages/Login";

export const StatusIndicator = () => {
  const { encryptionKey } = useAuthStore();
  const { updating, setShowModal, editorView, setEditorView, setModalContent } =
    useUIStore();
  return (
    <div
      className="fixed bottom-2 right-3 bg-surface0 border border-surface1 rounded-sm px-2 py-0.5 flex items-center gap-2.5 shadow-lg backdrop-blur-sm"
      onClick={() => {
        if (!encryptionKey) {
          setModalContent(Login);
          setShowModal(true);
        }
      }}
    >
      <div
        className="select-none"
        onClick={() =>
          setEditorView(editorView == "parsed" ? "unparsed" : "parsed")
        }
      >
        {editorView}
      </div>
      {!encryptionKey ? (
        <WarningIcon className="h-4 w-4 my-1 [&_.fa-primary]:fill-warn [&_.fa-secondary]:fill-orange" />
      ) : updating ? (
        <>
          <SpinnerIcon className="animate-spin h-4 w-4 [&_.fa-primary]:fill-warn [&_.fa-secondary]:fill-sapphire" />
          {/*<span className="text-sm text-subtext font-medium">
            Saving...
          </span>*/}
        </>
      ) : (
        <>
          <CheckIcon className="h-4 w-4 [&_.fa-primary]:fill-success [&_.fa-secondary]:fill-teal" />
          {/*<span className="text-sm text-subtext font-medium">Saved</span>*/}
        </>
      )}
    </div>
  );
};
