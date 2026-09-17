import type { UnoGameState } from "@uno/shared";
import type { GameRoom, StateCallbacks } from "../../types";
import { UnoPlayerGameDataEvents } from "./UnoPlayerGameDataEvents";
import { UnoGameStateEvents } from "./UnoGameStateEvents";
import { UnoEvents } from "./UnoEvents";
import { UnoLifecycleEvents } from "./UnoLifecycleEvents";

export interface GameEventModule {
    initialize(
        room: GameRoom,
        $: StateCallbacks
    ): Array<() => void>;
}

export const UnoEventModule: GameEventModule = {
    initialize(room, $) {
        const unlisteners: Array<() => void> = [];

        unlisteners.push(
            ...UnoGameStateEvents($, room.state.gameState as UnoGameState),
            ...UnoPlayerGameDataEvents($, room),
            ...UnoEvents(room),
            ...UnoLifecycleEvents(room),
        );

        return unlisteners;
    }
}