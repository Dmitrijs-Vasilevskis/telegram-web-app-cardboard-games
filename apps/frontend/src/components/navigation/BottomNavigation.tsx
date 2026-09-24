import { Link } from "react-router-dom";

export function BottomNavigation() {
  return (
    <div className="w-full bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl px-2 py-2 flex flex-row landscape:flex-col items-center justify-around shadow-2xl landscape:h-full">
      <Link to={"/play"} className="flex flex-col items-center gap-1 py-1 px-4 text-blue-400 font-medium">
        <span className="text-xl">🃏</span>
        <span className="text-[10px] tracking-wide font-bold uppercase">
          Play
        </span>
      </Link>
      <Link to={"/lobbies"} className="flex flex-col items-center gap-1 py-1 px-4 text-white/40 hover:text-white/70 font-medium transition">
        <span className="text-xl">⚙️</span>
        <span className="text-[10px] tracking-wide font-bold uppercase">
          Lobbies
        </span>
      </Link>
    </div>
  );
}
