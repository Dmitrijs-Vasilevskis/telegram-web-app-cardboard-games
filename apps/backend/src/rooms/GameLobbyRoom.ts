import { Client, CloseCode, Room } from "@colyseus/core";
import { TelegramAuthUser, validateTelegramInitData } from "../auth/telegram";
import { AvatarId, GameState, GameType, Player, RoomOptions, RoomStatus } from "@uno/shared";
import { StateView } from "@colyseus/schema";
import { assertRoomCapacity, hasRoomCode, registerRoom, unregisterRoom } from "../utils/roomRegistry";
import { ALLOWED_EMOTE_IDS, MAX_CLIENTS, ROOM_CODE_MAX_GENERATION_ATTEMPTS } from "../game/constants";
import { generateUniqueRoomCode } from "../utils/roomCode";
import { GAME_REGISTRY, GameEngine } from "../game/GameRegistry";
import { GameEventBus } from "../game/event/GameEventBus";
import { GameEventBroadcaster } from "../game/event/GameEventBroadcaster";
import { SeatManager } from "../game/SeatManager";

export class GameLobbyRoom extends Room<RoomOptions> {
    private gameEngine?: GameEngine;
    private gameEngineMessageListeners: Array<() => void> = [];
    private gameEventBus!: GameEventBus;
    private gameEventBroadcaster!: GameEventBroadcaster;
    private seatManager!: SeatManager;
    private pauseIntervalTimer: ReturnType<typeof setInterval> | null = null;

    onCreate(options: { gameType?: GameType }) {
        assertRoomCapacity();
        this.maxClients = MAX_CLIENTS;

        this.state = new GameState();
        this.state.status = RoomStatus.LOBBY;

        if (options.gameType && GAME_REGISTRY[options.gameType]) {
            this.state.gameType = options.gameType;
        } else {
            this.state.gameType = GameType.UNO;
        }

        const roomCode = generateUniqueRoomCode(
            (code) => !hasRoomCode(code),
            6,
            ROOM_CODE_MAX_GENERATION_ATTEMPTS,
        );

        registerRoom(roomCode);

        this.state.roomCode = roomCode;
        this.setMetadata({ ...this.metadata, roomCode });

        this.gameEventBus = new GameEventBus();
        this.gameEventBroadcaster = new GameEventBroadcaster(
            this.gameEventBus,
            this
        );
        this.seatManager = new SeatManager(6);

        this.gameEventBroadcaster.start();

        this.onMessage('selectGame', (client, payload: { gameType: GameType }) => {
            if (client.sessionId !== this.state.hostId) return;

            if (this.state.status !== RoomStatus.LOBBY) return;

            if (!GAME_REGISTRY[payload.gameType]) return;

            this.state.gameType = payload.gameType;
            this.setMetadata({ ...this.metadata, gameType: payload.gameType });

            const config = GAME_REGISTRY[payload.gameType];

            this.state.players.forEach((player) => {
                player.gameData = config.createPlayerData();
                player.isReady = false;
            });

            console.log(`[LOBBY] Host changed game type to: ${payload.gameType}`);
        });

        this.onMessage('startGame', (client) => {
            this.handleStartGame(client.sessionId);
        });

        this.onMessage('restartGame', (client) => {
            this.handleRestartGame(client.sessionId);
        })

        this.onMessage('backToLobby', (client) => {
            this.handleBackToLobby(client.sessionId);
        });

        this.onMessage('toggleReady', (client) => {
            const player = this.state.players.get(client.sessionId);
            if (player) player.isReady = !player.isReady;
        });

        this.onMessage('sendEmote', (client, payload: { emoteId: string }) => {
            if (!payload?.emoteId || !ALLOWED_EMOTE_IDS.has(payload.emoteId)) return;

            this.gameEventBus.emit({
                type: "player.emote",
                playerId: client.sessionId,
                emote: payload.emoteId,
            });
        });

        this.onMessage('changeAvatar', (client, payload: { avatarId: AvatarId }) => {
            const player = this.state.players.get(client.sessionId);

            if (player) player.avatarId = payload.avatarId;
        });
    }

    async onAuth(client: Client, options: { initData: string }) {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        if (!botToken || !options.initData) return false;

        const tgUser = validateTelegramInitData(options.initData, botToken);

        if (!tgUser) {
            console.error(`[AUTH FAILED]: Client ${client.sessionId} - Invalid authentication raw data`);
            return false;
        }

        return tgUser;
    }

