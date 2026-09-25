import { useGameStore } from "../store/gameStore";
import type { LobbyInfo } from "../store/slices/lobbySlice";
import type { AvailableLobby, SharedLobbyRoom } from "./types";

export class LobbyEvents {
    private static currentRoom: SharedLobbyRoom | null = null;
    private static cleanup: Array<() => void> = [];

    static initialize(room: SharedLobbyRoom) {
        this.destroy();

        this.currentRoom = room;

        this.registerRoomEvents(this.currentRoom);
    }

    static destroy() {
        for (const unsubscribe of this.cleanup) {
            unsubscribe();
        }

        this.cleanup = [];
        this.currentRoom = null
    }

    private static registerRoomEvents(room: SharedLobbyRoom) {
        this.cleanup.push(
            room.onMessage("rooms", (rooms: AvailableLobby[]) => {
                useGameStore.getState().setLobbies(
                    rooms.map((room) => this.mapLobby(room))
                );
            }),

            room.onMessage("+", ([_, room]: [string, AvailableLobby]) => {
                useGameStore.getState().upsertLobby(
                    this.mapLobby(room)
                );
            }),

            room.onMessage("-", (roomId: string) => {
                useGameStore.getState().removeLobby(roomId);
            }),
        );
    }

    private static mapLobby(room: AvailableLobby): LobbyInfo {
        return {
            roomId: room.roomId,
            roomCode: room.metadata.roomCode,
            gameType: room.metadata.gameType,
            status: room.metadata.status,
            playerCount: room.metadata.playerCount,
            maxPlayers: room.metadata.maxPlayers,
        };
    }
}