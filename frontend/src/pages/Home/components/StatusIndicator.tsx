import { useAuthStore } from "../../../stores/authStore";
import { useUIStore } from "../../../stores/uiStore";
// @ts-ignore
import CheckIcon from "../../../assets/fontawesome/svg/circle-check.svg?react";
// @ts-ignore
import SpinnerIcon from "../../../assets/fontawesome/svg/rotate.svg?react";
// @ts-ignore
import WarningIcon from "../../../assets/fontawesome/svg/circle-exclamation.svg?react";

export const StatusIndicator = () => {
  const { encryptionKey } = useAuthStore();
  const { updating, setShowModal } = useUIStore();
  return (
    <div
      className="fixed bottom-2 right-3 bg-ctp-surface0 border border-ctp-surface2 rounded-sm px-2 py-0.5 flex items-center gap-2.5 shadow-lg backdrop-blur-sm"
      onClick={() => {
        if (!encryptionKey) {
          setShowModal(true);
        }
      }}
    >
      {!encryptionKey ? (
        <WarningIcon className="h-4 w-4 my-1 [&_.fa-primary]:fill-ctp-yellow [&_.fa-secondary]:fill-ctp-orange" />
      ) : updating ? (
        <>
          <SpinnerIcon className="animate-spin h-4 w-4 [&_.fa-primary]:fill-ctp-blue [&_.fa-secondary]:fill-ctp-sapphire" />
          {/*<span className="text-sm text-ctp-subtext0 font-medium">
            Saving...
          </span>*/}
        </>
      ) : (
        <>
          <CheckIcon className="h-4 w-4 [&_.fa-primary]:fill-ctp-green [&_.fa-secondary]:fill-ctp-teal" />
          {/*<span className="text-sm text-ctp-subtext0 font-medium">Saved</span>*/}
        </>
      )}
    </div>
  );
};
