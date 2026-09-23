import type { Room, RoomAvailable } from "@colyseus/sdk";
import { useGameStore } from "../store/gameStore";
import type { LobbyRoom } from "../store/slices/lobbySlice";

export class LobbyEvents {
    private static currentRoom: Room | null = null;
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

    private static registerRoomEvents(room: Room) {
        this.cleanup.push(
            room.onMessage("rooms", (rooms: RoomAvailable[]) => {
                useGameStore.getState().setLobbies(
                    rooms.map((room) => this.mapLobby(room))
                );
            }),

            room.onMessage("+", ([roomId, room]: [string, RoomAvailable]) => {
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