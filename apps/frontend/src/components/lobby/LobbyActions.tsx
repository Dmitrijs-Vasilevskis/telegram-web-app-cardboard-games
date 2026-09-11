import { roomService } from "../../services/colyseus/";

interface Props {
  isReady: boolean;
  isHost: boolean;
  canStart: boolean;
  onLeave: () => void;
}

export function LobbyActions({ isReady, isHost, canStart, onLeave }: Props) {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-2 bg-black/30 backdrop-blur-md border border-white/5 p-3 rounded-2xl shadow-xl">
      {isHost && (
        <button
          onClick={() => roomService.startGame()}
          disabled={!canStart}
          className="w-full h-12 landscape:h-10 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 disabled:from-zinc-700 disabled:to-zinc-800 text-black font-extrabold text-sm tracking-widest active:scale-[0.98] transition-all disabled:text-white/30 disabled:pointer-events-none shadow-md shadow-orange-900/20"
        >
          🚀 START BATTLE
        </button>
      )}

      <div className="flex gap-2 w-full">
        <button
          onClick={() => roomService.toggleReady()}
          className={`flex-1 h-12 landscape:h-10 rounded-xl font-bold text-sm landscape:text-xs tracking-wide transition-all active:scale-[0.97] border ${
            isReady
              ? "bg-amber-600/20 text-amber-400 border-amber-600/30"
              : "bg-emerald-600 text-white border-transparent shadow-md shadow-emerald-950/40"
          }`}
        >
          {isReady ? "🛑 NOT READY" : "✅ READY"}
        </button>

        <button
          onClick={onLeave}
          className="px-4 h-12 landscape:h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-bold text-xs landscape:text-[10px] tracking-wide transition-all active:scale-[0.97]"
        >
          LEAVE
        </button>
      </div>
    </div>
  );
}
