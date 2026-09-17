import { create } from "zustand";
import type { GameStore } from "./types";
import { createRoomSlice, initialRoomState } from "./slices/roomSlice";
import { initialUnoState, unoSlice } from "./slices/unoSlice";
import { bjSlice, initialBjState } from "./slices/bjSlice";

export const useGameStore = create<GameStore>()((set, get, api) => ({
    ...createRoomSlice(set, get, api),
    ...unoSlice(set, get, api),
    ...bjSlice(set, get, api),
    reset() {
        set({
            ...initialRoomState,
            ...initialUnoState,
            ...initialBjState
        })
    },
    resetGame() {
        const gameType = get().gameType;

        set({
            gameResult: null,
            roundResult: null,
            isPaused: false,
            pausedPlayerId: null,
            reconnectRemaining: null,

            ...(gameType === "uno" ? initialUnoState : {}),
            ...(gameType === "blackjack" ? initialBjState : {}),
        })
    },
}));