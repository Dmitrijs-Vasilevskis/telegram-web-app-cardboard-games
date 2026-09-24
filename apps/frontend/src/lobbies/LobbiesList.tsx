import type { LobbyRoom } from "../store/slices/lobbySlice";
import { LobbyCard } from "./LobbyCard";

interface Props {
  lobbies: LobbyRoom[];
  loading: boolean;
  onJoin: () => void;
}

export function LobbiesList({ lobbies, loading, onJoin }: Props) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-white/50">Loading lobbies...</span>
      </div>
    );
  }

  if (lobbies.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <span className="text-3xl mb-2">🎮</span>

        <p className="text-sm font-semibold text-white/70">No open lobbies</p>

        <p className="mt-1 text-xs text-white/40">
          Create a lobby and start a game!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {lobbies.map((lobby) => (
        <LobbyCard key={lobby.roomId} lobby={lobby} onJoin={() => onJoin()} />
      ))}
    </div>
  );
}
