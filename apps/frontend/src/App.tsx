import { useGameStore } from "./store/gameStore";
import { LobbyScreen } from "./game/screens/LobbyScreen";
import { RoomStatus } from "@uno/shared";
import { JoinRoomScreen } from "./game/screens/JoinRoomScreen";
import { GameScreen } from "./game/screens/GameScreen";

function App() {
  const status = useGameStore((s) => s.status);

  const renderScreen = () => {
    switch (status) {
      case RoomStatus.LOBBY:
        return <LobbyScreen />;
      case RoomStatus.PLAYING:
      case RoomStatus.FINISHED:
        return <GameScreen />;
      default:
        return <JoinRoomScreen />;
    }
  };

  return <div className="telegram-viewport">{renderScreen()}</div>;
}

export default App;
