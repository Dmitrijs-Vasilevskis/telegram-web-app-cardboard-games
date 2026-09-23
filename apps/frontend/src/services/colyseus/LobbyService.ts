import { LobbyEvents } from "../../lobbies/LobbyEvents";
import { useGameStore } from "../../store/gameStore";
import type { ColyseusService } from "./ColyseusService";

export class LobbyService {
    private readonly colyseus: ColyseusService;
    private connected = false;

    constructor(colyseus: ColyseusService) {
        this.colyseus = colyseus;
    }

    async connect() {
        if (this.connected) return;

        this.connected = true;

        try {
            const room = await this.colyseus.joinLobby();

            LobbyEvents.initialize(room);
        } catch (error) {
            this.connected = false;
            throw error;
        }
    }

    async disconnect() {
        if (!this.connected) return;

        this.connected = false;

        LobbyEvents.destroy();
        await this.colyseus.leaveLobby();

        useGameStore.getState().clearLobbies();
    }
}