import type { GameType } from "@uno/shared";
import { GAME_REGISTRY } from "../../../../games/registry";

interface GameSelectorProps {
  selectedGame: GameType;
  currentGameType: GameType;
  isHost: boolean;
  onSelect: (gameType: GameType) => void;
}

export function GameSettings({
  selectedGame,
  currentGameType,
  isHost,
  onSelect,
}: GameSelectorProps) {
  return (
    <div className="space-y-3">
      {Object.entries(GAME_REGISTRY).map(([type, game]) => {
        const gameType = type as GameType;
        const isSelected = selectedGame === gameType;
        const isCurrent = currentGameType === gameType;
        const isSelectable = isHost && game.enabled;

        return (
          <button
            key={gameType}
            type="button"
            disabled={!isSelectable}
            onClick={() => onSelect(gameType)}
            className={` w-full relative p-4 rounded-2xl border transition-all text-left flex flex-col gap-3
                ${
                  !game.enabled
                    ? "opacity-50 bg-white/5 border-white/5 cursor-not-allowed"
                    : isSelectable
                      ? "cursor-pointer active:scale-[0.98]"
                      : "cursor-default"
                }
  
                ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }
              `}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                  {game.icon ?? "🎮"}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">
                      {game.name}
                    </span>

                    {!game.enabled && (
                      <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold uppercase">
                        Soon
                      </span>
                    )}

                    {isCurrent && game.enabled && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold uppercase">
                        Current
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-0.5">
                    {game.shortDesc}
                  </p>
                </div>
              </div>

              {game.enabled && (
                <div
                  className={` w-6 h-6 rounded-full border-2 flex items-center justify-center transition shrink-0
                      ${
                        isSelected
                          ? "border-indigo-400 bg-indigo-500"
                          : "border-white/20 bg-transparent"
                      }
                    `}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-[11px] bg-white/5 text-gray-300 border border-white/10 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                👥 {game.minPlayers}-{game.maxPlayers} Players
              </span>

              <span
                className={` text-[11px] px-2.5 py-1 rounded-lg font-medium border
                    ${
                      game.enabled
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    }
                  `}
              >
                {game.enabled ? "● Available" : "○ Disabled"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
