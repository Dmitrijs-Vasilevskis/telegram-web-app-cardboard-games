import type { Room, RoomAvailable } from "@colyseus/sdk";
import type { LobbyMetadata } from "@uno/shared";

export type SharedLobbyRoom = Room<AvailableLobby>;

export type AvailableLobby = RoomAvailable & {
    metadata: LobbyMetadata;
};