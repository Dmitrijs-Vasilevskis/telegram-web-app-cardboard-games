import { GameType } from "@uno/shared";

export interface GameMeta {
    id: GameType;
    name: string;
    shortDesc: string;
    minPlayers: number;
    maxPlayers: number;
    enabled: boolean;
    icon?: string;
    thumbnail?: string;
}

export const GAME_REGISTRY: Record<GameType, GameMeta> = {
    [GameType.UNO]: {
        id: GameType.UNO,
        name: "UNO",
        shortDesc: "Classic card game",
        minPlayers: 2,
        maxPlayers: 8,
        enabled: true,
        icon: "🟥",
    },
    [GameType.BLACKJACK]: {
        id: GameType.BLACKJACK,
        name: "Blackjack",
        shortDesc: "Beat the dealer",
        minPlayers: 1,
        maxPlayers: 6,
        enabled: true,
        icon: "🃏",
    }
}

export function getGameMeta(gameType: GameType): GameMeta {
    return GAME_REGISTRY[gameType];
}

export function getAvailableGames(): GameMeta[] {
    return Object.values(GAME_REGISTRY).filter(game => game.enabled);
}

export function getAllGames(): GameMeta[] {
    return Object.values(GAME_REGISTRY);
}