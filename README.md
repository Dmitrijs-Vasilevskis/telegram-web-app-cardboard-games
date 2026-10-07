# Uno Mini App

A multiplayer game served via a Turborepo monorepo.

## Architecture

```
┌──────────────┐  WebSocket   ┌─────────────┐
│  Telegram    │◄──────────►  │ Colyseus    │
│ Web App      │              │ Backend     │
│ (Vite +      │◄──────────►  │ (Express    │
│  React)      │              │ + Colyseus) │
└──────────────┘              └───────┬─────┘
                                      │ PostgreSQL
                                      ▼
                                  ┌──────────┐
                                  │ Database │
                                  └──────────┘

## Features

- **Telegram-based multiplayer gaming** — play via Telegram Web App
- **Real-time gameplay** using Colyseus WebSocket rooms and lobbies
- **Avatar proxying** with rate limiting to Telegram CDN images

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Compose (for running the PostgreSQL database)

### Quick Start

```sh
# Install dependencies
npm install

# Build and start all services (PostgreSQL, backend, frontend) with hot-reload
npx turbo dev

# Or run components individually:
```

### Running the Stack

| Command | What it does |
|---------|-------------|
| `npx turbo dev` | Starts all services (PostgreSQL, backend, frontend) with hot-reload |
| `npx turbo dev --filter=backend` | Backend + PostgreSQL only |
| `npx turbo dev --filter=frontend` | Frontend only (requires backend to be running) |

### Project Structure

```
┌───────────────┐  ┌─────────────┐  ┌────────────────┐
│ apps/frontend │  │ packages    │  │ docker-compose │
│               │  │             │  │ yml            │
└───────────────┘  └─────────────┘  └────────────────┘
```

| Directory | Purpose                                       |
|-----------|-----------------------------------------------|
| `apps/frontend`     | Vite-based React client app         |
| `apps/backend`      | Colyseus game server + Express API  |
| `packages/`         | Shared dependencies (types, config) |
| `docker-compose.yml`| Local infrastructure (PostgreSQL)   |

### Key Endpoints

- **`GET /health`** — Health check endpoint (`200 OK` with timestamp)
- **`GET /proxy-avatar?url=...`** — Proxies avatar images from Telegram CDN (rate-limited)

### Environment Variables

| Variable        | Default | Description                  |
|-----------------|---------|------------------------------|
| `PORT`          | 2567    | Backend port                 |
| `FRONTEND_PORT` | 3000    | Frontend port                |
| `DATABASE_URL`  | —       | PostgreSQL connection string |

### Dependencies

- **Colyseus**: WebSocket rooms and real-time sync
- **Express**: REST endpoints (health check, avatar proxy)

## Contributing

[TBD]
```
