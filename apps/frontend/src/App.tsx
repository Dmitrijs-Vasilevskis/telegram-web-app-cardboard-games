import { LobbyScreen } from "./game/screens/LobbyScreen";
import { JoinRoomScreen } from "./game/screens/JoinRoomScreen";
import { GameScreen } from "./game/screens/GameScreen";
import { Navigate, Route, Routes } from "react-router-dom";
import { LobbiesScreen } from "./lobbies/LobbiesScreen";

function App() {
  return (
    <div className="telegram-viewport">
      <Routes>
        <Route path="/play" element={<JoinRoomScreen />} />
        <Route path="/lobbies" element={<LobbiesScreen />} />
        <Route path="/room" element={<LobbyScreen />} />
        <Route path="/game" element={<GameScreen />} />

        <Route path="*" element={<Navigate to="/play" replace />} />
      </Routes>
    </div>
  );
}

export default App;
