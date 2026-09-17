import { Room } from "@colyseus/core";
import { GameState, BjCard, RoomStatus, Player, BjPlayerData, BjGameState, BjDealerPublicCard, GameEventInput } from '@uno/shared';
import { BJ_TIMINGS, MATCH_WINNING_SCORE } from "./constants";
import { DeckManager } from "./DeckManager";
import { TurnManager } from "./TurnManager";
import { evaluateHand, HandEvaluation } from "./utils/HandEvaluator";
import { BlackjackDealerRuntime } from "./BlackjackDealerRuntime";
import { GameActionScheduler } from "../../game/GameActionScheduler";
import { BjRoundResult, BjRoundResultType, InitialDealTarget } from "./types";
import { GameEventBus } from "../../game/event/GameEventBus";

export class BlackjackGameEngine {
    private needsReshuffle = false;
    private dealer = new BlackjackDealerRuntime();
    private readonly scheduler = new GameActionScheduler();
    private initialDealSequence: InitialDealTarget[] = [];
    private initialDealIndex = 0;

    constructor(
        private room: Room,
        private state: GameState,
        private deckManager: DeckManager,
        private turnManager: TurnManager,
        private eventBus: GameEventBus
    ) { }

    private getBjState(): BjGameState {
        return this.state.gameState as BjGameState;
    }

    private getBjData(player: Player): BjPlayerData {
        return player.gameData as BjPlayerData;
    }

    startGame() {
        for (const player of this.state.players.values()) {
            player.score = 0;
        }

        this.state.matchWinnerId = "";
        this.state.roundNumber = 1;
        this.needsReshuffle = false;

        this.deckManager.initialize();

        this.setupRound();
    }

    private setupRound() {
        const bjState = this.getBjState();

        const shiftAmount = (this.state.roundNumber - 1) % this.state.playerOrder.length;
        const shiftedOrder = [
            ...this.state.playerOrder.slice(shiftAmount),
            ...this.state.playerOrder.slice(0, shiftAmount)
        ];

        this.state.playerOrder.clear();
        shiftedOrder.forEach(id => this.state.playerOrder.push(id));

        // clear hands and hand value
        this.dealer.clear();
        bjState.bjDealer.hand.clear();
        bjState.bjDealer.handValue = 0;

        // initial player states
        this.state.playerOrder.forEach((playerId) => {
            const player = this.state.players.get(playerId);
            if (!player) return;

            if (!(player.gameData instanceof BjPlayerData)) {
                player.gameData = new BjPlayerData();
            }

            const bjData = this.getBjData(player);

            bjData.hand.clear();
            bjData.handValue = 0;
            bjData.blackjackStood = false;

            player.isTurn = false;
        });

        this.dealInitialCards();

        this.room.broadcast("roundHighlight", {
            roundNumber: this.state.roundNumber
        });
    }

    private dealInitialCards() {
        this.initialDealSequence = this.createInitialDealSequence();
        this.initialDealIndex = 0;

        this.dealNextInitialCard();
    }

    private dealNextInitialCard() {
        const target = this.initialDealSequence[this.initialDealIndex];

        if (!target) {
            this.finishInitialDeal()
            return;
        }

        if (target.type === "player") {
            this.dealCardToPlayer(target.playerId);
        } else {
            this.dealCardToDealer(target.isFaceDown);
        }

        this.initialDealIndex++;

        this.scheduler.schedule(
            BJ_TIMINGS.initialDeal,
            () => {
                this.dealNextInitialCard();
            }
        );
    }

    private finishInitialDeal() {
        this.initialDealSequence = [];
        this.initialDealIndex = 0;

        const firstPlayerOrder = this.state.playerOrder[0];

        if (firstPlayerOrder) {
            this.turnManager.assignTurn(firstPlayerOrder);
        }

        this.state.status = RoomStatus.PLAYING;
    }

    private createInitialDealSequence(): InitialDealTarget[] {
        const sequence: InitialDealTarget[] = [];

        // first circle
        this.state.playerOrder.forEach((playerId) => {
            sequence.push({
                type: "player",
                playerId: playerId
            });
        });

        sequence.push({
            type: "dealer",
            isFaceDown: false,
        });

        // second circle
        this.state.playerOrder.forEach((playerId) => {
            sequence.push({
                type: "player",
                playerId: playerId
            });
        });

        sequence.push({
            type: "dealer",
            isFaceDown: true,
        });

        return sequence;
    }

