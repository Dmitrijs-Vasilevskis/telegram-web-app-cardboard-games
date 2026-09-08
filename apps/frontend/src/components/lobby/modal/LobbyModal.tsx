import type { AvatarId, GameType } from "@uno/shared";
import { useEffect, useState } from "react";
import { GAME_REGISTRY } from "../../../games/registry";
import { AVATARS } from "../../../game/avatar/avatar.config";
import { SettingsRow } from "./SettingRow";
import { AvatarSelector } from "./player/AvatarSettings";
import { GameSettings } from "./game/GameSettings";
import { ModalHeader } from "./ModalHeader";

interface LobbyModalProps {
  isOpen: boolean;
  currentGameType: GameType;
  isHost: boolean;
  onClose: () => void;
  onSelectGame: (gameType: GameType) => void;
  onSelectAvatar: (avatarId: AvatarId) => void;
  selectedAvatar: AvatarId;
}

export type SettingsPage = "overview" | "game" | "avatar";

export function LobbyModal({
  isOpen,
  currentGameType,
  isHost,
  onClose,
  onSelectGame,
  onSelectAvatar,
  selectedAvatar,
}: LobbyModalProps) {
  const [page, setPage] = useState<SettingsPage>("overview");
  const [selectedGame, setSelectedGame] = useState<GameType>(currentGameType);

  useEffect(() => {
    if (isOpen) {
      setPage("overview");
      setSelectedGame(currentGameType);
    }
  }, [isOpen, currentGameType]);

  if (!isOpen) return null;

  const currentGame = GAME_REGISTRY[currentGameType];

  const currentAvatar = AVATARS[selectedAvatar];

  const avatarName = currentAvatar?.id.replace("_", " ") ?? selectedAvatar;

  const handleClose = () => {
    setPage("overview");
    setSelectedGame(currentGameType);
    onClose();
  };

  const handleReturn = () => {
    setPage("overview");
  };

  const handleGameConfirm = () => {
    onSelectGame(selectedGame);
    setPage("overview");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full h-full max-w-md bg-[#1f122e] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <ModalHeader
          isHost={isHost}
          page={page}
          onClose={handleClose}
          onReturn={handleReturn}
        />

        <div className="flex-1 overflow-y-auto p-4">
          {page === "overview" && (
            <div className="space-y-3">
              <section>
                <SectionTitle title="Lobby" />

                <div className="space-y-2">
                  <SettingsRow
                    icon={currentGame?.icon ?? "🎮"}
                    label="Select Game"
                    value={currentGame?.name ?? currentGameType}
                    disabled={!isHost}
                    onClick={() => {
                      if (isHost) {
                        setPage("game");
                      }
                    }}
                  />
                </div>
              </section>

              <section>
                <SectionTitle title="Appearance" />

                <div className="space-y-2">
                  <SettingsRow
                    icon="👤"
                    label="Avatar"
                    value={avatarName}
                    onClick={() => setPage("avatar")}
                  />
                </div>
              </section>
            </div>
          )}

          {page === "game" && (
            <GameSettings
              selectedGame={selectedGame}
              currentGameType={currentGameType}
              isHost={isHost}
              onSelect={setSelectedGame}
            />
          )}

          {page === "avatar" && (
            <AvatarSelector
              selectedAvatar={selectedAvatar}
              onSelect={onSelectAvatar}
            />
          )}
        </div>

        {page === "game" && isHost && (
          <div className="p-3 border-t border-white/10 shrink-0">
            <button
              type="button"
              onClick={handleGameConfirm}
              disabled={selectedGame === currentGameType}
              className="w-full py-3.5 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 
              disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg"
            >
              Confirm Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 w-full opacity-30 mb-3">
      <div className="flex-1 h-px bg-white" />
      <span className="text-xs font-bold uppercase tracking-widest">
        {title}
      </span>
      <div className="flex-1 h-px bg-white" />
    </div>
  );
}
