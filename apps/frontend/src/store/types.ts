import type { AvatarId, GameType, RoomStatus } from "@uno/shared";
import type { StateCreator } from "zustand";
import type { UnoSlice } from "./slices/unoSlice";
import type { BjSlice } from "./slices/bjSlice";
import type { RoomSlice } from "./slices/roomSlice";
import type { LobbySlice } from "./slices/lobbySlice";

export type StoreSlice<T> = StateCreator<
    GameStore,
    [],
    [],
    T
>;

export type GameStore =
    LobbySlice &
    RoomSlice &
    UnoSlice &
    BjSlice & {
        reset(): void;
        resetGame(): void;
    };


export interface RoomStore {
    connected: boolean;
    roomId: string | null;
    roomCode: string | null;
    gameType: GameType;
    currentTurn: string;
    status: RoomStatus;
    hostId: string;
    players: BasePlayerDTO[];
    localPlayer: BaseLocalPlayerDTO | null;
    winner: GameWinner | null;
    roundResults: RoundResults | null;
    isPaused: boolean;
    pausedPlayerId: string | null;
    reconnectRemaining: number | null;
    roomError: string | null;
}

export interface RoundResults {
    roundWinnerId: string;
    roundWinnerName: string;
    pointsAwarded: number;
    totalScore: number;

    standings: {
        playerId: string;
        playerName: string;
        score: number;
    }[];
}

export interface BasePlayerDTO<TGameData = unknown> {
    id: string;
    name: string;
    photoUrl: string;
    score: number;
    isTurn: boolean;
    isReady: boolean;
    isConnected: boolean;
    avatarId: AvatarId;
    seatIndex: number;
    gameData: TGameData;
}

export type BaseLocalPlayerDTO<TGameData = unknown> = BasePlayerDTO<TGameData>; 

export interface GameWinner {
    id: string;
    name: string;
}