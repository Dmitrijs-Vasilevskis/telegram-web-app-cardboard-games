import { GameState, Card, UnoCardValue, UnoGameState } from "@uno/shared";
import { createDeck, shuffle } from "./UNODeck";

const NUMBER_VALUES: UnoCardValue[] = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
];

export class DeckManager {
    private internalDeck: Card[] = [];
    private internalDiscardPile: Card[] = [];

    constructor(
        private state: GameState,
    ) { }

    private getUnoState(): UnoGameState {
        return this.state.gameState as UnoGameState;
    }

    initialize() {
        this.internalDeck = createDeck();
        const unoState = this.getUnoState();

        this.internalDiscardPile = [];
        unoState.topDiscardCard = null;

        const firstCardIndex = this.internalDeck.findIndex(card => NUMBER_VALUES.includes(card.value));
        const [firstCard] = this.internalDeck.splice(firstCardIndex, 1);

        this.internalDiscardPile.push(firstCard);
        unoState.topDiscardCard = firstCard;
        unoState.activeColor = firstCard.color!;
    }

    reshuffleDiscard() {
        if (this.internalDiscardPile.length <= 1) return;

        const top = this.internalDiscardPile.pop()!;

        this.internalDeck = shuffle(this.internalDiscardPile);
        this.internalDiscardPile = [top];
    }

    draw(onCardAllocated?: (card: Card) => void): Card | null {
        if (this.internalDeck.length === 0) {
            this.reshuffleDiscard();
        }

        const card = this.internalDeck.pop();
        if (!card) return null;

        if (onCardAllocated) {
            onCardAllocated(card);
        }

        return card;
    }

    discard(card: Card) {
        const unoState = this.getUnoState();
        this.internalDiscardPile.push(card);
        unoState.topDiscardCard = card;
    }
}