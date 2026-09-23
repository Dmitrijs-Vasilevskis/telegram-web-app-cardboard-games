import GameLayout from "../../../components/game/GameLayout";
import { UnoTable3D } from "./scene/UnoTable3D";
import { UnoGameplay } from "./UnoGameplay";
import UnoHUD from "./UnoHUD";

export function UnoGameScreen() {
  return (
    <GameLayout scene={<UnoTable3D />} hud={<UnoHUD />}>
      <UnoGameplay />
    </GameLayout>
  );
}
