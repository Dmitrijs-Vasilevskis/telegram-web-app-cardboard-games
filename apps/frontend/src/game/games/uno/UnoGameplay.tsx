import { useState } from "react";
import { useGameContext } from "../../../providers/game/GameProvider";
import { useGameStore } from "../../../store/gameStore";
import {
  useUnoActiveColor,
  useUnoDiscardTop,
  useUnoLocalPlayer,
} from "./hooks";
import type { CardDTO } from "../../../types/game";
import type { Color } from "@uno/shared";
import { usePlayerAnimationStore } from "../../../store/playerAnimationStore";
import { unoService } from "../../../services/colyseus";
import { UnoButton } from "../../../components/games/uno/UnoButton";
import { ChallengeUnoButton } from "../../../components/games/uno/ChallengeUnoButton";
import { HandCards } from "./hud/HandCards";
import { LandscapeHandCards } from "../../../components/games/uno/card/LandscapeHandCards";
import { DrawButton } from "../../../components/games/uno/DrawButton";
import { UnoWildColorPicker } from "../../../components/games/uno/UnoWildColorPicker";

export function UnoGameplay() {
  const { isLandscape } = useGameContext();
  const localPlayer = useUnoLocalPlayer();
  const activeColor = useUnoActiveColor();
  const discardTop = useUnoDiscardTop();
  const currentTurn = useGameStore((s) => s.currentTurn);

  const [wildCard, setWildCard] = useState<CardDTO | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  if (!localPlayer) {
    return null;
  }

  const onWilCard = (card: CardDTO) => {
    setWildCard(card);
  };

  const onWildCardColorSelect = (color: Color) => {
    if (!wildCard) return;

    const actionId = crypto.randomUUID();

    usePlayerAnimationStore
      .getState()
      .triggerOptimisticAnimation(localPlayer.id, "Hit", actionId);

    unoService.playCard(actionId, wildCard.id, color);

    setWildCard(null);
  };

  const onDraw = () => {
    const actionId = crypto.randomUUID();

    usePlayerAnimationStore
      .getState()
      .triggerOptimisticAnimation(localPlayer.id, "Hit", actionId);

    unoService.drawCard(actionId);
  };

  const isPlayable = (card: CardDTO) => {
    if (card.value === "wild" || card.value === "wildDrawFour") {
      return true;
    }

    if (card.color === activeColor) {
      return true;
    }

    if (card.value === discardTop?.value) {
      return true;
    }

    return false;
  };

  return (
    <>
      <UnoButton />
      <ChallengeUnoButton />

      {isLandscape ? (
        <HandCards
          playerId={localPlayer.id}
          cards={localPlayer.gameData.hand}
          onWildCard={onWilCard}
          isPlayable={isPlayable}
          selectedCardId={selectedCardId}
          setSelectedCardId={setSelectedCardId}
        />
      ) : (
        <LandscapeHandCards
          playerId={localPlayer.id}
          cards={localPlayer.gameData.hand}
          isPlayable={isPlayable}
          setSelectedCardId={setSelectedCardId}
          onWildCard={onWilCard}
        />
      )}

      <DrawButton isMyTurn={localPlayer.id === currentTurn} onDraw={onDraw} />

      {wildCard && <UnoWildColorPicker onSelect={onWildCardColorSelect} />}
    </>
  );
}