    onJoin(client: Client, options: any) {
        const user = client.auth as TelegramAuthUser;
        const telegramId = String(user.id);
        const displayName = user.username || user.first_name || "Player";
        const photoUrl = user.photo_url || "";

        client.view = new StateView();
        const existingPlayer = this.findExistingPlayer(telegramId);

        if (!existingPlayer && this.state.status !== RoomStatus.LOBBY) {
            throw new Error('Game already in progress');
        }

        const currentConfig = GAME_REGISTRY[this.state.gameType];

        if (existingPlayer) {
            const oldSessionId = existingPlayer.id;
            const newSessionId = client.sessionId;

            this.state.players.delete(oldSessionId);

            existingPlayer.id = newSessionId;
            existingPlayer.connectionId = newSessionId;
            existingPlayer.isConnected = true;
            existingPlayer.disconnectedAt = 0;

            this.seatManager.replacePlayerId(oldSessionId, newSessionId);

            this.state.players.set(newSessionId, existingPlayer);

            if (this.state.hostId === oldSessionId) this.state.hostId = newSessionId;
            if (this.state.currentTurn === oldSessionId) this.state.currentTurn = newSessionId;
            if (this.state.pausedPlayerId === oldSessionId) this.state.pausedPlayerId = newSessionId;
            if (this.state.roundWinnerId === oldSessionId) this.state.roundWinnerId = newSessionId;
            if (this.state.matchWinnerId === oldSessionId) this.state.matchWinnerId = newSessionId;

            // Handle specific game custom session string tracking corrections via a local hook override if needed
            if (currentConfig.onSessionIdSwapped) {
                currentConfig.onSessionIdSwapped(this.state, oldSessionId, newSessionId);
            }

            const playerIndex = this.state.playerOrder.indexOf(oldSessionId);
            if (playerIndex !== -1) {
                this.state.playerOrder[playerIndex] = newSessionId;
            }

            // Let subclass add custom schema fields to the View filter (e.g. Hand cards)
            if (currentConfig.syncView) {
                currentConfig.syncView(client, existingPlayer);
            }

            client.view.add(existingPlayer);
            return;
        }

        // Creating fresh lobby player
        const newPlayer = new Player();
        newPlayer.id = client.sessionId;
        newPlayer.connectionId = client.sessionId;
        newPlayer.telegramId = telegramId;
        newPlayer.playerId = telegramId;
        newPlayer.name = displayName;
        newPlayer.photoUrl = photoUrl;
        newPlayer.gameData = currentConfig.createPlayerData();

        const seatIndex = this.seatManager.reserve(newPlayer.id);

        if (seatIndex === null) {
            throw new Error("No seats available");
        }

        newPlayer.seatIndex = seatIndex;

        this.state.players.set(client.sessionId, newPlayer);
        this.state.playerOrder.push(client.sessionId);

        client.view.add(newPlayer);

        if (!this.state.hostId) {
            this.state.hostId = client.sessionId;
        }
    }

    async onLeave(client: Client, code?: number) {
        const player = this.state.players.get(client.sessionId);
        if (!player) return;

        if (code === CloseCode.CONSENTED) {
            this.removePlayer(client.sessionId);
            return;
        }

        player.isConnected = false;
        player.disconnectedAt = Date.now();


        this.handlePlayerDisconnect(client.sessionId, 30000);

        try {
            await this.allowReconnection(client, 30);
            player.isConnected = true;
            player.disconnectedAt = 0;

            this.handlePlayerReconnect(client.sessionId);
        } catch {
            const wasPausedPlayer = this.state.pausedPlayerId === player.id;
            this.removePlayer(player.id);
            if (wasPausedPlayer && this.gameEngine) {

                this.resumeGame();
                this.gameEngine.handleTimeoutForfeit();
            }
        }
    }

    onDispose() {
        unregisterRoom(this.state.roomCode);

        this.gameEventBus?.clear();
        this.gameEventBroadcaster?.stop();

        if (this.gameEngine) {
            this.cleanupGameMessages();
            this.gameEngine.dispose();
        }
    }

    private handleStartGame(playerId: string) {
        if (playerId !== this.state.hostId) return;
        if (this.state.players.size < 1) {
            this.broadcast('error', { message: 'At least 2 players required to start the game.' });
            return;
        }

        if (this.state.status !== RoomStatus.LOBBY) return;

        const allReady = Array.from(this.state.players.values())
            .every((player) => player.isReady);

        if (!allReady) {
            this.broadcast("error", {
                message: "All players must be ready.",
            });
            return;
        }

        const gameConfig = GAME_REGISTRY[this.state.gameType];

        this.state.gameState = gameConfig.createGameState();

        this.gameEngine = gameConfig.createEngine(
            this,
            this.state,
            this.gameEventBus
        );

        this.gameEngineMessageListeners = gameConfig.setupMessages(
            this,
            this.gameEngine
        );

        this.state.status = RoomStatus.PLAYING;
        this.gameEngine.startGame();

        this.broadcast("gameStarted", { gameType: this.state.gameType });
    }

