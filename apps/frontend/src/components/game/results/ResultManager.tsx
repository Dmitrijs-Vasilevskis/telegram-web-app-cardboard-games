import { GameType } from "@uno/shared";
import { useGameStore } from "../../../store/gameStore";
import { GameEndOverlay } from "./GameEndOverlay";
import { RoundEndOverlay } from "./RoundEndOverlay";

export function ResultManager() {
  const gameType = useGameStore((state) => state.gameType);
  const gameResult = useGameStore((state) => state.gameResult);
  const roundResult = useGameStore((state) => state.roundResult);

  if (gameResult) {
    return <GameEndOverlay result={gameResult} />;
  }

  if (gameType === GameType.UNO && roundResult) {
    return <RoundEndOverlay result={roundResult} />;
  }

  return;
}
