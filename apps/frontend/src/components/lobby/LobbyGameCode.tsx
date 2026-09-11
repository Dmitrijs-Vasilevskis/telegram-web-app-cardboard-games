interface Props {
    roomCode: string | null;
    copyInviteLink: () => void;
    copied: boolean;
  }
  
  export function LobbyGameCode({ roomCode, copyInviteLink, copied }: Props) {
    return (
      <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-md border border-white/10 p-3 landscape:p-2 rounded-2xl shadow-lg flex items-center justify-between mt-2">
        <div className="flex flex-col">
          <span className="text-xs landscape:text-[10px] text-white/40 font-bold tracking-wider uppercase">
            Lobby Code
          </span>
          <span className="text-3xl landscape:text-2xl font-black font-mono tracking-widest bg-clip-text text-transparent bg-linear-to-r from-yellow-400 to-orange-400">
            {roomCode || "------"}
          </span>
        </div>
  
        <button
          onClick={copyInviteLink}
          className={`py-4 px-5 rounded-xl font-bold text-xs landscape:text-[10px] tracking-wide transition-all active:scale-[0.95] flex items-center gap-2 shadow-md ${
            copied
              ? "bg-emerald-600 text-white"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40"
          }`}
        >
          <span>{copied ? "✨ CODE COPIED!" : "🔗 SHARE CODE"}</span>
        </button>
      </div>
    );
  }
  