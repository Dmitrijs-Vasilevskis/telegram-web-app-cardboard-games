import { Room } from "@colyseus/core";
import { Card, Color, GameState, Player, RoomStatus, UnoGameState, UnoPlayerData } from "@uno/shared";
import { DeckManager } from './DeckManager';
import { TurnManager } from './TurnManager';
import { CardValidator } from "./validators/CardValidator";
import { ScodeCalculator } from "./ScoreCalculator";
import { MATCH_WINNING_SCORE, ROUND_INTERMISSION_MS } from "./constants";
import { GameEventBus } from "../../game/event/GameEventBus";

export class UnoGameEngine {
    private roundStartTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(
        private room: Room,
        private state: GameState,
        private deckManager: DeckManager,
        private turnManager: TurnManager,
        private eventBus: GameEventBus
    ) { }

    dispose() {
        this.clearRoundStartTimer();
    }

    private clearRoundStartTimer() {
        if (this.roundStartTimer) {
            clearTimeout(this.roundStartTimer);
            this.roundStartTimer = null;
        }
    }

    private getUnoPlayerData(player: Player): UnoPlayerData {
        return player.gameData as UnoPlayerData;
    }

    private getUnoState(): UnoGameState {
        return this.state.gameState as UnoGameState;
    }

    private isGameplayBlocked(): boolean {
        return this.state.gameEnded || Boolean(this.state.roundWinnerId);
    }

    startGame() {
        for (const player of this.state.players.values()) {
            player.score = 0;
        }
        this.state.matchWinnerId = "";

        const firstPlayer = this.state.playerOrder[0];

        this.setupRound(firstPlayer);
    }

    private syncHandCount(player: Player) {
        const unoData = this.getUnoPlayerData(player);
        if (unoData) {
            unoData.handCount = unoData.hand.length;
        }
    }

    private setupRound(startingPlayerId: string) {
        this.deckManager.initialize();

        const unoState = this.getUnoState();

        this.state.roundStartAt = 0;
        this.state.isPaused = false;
        this.state.pausedPlayerId = "";
        this.state.roundWinnerId = "";
        this.state.gameEnded = false;
        this.state.currentTurn = "";

        unoState.direction = 1;
        unoState.unoPendingPlayerId = "";

        for (const player of this.state.players.values()) {
            const unoData = player.gameData as UnoPlayerData;
            unoData.hand.clear();

            const client = this.room.clients.find(c => c.sessionId === player.id);

            for (let i = 0; i < 7; i++) {

                const card = this.deckManager.draw((allocatedCard: Card) => {
                    unoData.hand.push(allocatedCard);

                    if (client?.view) {
                        client.view.add(allocatedCard);
                    }
                });
            }

            player.isTurn = false;
            unoData.saidUno = false;
            this.syncHandCount(player);
        }

        this.turnManager.assignTurn(startingPlayerId);
        this.state.status = RoomStatus.PLAYING;
    }

    private startNextRound(roundWinnerId: string) {
        this.setupRound(roundWinnerId);

        this.room.broadcast("roundStarted",
            {
                starterPlayerId: roundWinnerId
            }
        );
    }

    drawCard(playerId: string, actionId: string) {
        if (this.state.status !== RoomStatus.PLAYING || this.state.isPaused || this.isGameplayBlocked()) return;

        this.resolveUnoWindow();

        const player = this.state.players.get(playerId);

        if (!player || !player.isTurn) return;

        const unoData = this.getUnoPlayerData(player);
        const client = this.room.clients.find(c => c.sessionId === playerId);

        const card = this.deckManager.draw((allocatedCard) => {
            unoData.hand.push(allocatedCard);

            if (client?.view) {
                client.view.add(allocatedCard);
            }
        });

        if (card) {
            this.syncHandCount(player);
        }

        this.eventBus.emit({
            type: "player.animation",
            playerId,
            animation: "Hit",
            actionId,
        });

        const result = this.turnManager.nextTurn();

        if (result?.type === 'paused') {
            this.state.isPaused = true;
            this.state.pausedPlayerId = result.playerId;
            this.state.pausedReconnectRemainingMs = result.remainingMs;
        }
    }

    addCardsToPlayer(playerId: string, count: number) {
        const player = this.state.players.get(playerId);
        if (!player) return;

        const unoData = this.getUnoPlayerData(player);
        const client = this.room.clients.find(c => c.sessionId === playerId);

        for (let i = 0; i < count; i++) {
            this.deckManager.draw((allocatedCard) => {
                unoData.hand.push(allocatedCard);

                if (client?.view) {
                    client.view.add(allocatedCard);
                }
            });
        }

        this.syncHandCount(player);
    }

