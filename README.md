<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Practix - Interactive Coding Platform

Learn programming through hands-on coding exercises with real-time code execution.

## Features

- **18 Courses** (Go, Java, Python, Algorithms, AI/ML, Design Patterns) with ~921 tasks
- **Multi-language** support (EN, RU, UZ)
- **Real code execution** with Piston + BullMQ (8 languages)
- **Web IDE Playground** at `/playground`
- **AI Tutor** powered by Gemini 2.0 Flash (100 req/day premium)
- **Gamification** - XP, levels, badges, streaks
- **Swagger API docs** at `/api/docs`
- **Health checks** and Prometheus metrics

## Quick Start

**Prerequisites:** Node.js 18+, Docker, Docker Compose

```bash
# Clone and install
npm install && cd server && npm install && cd ..

# Start everything
make start-docker
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## Documentation

| Doc | Description |
|-----|-------------|
| [RUN_GUIDE.md](RUN_GUIDE.md) | Detailed setup & commands |
| [ROADMAP.md](ROADMAP.md) | Feature status & course content |
| [TECH_STACK.md](TECH_STACK.md) | Architecture & integrations |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Monaco Editor |
| Backend | NestJS + Prisma + PostgreSQL |
| Code Execution | Piston + BullMQ + Redis |
| AI | Google Gemini 2.0 Flash |
| Auth | JWT |

## Makefile Commands

```bash
make start-docker   # Start full stack
make start          # Local dev mode
make stop           # Stop containers
make db-refresh     # Reset database
make vet            # Type-check both apps
```

## Environment Variables

Create `server/.env`:
```env
DATABASE_URL="postgresql://practix_user:practix_secure_password@db:5432/practix_db"
JWT_SECRET="your-secret"
GEMINI_API_KEY="your-google-ai-key"
```

## License

MIT
