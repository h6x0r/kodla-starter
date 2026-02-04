# Practix Project Configuration

## Communication Language
**Общение ведётся на русском языке.** All responses and discussions should be in Russian.

---

## Agent Rules

**IMPORTANT: Parallel agents are FORBIDDEN unless explicitly requested in the prompt.**
- Always work synchronously, step by step
- Only use parallel Task tools when user explicitly says "in parallel" or "параллельно"
- Focus on careful, thorough implementation over speed

---

## Code Quality Standards

### Size Limits (MANDATORY)

| Entity | Max Lines | Notes |
|--------|-----------|-------|
| **Function/Method** | 50 | Split into smaller functions if exceeds |
| **React Component** | 200 | Extract sub-components if exceeds |
| **Service Class** | 300 | Split by domain responsibility |
| **Controller** | 150 | Delegate logic to services |
| **Single File** | 400 | Split into modules/features |
| **Hook (custom)** | 100 | Extract helpers if complex |

### File Organization
- **One component per file** - no multiple exports of components
- **Single Responsibility** - each file/class does ONE thing well
- **Feature-based structure** - group by feature, not by type
- **Max 5-7 imports** from same module - split if more needed

### Frontend Best Practices
- **Props interface** - always define, max 10 props per component
- **Custom hooks** - extract logic from components when >20 lines
- **Memoization** - use `memo`, `useMemo`, `useCallback` for expensive operations
- **Early returns** - prefer guard clauses over nested conditionals
- **Colocation** - keep related files together (Component + test + styles)

### Backend Best Practices
- **DTOs** - always validate input with class-validator
- **Services** - business logic only, no HTTP concepts
- **Controllers** - thin, only HTTP handling and validation
- **Repository pattern** - abstract database access
- **Error handling** - use custom exceptions, not generic Error

### When to Refactor (BEFORE adding new code)
- Function exceeds 50 lines → split immediately
- Component exceeds 200 lines → extract sub-components
- File has >10 functions → create separate modules
- Cyclomatic complexity >10 → simplify logic
- >3 levels of nesting → flatten with early returns

---

## Technical Debt Management

**Файл:** `docs/TECH_DEBT_AND_ROADMAP.md`

### Правила обновления техдолга

1. **Выполненные задачи** — сразу удалять из TODO или помечать `✅ Исправлено (дата)`
2. **Найденные баги** — немедленно документировать:
   - Файл и строка кода
   - Шаги воспроизведения
   - Ожидаемое vs фактическое поведение
   - Приоритет: 🔴 Критично, 🟠 Серьёзно, 🟡 Средний, 🟢 Низкий
3. **Changelog** — обновлять при каждом значимом изменении

### Workflow при обнаружении бага

```markdown
### Новый баг: [Краткое описание]

**Статус:** 🔴 Критично / 🟠 Серьёзно / 🟡 Средний

**Файл:** `path/to/file.ts:123`

**Воспроизведение:**
1. Шаг 1
2. Шаг 2

**Ожидаемое:** X
**Фактическое:** Y

**Решение:** [Предлагаемое решение]
```

---

## Quality Principles (MANDATORY)

### Zero Skip Policy
**КРИТИЧНО: Ни одна задача не должна пропускаться в тестировании!**

- **E2E тесты должны покрывать ВСЕ 918+ задач** без исключений
- Если задача не проходит тест — исправить задачу или тестовую инфраструктуру, НЕ пропускать
- `test.skip()` запрещён для обхода проблем — только для WIP функционала
- Каждый непройденный тест — баг, который нужно исправить

### Architecture Standards
- **Best Practices First** — код должен соответствовать лучшим практикам индустрии
- **Consistency** — одинаковые паттерны во всём проекте
- **Maintainability** — код должен быть понятен другим разработчикам
- **Testability** — архитектура должна упрощать тестирование, не усложнять

### Применение принципов
Эти правила применяются ко ВСЕМ частям приложения:
- Frontend компоненты и логика
- Backend сервисы и контроллеры
- База данных и миграции
- E2E и unit тесты
- CI/CD пайплайны

---

## Testing Requirements (MANDATORY)

### Coverage Thresholds
| Metric | Minimum | Target |
|--------|---------|--------|
| **Statements** | 87% | 95% |
| **Branches** | 85% | 90% |
| **Functions** | 87% | 95% |
| **Lines** | 87% | 95% |

### Mandatory Testing Workflow

**CRITICAL: After ANY code changes, tests MUST be written and run!**

| Change Type | Required Tests | Verification |
|-------------|----------------|--------------|
| **Backend** | Unit tests (*.spec.ts) | `cd server && npm test` |
| **Frontend** | Unit (*.test.tsx) + E2E | `npm test` + `npx playwright test` |
| **Database/Seeds** | Integration tests | `npm run seed` + manual verification |

