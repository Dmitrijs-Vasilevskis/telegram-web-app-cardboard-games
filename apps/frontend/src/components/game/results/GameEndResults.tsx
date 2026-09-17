import { motion } from "framer-motion";
import type { GameResult } from "../../../store/slices/roomSlice";

interface Props {
  result: GameResult;
  localPlayerId: string;
  readyPlayers: number;
  totalPlayers: number;
}

export function GameEndResults({
  result,
  localPlayerId,
  readyPlayers,
  totalPlayers,
}: Props) {
  const isLocalWinner = result.winnerId === localPlayerId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl text-center flex flex-col h-full
      landscape:grid landscape:grid-cols-2"
    >
      <div className="landscape:mt-6 mt-3 px-4 content-center">
        <h1 className="text-3xl font-black uppercase tracking-tight text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.2)] landscape:text-2xl">
          {isLocalWinner ? "YOU WIN!" : `${result.winnerName} WINS!`}
        </h1>
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Winning Score
          </p>

          <p className="mt-1 text-6xl font-black leading-none text-white landscape:text-5xl">
            {result.winnerScore}
          </p>
        </div>
        <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-5 py-2">
          <span className="text-sm font-semibold text-slate-300 uppercase">
            Players ready
          </span>
          <span className="font-black text-emerald-400 text-center tabular-nums">
            {readyPlayers}/{totalPlayers}
          </span>
          <span className="text-lg">👥</span>
        </div>
      </div>
      <div className="mt-6 rounded-3xl border flex-1 border-white/10 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-md landscape:mt-4 landscape:p-3">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />

          <h2 className="shrink-0 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
            Final Standings
          </h2>

          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="mt-3 flex flex-col gap-1.5">
          {result.standings.map((player, index) => {
            const isLocalPlayer = player.playerId === localPlayerId;
            const isWinner = player.playerId === result.winnerId;

            return (
              <div
                key={player.playerId}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors landscape:py-2
                  ${
                    isWinner
                      ? "border border-yellow-400/40 bg-yellow-400/10"
                      : isLocalPlayer
                        ? "bg-white/10"
                        : "bg-black/20"
                  }
                `}
              >
                <span
                  className={`w-6 text-left font-black
                    ${isWinner ? "text-yellow-400" : "text-slate-500"}
                  `}
                >
                  {isWinner ? "🏆" : index + 1}
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-left font-bold
                    ${isWinner ? "text-white" : "text-slate-300"}
                  `}
                >
                  {player.playerName}

                  {isLocalPlayer && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      YOU
                    </span>
                  )}
                </span>
                <span className="min-w-8 text-right text-lg font-black text-white">
                  {player.score}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
