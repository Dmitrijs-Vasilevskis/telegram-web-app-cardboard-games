import type { GameType, RoomStatus } from "@uno/shared";
import type { StoreSlice } from "../types";

export interface LobbyRoom {
    roomId: string;
    roomCode: string;
    gameType: GameType;
    status: RoomStatus;
    playerCount: number;
    maxPlayers: number;
}

export interface LobbyState {
    lobbies: LobbyRoom[];
}

export interface LobbyActions {
    setLobbies: (lobbies: LobbyRoom[]) => void;
    addLobby: (lobby: LobbyRoom) => void;
    updateLobby: (updates: LobbyRoom) => void;
    removeLobby: (roomId: string) => void;
    clearLobbies: () => void;
}

export type LobbySlice = LobbyState & LobbyActions;

export const initialLobbyState: LobbyState = {
    lobbies: [],
}

export const createLobbySlice: StoreSlice<LobbySlice> = (set) => ({
    ...initialLobbyState,
    setLobbies: (lobbies: LobbyRoom[]) => set({ lobbies }),
    addLobby: (lobby: LobbyRoom) => set((state) => ({
        lobbies: state.lobbies.some(
            (existing) => existing.roomId === lobby.roomId)
            ? state.lobbies
            : [...state.lobbies, lobby]
    })),
    updateLobby: (updates: LobbyRoom) => set((state) => ({
        lobbies: state.lobbies.map((lobby) =>
            lobby.roomId === updates.roomId
                ? updates
                : lobby
        )
    })),
    removeLobby: (roomId: string) => set((state) => ({
        lobbies: state.lobbies.filter((lobby) => lobby.roomId !== roomId)
    })),
    clearLobbies: () => set({
        lobbies: []
    }),
});