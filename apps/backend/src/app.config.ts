import { defineServer, defineRoom, monitor, LobbyRoom, } from "colyseus";
import { WebSocketTransport } from '@colyseus/ws-transport';
import cors from 'cors';
import express from 'express';
import { rateLimit } from "./middleware/rateLimit";
import { fetchAvatar, isAllowedAvatarUrl } from "./utils/avatarProxy";
import {
    HTTP_RATE_LIMIT_AVATAR_MAX,
    HTTP_RATE_LIMIT_HEALTH_MAX,
    MAX_WS_PAYLOAD_BYTES,
} from "./game/constants";
import { GameLobbyRoom } from "./rooms/GameLobbyRoom";

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
].filter(Boolean) as string[];

const isProduction = process.env.NODE_ENV === 'production';

export const server = defineServer({
    devMode: !isProduction,
    transport: new WebSocketTransport({
        pingInterval: 6000,
        pingMaxRetries: 4,
        maxPayload: MAX_WS_PAYLOAD_BYTES,
    }),
    rooms: {
        lobby: defineRoom(LobbyRoom),
        game: defineRoom(GameLobbyRoom).enableRealtimeListing().filterBy(['roomCode']),
    },
    express: (app) => {
        app.set('trust proxy', 1);

        app.use(cors({
            origin: allowedOrigins,
            credentials: true
        }));

        app.use(express.json());

        app.get(
            "/health",
            rateLimit({ max: HTTP_RATE_LIMIT_HEALTH_MAX }),
            (_, res) => {
                res.json({
                    status: 'ok',
                    timestamp: new Date().toISOString(),
                });
            },
        );

        if (!isProduction) {
            app.use('/colyseus', monitor());
        }

        app.get(
            "/proxy-avatar",
            rateLimit({ max: HTTP_RATE_LIMIT_AVATAR_MAX }),
            async (req, res) => {
                const { url } = req.query;

                if (!url || typeof url !== 'string') {
                    return res.status(400).send("Missing target URL parameter");
                }

                if (!isAllowedAvatarUrl(url)) {
                    return res.status(400).send("Avatar URL is not allowed");
                }

                try {
                    const { buffer, contentType } = await fetchAvatar(url);

                    res.setHeader('Content-Type', contentType);
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Cache-Control', 'public, max-age=3600');

                    return res.send(buffer);
                } catch (error) {
                    const message = error instanceof Error ? error.message : "Unknown error";

                    if (message === "Image too large") {
                        return res.status(413).send(message);
                    }

                    if (message.includes("Upstream returned")) {
                        return res.status(502).send("Failed to fetch avatar from source");
                    }

                    console.error("Failed proxying avatar:", message);
                    return res.status(500).send("Error fetching avatar asset");
                }
            },
        );
    },
    beforeListen: () => {

    },
});
