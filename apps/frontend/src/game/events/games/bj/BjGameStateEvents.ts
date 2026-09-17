import type { StateCallbacks } from "../../types";
import { useGameStore } from "../../../../store/gameStore";
import type { BjDealerPublicCard, BjGameState } from "@uno/shared";
import type { BjDealerDTO } from "../../../../store/slices/bjSlice";
import { mapDealerCard } from "../../mappers/bj/CardMapper";

export function BjGameStateEvents(
    $: StateCallbacks,
    gameState: BjGameState
): Array<() => void> {
    const store = useGameStore.getState();

    // set initial dealer state
    store.setBjDealer({
        hand: gameState.bjDealer.hand.map(mapDealerCard),
        handValue: gameState.bjDealer.handValue,
    });

    return [
        $(gameState).bjDealer.hand.onAdd((card: BjDealerPublicCard) => {
            const bjDealer = useGameStore.getState().bjDealer;

            if (!bjDealer) return;

            if (!bjDealer.hand.some(c => c.id === card.id)) {
                updateBjDealerGameData<BjDealerDTO>({
                    hand: [
                        ...bjDealer.hand,
                        mapDealerCard(card),
                    ],
                });
            }

            const wasFaceDown = card.isFaceDown;

            if (!wasFaceDown) return;

            $(card).listen("isFaceDown", (isFaceDown: boolean) => {
                if (isFaceDown) return;

                const current = useGameStore.getState().bjDealer;

                if (!current) return;

                const cardIndex = current.hand.findIndex(c => c.id === card.id);

                if (cardIndex === -1) return;

                const hand = [...bjDealer.hand];

                hand[cardIndex] = mapDealerCard(card);

                updateBjDealerGameData<BjDealerDTO>({
                    hand,
                });
            });
        }),

        $(gameState).bjDealer.hand.onRemove((card: BjDealerPublicCard) => {
            const bjDealer = useGameStore.getState().bjDealer;

            if (!bjDealer) return;

            updateBjDealerGameData<BjDealerDTO>({
                hand: bjDealer.hand.filter((c) => c.id !== card.id),
            });
        }),

        $(gameState).bjDealer.listen("handValue", (count: number) => {
            updateBjDealerGameData<BjDealerDTO>({
                handValue: count
            });
        }),

        $(gameState).listen("cardsRemaining", (count: number) => {
            store.setCardsRemaining(count);
        }),
    ];
}

function updateBjDealerGameData<T>(updates: Partial<T>) {
    const { bjDealer, setBjDealer } = useGameStore.getState();

    if (!bjDealer) return;

    setBjDealer({
        ...bjDealer,
        ...updates
    });
}