# PRACTIX Platform - Run Guide

## Prerequisites
* **Node.js** (v18+)
* **Docker** & **Docker Compose**
* **API Key** for Google Gemini (optional, for AI hints)

---

## Quick Start

### Option 1: Full Stack (Recommended)
```bash
make start-docker
```
This starts:
- Frontend at http://localhost:3000
- Backend at http://localhost:8080
- Piston (code execution) + Redis + BullMQ

### Option 2: Local Development
```bash
make start
```
Runs Vite dev server + NestJS in watch mode.

---

## Makefile Commands

### Application
| Command | Description |
|---------|-------------|
| `make start-docker` | Start full stack |
| `make start` | Local dev servers |
| `make stop` | Stop all containers |
| `make build` | Build Docker images |
| `make vet` | Type-check frontend & backend |

### Database
| Command | Description |
|---------|-------------|
| `make db-refresh` | Reset DB and re-seed |
| `make db-seed` | Run seeds only |
| `make db-reset` | Reset DB (drops data!) |
| `make db-studio` | Open Prisma Studio |
| `make db-migrate` | Run migrations |

---

## Code Execution Engine (Piston + BullMQ)

### Architecture
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│   BullMQ    │
│  (React)    │     │  (NestJS)   │     │  (Redis)    │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  PostgreSQL │     │   Piston    │
                    │  (practix_db) │     │  (sandbox)  │
                    └─────────────┘     └─────────────┘
```

### Supported Languages
| Language | Time Limit | Memory Limit |
|----------|------------|--------------|
| Go | 5s | 256MB |
| Java | 10s | 512MB |
| JavaScript | 5s | 256MB |
| TypeScript | 10s | 256MB |
| Python | 10s | 256MB |
| Rust | 10s | 256MB |
| C/C++ | 5s | 256MB |

### Resource Management
- **Queue-based execution** with BullMQ (Redis)
- **Caching**: Results cached for 30 minutes (reduces load by ~60%)
- **Rate Limiting**:
  - Global: 60 requests/minute
  - POST /submissions: 10/minute
  - POST /submissions/run: 20/minute
- **Priority Queue**: Premium users get higher priority

### Configuration
Environment variables in `docker-compose.yml`:
```bash
PISTON_URL=http://piston:2000
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## Environment Variables

### Backend (`server/.env` or docker-compose)
```env
DATABASE_URL="postgresql://practix_user:practix_secure_password@db:5432/practix_db"
JWT_SECRET="your_jwt_secret"
PORT=8080
GEMINI_API_KEY="your_google_ai_key"

# Piston
PISTON_URL="http://piston:2000"

# Redis (for BullMQ queue and caching)
REDIS_HOST=redis
REDIS_PORT=6379
```

### Frontend (build args)
```env
REACT_APP_API_URL="http://localhost:8080"
GEMINI_API_KEY="your_google_ai_key"
```

---

## API Endpoints

### Code Execution
```bash
# Run code (no auth required)
POST /submissions/run
{
  "code": "package main...",
  "language": "go",
  "stdin": "optional input"
}

# Submit solution (auth required)
POST /submissions
{
  "taskId": "task-slug",
  "code": "package main...",
  "language": "go"
}

# Check execution engine status
GET /submissions/judge/status

# Get supported languages
GET /submissions/languages
```

---

## Troubleshooting

### Code Execution Issues
| Problem | Solution |
|---------|----------|
| Piston not starting | Check Docker: `docker compose logs piston` |
| Code execution timeout | Check queue status: `GET /submissions/judge/status` |
| "Unsupported language" | Check `/submissions/languages` for supported list |
| Rate limit exceeded | Wait 1 minute or check rate limiting config |

### Database Issues
| Problem | Solution |
|---------|----------|
| P1001 Connection refused | Ensure PostgreSQL is running: `docker compose up -d db` |
| Seed fails | Check for TypeScript errors in seed files |

### General
| Problem | Solution |
|---------|----------|
| Frontend blank | Check console for API errors, verify `REACT_APP_API_URL` |
| AI hints not working | Verify `GEMINI_API_KEY` is set |

---

## Production Deployment

### Recommended Setup
1. Use managed PostgreSQL (AWS RDS, Google Cloud SQL)
2. Deploy Piston on dedicated server with high CPU
3. Use Redis cluster for BullMQ queue persistence
4. Set up monitoring for queue depth

### Scaling
```bash
# Scale Piston workers
docker compose up -d --scale piston=4
```

BullMQ automatically distributes jobs across workers.

### Security
- Use firewall to restrict Piston access to backend only
- Set resource limits per execution
- Configure rate limiting per user tier

---

## Support
- GitHub Issues: https://github.com/your-org/practix/issues
- Documentation: See TECH_STACK.md for architecture details
