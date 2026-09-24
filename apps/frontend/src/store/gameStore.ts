import { create } from "zustand";
import type { GameStore } from "./types";
import { createRoomSlice, initialRoomState } from "./slices/roomSlice";
import { initialUnoState, unoSlice } from "./slices/unoSlice";
import { bjSlice, initialBjState } from "./slices/bjSlice";
import { createLobbySlice, initialLobbyState } from "./slices/lobbySlice";

export const useGameStore = create<GameStore>()((set, get, api) => ({
    ...createLobbySlice(set, get, api),
    ...createRoomSlice(set, get, api),
    ...unoSlice(set, get, api),
    ...bjSlice(set, get, api),
    reset() {
        set({
            ...initialLobbyState,
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