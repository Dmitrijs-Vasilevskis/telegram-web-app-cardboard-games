import { motion } from "framer-motion";
import { useGameStore } from "../../../store/gameStore";
import type { UnoRoundResult } from "../../../store/slices/unoSlice";
import { RoundEndCounter } from "./round/RoundEndCounter";
import { RoundEndStandings } from "./round/RoundEndStandings";
import { RoundEndResults } from "./round/RoundEndResults";
import { getRemainingSeconds } from "../../../utils/time";

interface Props {
  result: UnoRoundResult;
}

export function RoundEndOverlay({ result }: Props) {
  const localPlayer = useGameStore((state) => state.localPlayer);
  const roundStartAt = useGameStore((state) => state.roundStartAt);

  if (!localPlayer) {
    return null;
  }

  const remainingSeconds = getRemainingSeconds(roundStartAt);

  const isLocalWinner = result.roundWinnerId === localPlayer.id;

  const standings = [...result.standings].sort((a, b) => b.score - a.score);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-90 flex flex-col overflow-hidden bg-slate-950"
    >
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-6 landscape:py-4">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex w-full h-full max-w-2xl flex-col text-center gap-3 landscape:grid landscape:grid-cols-2"
        >
          <RoundEndResults
            isLocalWinner={isLocalWinner}
            roundWinnerName={result.roundWinnerName}
            pointsAwarded={result.pointsAwarded}
            totalScore={result.totalScore}
          />

          <RoundEndStandings
            winnerId={result.roundWinnerId}
            localPlayerId={localPlayer.id}
            pointsAwarded={result.pointsAwarded}
            standings={standings}
          />
        </motion.div>
      </div>

      <RoundEndCounter durationSeconds={remainingSeconds} />
    </motion.div>
  );
}
