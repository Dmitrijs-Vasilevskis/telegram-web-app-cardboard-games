interface Props {
  isLocalWinner: boolean;
  roundWinnerName: string;
  pointsAwarded: number;
  totalScore: number;
}
export function RoundEndResults({
  isLocalWinner,
  roundWinnerName,
  pointsAwarded,
  totalScore,
}: Props) {
  return (
    <div className="flex flex-col mt-4 landscape:mt-0 justify-center">
      <div className="flex flex-col items-center">
        <span className="mb-3 text-5xl landscape:text-4xl">🏆</span>

        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
          Round Complete
        </p>

        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.2)] landscape:text-2xl">
          {isLocalWinner ? "YOU WON!" : `${roundWinnerName} WINS!`}
        </h1>
      </div>
      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
          Round Points
        </p>

        <p className="mt-1 text-6xl font-black leading-none text-emerald-400 landscape:text-5xl">
          +{pointsAwarded}
        </p>

        <p className="mt-3 text-sm font-semibold text-slate-400">
          Total Score{" "}
          <span className="font-black text-white">{totalScore}</span>
        </p>
      </div>
    </div>
  );
}
