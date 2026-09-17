import { BaseGameState, BasePlayerData, BjGameState, BjPlayerData, Color, GameState, GameType, Player, UnoGameState, UnoPlayerData } from "@uno/shared";
import { Client, Room } from "@colyseus/core";
import { UnoGameEngine } from "../games/uno/GameEngine";
import { BlackjackGameEngine } from "../games/blackjack/GameEngine";
import { GameEventBus } from "./event/GameEventBus";

export interface GameEngine {
    startGame(): void;
    dispose(): void;
    handleTimeoutForfeit(): void;
}

export interface GameDefinition<
    TEngine extends GameEngine,
    TGameState extends BaseGameState,
    TPlayerData extends BasePlayerData
> {
    createGameState: () => TGameState;
    createPlayerData: () => TPlayerData;
    createEngine: (room: Room, state: GameState, eventBus: GameEventBus) => TEngine;
    setupMessages: (room: Room, engine: GameEngine) => Array<() => void>;
    syncView?: (client: Client, player: Player) => void;
    onSessionIdSwapped?: (state: GameState, oldId: string, newId: string) => void;
}

type GameDefinitionMap = {
    [GameType.UNO]: GameDefinition<UnoGameEngine, UnoGameState, UnoPlayerData>;
    [GameType.BLACKJACK]: GameDefinition<BlackjackGameEngine, BjGameState, BjPlayerData>;
}

export const GAME_REGISTRY: GameDefinitionMap = {
    uno: {
        createGameState: () => new UnoGameState(),
        createPlayerData: () => new UnoPlayerData(),
        createEngine: (room, state, eventBus) => {
            const { DeckManager } = require("../games/uno/DeckManager");
            const { TurnManager } = require("../games/uno/TurnManager");

            const deckManager = new DeckManager(state);
            const turnManager = new TurnManager(state);

            return new UnoGameEngine(
                room,
                state,
                deckManager,
                turnManager,
                eventBus
            );
        },
        setupMessages: (room, engine) => {
            const unoEngine = engine as UnoGameEngine;

            const unbindPlayCard = room.onMessage('playCard', (client, payload: { actionId: string, cardId: string; chosenColor?: Color }) => {
                unoEngine.playCard(client.sessionId, payload.actionId, payload.cardId, payload.chosenColor);
            });

            const unbindDrawCard = room.onMessage('drawCard', (client, payload: { actionId: string }) => {
                unoEngine.drawCard(client.sessionId, payload.actionId);
            });

            const unbindChallengeUno = room.onMessage('challengeUno', (client) => {
                unoEngine.challengeUno(client.sessionId);
            });

            const unbindUno = room.onMessage('uno', (client) => {
                unoEngine.callUno(client.sessionId);
            });

            return [
                unbindPlayCard,
                unbindDrawCard,
                unbindChallengeUno,
                unbindUno
            ];
        },
        syncView: (client, player) => {
            const unoData = player.gameData as UnoPlayerData;

            if (unoData && unoData.hand) {
                for (const card of unoData.hand) {
                    client?.view?.add(card);
                }
            }
        },
        onSessionIdSwapped: (state, oldId, newId) => {
            const unoGameData = state.gameState as UnoGameState;

            if (unoGameData && unoGameData.unoPendingPlayerId === oldId) {
                unoGameData.unoPendingPlayerId = newId;
            }
        }
    },
    blackjack: {
        createGameState: () => new BjGameState(),
        createPlayerData: () => new BjPlayerData(),
        createEngine: (room, state, eventBus) => {
            const { DeckManager } = require("../games/blackjack/DeckManager");
            const { TurnManager } = require("../games/blackjack/TurnManager");

            const deckManager = new DeckManager(state);
            const turnManager = new TurnManager(state);

            return new BlackjackGameEngine(
                room,
                state,
                deckManager,
                turnManager,
                eventBus
            );
        },
        setupMessages: (room, engine) => {
            const bjEngine = engine as BlackjackGameEngine;
            
            const unbindStand = room.onMessage('stand', (client, payload: { actionId: string }) => {
                bjEngine.handlePlayerStand(client.sessionId, payload.actionId);
            });

            const unbindHit = room.onMessage('hit', (client, payload: { actionId: string }) => {
                bjEngine.handlePlayerHit(client.sessionId, payload.actionId);
            });

            return [
                unbindStand,
                unbindHit
            ];
        },
        syncView: (client, player) => {
            const bjData = player.gameData as BjPlayerData;

            if (bjData && bjData.hand) {
                for (const card of bjData.hand) {
                    client?.view?.add(card);
                }
            }
        }
    }
};