import { useGameStore } from "../../../store/gameStore";
import { MatchInfoPanel } from "../../hud/MatchInfoPanel";
import {
  useUnoActiveColor,
  useUnoDiscardTop,
  useUnoLocalPlayer,
  useUnoPlayers,
} from "./hooks";

export default function UnoHUD() {
  const activeColor = useUnoActiveColor();
  const discardTop = useUnoDiscardTop();
  const players = useUnoPlayers();
  const localPlayer = useUnoLocalPlayer();
  const currentTurn = useGameStore((s) => s.currentTurn);
  const currentTurnPlayer = players.find((p) => p.id === currentTurn) ?? null;

  if (!localPlayer) {
    return null;
  }

  return (
    <>
      <MatchInfoPanel
        currentTurnPlayer={currentTurnPlayer?.name ?? ""}
        activeColor={activeColor}
        discardTop={discardTop}
        isMyTurn={localPlayer.id === currentTurn}
      />
    </>
  );
}
