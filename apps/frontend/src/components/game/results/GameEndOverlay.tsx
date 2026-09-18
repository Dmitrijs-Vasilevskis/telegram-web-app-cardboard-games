import { motion } from "framer-motion";
import { useGameStore } from "../../../store/gameStore";
import type { GameResult } from "../../../store/slices/roomSlice";
import { GameEndActions } from "./game/GameEndActions";
import { GameEndResults } from "./game/GameEndResults";
import { useGameContext } from "../../../providers/game/GameProvider";
import { roomService } from '../../../services/colyseus/index';

interface Props {
  result: GameResult;
}

export function GameEndOverlay({ result }: Props) {
  const { leaveRoom } = useGameContext();
  const localPlayer = useGameStore((state) => state.localPlayer);
  const players = useGameStore((state) => state.players);
  const hostId = useGameStore((state) => state.hostId);

  if (!localPlayer) {
    return null;
  }

  const isHost = localPlayer.id === hostId;
  const readyPlayers = players.filter((player) => player.isReady).length;
  const canStart = players.length >= 1 && players.every((p) => p.isReady);

  const handleBackToLobby = () => {
    if(isHost) {
        roomService.backToLobby()
        return;
    }

    leaveRoom();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-100 flex flex-col overflow-hidden bg-slate-950"
    >
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-6 landscape:px-8 landscape:py-4">
        <GameEndResults
          result={result}
          localPlayerId={localPlayer.id}
          readyPlayers={readyPlayers}
          totalPlayers={players.length}
        />
      </div>
      <div className="w-full p-4 relative z-10">
        <GameEndActions
          isReady={localPlayer.isReady}
          isHost={isHost}
          canStart={canStart}
          onBackToLobby={handleBackToLobby}
        />
      </div>
    </motion.div>
  );
}