    playCard(playerId: string, actionId: string, cardId: string, chosenColor?: Color) {
        if (this.state.status !== RoomStatus.PLAYING || this.state.isPaused || this.isGameplayBlocked()) return;

        this.resolveUnoWindow()

        const player = this.state.players.get(playerId);
        let turnsToAdvance = 1;

        if (!player || !player.isTurn) {
            return;
        }

        const unoData = this.getUnoPlayerData(player);
        const unoState = this.getUnoState();

        const cardIndex = unoData.hand.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return;

        const card = unoData.hand[cardIndex];

        if (!CardValidator.canPlay(card, unoState.topDiscardCard, unoState.activeColor)) return;

        if (card.value === 'wild' || card.value === 'wildDrawFour') {
            if (!chosenColor) return;

            unoState.activeColor = chosenColor;
        } else {
            unoState.activeColor = card.color!;
        }

        unoData.hand.splice(cardIndex, 1);
        this.syncHandCount(player);

        this.eventBus.emit({
            type: "player.animation",
            playerId,
            animation: "Hit",
            actionId,
        });

        if (unoData.hand.length === 1) {
            unoData.saidUno = false;

            unoState.unoPendingPlayerId = player.id;
        }

        this.deckManager.discard(card);

        if (card.value === 'skip') {
            turnsToAdvance = 2;
        } else if (card.value === 'reverse') {
            if (this.state.players.size === 2) {
                turnsToAdvance = 2;
            } else {
                unoState.direction = unoState.direction === 1
                    ? -1
                    : 1;
            }
        } else if (card.value === 'drawTwo') {
            const nextPlayerId = this.turnManager.getNextPlayerId(playerId);

            if (!nextPlayerId) return;

            this.addCardsToPlayer(
                nextPlayerId,
                2
            );

            turnsToAdvance = 2;
        } else if (card.value === 'wildDrawFour') {
            const nextPlayerId = this.turnManager.getNextPlayerId(playerId);

            if (!nextPlayerId) return;

            this.addCardsToPlayer(
                nextPlayerId,
                4
            );

            turnsToAdvance = 2;
        }

        // check for win condition before next turn
        if (unoData.hand.length === 0) {
            this.handleRoundWin(playerId);
            return;
        }

        let result;
        for (let i = 0; i < turnsToAdvance; i++) {
            result = this.turnManager.nextTurn();
        }

        if (result?.type === "paused") {
            this.state.isPaused = true;
            this.state.pausedPlayerId = result.playerId;
            this.state.pausedReconnectRemainingMs = result.remainingMs;
        }
    }

    private handleRoundWin(playerId: string) {
        const winner = this.state.players.get(playerId);

        if (!winner) {
            return;
        }

        const unoState = this.getUnoState();
        const points = ScodeCalculator.CalculateRoundPoints(
            this.state.players.values(),
            playerId
        );

        winner.score += points;

        unoState.unoPendingPlayerId = "";
        this.state.roundWinnerId = playerId;

        const standings = Array.from(this.state.players.values()).map(player => ({
            playerId: player.id,
            playerName: player.name,
            score: player.score
        })).sort((a, b) => b.score - a.score);

        if (winner.score >= MATCH_WINNING_SCORE) {
            this.clearRoundStartTimer();
            this.state.matchWinnerId = playerId;
            this.state.gameEnded = true;
            this.state.status = RoomStatus.FINISHED;

            this.room.broadcast("gameEnd",
                {
                    matchWinnerId: playerId,
                    winnerName: winner.name,
                    winnerScore: winner.score,
                    standings
                }
            );

            return;
        };

        this.clearRoundStartTimer();
        this.state.roundStartAt = Date.now() + ROUND_INTERMISSION_MS;


        this.room.broadcast("roundEnded",
            {
                roundWinnerId: playerId,
                roundWinnerName: winner.name,
                pointsAwarded: points,
                totalScore: winner.score,
                standings
            }
        );
        
        // prevent stuck match if a round winner leaves
        this.roundStartTimer = setTimeout(() => {
            this.roundStartTimer = null;
            this.state.roundStartAt = 0;

            const starterId = this.state.players.has(playerId)
                ? playerId
                : this.state.playerOrder[0];

            if (!starterId) return;

            this.startNextRound(starterId);
        }, ROUND_INTERMISSION_MS);
    }

    callUno(playerId: string) {
        const player = this.state.players.get(playerId);

        if (!player) return;

        const unoState = this.getUnoState();

        if (unoState.unoPendingPlayerId !== playerId) {
            return;
        }

        const unoData = this.getUnoPlayerData(player);

        unoData.saidUno = true;
        unoState.unoPendingPlayerId = "";

        this.room.broadcast('unoCalled',
            {
                playerId
            }
        );
    }

    challengeUno(challengerId: string) {
        const unoState = this.getUnoState();

        const offenderId = unoState.unoPendingPlayerId;
        if (!offenderId) return;

        const offender = this.state.players.get(offenderId);

        if (!offender || offender.id === challengerId) return;

        const offenderUnoData = this.getUnoPlayerData(offender);

        if (offenderUnoData.saidUno) return;

        this.addCardsToPlayer(offender.id, 2);
        unoState.unoPendingPlayerId = "";

        this.room.broadcast(
            "unoPenalty",
            {
                offenderId: offender.id,
                challengerId
            }
        );
    }

    private resolveUnoWindow() {
        const unoState = this.getUnoState();

        const pendingPlayerId = unoState.unoPendingPlayerId;

        if (!pendingPlayerId) return;

        const player = this.state.players.get(pendingPlayerId);

        if (!player) {
            unoState.unoPendingPlayerId = "";

            return;
        }

        const unoData = this.getUnoPlayerData(player);
        unoData.saidUno = true;

        unoState.unoPendingPlayerId = "";
    }

    handleTimeoutForfeit() {
        this.turnManager.nextTurn();
    }
}