import { CloseCode } from "@colyseus/sdk";
import { useGameStore } from "../../../store/gameStore";
import type { GameRoom } from "../types";

export function RoomLifecycleEvents(room: GameRoom) {

    room.onLeave((code: number, _reason?: string) => {
        const isIntentionalLeave = code === CloseCode.CONSENTED;
        const isReconnectFailure = code === CloseCode.FAILED_TO_RECONNECT;

        if (isIntentionalLeave || isReconnectFailure) {
            useGameStore.getState().reset();
        };
    });
}