import type { GameType } from "@uno/shared";
import { getGameMeta } from "../../games/registry";

interface Props {
  gameType: GameType;
  isHost?: boolean;
  onAction: () => void;
}

export function LobbyGameChange({ gameType, onAction }: Props) {
  const game = getGameMeta(gameType);

  return (
    <button
      onClick={onAction}
      className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-lg flex items-center justify-between mt-2"
    >
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 bg-white/5 rounded-xl flex items-center justify-center text-xs border border-white/10">
          {game.icon}
        </div>
        <div>
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Selected Game
          </div>
          <div className="text-white font-bold text-lg flex items-center gap-2">
            {game.name}
          </div>
        </div>
      </div>
      <div className="w-9 h-9 flex items-center justify-center text-gray-300 transition-colors group-hover:bg-white/10 group-hover:text-white">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}
