import { useState } from "react";
import { BottomNavigation } from "../../components/navigation/BottomNavigation";
import { ProfileInformationPanel } from "../../components/user/ProfileInformationPanel";
import { JoinLobby } from "../../components/lobby/JoinLobby";
import { CreateLobby } from "../../components/lobby/CreateLobby";
import { useGameContext } from "../../providers/game/GameProvider";

export function JoinRoomScreen() {
  const [imageError, setImageError] = useState(false);

  const {
    joining,
    roomCode,
    user,
    joinError,
    setRoomCode,
    createRoom,
    joinRoom,
  } = useGameContext();

  const displayName = user?.username || user?.first_name || "Player";

  return (
    <div
      className="h-screen w-full flex flex-col justify-between p-4 select-none overflow-hidden
    bg-linear-to-b from-[#1c0a26] via-[#2a1b40] to-[#0f081d] text-white
    landscape:gap-3 landscape:grid landscape:grid-cols-8 landscape:grid-rows-[1fr_auto]
    "
    >
      <div className="flex flex-1 flex-col landscape:col-span-7 landscape:row-span-2">
        <ProfileInformationPanel
          user={user}
          displayName={displayName}
          imageError={imageError}
          setImageError={setImageError}
        />

        <div className="flex-1 flex flex-col justify-center items-center w-full max-w-sm mx-auto px-2 gap-6 my-4">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-wider bg-clip-text text-transparent bg-linear-to-r from-red-500 via-yellow-400 to-blue-500 drop-shadow-sm">
              UNO MINI
            </h1>
            <p className="text-xs text-white/50 mt-1">
              Real-time Telegram Card Battles
            </p>
          </div>

          {joinError && (
            <div className="w-full rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
              {joinError}
            </div>
          )}

          <CreateLobby joining={joining} onCreate={createRoom} />

          <div className="flex items-center gap-3 w-full opacity-30">
            <div className="flex-1 h-px bg-white" />
            <span className="text-xs font-bold tracking-widest">OR</span>
            <div className="flex-1 h-px bg-white" />
          </div>

          <JoinLobby
            roomCode={roomCode}
            joining={joining}
            onJoin={joinRoom}
            setRoomCode={setRoomCode}
          />
        </div>
      </div>

      <div className="landscape:col-span-1 landscape:row-span-2">
        <BottomNavigation />
      </div>
    </div>
  );
}
