import type { Color } from "@uno/shared";
import type { CardDTO, GameDirection } from "../../types/game";
import type { BasePlayerDTO, StoreSlice } from "../types";

export interface UnoPlayerDataDTO {
    handCount: number;
    saidUno: boolean;
}

export interface UnoRoundResult {
    roundWinnerId: string;
    roundWinnerName: string;
    pointsAwarded: number;
    totalScore: number;
    standings: {
        playerId: string;
        playerName: string;
        score: number;
    }[];
}

export type UnoPlayerDTO = BasePlayerDTO<UnoPlayerDataDTO>;

export interface UnoLocalPlayerDataDTO extends UnoPlayerDataDTO {
    hand: CardDTO[];
}

export type UnoLocalPlayerDTO = BasePlayerDTO<UnoLocalPlayerDataDTO>;

export type UnoSlice = UnoState & UnoActions;

export interface UnoState {
    direction: GameDirection;
    activeColor: Color;
    discardTop: CardDTO | null;
    unoWindowPlayerId: string | null;
    roundResult: UnoRoundResult | null;
}

export interface UnoActions {
    setDiscardTop: (discardTop: CardDTO) => void;
    setActiveColor: (color: Color) => void;
    setDirection: (direction: GameDirection) => void;
    setUnoWindowPlayerId: (playerId: string | null) => void;
    setRoundResult: (roundResult: UnoRoundResult | null) => void;
}

export const initialUnoState: UnoState = {
    direction: 1,
    activeColor: 'red',
    discardTop: null,
    unoWindowPlayerId: null,
    roundResult: null,
}

export const unoSlice: StoreSlice<UnoSlice> = (set) => ({
    ...initialUnoState,
    setDiscardTop: (discardTop: CardDTO | null) => set({ discardTop }),
    setActiveColor: (activeColor: Color) => set({ activeColor }),
    setDirection: (direction) => set({ direction }),
    setUnoWindowPlayerId: (playerId: string | null) => set({ unoWindowPlayerId: playerId }),
    setRoundResult: (roundResult: UnoRoundResult | null) => set({ roundResult }),
});