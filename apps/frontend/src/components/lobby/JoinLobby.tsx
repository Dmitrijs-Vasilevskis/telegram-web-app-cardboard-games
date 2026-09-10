interface Props {
  roomCode: string;
  joining: boolean;
  onJoin: () => void;
  setRoomCode: React.Dispatch<React.SetStateAction<string>>;
}

export function JoinLobby({ roomCode, joining, onJoin, setRoomCode }: Props) {
  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 landscape:p-3 flex flex-col gap-3 shadow-inner">
      <label
        htmlFor="roomCodeInput"
        className="text-xs font-bold tracking-wider text-white/60 uppercase landscape:text-[10px]"
      >
        Have a Room Invitation?
      </label>
      <div className="flex gap-2 w-full">
        <input
          id="roomCodeInput"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          placeholder="ENTER ROOM CODE"
          maxLength={6}
          className="h-12 landscape:h-10 w-full rounded-xl bg-black/40 border border-white/10 px-4 text-white placeholder-white/20 font-mono text-center tracking-widest uppercase focus:border-blue-500/50 outline-hidden transition"
        />
        <button
          disabled={joining || !roomCode.trim()}
          onClick={onJoin}
          className="h-12 landscape:h-10 px-6 rounded-xl bg-blue-600 font-bold shadow-md shadow-blue-900/40 active:scale-[0.96] transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          JOIN
        </button>
      </div>
    </div>
  );
}
