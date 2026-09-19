export const MATCH_WINNING_SCORE = 500;
export const MAX_CLIENTS = 10;
export const MAX_ROOMS_PER_PROCESS = 200;
export const ROOM_CODE_MAX_GENERATION_ATTEMPTS = 20;
export const ROUND_INTERMISSION_MS = 10_000;
export const TELEGRAM_AUTH_MAX_AGE_SECONDS = 86_400;
export const MAX_WS_PAYLOAD_BYTES = 8 * 1024;
export const MAX_AVATAR_BYTES = 256 * 1024;
export const AVATAR_FETCH_TIMEOUT_MS = 5_000;
export const HTTP_RATE_LIMIT_WINDOW_MS = 60_000;
export const HTTP_RATE_LIMIT_HEALTH_MAX = 120;
export const HTTP_RATE_LIMIT_AVATAR_MAX = 30;
export const PLAYER_RECONNECT_TIMEOUT_MS = 30_000;
export const PLAYER_RECONNECT_TIMEOUT_SECONDS =
    PLAYER_RECONNECT_TIMEOUT_MS / 1000;

export const ALLOWED_EMOTE_IDS = new Set([
    'laugh',
    'angry',
    'wow',
    'cry',
    'flex',
    'gg',
    'heart',
    'fire',
    'mindblown',
]);