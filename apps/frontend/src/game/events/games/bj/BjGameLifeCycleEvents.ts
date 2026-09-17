import { useGameStore } from "../../../../store/gameStore";
import type { GameRoom } from "../../types";

export function BjGameLifeCycleEvents(
    room: GameRoom
): Array<() => void> {
    return [
        room.onMessage("roundResults", ({
            results,
        }: {
            results: Array<{
                playerId: string;
                points: number;
            }>;
        }) => {
            const { setScoreAnimation } = useGameStore.getState();

            for (const result of results) {
                if (result.points <= 0) continue;

                setScoreAnimation(
                    result.playerId,
                    result.points
                );
            }
        })
    ];
}