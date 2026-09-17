import { motion } from "framer-motion";
import { useGameStore } from "../../../store/gameStore";
import type { UnoRoundResult } from "../../../store/slices/unoSlice";

interface Props {
  result: UnoRoundResult;
}

export function RoundEndOverlay({ result }: Props) {
  const localPlayer = useGameStore((state) => state.localPlayer);

  if (!localPlayer) {
    return null;
  }

  const isLocalWinner = result.roundWinnerId === localPlayer.id;

  const standings = [...result.standings].sort((a, b) => b.score - a.score);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-90 flex items-center justify-center bg-black/70 backdrop-blur-xs"
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex w-[90vw] max-w-180 flex-col rounded-3xl border border-yellow-400 bg-gray-900 p-6 shadow-2xl"
      >
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="mb-4 text-5xl">🏆</div>

            <h2 className="text-3xl font-black text-yellow-400">
              {isLocalWinner
                ? "YOU WON THE ROUND!"
                : `${result.roundWinnerName} WON THE ROUND!`}
            </h2>

            <div className="mt-6">
              <p className="text-gray-300">Points Earned</p>

              <p className="text-4xl font-bold text-green-400">
                +{result.pointsAwarded}
              </p>

              <p className="text-gray-400">Total Score: {result.totalScore}</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-3 text-sm text-gray-400">Current Standings</div>

            {standings.map((player, index) => (
              <div
                key={player.playerId}
                className="flex justify-between border-b border-gray-800 py-2"
              >
                <div className="flex gap-3">
                  <span className="w-5 text-gray-500">{index + 1}</span>

                  <span>{player.playerName}</span>
                </div>

                <span className="font-bold">{player.score}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Next round starting...
        </p>
      </motion.div>
    </motion.div>
  );
}
