import type { GameType, RoomStatus } from "@uno/shared";
import type { StoreSlice } from "../types";

export interface LobbyInfo {
    roomId: string;
    roomCode: string;
    gameType: GameType;
    status: RoomStatus;
    playerCount: number;
    maxPlayers: number;
}

export interface LobbyState {
    lobbies: LobbyInfo[];
}

export interface LobbyActions {
    setLobbies: (lobbies: LobbyInfo[]) => void;
    upsertLobby: (lobby: LobbyInfo) => void;
    updateLobby: (updates: LobbyInfo) => void;
    removeLobby: (roomId: string) => void;
    clearLobbies: () => void;
}

export type LobbySlice = LobbyState & LobbyActions;

export const initialLobbyState: LobbyState = {
    lobbies: [],
}

export const createLobbySlice: StoreSlice<LobbySlice> = (set) => ({
    ...initialLobbyState,
    setLobbies: (lobbies: LobbyInfo[]) => set({ lobbies }),
    upsertLobby: (lobby: LobbyInfo) => set((state) => {
        const exist = state.lobbies.some((existing) => existing.roomId === lobby.roomId);

        return {
            lobbies: exist
                ? state.lobbies.map((existing) =>
                    existing.roomId === lobby.roomId
                        ? lobby
                        : existing
                )
                : [...state.lobbies, lobby],
        };
    }),
    updateLobby: (updates: LobbyInfo) => set((state) => ({
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