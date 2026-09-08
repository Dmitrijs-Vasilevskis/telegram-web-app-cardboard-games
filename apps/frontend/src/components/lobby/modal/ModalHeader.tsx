import type { SettingsPage } from "./LobbyModal";

interface Props {
  page: SettingsPage;
  isHost: boolean;
  onReturn: () => void;
  onClose: () => void;
}

export function ModalHeader({ page, isHost, onReturn, onClose }: Props) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-white/10 shrink-0">
      {page !== "overview" && (
        <button
          type="button"
          onClick={onReturn}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/20 transition shrink-0"
        >
          ←
        </button>
      )}

      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold text-white">
          {page === "overview" && "Lobby Settings"}
          {page === "game" && "Game"}
          {page === "avatar" && "Avatar"}
        </h2>

        <p className="text-xs text-gray-400">
          {page === "overview" && "Configure your lobby and appearance"}

          {page === "game" &&
            (isHost
              ? "Choose the game for this lobby"
              : "Only the host can change the game")}

          {page === "avatar" && "Choose how you appear in the game"}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/20 transition shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
