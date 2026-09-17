import { RoomStatus, type GameType } from "@uno/shared";
import { UnoEventModule, type GameEventModule } from "../games/uno/UnoEventModule";
import type { GameRoom, StateCallbacks } from "../types";
import { BjEventModule } from "../games/bj/BjEventModule";

export const GAME_EVENT_MODULES: Record<GameType, GameEventModule> = {
    uno: UnoEventModule,
    blackjack: BjEventModule
};

export function RegisterGameModuleEvents(
    room: GameRoom,
    $: StateCallbacks
): Array<() => void> {
    let activeGameListeners: Array<() => void> = [];

    const cleanup = () => {
        const listeners = activeGameListeners;

        for (const unlisten of listeners) {
            try {
                unlisten();
            } catch (error) {
                console.warn("[GAME MODULE] Failed to cleanup listener:", error);
            }
        }

        activeGameListeners = [];
    };

    const statusListener = $(room.state).listen("status", (status: RoomStatus) => {
        if (status !== RoomStatus.PLAYING) {
            cleanup();
            return;
        }

        cleanup();

        const gameEventModule = GAME_EVENT_MODULES[room.state.gameType];

        if (!gameEventModule) {
            return;
        }

        activeGameListeners = gameEventModule.initialize(room, $);
    });

    return [
        statusListener,
        cleanup
    ]
}