### Testing Rules
- **Every new feature** must include tests BEFORE merge
- **Every bug fix** must include regression test
- **No PR without tests** - coverage must not decrease
- **Test file naming** - `*.test.ts` / `*.test.tsx` / `*.spec.ts`
- **Colocation** - test file next to source file
- **Frontend changes** → ALWAYS write E2E tests for UI flows
- **Backend changes** → ALWAYS write unit tests for services/controllers

### What to Test
- **Frontend**: Components, hooks, services, utils, contexts
- **Backend**: Services, controllers, guards, pipes, utils
- **E2E**: Critical user flows (auth, payments, task execution)

### Test Structure
```typescript
describe('ComponentName', () => {
  describe('feature/method', () => {
    it('should do X when Y', () => {});
    it('should handle error when Z', () => {});
  });
});
```

### E2E Test Requirements (Frontend)
Every frontend UI change must include E2E tests:
```typescript
// e2e/tests/feature.spec.ts
test.describe('Feature Name', () => {
  test('should handle user interaction', async ({ page }) => {
    // Test the actual user flow
  });
});
```

---

## MCP Tools Usage

### When to use Sequential Thinking (`mcp__sequentialthinking`)
Use for complex problem-solving that requires step-by-step analysis:
- Architecture decisions with multiple trade-offs
- Debugging complex issues
- Planning multi-step implementations
- Analyzing code for refactoring

### When to use Memory (`mcp__memory`)
Use for storing/retrieving persistent knowledge across sessions:
- User preferences and decisions
- Project-specific conventions discovered
- Important context that should persist
- Notes about code patterns used in this project

### When to use Context7 (`mcp__context7`)
Use for retrieving up-to-date documentation:
- Library/framework documentation (React, NestJS, Prisma, etc.)
- API references and examples
- Best practices from official docs

---

## Quick Reference

| File | Purpose |
|------|---------|
| `docs/PLATFORM_FEATURES.md` | **Complete platform documentation** - all features, APIs, flows |
| `docs/deployment/COOLIFY_CONFIG.md` | **🚀 Production deployment** - SSH, URLs, deploy commands |
| `docs/integrations/GEMINI_SETUP.md` | Google Gemini API setup guide |
| `docs/deployment/PLATFORM_COMPARISON.md` | Deployment platforms comparison (Railway vs Hetzner etc.) |
| `ROADMAP.md` | Complete course catalog and development status |
| `TECH_STACK.md` | Technology stack and integrations |
| `RUN_GUIDE.md` | Local development setup |
| `TASK_CREATION_GUIDE.md` | How to create new tasks/courses |
| `docs/TECH_DEBT_AND_ROADMAP.md` | Technical debt and implementation plans |

---

## Key Directories

### Backend (`/server/`)
```
server/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Database seeder
│   └── seeds/             # Course content
│       └── courses/       # All course definitions
├── src/
│   ├── subscriptions/     # Subscription system
│   ├── submissions/       # Code execution & grading
│   ├── ai/                # AI Tutor (Gemini)
│   ├── judge0/            # Judge0 code execution
│   ├── queue/             # BullMQ job queue
│   ├── health/            # Health checks & metrics
│   └── gamification/      # XP, levels, badges
```

### Frontend (`/src/`)
```
src/
├── features/
│   ├── subscriptions/     # Subscription UI & API
│   ├── tasks/             # Task workspace
│   ├── courses/           # Course catalog
│   ├── playground/        # Web IDE
│   └── dashboard/         # User stats
├── contexts/              # React contexts
└── components/            # Shared UI components
```

---

## Current Platform Status

### Production Ready
- **18 Courses** (~921 tasks) with full localization (EN/RU/UZ)
- **Piston Code Execution** - 8 languages
- **BullMQ Queue + Redis Caching**
- **Playground (Web IDE)** - /playground
- **AI Tutor** - Gemini 2.0 Flash (100 req/day premium)
- **Gamification** - XP, levels, badges, streaks
- **Health Checks** - /health, /health/metrics
- **Swagger Docs** - /api/docs (dev only)

### Planned Courses
- **Prompt Engineering** (Priority: HIGH) - 35+ tasks
- **Math for Data Science** (Priority: MEDIUM) - Discussion needed
- **System Design** (Priority: MEDIUM) - 30+ tasks

---

## AI Tutor Limits

| Tier | Daily Limit | Notes |
|------|-------------|-------|
| Free (no subscription) | 5 | Basic access |
| Course subscription | 30 | Per-course purchase |
| Global Premium | 100 | Full platform access |
| Prompt Engineering course | 100 | Special limit for PE course |

---

## Adding New Courses

See `TASK_CREATION_GUIDE.md` for complete instructions.

