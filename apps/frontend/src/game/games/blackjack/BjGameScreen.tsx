
import GameLayout from "../../../components/game/GameLayout";
import { BlackjackHUD } from "../../../components/games/bj/BlackjackHUD";
import { BjGameplay } from "./BjGameplay";
import { BjTable } from "./scene/BjTable";

export default function BjGameScreen() {
  return (
    <GameLayout scene={<BjTable/>} hud={<BlackjackHUD />}>
      <BjGameplay />
    </GameLayout>
  );
}