    private dealCardToPlayer(playerId: string): void {
        const player = this.state.players.get(playerId);
        if (!player) return;

        const client = this.room.clients.find(c => c.sessionId === player.id);
        const bjData = this.getBjData(player);

        const { crossedThreshold } = this.deckManager.drawCard((allocatedCard: BjCard) => {
            bjData.hand.push(allocatedCard);

            if (client?.view) {
                client.view.add(allocatedCard);
            }
        });

        if (crossedThreshold) {
            this.needsReshuffle = true;
        };

        const hand = evaluateHand(bjData.hand);
        bjData.handValue = hand.value;
    }

    private dealCardToDealer(isFaceDown: boolean): void {
        const bjState = this.getBjState();

        const { crossedThreshold } = this.deckManager.drawCard((allocatedCard: BjCard) => {
            allocatedCard.isFaceDown = isFaceDown;

            this.dealer.hand.push(allocatedCard);

            const dealerCard = new BjDealerPublicCard();

            dealerCard.id = allocatedCard.id;
            dealerCard.isFaceDown = allocatedCard.isFaceDown;

            if (!allocatedCard.isFaceDown) {
                dealerCard.suit = allocatedCard.suit;
                dealerCard.rank = allocatedCard.rank;
                dealerCard.value = allocatedCard.value;
            }

            bjState.bjDealer.hand.push(dealerCard);
        });

        if (crossedThreshold) {
            this.needsReshuffle = true;
        }

        const hand = evaluateHand(this.dealer.hand);

        this.dealer.handValue = hand.value;
        bjState.bjDealer.handValue = hand.value;
    }

    handlePlayerHit(playerId: string, actionId: string) {
        const player = this.state.players.get(playerId);

        if (!player || !player.isTurn) return;

        const client = this.room.clients.find(c => c.sessionId === playerId);
        const bjData = this.getBjData(player);

        const { crossedThreshold } = this.deckManager.drawCard((allocatedCard: BjCard) => {
            bjData.hand.push(allocatedCard);

            if (client?.view) {
                client.view.add(allocatedCard);
            }
        });

        if (crossedThreshold) {
            this.needsReshuffle = true;
        }


        const hand = evaluateHand(bjData.hand);
        bjData.handValue = hand.value;

        this.eventBus.emit({
            type: "player.animation",
            playerId,
            animation: "Hit",
            actionId
        });

        if (hand.isBust) {
            player.isTurn = false;
            bjData.blackjackStood = true;

            this.eventBus.emit({
                type: "player.animation",
                playerId,
                animation: "Death"
            });

            this.moveToNextTurn();
        }
    }

    handlePlayerStand(playerId: string, actionId: string) {
        const player = this.state.players.get(playerId);

        if (!player || !player.isTurn) return;

        const bjData = this.getBjData(player);

        player.isTurn = false;
        bjData.blackjackStood = true;

        this.eventBus.emit({
            type: "player.animation",
            playerId,
            animation: "No",
            actionId
        });

        this.moveToNextTurn();
    }

    private moveToNextTurn() {
        const nextPlayerId = this.turnManager.getNextPlayerId(this.state.currentTurn);

        if (!nextPlayerId) return;

        const result = this.turnManager.nextTurn(nextPlayerId);

        switch (result?.type) {
            case "advanced":
                break;
            case "paused":
                this.state.isPaused = true;
                this.state.pausedPlayerId = result.playerId;
                this.state.pausedReconnectRemainingMs = result.remainingMs;
                break;
            case "dealer":
                this.executeDealerTurn();
                break;
        }
    }

    private executeDealerTurn() {
        const bjState = this.getBjState();

        this.scheduler.schedule(BJ_TIMINGS.dealerReveal, () => {
            // reveal dealer hidden card
            this.revealDealerCards();

            this.scheduler.schedule(BJ_TIMINGS.dealerDraw, () => {
                this.processDealerTurn();
            });
        });
    }

    private revealDealerCards() {
        const bjState = this.getBjState();

        this.dealer.hand.forEach((privateCard) => {

            if (!privateCard.isFaceDown) return;

            privateCard.isFaceDown = false;

            const publicCard = bjState.bjDealer.hand.find((c) => c.id === privateCard.id);

            if (!publicCard) return;

            publicCard.isFaceDown = false;
            publicCard.rank = privateCard.rank;
            publicCard.suit = privateCard.suit;
            publicCard.value = privateCard.value;
        });

        const hand = evaluateHand(this.dealer.hand);

        this.dealer.handValue = hand.value;
        bjState.bjDealer.handValue = hand.value;

        this.highlightDealerHandState(hand);
    }

    private processDealerTurn() {
        if (this.dealer.handValue >= 17 || this.dealer.handValue > 21) {
            this.scheduleRoundFinalization();
            return;
        }

        this.drawDealerCard();

        this.scheduler.schedule(BJ_TIMINGS.dealerDraw, () => {
            this.processDealerTurn();
        });
    }

