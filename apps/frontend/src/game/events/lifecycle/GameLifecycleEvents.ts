import { useEffectStore } from "../../../store/effectsStore";
import { useGameStore } from "../../../store/gameStore";
import type { GameResult } from "../../../store/slices/roomSlice";
import { GameEvents, type GameRoom } from "../types";


export function RegisterGameLifecycleEvents(room: GameRoom) {
    const store = useGameStore.getState();
    const effects = useEffectStore.getState();

    room.onMessage(GameEvents.GAME_END, (gameResult: GameResult) => {
        store.setGameResult({
            winnerId: gameResult.winnerId,
            winnerName: gameResult.winnerName,
            winnerScore: gameResult.winnerScore,
            standings: gameResult.standings
        });

        effects.addEffect({
            text: `${gameResult.winnerName} WINS!`,
            color: "#facc15",
            emphasis: "special",
        });
    });

    room.onMessage(GameEvents.GAME_START, () => {
        store.resetGame()
    });

    room.onMessage(GameEvents.ERROR, (data: { message: string }) => {
        store.setRoomError(data.message);

        effects.addEffect({
            text: data.message,
            color: "#ef4444",
            emphasis: "special",
        });
    });

    room.onMessage(GameEvents.ROUND_HIGHLIGHT, ({ roundNumber }: { roundNumber: number }) => {
        effects.addEffect({
            text: `ROUND ${roundNumber}`,
            color: "facc15",
            emphasis: "special",
        });
    });
}