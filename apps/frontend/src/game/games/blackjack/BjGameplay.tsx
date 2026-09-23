import { useBjDealer, useBjLocalPlayer } from "./hooks";
import { DealerHand } from "./hud/DealerHand";
import { HandCards } from "./hud/HandCards";
import { ActionButtons } from "./hud/ActionButtons";
import { useGameStore } from "../../../store/gameStore";
import { usePlayerAnimationStore } from "../../../store/playerAnimationStore";
import { bjService } from "../../../services/colyseus";

export function BjGameplay() {
  const localPlayer = useBjLocalPlayer();
  const currentTurn = useGameStore((s) => s.currentTurn);
  const bjDelaer = useBjDealer();

  if (!localPlayer) {
    return null;
  }

  const isPlayerTurn = currentTurn === localPlayer.id;
  const hasNaturalBlackjack =
    localPlayer.gameData.handValue === 21 &&
    localPlayer.gameData.hand.length === 2;

  const canHit = isPlayerTurn && !hasNaturalBlackjack;

  const hit = () => {
    const actionId = crypto.randomUUID();

    usePlayerAnimationStore
      .getState()
      .triggerOptimisticAnimation(localPlayer.id, "Hit", actionId);

    bjService.hit(actionId);
  };

  const stand = () => {
    const actionId = crypto.randomUUID();

    usePlayerAnimationStore
      .getState()
      .triggerOptimisticAnimation(localPlayer.id, "No", actionId);

    bjService.stand(actionId);
  };

  return (
    <>
      <ActionButtons
        onHit={hit}
        onStand={stand}
        isPlayerTurn={isPlayerTurn}
        canHit={canHit}
      />
      <HandCards
        cards={localPlayer.gameData.hand}
        handValue={localPlayer.gameData.handValue}
      />
      <DealerHand dealer={bjDelaer} />
    </>
  );
}
