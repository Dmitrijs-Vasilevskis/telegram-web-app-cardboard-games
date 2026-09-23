import { useGameStore } from "../../../store/gameStore";
import type { UnoLocalPlayerDTO, UnoPlayerDTO } from "../../../store/slices/unoSlice";

export const useUnoPlayers = () =>
    useGameStore(state => state.players as UnoPlayerDTO[]);

export const useUnoLocalPlayer = () =>
    useGameStore(state => state.localPlayer as UnoLocalPlayerDTO | null);

export const useUnoDirection = () =>
    useGameStore((state) => state.direction);

export const useUnoActiveColor = () =>
    useGameStore((state) => state.activeColor);

export const useUnoDiscardTop = () =>
    useGameStore((state) => state.discardTop);

export const useUnoWindowPlayerId = () =>
    useGameStore((state) => state.unoWindowPlayerId);