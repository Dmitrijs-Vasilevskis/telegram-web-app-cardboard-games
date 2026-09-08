import { useState } from "react";
import { useGameContext } from "../../providers/game/GameProvider";
import { useGameStore } from "../../store/gameStore";
import { LobbyActions } from "../../components/lobby/LobbyActions";
import { LobbyHeader } from "../../components/lobby/LobbyHeader";
import { LobbyPlayers } from "../../components/lobby/LobbyPlayers";
import { LobbyModal } from "../../components/lobby/modal/LobbyModal";
import { roomService } from "../../services/colyseus/";
import type { AvatarId, GameType } from "@uno/shared";

export function LobbyScreen() {
  const roomCode = useGameStore((s) => s.roomCode);
  const hostId = useGameStore((s) => s.hostId);
  const players = useGameStore((s) => s.players);
  const localPlayer = useGameStore((s) => s.localPlayer);
  const gameType = useGameStore((s) => s.gameType);

  const { leaveRoom } = useGameContext();
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isHost = localPlayer?.id === hostId;

  const canStart = players.length >= 1 && players.every((p) => p.isReady);
  const roomError = useGameStore((s) => s.roomError);

  const copyInviteLink = async () => {
    if (!roomCode) return;

    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const handleSelectAvatar = (avatarId: AvatarId) => {
    roomService.changeAvatar(avatarId);
  };

  const handleSelectGame = (selectedGame: GameType) => {
    console.log("Selected game:", selectedGame);
    roomService.selectGame(selectedGame);
    setIsModalOpen(false);
  };

  const handleToggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  return (
    <div
      className="
      h-screen w-full flex flex-col gap-3 p-4 select-none overflow-hidden
      bg-linear-to-b from-[#1c0a26] via-[#2a1b40] to-[#0f081d] text-white
      landscape:grid landscape:grid-cols-2 landscape:grid-rows-[1fr_auto] landscape:gap-3 landscape:p-3"
    >
      {roomError && (
        <div className="mb-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-center text-sm text-red-300">
          {roomError}
        </div>
      )}

      <div className="min-h-0 landscape:col-start-2 landscape:row-start-1">
        <LobbyHeader
          roomCode={roomCode}
          copied={copied}
          copyInviteLink={copyInviteLink}
          gameType={gameType}
          onAction={handleToggleModal}
        />
      </div>

      <div className="min-h-0 flex-1 landscape:row-span-2">
        <LobbyPlayers
          players={players}
          localPlayer={localPlayer}
          hostId={hostId}
        />
      </div>

      <div className="min-h-0 landscape:col-start-2 landscape:row-start-2">
        <LobbyActions
          isReady={localPlayer?.isReady ?? false}
          isHost={isHost}
          canStart={canStart}
          onLeave={leaveRoom}
        />
      </div>

      <LobbyModal
        isHost={isHost}
        isOpen={isModalOpen}
        currentGameType={gameType}
        onClose={() => handleToggleModal()}
        onSelectGame={handleSelectGame}
        onSelectAvatar={handleSelectAvatar}
        selectedAvatar={localPlayer?.avatarId ?? "astronaut"}
      />
    </div>
  );
}
