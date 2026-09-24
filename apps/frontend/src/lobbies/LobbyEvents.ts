import type { Room, RoomAvailable } from "@colyseus/sdk";
import { useGameStore } from "../store/gameStore";
import type { LobbyRoom } from "../store/slices/lobbySlice";

export type SharedLobbyRoom = Room<RoomAvailable>;

export class LobbyEvents {
    private static currentRoom: SharedLobbyRoom | null = null;
    private static cleanup: Array<() => void> = [];

    static initialize(room: Room) {
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
            room.onMessage("rooms", (rooms: RoomAvailable[]) => {
                useGameStore.getState().setLobbies(
                    rooms.map((room) => this.mapLobby(room))
                );
            }),

            room.onMessage("+", ([_, room]: [string, RoomAvailable]) => {
                useGameStore.getState().addLobby(
                    this.mapLobby(room)
                );
            }),

            room.onMessage("-", (roomId: string) => {
                useGameStore.getState().removeLobby(roomId);
            })
        );
    }

    private static mapLobby(room: RoomAvailable): LobbyRoom {
        return {
            roomId: room.roomId,
            roomCode: room.metadata.roomCode,
            gameType: room.metadata.gameType,
            status: room.metadata.status,
            playerCount: room.metadata.playerCount,
            maxPlayers: room.maxClients,
        };
    }
}