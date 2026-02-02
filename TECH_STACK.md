# PRACTIX Tech Stack & Integrations

> Last updated: 2026-01-04

---

## Quick Overview

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | React + TypeScript | SPA with Monaco Editor |
| **Backend** | NestJS + Prisma | REST API, Auth, Business Logic |
| **Database** | PostgreSQL | User data, Courses, Progress |
| **Code Execution** | Piston + BullMQ | Sandboxed code runner (8 languages) |
| **AI Tutor** | Google Gemini 2.0 Flash | Intelligent hints & explanations |
| **Auth** | JWT | Stateless authentication |

---

## 1. AI Engine Integration

### Current: Google Gemini 2.0 Flash

**Why Gemini 2.0 Flash?**

After analyzing multiple LLM providers for EdTech use case (150K+ requests/month), Gemini 2.0 Flash offers the best price/quality ratio.

#### Pricing Comparison (per 1M tokens)

| Model | Input | Output | Monthly Cost* | Quality |
|-------|-------|--------|---------------|---------|
| **Gemini 2.0 Flash** | $0.10 | $0.40 | ~$55 | Excellent |
| GPT-4o mini | $0.15 | $0.60 | ~$82 | Very Good |
| Claude 3.5 Haiku | $0.25 | $1.25 | ~$165 | Very Good |
| Groq Llama 70B | $0.59 | $0.79 | ~$150 | Good |
| GPT-4o | $2.50 | $10.00 | ~$1,375 | Premium |
| Claude 3.5 Sonnet | $3.00 | $15.00 | ~$1,980 | Premium |

*Estimated for 150K requests/month (~1100 tokens avg)

#### Pros & Cons Analysis

**Gemini 2.0 Flash** (Selected)
- Pros: Lowest cost, excellent code understanding, fast responses, good multi-language support
- Cons: Slightly less creative than GPT-4o in edge cases
- **Result: CHOSEN - Best price/quality for EdTech**

**GPT-4o mini**
- Pros: Strong reasoning, good code generation, reliable
- Cons: 1.5x more expensive than Gemini
- **Result: Good backup option**

**Claude 3.5 Haiku**
- Pros: Excellent at following instructions, good safety
- Cons: 3x more expensive than Gemini
- **Result: Too expensive for high volume**

**Groq (Llama 70B)**
- Pros: Fast inference, open-source model
- Cons: Less accurate for coding tasks, inconsistent quality
- **Result: Not suitable for education**

**Premium Models (GPT-4o, Claude Sonnet)**
- Pros: Best quality responses
- Cons: 20-40x more expensive
- **Result: Not viable for EdTech scale**

### Implementation Details

```
server/src/ai/
├── ai.module.ts        # Module registration
├── ai.controller.ts    # POST /ai/tutor endpoint
└── ai.service.ts       # Gemini API integration
```

**Rate Limiting (AI Tutor):**

| Tier | Daily Limit | Notes |
|------|-------------|-------|
| Free (no subscription) | 5 | Basic access |
| Course subscription | 30 | Per-course purchase |
| Global Premium | 100 | Full platform access |
| Prompt Engineering course | 100 | Special limit for PE course |

**Features:**
- Multi-language responses (EN, RU, UZ)
- Context-aware hints (knows task, code, question)
- No solution leakage (tutor mode)
- Markdown formatting support

---

## 2. Code Execution Engine

### Piston + BullMQ + Redis

Lightweight, ARM64-compatible code execution with production-grade queue management.

#### Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Backend   │────▶│   BullMQ    │────▶│   Piston    │
│   (NestJS)  │     │   (Redis)   │     │   Workers   │
└─────────────┘     └─────────────┘     └─────────────┘
```

#### Supported Languages

| Language | Time Limit | Memory Limit |
|----------|------------|--------------|
| Go | 5s | 256MB |
| Java | 10s | 512MB |
| JavaScript | 5s | 256MB |
| TypeScript | 10s | 256MB |
| Python | 10s | 256MB |
| Rust | 10s | 256MB |
| C++ | 5s | 256MB |
| C | 5s | 256MB |

#### Why Piston?

| Feature | Benefit |
|---------|---------|
| ARM64 (Apple Silicon) | ✅ Native support |
| Setup Complexity | Simple Docker setup |
| Queue Management | BullMQ (Redis-based) |
| Resource Usage | Lightweight |
| Languages | 50+ supported |
| License | MIT (free & open-source) |

#### Pros & Cons

**Pros:**
- ✅ Works on ARM64/Apple Silicon natively
- ✅ Free & open-source (MIT)
- ✅ Lightweight and fast
- ✅ BullMQ provides enterprise-grade queuing
- ✅ Easy horizontal scaling
- ✅ Detailed queue monitoring

**Cons:**
- Requires Redis for queue
- No built-in expected output comparison (handled in app)

#### Implementation

```
server/src/
├── piston/
│   ├── piston.module.ts      # Piston module
│   └── piston.service.ts     # Piston API client
├── queue/
│   ├── queue.module.ts       # BullMQ setup
│   ├── code-execution.service.ts  # Queue API
│   └── code-execution.processor.ts # Worker
└── submissions/              # Submission handling
```

#### Queue Features (BullMQ)

- **Concurrency:** 4 parallel jobs (configurable)
- **Retries:** 3 attempts with exponential backoff
- **Rate Limiting:** Built-in support
- **Monitoring:** Job status, queue stats
- **Persistence:** Redis AOF for durability

#### Scaling

```bash
# Scale Piston workers
docker compose up -d --scale piston=4
```

BullMQ automatically distributes jobs across workers.

---

## 3. Frontend Stack

### React 18 + TypeScript

Modern SPA with full type safety.

**Key Libraries:**
- **Monaco Editor** - VS Code editor component
- **React Router v6** - Client-side routing
- **TailwindCSS** - Utility-first styling
- **Axios** - HTTP client

**Pros:**
- Type safety catches bugs early
- Rich ecosystem
- Monaco provides IDE-like experience
- Fast development with Tailwind

**Cons:**
- Bundle size (mitigated with code splitting)
- Learning curve for Monaco

---

## 4. Backend Stack

### NestJS + Prisma + PostgreSQL

Enterprise-grade Node.js framework with type-safe ORM.

**Pros:**
- Modular architecture
- Built-in dependency injection
- Prisma auto-generates types
- Excellent TypeScript support
- Easy testing

**Cons:**
- Steeper learning curve than Express
- Prisma migrations require care

#### Key Modules

```
server/src/
├── auth/           # JWT authentication
├── users/          # User management
├── courses/        # Course CRUD
├── submissions/    # Code submissions
├── ai/             # AI Tutor
├── piston/         # Piston code execution
└── queue/          # BullMQ job queue
```

---

## 5. Authentication

### JWT (JSON Web Tokens)

Stateless authentication with access/refresh token pattern.

**Implementation:**
- Access token: 15min expiry
- Refresh token: 7 days expiry
- Stored in httpOnly cookies

**Pros:**
- Stateless (scalable)
- No session storage needed
- Works with mobile apps

**Cons:**
- Token revocation complexity
- Larger request size

---

## 6. Database

### PostgreSQL

Relational database for structured data.

**Schema Highlights:**
- Users (auth, preferences)
- Courses, Modules, Topics, Tasks
- Progress tracking (per user/task)
- Submissions history

**Pros:**
- ACID compliance
- Complex queries
- Prisma integration
- Free & reliable

**Cons:**
- Vertical scaling limits
- Schema migrations require planning

---

## 7. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Docker Compose                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Frontend  │  │   Backend   │  │     PostgreSQL      │  │
│  │  (React)    │  │  (NestJS)   │  │                     │  │
│  │  Port 3000  │  │  Port 8080  │  │     Port 5432       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Piston + Redis + BullMQ                 │    │
│  │       (Code Execution Engine with Job Queue)         │    │
│  │              Piston: Port 2000                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Performance Optimizations (Implemented)

### Rate Limiting
```
POST /submissions      → 10 requests/minute
POST /submissions/run  → 20 requests/minute
Global                 → 60 requests/minute
```

### Execution Caching
- Cache TTL: 30 minutes
- Key: hash(code + language + stdin)
- Only successful executions cached
- Reduces Piston load by ~60%

### Priority Queues
- Premium users: priority 1
- Free users: priority 10
- BullMQ handles prioritization

---

## 9. Future Roadmap

### Phase 1: WebAssembly Browser Execution (Planned)

**Goal**: Execute playground code in browser, reduce server load by 80%

**Technologies**:
- Pyodide (Python → WASM)
- TinyGo (Go → WASM)
- QuickJS (JavaScript/TypeScript)

**Architecture**:
```
Playground Mode:
  Browser → WASM Runtime → Instant result (~50ms)

Submit Mode:
  Browser → Backend → Piston → Verified result (~1-3s)
```

**Benefits**:
- Instant feedback for playground
- Zero server load for testing
- Better UX for learners

**Limitations**:
- 2GB memory limit (browser)
- No network access
- Some language features unsupported

### Phase 2: Horizontal Scaling
- Multi-instance Piston (docker-compose scale)
- Redis Cluster for queue persistence
- Kubernetes migration

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/practix

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Piston
PISTON_URL=http://piston:2000

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# AI (Gemini)
GOOGLE_GEMINI_API_KEY=your-gemini-api-key

# Optional
NODE_ENV=development
PORT=8080
```

---

*Last updated: 2026-01-04*
