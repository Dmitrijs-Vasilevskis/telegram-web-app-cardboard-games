import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GameProvider } from "./providers/game/GameProvider.tsx";
import { BrowserRouter } from "react-router-dom";
import { RoomNavigationBridge } from "./navigation/RoomNavigationBridge.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <GameProvider>
        <RoomNavigationBridge />
        <App />
      </GameProvider>
    </BrowserRouter>
  </StrictMode>
);
