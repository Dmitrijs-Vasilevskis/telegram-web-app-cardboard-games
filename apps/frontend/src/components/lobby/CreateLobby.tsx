interface Props {
  joining: boolean;
  onCreate: () => void;
}

export function CreateLobby({ joining, onCreate }: Props) {
  return (
    <button
      disabled={joining}
      onClick={onCreate}
      className="
      w-full rounded-2xl py-3 bg-linear-to-r from-emerald-500 to-green-600 hover:opacity-90
      font-bold tracking-wide shadow-lg shadow-green-900/30 active:scale-[0.98] transition-all
      disabled:opacity-50 flex items-center justify-center gap-2 landscape:py-1.5
        "
    >
      {joining ? (
        <span className="text-sm font-medium animate-pulse my-1">
          Setting up lobby...
        </span>
      ) : (
        <>
          <span className="text-lg">🎮</span>
          <span className="uppercase text-base landscape:text-sm">
            Create New Game
          </span>
        </>
      )}
    </button>
  );
}