### Required Task Fields
```typescript
{
  slug: string,           // unique identifier
  title: string,          // English title
  difficulty: 'easy' | 'medium' | 'hard',
  tags: string[],
  estimatedTime: string,  // '15m', '30m', '1h'
  isPremium: boolean,
  description: string,
  initialCode: string,
  solutionCode: string,
  testCode: string,       // 10 test cases required
  hint1: string,
  hint2: string,
  whyItMatters: string,
  order: number,
  translations: { ru: {...}, uz: {...} }
}
```

---

## Docker Deployment Rules

**CRITICAL: ВСЕГДА использовать Docker контейнеры! НИКОГДА не запускать приложения вручную!**

### Фиксированные Порты (НЕ МЕНЯТЬ!)

| Service | Port | URL |
|---------|------|-----|
| **Frontend** | 3000 | http://localhost:3000 |
| **Backend** | 8080 | http://localhost:8080 |
| **Database** | 5432 | postgresql://localhost:5432 |
| **Redis** | 6379 | redis://localhost:6379 |
| **Piston** | 2000 | http://localhost:2000 |

### Строгие Правила
- **НИКОГДА** не запускать `npm run dev` вручную
- **НИКОГДА** не создавать дополнительные контейнеры
- **НИКОГДА** не использовать другие порты (5173, 3001, 3002 и т.д.)
- **ВСЕГДА** использовать `docker compose` для всех операций
- **ВСЕГДА** пересобирать с `--no-cache` после изменений

### Проверка Статуса
```bash
docker compose ps  # Должны быть: frontend, backend, db, redis, judge0
```

---

**После ЛЮБЫХ изменений в коде - пересобрать контейнеры и проверить!**

### Полный Workflow После Изменений

#### 1. Frontend Changes (`/src/`)
```bash
# Шаг 1: Пересобрать контейнер
docker compose build --no-cache frontend && docker compose up -d frontend

# Шаг 2: Запустить unit тесты
npm run test

# Шаг 3: Запустить E2E тесты (ОБЯЗАТЕЛЬНО!)
npx playwright test

# Шаг 4: Визуальная проверка в браузере
```

#### 2. Backend Changes (`/server/src/`)
```bash
# Шаг 1: Пересобрать контейнер
docker compose build --no-cache backend && docker compose up -d backend

# Шаг 2: Запустить unit тесты
cd server && npm run test

# Шаг 3: Проверить API (Swagger или curl)
```

#### 3. Database/Seeds Changes (`/server/prisma/`)
```bash
# Шаг 1: Пересобрать контейнер
docker compose build --no-cache backend && docker compose up -d backend

# Шаг 2: Пересидить базу данных
docker compose exec backend npm run seed
# Или полный рефреш:
make db-refresh

# Шаг 3: Проверить данные в приложении
```

#### 4. Full Rebuild (major changes)
```bash
docker compose down && docker compose build --no-cache frontend backend && docker compose up -d
```

### Чек-лист Проверки
- [ ] Контейнеры пересобраны с `--no-cache`
- [ ] Unit тесты проходят (coverage ≥ 87%)
- [ ] E2E тесты проходят (для frontend изменений)
- [ ] Изменения работают в браузере
- [ ] Нет ошибок в консоли (F12 → Console)

---

## Session Notes

### Jan 17, 2026
- **E2E Tests Complete**: 263/263 тестов проходят (было ~20%)
  - Все Page Objects созданы (14 файлов в `e2e/pages/`)
  - ai-tutor.spec.ts — 14 тестов (исправлены data-testid в TaskDescriptionPanel)
  - payments.spec.ts — 23 теста
  - roadmap.spec.ts — 19 тестов
  - И все остальные модули
- **Tech Debt Rules**: Добавлены правила управления техдолгом в CLAUDE.md

### Jan 7, 2026
- **Java Test Runner**: Full rewrite with Expected/Actual capture
  - Fixed import deduplication (solutionCode + template conflicts)
  - Added `compile_timeout` for Java compilation (15s timeout)
  - Restructured code: `public class Main` must be FIRST in file
  - All 10 tests pass with proper JSON output
- **Go Test Runner**: Enhanced Expected/Actual extraction
  - Uses `// TestN: description` comments for Input display
  - Parses `t.Errorf` messages for Expected/Actual values
  - Tested locally blocked by Mac OS Silicon Docker limitation
- **RunResult Persistence**: 5-second cooldown timer working
- **TASK_CREATION_GUIDE.md**: Added Go/Java test templates

### Jan 4-6, 2026
- Added Swagger/OpenAPI documentation
- Added Prometheus metrics and health checks
- Implemented graceful shutdown for BullMQ
- Test coverage at 80%+ for all services
- Updated AI tutor limits: 100/day for premium
- RunResult feature: Save/restore last run results per task

### Next Priority
1. Prompt Engineering course (with 100 AI req/day limit)
2. Math for Data Science (needs execution strategy)
3. Test Go/Java runners on production server
