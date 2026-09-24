import { Client, type Room } from "@colyseus/sdk";

const RECONNECTION_TOKEN = "lobby_reconnection_token";

export class ColyseusService {
    readonly client: Client;
    room: Room | null = null;
    lobbyRoom: Room | null = null;

    constructor() {
        this.client = new Client(
            import.meta.env.VITE_COLYSEUS_SERVER_URL ||
            "ws://localhost:2567"
        );
    }

    async joinLobby(): Promise<Room> {
        if (this.lobbyRoom) {
            return this.lobbyRoom;
        }

        this.lobbyRoom = await this.client.joinOrCreate("lobby");

        return this.lobbyRoom;
    }

    async leaveLobby(): Promise<void> {
        if (!this.lobbyRoom) {
            return;
        }

        await this.lobbyRoom.leave();
        this.lobbyRoom = null;
    }

    async createRoom(initData: string): Promise<Room> {
        const room = await this.client.create("game", {
            initData
        });

        return this.setupRoom(room);
    }

    private setupRoom(room: Room): Room {
        this.room = room;

        this.persistSession();

        room.onReconnect(() => {
            this.persistSession();
        });

        return room;
    }

    async joinRoomByCode(
        roomCode: string,
        initData: string
    ): Promise<Room> {
        this.room = await this.client.join("game", {
            roomCode,
            initData
        });

        this.persistSession();

        return this.room;
    }

    async reconnect(reconnetionToken: string): Promise<Room> {
        this.room = await this.client.reconnect(reconnetionToken);
        this.persistSession();
        return this.room;
    }

    send(type: string, payload?: any) {
        this.room?.send(type, payload);
    }

    async leave(): Promise<void> {
        if (!this.room) return;

        localStorage.removeItem(RECONNECTION_TOKEN);

        await this.room.leave();
        this.room = null;
    }

    async trySessionRecovery(): Promise<Room | null> {
        const reconnetionToken = localStorage.getItem(RECONNECTION_TOKEN);
        if (!reconnetionToken) return null;

        try {
            this.room = await this.client.reconnect(reconnetionToken);

            this.persistSession();

            return this.room;
        } catch (error) {
            console.warn("[RECONNECTION FAILED]: Session missing on the server or token expired. Clearing cache.", error);

            localStorage.removeItem(RECONNECTION_TOKEN);
            this.room = null;

            return null;
        }
    }

    private persistSession(): void {
        if (!this.room) return;

        localStorage.setItem(RECONNECTION_TOKEN, this.room.reconnectionToken)
    }
}