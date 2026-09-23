import { useUnoLocalPlayer } from "../../../game/games/uno/hooks";
import { unoService } from "../../../services/colyseus";
import { ReactionButton } from "./ReactionButton";

export function UnoButton() {
  const localPlayer = useUnoLocalPlayer();

  const visible =
    !!localPlayer &&
    localPlayer.gameData.handCount === 1 &&
    !localPlayer.gameData.saidUno;

  return (
    <ReactionButton
      visible={visible}
      text="UNO!!"
      color="yellow"
      onClick={() => unoService.callUno()}
    />
  );
}
