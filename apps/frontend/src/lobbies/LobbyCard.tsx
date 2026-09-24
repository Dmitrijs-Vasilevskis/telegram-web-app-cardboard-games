import type { LobbyRoom } from "../store/slices/lobbySlice";
import { GameType, RoomStatus } from "@uno/shared";

interface Props {
  lobby: LobbyRoom;
  onJoin: () => void;
}

export function LobbyCard({ lobby, onJoin }: Props) {
  const isFull = lobby.playerCount >= lobby.maxPlayers;

  const canJoin =
    lobby.status === RoomStatus.LOBBY && lobby.playerCount < lobby.maxPlayers;

  return (
    <div className="group rounded-2xl border border-white/10 bg-white/6 p-3 transition-colors hover:border-white/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg">
            {lobby.gameType === GameType.UNO ? "🃏" : "♠️"}
          </div>

          <div className="min-w-0">
            <div className="font-bold text-sm text-white uppercase">
              {lobby.gameType}
            </div>

            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
              Room: {lobby.roomCode}
            </div>
          </div>
        </div>

        <span
          className={[
            "shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider",
            isFull
              ? "bg-white/10 text-white/35"
              : "bg-emerald-500/10 text-emerald-400",
          ].join(" ")}
        >
          {isFull ? "Full" : "Open"}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/5 pt-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Players</span>

          <span className="text-xs font-bold text-white">
            {lobby.playerCount}
            <span className="font-medium text-white/30">
              {" / "}
              {lobby.maxPlayers}
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={onJoin}
          disabled={!canJoin}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-[11px] font-bold text-white transition-all hover:bg-emerald-500 active:scale-95 disabled:pointer-events-none disabled:bg-zinc-700 disabled:text-white/30"
        >
          {isFull ? "FULL" : "JOIN"}
        </button>
      </div>
    </div>
  );
}