    private handleRestartGame(playerId: string) {
        if (this.state.hostId !== playerId) return;

        if (this.state.status !== RoomStatus.FINISHED) return;

        if (this.state.players.size < 1) {
            this.broadcast('error', { message: 'At least 2 players required to start the game.' });
            return;
        }

        const allReady = Array.from(this.state.players.values())
            .every((player) => player.isReady);

        if (!allReady) {
            this.broadcast("error", {
                message: "All players must be ready.",
            });
            return;
        }

        this.cleanupGameMessages();
        this.gameEngine?.dispose();
        this.gameEngine = undefined;

        const gameConfig = GAME_REGISTRY[this.state.gameType];

        this.state.gameState = gameConfig.createGameState();

        this.gameEngine = gameConfig.createEngine(
            this,
            this.state,
            this.gameEventBus
        );

        this.gameEngineMessageListeners = gameConfig.setupMessages(
            this,
            this.gameEngine
        );

        this.state.gameEnded = false;
        this.state.roundWinnerId = "";
        this.state.matchWinnerId = "";

        for (const player of this.state.players.values()) {
            player.isReady = false;
            player.isTurn = false;
        }

        this.state.status = RoomStatus.PLAYING;
        this.gameEngine.startGame();

        this.broadcast("gameStarted", { gameType: this.state.gameType });
    }

    private handleBackToLobby(playerId: string) {
        const player = this.state.players.get(playerId);

        if (!player) return;

        if (player.id !== this.state.hostId) return;

        if (this.state.status !== RoomStatus.FINISHED) return;

        this.cleanupGame();
        this.transitionToLobby();
    }

    private transitionToLobby() {
        this.state.gameEnded = false;
        this.state.roundWinnerId = "";
        this.state.matchWinnerId = "";

        for (const player of this.state.players.values()) {
            player.isReady = false;
        }

        this.state.status = RoomStatus.LOBBY;
    }

    private removePlayer(playerId: string) {
        this.seatManager.release(playerId);

        const playerIndex = this.state.playerOrder.indexOf(playerId);
        if (playerIndex !== -1) this.state.playerOrder.splice(playerIndex, 1);

        this.state.players.delete(playerId);
        if (this.state.currentTurn === playerId) this.state.currentTurn = "";
        if (this.state.hostId === playerId) this.state.hostId = this.state.playerOrder[0] ?? "";

        if (this.state.players.size === 0) this.disconnect();
    }

    private findExistingPlayer(telegramId: string): Player | undefined {
        return Array.from(this.state.players.values()).find(p => p.telegramId === telegramId);
    }

    handlePlayerDisconnect(playerId: string, durationMs: number) {
        if (this.state.status !== RoomStatus.PLAYING || this.state.isPaused) return;

        this.pauseGame(playerId, durationMs);
        this.clearPauseInterval();

        this.pauseIntervalTimer = setInterval(() => {
            if (this.state.pausedReconnectRemainingMs <= 1000) {
                this.clearPauseInterval();
                this.state.pausedReconnectRemainingMs = 0;
                return;
            }

            this.state.pausedReconnectRemainingMs -= 1000;
        }, 1000);
    }

    handlePlayerReconnect(playerId: string) {
        if (this.state.isPaused && this.state.pausedPlayerId === playerId) {
            this.clearPauseInterval();
            this.resumeGame();

            // this.room.broadcast("gameResumed");
        }
    }

    private pauseGame(playerId: string, durationMs: number) {
        this.state.isPaused = true;
        this.state.pausedPlayerId = playerId;
        this.state.pausedReconnectRemainingMs = durationMs;
    }

    private resumeGame() {
        this.state.isPaused = false;
        this.state.pausedPlayerId = "";
        this.state.pausedReconnectRemainingMs = 0;
    }

    private clearPauseInterval() {
        if (this.pauseIntervalTimer) {
            clearInterval(this.pauseIntervalTimer);
            this.pauseIntervalTimer = null;
        }
    }

    private cleanupGameMessages() {
        for (const unbind of this.gameEngineMessageListeners) {
            unbind();
        }

        this.gameEngineMessageListeners = [];
    }

    private cleanupGame() {
        for (const unbind of this.gameEngineMessageListeners) {
            unbind();
        }

        this.gameEngineMessageListeners = [];

        this.gameEngine?.dispose();
        this.gameEngine = undefined;
    }
}