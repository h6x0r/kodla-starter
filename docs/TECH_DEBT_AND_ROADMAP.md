# Practix: Технический Долг и План Развития

> Обновлено: 2026-01-17

---

## Правила ведения документа

1. **Выполненные задачи** — удаляются из списка TODO или помечаются как `✅ Исправлено (дата)`
2. **Найденные баги** — немедленно документируются с указанием:
   - Файл и строка кода
   - Шаги для воспроизведения
   - Ожидаемое vs фактическое поведение
   - Приоритет (🔴 Критично, 🟠 Серьёзно, 🟡 Средний, 🟢 Низкий)
3. **Changelog** — обновляется при каждом значимом изменении

---

## Оглавление

1. [Текущее состояние](#текущее-состояние)
2. [Критические проблемы](#критические-проблемы)
3. [Roadmap функционал](#roadmap-функционал)
4. [Платёжная система](#платёжная-система)
5. [Backend недоработки](#backend-недоработки)
6. [Frontend недоработки](#frontend-недоработки)
7. [Тестирование](#тестирование)
8. [Legacy код для удаления](#legacy-код-для-удаления)
9. [Приоритеты исправлений](#приоритеты-исправлений)
10. [Changelog](#changelog)

---

## Текущее состояние

### Что работает (Production Ready)
- **21 курс** (~958 задач) с полной локализацией (EN/RU/UZ)
- **Piston Code Execution** - 8 языков (Python, Go, Java, JS, TS, C, C++, Rust)
- **BullMQ Queue + Redis Caching**
- **Playground (Web IDE)** - /playground
- **AI Tutor** - Gemini 2.0 Flash (100 req/day premium)
- **Gamification** - XP, levels, badges, streaks, leaderboard
- **Health Checks** - /health, /health/metrics
- **Swagger Docs** - /api/docs (dev only)
- **Roadmap v2** - Wizard с вариантами и AI генерацией

### Что НЕ работает / Частично работает

| Компонент | Статус | Проблема |
|-----------|--------|----------|
| **Roadmap goal sync** | 🔴 BROKEN | Frontend: `find-job`, Backend: `first-job` |
| **Roadmap variants storage** | 🔴 MISSING | Варианты не сохраняются, теряются при обновлении |
| **Payment for regeneration** | 🔴 MISSING | Редирект на /premium вместо покупки |
| **One-time purchases** | 🟠 MISSING | Только подписки, нет разовых покупок |

---

## Критические проблемы

### 1. Рассинхронизация goal между Frontend и Backend

**Статус:** ✅ Исправлено (2026-01-10)

Frontend теперь использует `'first-job'` вместо `'find-job'`:
- `src/features/roadmap/ui/RoadmapPage.tsx:26` — тип WizardState
- `src/features/roadmap/ui/RoadmapPage.tsx:80` — GOAL_OPTIONS
- `src/features/roadmap/model/types.ts:18` — RoadmapGenerationInput

---

### 2. Варианты roadmap не сохраняются

**Статус:** ✅ Исправлено (2026-01-10)

Реализовано сохранение вариантов в Redis:
- Ключ: `roadmap:variants:{userId}`
- TTL: 24 часа (86400 секунд)
- Кэш очищается при выборе варианта или удалении roadmap

**Изменённые файлы:**
- `server/src/roadmaps/roadmaps.service.ts` — добавлен CacheService, методы `clearUserVariants()`, обновлены `generateRoadmapVariants()`, `getUserVariants()`, `selectRoadmapVariant()`, `deleteRoadmap()`

---

### 3. Платежи за регенерацию не интегрированы

**Статус:** 🔴 Критично — потеря дохода

**Проблема:** Кнопка "Purchase Regeneration" просто редиректит на `/premium`

**Файл:** `src/features/roadmap/ui/RoadmapPage.tsx:352`

```typescript
// TODO: Integrate with payment system
window.location.href = '/premium';
```

**Решение:** Интегрировать с Payme/Click для one-time purchase ($4.99)

---

## Roadmap функционал

### Текущая архитектура

```
Frontend Flow:
intro → wizard (5 шагов) → generating → variants → select → result

Wizard Steps:
1. Languages (12 опций)
2. Experience (0, <1, 1-2, 3-5, 5+ лет)
3. Interests (8 опций: backend, go, java, python, ai-ml, etc.)
4. Goal (first-job, senior, startup, master-skill)
5. Time (hours/week + target months)
```

### API Endpoints

| Endpoint | Метод | Статус | Описание |
|----------|-------|--------|----------|
| `/roadmaps/templates` | GET | ✅ | 7 шаблонов |
| `/roadmaps/can-generate` | GET | ✅ | Лимиты генерации |
| `/roadmaps/me` | GET | ✅ | Текущий roadmap |
| `/roadmaps/generate` | POST | ⚠️ Legacy | v1 генерация |
| `/roadmaps/generate-variants` | POST | ✅ | v2 с вариантами |
| `/roadmaps/variants` | GET | 🔴 Broken | Всегда пустой |
| `/roadmaps/select-variant` | POST | ✅ | Выбор варианта |
| `/roadmaps/delete` | DELETE | ✅ | Сброс roadmap |

### Недоработки Roadmap

#### 3.1 Wizard interests валидация

**Статус:** 🟠 Серьёзно

| Компонент | Требование |
|-----------|------------|
| Frontend | Опционально на шаге 2 |
| Backend DTO | `@IsNotEmpty() @ArrayMinSize(1)` |

**Файл:** `server/src/roadmaps/dto/roadmaps.dto.ts:65`

**Решение:** Добавить валидацию на frontend (минимум 1 интерес)

---

#### 3.2 Hardcoded salary ranges

**Статус:** 🟡 Средний приоритет

**Файл:** `server/src/roadmaps/roadmaps.service.ts:11-19`

```typescript
const SALARY_RANGES = {
  junior: { min: 800, max: 1500 },
  middle: { min: 2000, max: 4000 },
  senior: { min: 3500, max: 6000 },
};
```

**Проблема:** Зарплаты в USD без учёта региона

**Решение:** Параметризировать по регионам или убрать

---

#### 3.3 colorTheme добавляется асинхронно

**Статус:** 🟡 Низкий приоритет

**Файлы:**
- `server/src/roadmaps/roadmaps.service.ts:1124` — создаётся с `colorTheme: ''`
- `server/src/roadmaps/roadmaps.service.ts:1299` — заполняется в `hydrateRoadmap()`

---

## Платёжная система

### Текущий статус

| Функционал | Статус |
|------------|--------|
| Payme интеграция | ✅ Работает |
| Click интеграция | ✅ Работает |
| Подписки (monthly/yearly) | ✅ Работает |
| One-time purchases | 🔴 Не реализовано |
| Webhook security | 🟡 Нужен IP whitelist |

### Недоработки

#### 4.1 PaymentTransaction.updatedAt

**Статус:** ✅ Исправлено (2026-01-10)

Добавлено поле в схему:
```prisma
model PaymentTransaction {
  // ...
  updatedAt DateTime @updatedAt  // <-- добавлено
}
```

---

#### 4.2 One-time purchases не реализованы

**Статус:** 🟠 Серьёзно

**Примеры use cases:**
- Покупка регенерации roadmap ($4.99)
- Покупка доступа к одному курсу без подписки
- Покупка дополнительных AI запросов

**Файлы для изменения:**
- `server/src/payments/payments.service.ts`
- `server/src/payments/providers/payme.provider.ts`
- `server/src/payments/providers/click.provider.ts`

---

#### 4.3 Webhook endpoints не защищены

**Статус:** 🟡 Средний приоритет

**Проблема:** `/payments/payme` и `/payments/click` доступны публично

**Решение:** Добавить IP whitelist или signature verification

---

## Backend недоработки

### 5.1 AI модель hardcoded

**Статус:** 🟡 Средний приоритет

**Файл:** `server/src/roadmaps/roadmaps.service.ts:589`

```typescript
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
```

**Решение:** Вынести в env переменную `AI_MODEL_NAME`

---

### 5.2 Нет rate limiting для AI запросов

**Статус:** 🟡 Средний приоритет

**Проблема:** Пользователь может спамить генерацию roadmap

**Решение:** Добавить rate limiter (1 запрос в минуту)

---

### 5.3 Два параллельных API генерации

**Статус:** 🟡 Средний приоритет

| Версия | Endpoint | Статус |
|--------|----------|--------|
| v1 | `POST /roadmaps/generate` | Legacy |
| v2 | `POST /roadmaps/generate-variants` | Актуальный |

**Решение:** Удалить v1 после миграции

---

## Frontend недоработки

### 6.1 Отсутствующие иконки

**Статус:** ✅ Исправлено (2026-01-10)

Добавлены `IconCrown` и `IconLightning` в `src/components/Icons.tsx`

---

### 6.2 Bundle size warning

**Статус:** 🟡 Низкий приоритет

```
dist/assets/index-DJXRCsnT.js   1,011.12 kB │ gzip: 282.28 kB
```

**Рекомендация:** < 500 kB

**Решение:** Code splitting с dynamic imports для Monaco, Recharts

---

### 6.3 Wizard не сохраняет состояние

**Статус:** 🟡 Средний приоритет

**Проблема:** При обновлении страницы wizard сбрасывается

**Решение:** Сохранять в localStorage или URL params

---

### 6.4 Нет loading states для wizard

**Статус:** 🟡 Низкий приоритет

**Файл:** `src/features/roadmap/ui/RoadmapPage.tsx`

**Решение:** Добавить skeleton/loading при переходах

---

## Тестирование

### Backend

| Сервис | Покрытие | Файл |
|--------|----------|------|
| RoadmapsService | ~80% | `roadmaps.service.spec.ts` (1930 строк) |
| SubmissionsService | ~85% | `submissions.service.spec.ts` |
| UsersService | ~75% | `users.service.spec.ts` |
| PaymentsService | ~60% | Нужны интеграционные тесты |

### Frontend

| Компонент | Покрытие |
|-----------|----------|
| RoadmapPage | 0% |
| TaskWorkspace | 0% |
| CoursesPage | 0% |

**Рекомендация:** Добавить Vitest/Jest тесты для критичных компонентов

### E2E тесты

**Статус:** ✅ **263/263 тестов проходят** (обновлено 2026-01-17)

| Файл | Тестов | Статус |
|------|--------|--------|
| `ai-tutor.spec.ts` | 14 | ✅ |
| `admin.spec.ts` | 8 | ✅ |
| `analytics.spec.ts` | 14 | ✅ |
| `auth.spec.ts` | 8 | ✅ |
| `courses.spec.ts` | 10 | ✅ |
| `dashboard.spec.ts` | 19 | ✅ |
| `errors.spec.ts` | 13 | ✅ |
| `leaderboard.spec.ts` | 16 | ✅ |
| `localization.spec.ts` | 13 | ✅ |
| `mobile.spec.ts` | 17 | ✅ |
| `my-tasks.spec.ts` | 14 | ✅ |
| `payments.spec.ts` | 23 | ✅ |
| `playground.spec.ts` | 22 | ✅ |
| `roadmap.spec.ts` | 19 | ✅ |
| `settings.spec.ts` | 16 | ✅ |
| `subscription-access.spec.ts` | 20 | ✅ |
| `task-solving.spec.ts` | 17 | ✅ |

**Page Objects созданы:**
- `e2e/pages/` — 14 Page Objects для всех основных страниц
- Все используют `data-testid` атрибуты для надёжной селекции

---

## Новые требования (2026-01-17)

### NR-1. Ограничение параллельного доступа: 1 мобайл + 1 десктоп

**Статус:** ✅ Исправлено (2026-01-17)

**Текущее состояние:**
- `SessionsService.invalidateUserSessions()` убивает ВСЕ сессии при логине
- Разрешён только 1 активный девайс глобально
- `deviceInfo` хранится как строка (не типизирован)

**Требуемое поведение:**
- Разрешить одновременно: 1 mobile + 1 desktop
- При логине с mobile — убивать только mobile сессии
- При логине с desktop — убивать только desktop сессии
- Tablet считать как desktop

**Файлы для изменения:**

| Файл | Изменение |
|------|-----------|
| `server/prisma/schema.prisma` | Добавить `DeviceType` enum и поле `deviceType` в Session |
| `server/src/sessions/sessions.service.ts` | Фильтровать по deviceType при invalidate |
| `server/src/auth/auth.service.ts` | Передавать deviceType при создании сессии |
| `server/src/common/utils/device-parser.ts` | **Создать** - парсер User-Agent |
| `server/src/auth/strategies/jwt.strategy.ts` | Валидировать deviceType при каждом запросе |

**Схема изменений Prisma:**
```prisma
enum DeviceType {
  MOBILE
  DESKTOP
  UNKNOWN
}

model Session {
  // ... existing fields
  deviceType  DeviceType @default(UNKNOWN)

  @@index([userId, deviceType])
}
```

**Логика инвалидации:**
```typescript
async invalidateUserSessionsByDevice(userId: string, deviceType: DeviceType): Promise<number> {
  return this.prisma.session.updateMany({
    where: { userId, deviceType, isActive: true },
    data: { isActive: false },
  }).then(r => r.count);
}
```

**User-Agent парсинг:**
- Mobile: `/iPhone|iPad|Android|Mobile/i`
- Desktop: всё остальное

---

### NR-2. Курс по безопасности (Application Security)

**Статус:** ✅ Исправлено (2026-01-17) — 44 задачи создано

**Структура курса (40-50 задач):**

| Модуль | Задач | Темы |
|--------|-------|------|
| **1. Security Fundamentals** | 6 | CIA Triad, Defense in Depth, Least Privilege, Threat Modeling |
| **2. Authentication & Authorization** | 8 | RBAC, ABAC, OAuth 2.0, JWT Security, Session Management, MFA |
| **3. OWASP Top 10** | 12 | Injection, XSS, CSRF, Broken Auth, Security Misconfiguration, XXE, IDOR |
| **4. Cryptography Basics** | 6 | Hashing, Symmetric/Asymmetric, TLS, Password Storage, Digital Signatures |
| **5. Secure Coding Practices** | 8 | Input Validation, Output Encoding, Error Handling, Logging |
| **6. Security Certifications** | 4 | CISSP, CEH, CompTIA Security+, OSCP обзор |
| **7. Interview Preparation** | 6 | Common questions, Scenario-based, Practical demos |

**Типы задач:**
1. **Code Review** — найти уязвимость в коде (taskType: 'CODE')
2. **Secure Coding** — написать безопасную реализацию (taskType: 'CODE')
3. **Prompt-based** — анализ сценариев, написание политик (taskType: 'PROMPT')

**Примеры задач:**
- "Найдите SQL injection в этом коде и исправьте"
- "Реализуйте безопасное хранение паролей с bcrypt"
- "Напишите RBAC middleware для Express"
- "Какие уязвимости в этом JWT implementation?"

**Файлы для создания:**
```
server/prisma/seeds/courses/c_app_security/
├── course.ts
├── index.ts
└── modules/
    ├── security-fundamentals/
    ├── auth-authz/
    ├── owasp-top-10/
    ├── cryptography/
    ├── secure-coding/
    ├── certifications/
    └── interview-prep/
```

**Зависимости:** Рекомендуется после `software-engineering` или `go-web-apis`

---

### NR-3. Python Fundamentals — анализ задач

**Статус:** ✅ Исправлено (2026-01-17) — удалены пустые папки error-handling и strings

**Текущая структура:**

| Модуль | Задач | Темы |
|--------|-------|------|
| syntax-fundamentals | 8 | Variables, operators, basic I/O |
| control-flow | 10 | Conditionals, loops, iterations |
| data-structures | 12 | Lists, dicts, sets, tuples |
| functions | 10 | Def, args, kwargs, decorators |
| oop-basics | 10 | Classes, inheritance, magic methods |
| **ИТОГО** | **50** | |

**Проблема:** Есть пустые папки-заглушки, которые не используются:
- `modules/error-handling/` — 8 пустых topic папок
- `modules/strings/` — 8 пустых topic папок

**Рекомендации:**
1. **Удалить** пустые папки error-handling и strings (мусор)
2. **Опционально:** Добавить модуль error-handling с 5-6 задачами:
   - try/except basics
   - Exception hierarchy
   - Custom exceptions
   - Context managers
   - Logging basics

**Команда для очистки:**
```bash
rm -rf server/prisma/seeds/courses/c_python_fundamentals/modules/error-handling
rm -rf server/prisma/seeds/courses/c_python_fundamentals/modules/strings
```

---

## Legacy код для удаления

### 8.1 repository.ts (Roadmap)

**Файл:** `src/features/roadmap/data/repository.ts` (144 строки)

**Описание:** Hardcoded шаблоны roadmap, не используется

**Действие:** Удалить файл

---

### 8.2 v1 generateRoadmap API

**Файл:** `server/src/roadmaps/roadmaps.service.ts:252-330`

**Описание:** Legacy метод без вариантов

**Действие:** Удалить после миграции на v2

---

## Приоритеты исправлений

### 🔴 Критический приоритет

- [x] **NR-1** Ограничение устройств: 1 mobile + 1 desktop ✅ 2026-01-17

### 🟠 Высокий приоритет

- [x] **NR-2** Курс по безопасности (44 задачи) ✅ 2026-01-17
- [ ] **#4** Интегрировать one-time purchases для регенерации
- [ ] **#5** Добавить rate limiting для AI запросов
- [ ] **#2** Добавить валидацию interests на frontend (min 1)

### 🟡 Средний приоритет

- [ ] **#6** Frontend unit тесты для RoadmapPage
- [ ] **#7** Code splitting (Monaco, Recharts)
- [ ] **#8** Wizard state в localStorage
- [x] **NR-3** Очистка мусорных папок в Python Fundamentals ✅ 2026-01-17

### 🟢 Низкий приоритет (Backlog)

- [ ] **#9** Удалить legacy код (repository.ts, v1 API)
- [ ] **#10** Обновить Prisma 5.22 → 7.x
- [ ] **#11** Параметризировать salary ranges
- [ ] **#13** IP whitelist для webhooks

### ✅ Выполнено

- [x] **#1** Синхронизировать goal: `find-job` → `first-job` ✅ 2026-01-10
- [x] **#3** Сохранять варианты в Redis (24h TTL) ✅ 2026-01-10
- [x] **#12** E2E тесты для wizard flow ✅ 2026-01-17 (включены в roadmap.spec.ts)

---

## Changelog

| Дата | Изменение |
|------|-----------|
| 2026-01-17 | ✅ NR-2: Курс Application Security завершён — 44 задачи (7 модулей) |
| 2026-01-17 | ✅ NR-3: Удалены пустые папки error-handling и strings в Python Fundamentals |
| 2026-01-17 | 🆕 NR-2: Создана структура курса Application Security (7 модулей, 2 задачи, остальные TODO) |
| 2026-01-17 | ✅ NR-1: Реализовано ограничение устройств (DeviceType enum, device-parser, per-device session invalidation) |
| 2026-01-17 | 🆕 NR-1: Добавлено требование ограничения устройств (1 mobile + 1 desktop) |
| 2026-01-17 | 🆕 NR-2: Добавлен план курса по безопасности (40-50 задач) |
| 2026-01-17 | 🆕 NR-3: Проанализирован Python Fundamentals — 50 задач, найдены мусорные папки |
| 2026-01-17 | ✅ E2E тесты: все 263 теста проходят (было ~20%) |
| 2026-01-17 | ✅ Добавлены data-testid атрибуты в TaskDescriptionPanel для AI Tutor |
| 2026-01-17 | ✅ Исправлены payments.spec.ts — 23/23 тестов |
| 2026-01-17 | ✅ Созданы 14 Page Objects для E2E тестов |
| 2026-01-17 | Добавлены правила ведения документа техдолга |
| 2026-01-10 | Исправлена синхронизация goal: `find-job` → `first-job` |
| 2026-01-10 | Реализовано сохранение roadmap вариантов в Redis (24h TTL) |
| 2026-01-10 | Добавлены resizable панели в TaskWorkspace |
| 2026-01-10 | Добавлено `updatedAt` в PaymentTransaction schema |
| 2026-01-10 | Добавлены иконки IconCrown, IconLightning |
| 2026-01-10 | Расширен Python Fundamentals: 20 → 50 задач |
| 2026-01-10 | Полный анализ Roadmap функционала |
| 2026-01-10 | Обновлён этот документ с актуальным статусом |
| 2025-12-17 | Первоначальная версия документа |

---

## Курсы и зависимости

```
Go Track:
go-basics ──► go-concurrency ──► go-production
    │              │
    └──► go-web-apis ──────┘
         go-design-patterns (standalone)

Java Track:
java-core ──► java-modern ──► java-advanced
              java-design-patterns (standalone)

Python Track:
python-fundamentals ──► python-ml-fundamentals ──► python-deep-learning
                                                         │
                                                         └──► python-llm

Cross-Language:
software-engineering (standalone)
algo-fundamentals (standalone)
prompt-engineering (standalone)
math-for-ds (standalone)
app-security (standalone) ← 🆕 PLANNED
```

---

*Документ обновлён: 2026-01-17*
