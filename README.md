<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1kNpUCML8aystsOG7khQ_0nNZqcu2-GuC

## Run Locally

**Prerequisites:** Node.js ≥ 18, Docker, Docker Compose.

1. Install dependencies: `npm install && cd server && npm install`
2. Set the `GEMINI_API_KEY` in `server/.env` (см. `server/env.txt`)
3. Start both apps with watchers: `make start`

Подробная инструкция в [RUN_GUIDE.md](RUN_GUIDE.md).

## Docker Compose

Полностью контейнеризованный стенд (Postgres + Nest + Vite build):

```bash
make start-docker
# или
docker compose up --build
```

* Фронтенд: http://localhost:3000
* API: http://localhost:8080

## Makefile shortcuts

| Command | Description |
| --- | --- |
| `make migrate-up` | Прогоняет `prisma migrate deploy` (сервер должен видеть Postgres). |
| `make vet` | Собирает frontend и backend, гарантируя, что типы/импорты в порядке. |
| `make build` | Делает `docker compose build` (обновляет frontend/backend образы). |
| `make start` | Локальный дев-режим (Vite + Nest в watch-режиме). |
| `make start-docker` | Поднимает прод-стек в контейнерах. |
