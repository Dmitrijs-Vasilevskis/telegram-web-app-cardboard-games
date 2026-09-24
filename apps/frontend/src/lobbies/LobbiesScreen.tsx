import { useEffect, useState } from "react";
import { ProfileInformationPanel } from "../components/user/ProfileInformationPanel";
import { useGameContext } from "../providers/game/GameProvider";
import { BottomNavigation } from "../components/navigation/BottomNavigation";
import { LobbiesList } from "./LobbiesList";
import { useGameStore } from "../store/gameStore";
import { lobbyService } from "../services/colyseus";

export function LobbiesScreen() {
  const { user, username, isFullscreen } = useGameContext();
  const [imageError, setImageError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const lobbies = useGameStore((state) => state.lobbies);

  useEffect(() => {
    let mounted = true;

    const connect = async () => {
      try {
        setLoading(true);
        await lobbyService.connect();
      } catch (error) {
        console.log("Failed to connect to lobby: ", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    connect();

    return () => {
      mounted = false;
      lobbyService.disconnect();
    };
  }, []);
  return (
    <div
      className={`h-screen w-full flex flex-col justify-between pb-4 px-4 select-none overflow-hidden
    bg-linear-to-b from-[#1c0a26] via-[#2a1b40] to-[#0f081d] text-white
    landscape:gap-3 landscape:grid landscape:grid-cols-8 landscape:grid-rows-[1fr_auto]
        ${isFullscreen ? "pt-12" : "pt-4"}
    `}
    >
      <div className="flex flex-1 flex-col landscape:col-span-7 landscape:row-span-2">
        <ProfileInformationPanel
          user={user}
          displayName={username}
          imageError={imageError}
          setImageError={setImageError}
        />
        <div className="min-h-0 my-4 landscape:my-0 landscape:mt-4 flex-1 landscape:row-span-2">
          <div className="mx-auto flex flex-col min-h-0 w-full h-full">
            <div
              className="flex-1 min-h-0 w-full bg-white/5 border border-white/10
                rounded-2xl p-3 landscape:p-2.5 overflow-y-auto no-scrollbar space-y-2.5
                shadow-inner landscape:gap-2.5 landscape:space-y-0 landscape:content-start"
            >
              <LobbiesList
                lobbies={lobbies}
                loading={loading}
                onJoin={() => console.log(">>> onJoin")}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="landscape:col-span-1 landscape:row-span-2">
        <BottomNavigation />
      </div>
    </div>
  );
}