    private drawDealerCard() {
        const bjState = this.getBjState();

        const { crossedThreshold } = this.deckManager.drawCard(
            (allocatedCard: BjCard) => {
                this.dealer.hand.push(allocatedCard);

                const publicCard = new BjDealerPublicCard();

                publicCard.id = allocatedCard.id;
                publicCard.isFaceDown = false;
                publicCard.suit = allocatedCard.suit;
                publicCard.rank = allocatedCard.rank;
                publicCard.value = allocatedCard.value;

                bjState.bjDealer.hand.push(publicCard);
            });

        const hand = evaluateHand(this.dealer.hand);

        this.dealer.handValue = hand.value;
        bjState.bjDealer.handValue = hand.value;

        this.highlightDealerHandState(hand);

        if (crossedThreshold) {
            this.needsReshuffle = true;
        }
    }

    private scheduleRoundFinalization() {
        this.scheduler.schedule(BJ_TIMINGS.roundResult, () => {
            this.finalizeRound();
        });
    }

    private finalizeRound() {
        const dealerHand = evaluateHand(this.dealer.hand);
        const results: BjRoundResult[] = [];

        this.state.playerOrder.forEach((playerId) => {
            const player = this.state.players.get(playerId);
            if (!player) return;

            const bjData = this.getBjData(player);
            const playerHand = evaluateHand(bjData.hand);

            let result: BjRoundResultType;
            let points = 0;

            if (playerHand.isBust) {
                result = "bust";
            } else if (playerHand.isBlackJack) {
                if (dealerHand.isBlackJack) {
                    result = "push";
                } else {
                    result = "blackjack";
                    points = 2;
                }
            } else if (
                dealerHand.value > 21 ||
                playerHand.value > dealerHand.value
            ) {
                result = "win";
                points = playerHand.value === 21 ? 2 : 1;
            } else {
                result = "loss";
            }

            player.score += points;

            results.push({
                playerId,
                result,
                points,
            });
        });

        this.room.broadcast("roundResults", {
            roundNumber: this.state.roundNumber,
            results,
        });

        this.collectPlayedCardsToDiscard();
        this.handleRoundWin();
    }

    private collectPlayedCardsToDiscard() {
        const dealerCards: BjCard[] = [];

        this.dealer.hand.forEach((c: BjCard) => dealerCards.push(c));
        this.deckManager.collectToDiscard(dealerCards);

        this.state.players.forEach((player) => {
            const bjData = this.getBjData(player);
            if (bjData.hand) {
                const playerCards: BjCard[] = [];
                bjData.hand.forEach((c: BjCard) => playerCards.push(c));
                this.deckManager.collectToDiscard(playerCards);
            }
        });
    }

    private handleRoundWin() {
        let leadingPlayer: Player | null = null;
        let maxScore = 0;

        for (const player of this.state.players.values()) {
            if (player.score >= MATCH_WINNING_SCORE && player.score > maxScore) {
                maxScore = player.score;
                leadingPlayer = player;
            }
        }

        if (leadingPlayer !== null) {
            const standings = Array.from(this.state.players.values()).map(player => ({
                playerId: player.id,
                playerName: player.name,
                score: player.score
            })).sort((a, b) => b.score - a.score);

            this.state.matchWinnerId = leadingPlayer.id;
            this.state.gameEnded = true;
            this.state.status = RoomStatus.FINISHED;

            this.room.broadcast("gameEnd", {
                matchWinnerId: leadingPlayer.id,
                winnerName: leadingPlayer.name,
                winnerScore: maxScore,
                standings
            });

        } else {
            this.state.roundNumber = (this.state.roundNumber || 1) + 1;

            if (this.needsReshuffle) {
                this.deckManager.recycleDiscardPile();
                this.needsReshuffle = false;
            }

            this.setupRound();
        }
    }

    private highlightPlayerHandState(playerId: string, hand: HandEvaluation): void {
        if (hand.isBust) {
            this.room.broadcast("playerBust", { playerId });
            return;
        }

        if (hand.isBlackJack) {
            this.room.broadcast("playerBlackjack", { playerId });
        }
    }

    private highlightDealerHandState(hand: HandEvaluation): void {
        if (hand.isBust) {
            this.room.broadcast("dealerBust");
            return;
        }

        if (hand.isBlackJack) {
            this.room.broadcast("dealerBlackjack");
        }
    }

    dispose() {
        this.scheduler.cancelAll();

        this.initialDealSequence = [];
        this.initialDealIndex = 0;

        this.dealer.clear();

        this.needsReshuffle = false;
    }

    handleTimeoutForfeit() {
        // todo: implement turn transfer to the next player/dealer
    }
}