export type Color =
    | 'red'
    | 'green'
    | 'blue'
    | 'yellow';

export type CardValue =
    | '0'
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | 'skip'
    | 'reverse'
    | 'drawTwo'
    | 'wild'
    | 'wildDrawFour';

export interface CardDTO {
    id: string;
    color: Color | null;
    value: CardValue;
}

export interface PlayerDTO {
    id: string;
    name: string;
    photoUrl: string;
    score: number;
    isTurn: boolean;
    handCount: number;
    isReady: boolean;
    isConnected: boolean;
    saidUno: boolean;
}

export interface LocalPlayerDTO
    extends PlayerDTO {
    hand: CardDTO[];
}

export interface GameResults {
    winnerId: string;
    winnerName: string;
    winnerScore: number;
}

export interface UnoRoundResults {
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

export type GameDirection  = 1 | -1;
