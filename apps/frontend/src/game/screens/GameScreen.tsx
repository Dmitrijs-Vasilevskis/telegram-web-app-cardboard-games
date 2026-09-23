import { useGameStore } from "../../store/gameStore";
import BjGameScreen from "../games/blackjack/BjGameScreen";
import { UnoGameScreen } from "../games/uno/UnoGameScreen";

export function GameScreen() {
  const gameType = useGameStore((s) => s.gameType);

  switch (gameType) {
    case "uno":
      return <UnoGameScreen />;
    case "blackjack":
      return <BjGameScreen />;
    default:
      return null;
  }
}
