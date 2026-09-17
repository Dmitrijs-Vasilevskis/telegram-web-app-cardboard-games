import { useGameStore } from "../../../../store/gameStore";
import type { UnoRoundResult } from "../../../../store/slices/unoSlice";
import { GameEvents, type GameRoom } from "../../types";

export function UnoLifecycleEvents(
    room: GameRoom
): Array<() => void> {
    const store = useGameStore.getState();

    return [
        room.onMessage(GameEvents.ROUND_ENDED, (roundResult: UnoRoundResult) => [
            store.setRoundResult(roundResult)
        ]),

        room.onMessage(GameEvents.ROUND_STARTED, () => {
            store.setRoundResult(null);
        }),
    ];
}