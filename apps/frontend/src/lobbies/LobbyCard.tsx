import type { LobbyRoom } from "../store/slices/lobbySlice";

interface Props {
  lobby: LobbyRoom;
  onJoin: () => void;
}

export function LobbyCard({ lobby, onJoin }: Props) {
  const isFull = lobby.playerCount >= lobby.maxPlayers;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-white">{lobby.gameType}</span>

          <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
            {lobby.roomCode}
          </span>
        </div>

        <div className="mt-1 text-xs text-white/50">
          {lobby.playerCount} / {lobby.maxPlayers} players
        </div>
      </div>

      <button
        type="button"
        onClick={onJoin}
        disabled={isFull}
        className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-all active:scale-95 disabled:pointer-events-none disabled:bg-zinc-700 disabled:text-white/30"
      >
        {isFull ? "FULL" : "JOIN"}
      </button>
    </div>
  );
}
