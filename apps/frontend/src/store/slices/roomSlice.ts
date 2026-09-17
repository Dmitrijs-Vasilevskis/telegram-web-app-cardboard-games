import { GameType, RoomStatus } from "@uno/shared";
import type { BaseLocalPlayerDTO, BasePlayerDTO, StoreSlice } from "../types";

export interface GameResult {
    winnerId: string;
    winnerName: string;
    winnerScore: number;
    standings: {
        playerId: string;
        playerName: string;
        score: number;
    }[];
}

export type RoomSlice = RoomState & RoomActions;

export interface RoomState {
    connected: boolean;
    roomId: string | null;
    roomCode: string | null;
    players: BasePlayerDTO[];
    localPlayer: BaseLocalPlayerDTO | null;
    currentTurn: string;
    gameType: GameType;
    status: RoomStatus | null
    hostId: string;
    roomError: string | null;
    gameResult: GameResult | null;
    isPaused: boolean;
    pausedPlayerId: string | null;
    reconnectRemaining: number | null;
}

export interface RoomActions {
    setConnected: (value: boolean) => void;
    setRoomId: (roomId: string) => void;
    setRoomCode: (roomCode: string) => void;
    setPlayers: (players: BasePlayerDTO[]) => void;
    setLocalPlayer: (localPlayer: BaseLocalPlayerDTO | null) => void;
    setCurrentTurn: (playerId: string) => void;
    setGameType: (gameType: GameType) => void;
    setStatus: (status: RoomStatus) => void;
    setHostId: (hostId: string) => void;
    setPaused: (paused: boolean, pausedPlayerId?: string, reconnectRemaining?: number) => void;
    setGameResult: (winner: GameResult | null) => void;
    setRoomError: (message: string | null) => void;
}

export const initialRoomState: RoomState = {
    connected: false,
    roomId: null,
    roomCode: null,
    players: [],
    localPlayer: null,
    currentTurn: "",
    gameType: GameType.UNO,
    status: null,
    hostId: "",
    roomError: null,
    gameResult: null,
    isPaused: false,
    pausedPlayerId: null,
    reconnectRemaining: null
}

export const createRoomSlice: StoreSlice<RoomSlice> = (set) => ({
    connected: false,
    roomId: null,
    roomCode: null,
    players: [],
    localPlayer: null,
    currentTurn: "",
    gameType: GameType.UNO,
    status: null,
    hostId: "",
    roomError: null,
    gameResult: null,
    roundResult: null,
    isPaused: false,
    pausedPlayerId: null,
    reconnectRemaining: null,
    setConnected: (connected) => set({ connected }),
    setRoomId: (roomId) => set({ roomId }),
    setStatus: (status: RoomStatus | null) => set({ status }),
    setGameType: (gameType: GameType) => set({ gameType }),
    setRoomCode: (roomCode) => set({ roomCode }),
    setPlayers: (players) => set({ players }),
    setLocalPlayer: (localPlayer: BaseLocalPlayerDTO | null) => set({ localPlayer }),
    setCurrentTurn: (currentTurn: string) => set({ currentTurn }),
    setHostId: (hostId) => set({ hostId }),
    setGameResult: (gameResult: GameResult | null) => set({ gameResult }),
    setRoomError: (roomError) => set({ roomError }),
    setPaused: (isPaused: boolean, pausedPlayerId?: string, reconnectRemaining?: number) => {
        set({
            isPaused,
            pausedPlayerId: pausedPlayerId ?? null,
            reconnectRemaining: reconnectRemaining ?? null,
        })
    }
});