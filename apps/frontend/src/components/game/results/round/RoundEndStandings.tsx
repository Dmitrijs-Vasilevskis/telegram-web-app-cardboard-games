interface Props {
  winnerId: string;
  localPlayerId: string;
  pointsAwarded: number;
  standings: {
    playerId: string;
    playerName: string;
    score: number;
  }[];
}
export function RoundEndStandings({
    winnerId,
    localPlayerId,
    pointsAwarded,
    standings,
  }: Props) {
    return (
      <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-md landscape:mt-5 landscape:p-3">
        <div className="flex shrink-0 items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
  
          <h2 className="shrink-0 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
            Current Standings
          </h2>
  
          <div className="h-px flex-1 bg-white/10" />
        </div>
  
        <div className="mt-3 px-3 landscape:px-2 min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1.5 mb-1">
            {standings.map((player, index) => {
              const isLocalPlayer = player.playerId === localPlayerId;
              const isWinner = player.playerId === winnerId;
              const earnedPoints = isWinner ? pointsAwarded : 0;
  
              return (
                <div
                  key={player.playerId}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 landscape:py-2 ${
                    isWinner
                      ? "border border-yellow-400/40 bg-yellow-400/10"
                      : isLocalPlayer
                        ? "bg-white/10"
                        : "bg-black/20"
                  }`}
                >
                  <span
                    className={`w-6 text-left font-black ${
                      isWinner ? "text-yellow-400" : "text-slate-500"
                    }`}
                  >
                    {isWinner ? "🏆" : index + 1}
                  </span>
  
                  <span
                    className={`min-w-0 flex-1 truncate text-left font-bold ${
                      isWinner ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {player.playerName}
  
                    {isLocalPlayer && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        YOU
                      </span>
                    )}
                  </span>
  
                  {isWinner && (
                    <span className="w-12 text-right text-sm font-black tabular-nums text-emerald-400">
                      +{earnedPoints}
                    </span>
                  )}
  
                  <span className="min-w-8 text-right text-lg font-black tabular-nums text-white">
                    {player.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
