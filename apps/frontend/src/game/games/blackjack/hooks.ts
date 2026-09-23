import { useGameStore } from "../../../store/gameStore";
import type { BjDealerDTO, BjLocalPlayerDTO, BjPlayerDTO } from "../../../store/slices/bjSlice";

export const useBjPlayers = () =>
    useGameStore(state => state.players as BjPlayerDTO[]);


export const useBjLocalPlayer = () =>
    useGameStore(state => state.localPlayer as BjLocalPlayerDTO | null);


export const useBjDealer = () =>
    useGameStore(state => state.bjDealer as BjDealerDTO | null);
