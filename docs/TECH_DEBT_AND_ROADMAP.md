# Practix: Технический Долг и План Развития

> Обновлено: 2026-02-04

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
| **Roadmap goal sync** | ✅ FIXED | Исправлено 2026-01-10 |
| **Roadmap variants storage** | ✅ FIXED | Исправлено 2026-01-10 (Redis cache) |
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
| `/roadmaps/generate-variants` | POST | ✅ | v2 генерация с вариантами (rate limited: 1/min) |
| `/roadmaps/variants` | GET | ✅ | Варианты из Redis cache (24h TTL) |
| `/roadmaps/select-variant` | POST | ✅ | Выбор варианта |
| `/roadmaps/delete` | DELETE | ✅ | Сброс roadmap |

### Недоработки Roadmap

#### 3.1 Wizard interests валидация

**Статус:** ✅ Исправлено (2026-02-04)

Frontend валидация реализована в `RoadmapPage.tsx`:
- `canProceed()` проверяет минимум 1 интерес
- `interestsError` состояние для отображения ошибки
- Кнопка "Next" заблокирована без выбора

---

#### 3.2 Hardcoded salary ranges

**Статус:** ✅ Исправлено (2026-02-04)

Реализована параметризация через env переменную `SALARY_RANGES`:
- `server/src/roadmaps/roadmap.config.ts` — `getSalaryRanges()` функция
- Значения загружаются из env с fallback на defaults
- Формат: JSON `{"junior":{"min":800,"max":1500},...}`

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
| Webhook security | ✅ IP whitelist реализован |

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

**Статус:** ✅ Исправлено (2026-02-04)

Реализован `IpWhitelistGuard` в `server/src/common/guards/ip-whitelist.guard.ts`:
- Проверяет IP адреса Payme и Click
- Настраивается через env переменные
- Применяется к webhook endpoints

---

## Backend недоработки

### 5.1 AI модель hardcoded

**Статус:** ✅ Исправлено (2026-02-04)

AI модель теперь загружается из env переменной `AI_MODEL_NAME`:
- Default: `gemini-2.0-flash`
- Файл: `server/src/roadmaps/roadmaps.service.ts`

---

### 5.2 Нет rate limiting для AI запросов

**Статус:** ✅ Исправлено (2026-02-04)

Добавлен rate limiting через NestJS Throttler:
- `@Throttle({ default: { limit: 1, ttl: 60000 } })` на `generate-variants` endpoint
- 1 запрос в минуту для генерации roadmap
- Файл: `server/src/roadmaps/roadmaps.controller.ts`

---

### 5.3 Два параллельных API генерации

**Статус:** ✅ Исправлено (2026-02-04)

Legacy v1 API удалён:
- Удалён `POST /roadmaps/generate` endpoint
- Удалены методы: `generateRoadmap()`, `getTasksByCategory()`, `generatePhasesWithAI()`, etc.
- Удалён `GenerateRoadmapDto` класс
- Удалено ~600 строк кода + ~400 строк тестов

---

## Frontend недоработки

### 6.1 Отсутствующие иконки

**Статус:** ✅ Исправлено (2026-01-10)

Добавлены `IconCrown` и `IconLightning` в `src/components/Icons.tsx`

---

### 6.2 Bundle size warning

**Статус:** ✅ Исправлено (2026-02-04)

Code splitting реализован в `vite.config.ts`:
- Monaco Editor — lazy loaded
- Recharts — lazy loaded
- Admin dashboard — lazy loaded

---

### 6.3 Wizard не сохраняет состояние

**Статус:** ✅ Исправлено (2026-02-04)

Wizard state сохраняется в localStorage:
- Ключ: `roadmap-wizard-state`
- Восстанавливается при перезагрузке страницы

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

| Компонент | Покрытие | Статус |
|-----------|----------|--------|
| RoadmapPage | ~90% | ✅ 57 тестов в `RoadmapPage.test.tsx` |
| TaskWorkspace | ~70% | ✅ Покрыт через E2E |
| CoursesPage | ~85% | ✅ Тесты в `CoursesPage.test.tsx` |

**Общее покрытие:** 817 unit тестов проходят

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

## Админ-панель v2 (Планируемый функционал)

### Текущее состояние

Админ-панель (`/admin`) имеет базовый функционал:
- Просмотр пользователей
- Управление подписками
- Bug reports

### Планируемая архитектура

```
/admin
├── /dashboard          # Общая статистика
├── /analytics          # Детальная аналитика
│   ├── /users          # DAU/MAU, retention, cohorts
│   ├── /courses        # Популярность курсов, completion rate
│   ├── /tasks          # Статистика решений, сложность
│   └── /revenue        # Доходы, подписки, конверсии
├── /limits             # Управление лимитами
│   ├── /ai             # AI Tutor лимиты
│   ├── /courses        # Доступ к курсам
│   └── /api            # Rate limiting API
├── /users              # Управление пользователями
│   ├── /list           # Список с фильтрами
│   ├── /[id]           # Профиль пользователя
│   └── /bans           # Заблокированные
├── /content            # Управление контентом
│   ├── /courses        # Курсы (вкл/выкл, premium)
│   ├── /tasks          # Задачи (редактирование)
│   └── /bug-reports    # Bug reports от пользователей
├── /payments           # Финансы
│   ├── /transactions   # История транзакций
│   ├── /refunds        # Возвраты
│   └── /subscriptions  # Активные подписки
└── /settings           # Настройки платформы
    ├── /feature-flags  # Feature toggles
    ├── /maintenance    # Режим обслуживания
    └── /notifications  # Системные уведомления
```

### NR-4. Управление лимитами из админки

**Статус:** 🔴 TODO

**Требования:**

#### 4.1 AI Tutor лимиты (`/admin/limits/ai`)

| Настройка | Описание | Тип |
|-----------|----------|-----|
| `ai.enabled` | Глобальное вкл/выкл AI Tutor | toggle |
| `ai.limits.free` | Лимит для бесплатных пользователей | number (default: 5) |
| `ai.limits.subscription` | Лимит для подписчиков | number (default: 30) |
| `ai.limits.premium` | Лимит для premium | number (default: 100) |
| `ai.limits.promptEngineering` | Лимит для курса Prompt Engineering | number (default: 100) |
| `ai.cooldown` | Задержка между запросами (сек) | number (default: 5) |
| `ai.maxTokens` | Максимум токенов в ответе | number (default: 2048) |

#### 4.2 Rate Limiting API (`/admin/limits/api`)

| Настройка | Описание | Тип |
|-----------|----------|-----|
| `api.rateLimit.enabled` | Включить rate limiting | toggle |
| `api.rateLimit.submissions` | Лимит submissions/мин | number (default: 10) |
| `api.rateLimit.playground` | Лимит playground запросов/мин | number (default: 20) |
| `api.rateLimit.auth` | Лимит auth запросов/мин | number (default: 5) |
| `api.rateLimit.global` | Глобальный лимит/мин | number (default: 100) |

#### 4.3 Доступ к курсам (`/admin/limits/courses`)

| Настройка | Описание | Тип |
|-----------|----------|-----|
| `courses.[slug].enabled` | Вкл/выкл курс | toggle |
| `courses.[slug].premium` | Курс только для premium | toggle |
| `courses.[slug].freeTasksLimit` | Бесплатных задач в курсе | number |

**Хранение настроек:**
- Redis для быстрого доступа: `settings:{category}:{key}`
- PostgreSQL для персистентности: таблица `PlatformSettings`

**Схема Prisma:**
```prisma
model PlatformSetting {
  id        String   @id @default(cuid())
  category  String   // 'ai', 'api', 'courses'
  key       String   // 'limits.free', 'rateLimit.enabled'
  value     String   // JSON serialized value
  updatedBy String?  // Admin user ID
  updatedAt DateTime @updatedAt
  
  @@unique([category, key])
  @@index([category])
}
```

**API Endpoints:**

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `GET /admin/settings` | GET | Все настройки |
| `GET /admin/settings/:category` | GET | Настройки категории |
| `PUT /admin/settings/:category/:key` | PUT | Обновить настройку |
| `POST /admin/settings/bulk` | POST | Массовое обновление |

**Файлы для создания:**

| Файл | Описание |
|------|----------|
| `server/src/admin/settings/settings.service.ts` | Сервис настроек |
| `server/src/admin/settings/settings.controller.ts` | API контроллер |
| `server/src/admin/settings/dto/settings.dto.ts` | DTO для валидации |
| `src/features/admin/pages/LimitsPage.tsx` | UI страница лимитов |
| `src/features/admin/components/LimitToggle.tsx` | Компонент toggle |
| `src/features/admin/components/LimitInput.tsx` | Компонент числового ввода |

---

### NR-5. Аналитика в админке

**Статус:** 🟡 TODO (средний приоритет)

**Метрики для отслеживания:**

#### Users Analytics
- DAU/WAU/MAU (Daily/Weekly/Monthly Active Users)
- New registrations per day
- Retention rate (D1, D7, D30)
- Churn rate
- User cohort analysis

#### Courses Analytics
- Course completion rate
- Average time to complete
- Most popular courses
- Drop-off points (какие задачи бросают)
- Task difficulty vs completion

#### Revenue Analytics
- MRR (Monthly Recurring Revenue)
- New subscriptions per day
- Cancellation rate
- Average revenue per user (ARPU)
- Conversion rate (free → paid)

#### System Analytics
- Code execution stats (by language)
- AI Tutor usage
- Error rates
- Response times

---

## Legacy код для удаления

### 8.1 repository.ts (Roadmap)

**Статус:** ✅ Удалено (2026-02-04)

**Файл:** `src/features/roadmap/data/repository.ts` — **УДАЛЁН**

---

### 8.2 v1 generateRoadmap API

**Статус:** ✅ Удалено (2026-02-04)

**Удалено:**
- `generateRoadmap()` метод (~80 строк)
- Legacy private методы: `getTasksByCategory()`, `generatePhasesWithAI()`, `buildRoadmapPrompt()`, `generatePhasesFallback()` (~260 строк)
- `GenerateRoadmapDto` класс
- Неиспользуемые константы: `CATEGORY_PATTERNS`, `GENERATION_LIMITS`, `TIME_MULTIPLIERS`
- Тесты для удалённого legacy кода (~400 строк)

---

### 8.3 Пустые файлы roadmap

**Статус:** ✅ Удалено (2026-02-04)

Удалены пустые stub-файлы:
- `src/lib/roadmap/domain.ts`
- `src/lib/roadmap/repository.ts`
- `src/lib/roadmap/service.ts`

---

## Приоритеты исправлений

### 🔴 Критический приоритет

- [x] **NR-1** Ограничение устройств: 1 mobile + 1 desktop ✅ 2026-01-17

### 🟠 Высокий приоритет

- [x] **NR-2** Курс по безопасности (44 задачи) ✅ 2026-01-17
- [x] **#5** Rate limiting для AI запросов ✅ 2026-02-04 (1 req/min)
- [x] **#2** Валидация interests на frontend ✅ 2026-02-04 (уже было реализовано)
- [ ] **#4** Интегрировать one-time purchases для регенерации
- [ ] **NR-4** Управление лимитами из админки (AI, API, курсы)

### 🟡 Средний приоритет

- [x] **#6** Frontend unit тесты для RoadmapPage ✅ 2026-02-04 (57 тестов)
- [x] **#7** Code splitting (Monaco, Recharts) ✅ 2026-02-04 (уже реализовано в vite.config.ts)
- [x] **#8** Wizard state в localStorage ✅ 2026-02-04 (уже реализовано)
- [x] **NR-3** Очистка мусорных папок в Python Fundamentals ✅ 2026-01-17
- [ ] **NR-5** Аналитика в админке (DAU/MAU, revenue, courses)

### 🟢 Низкий приоритет (Backlog)

- [x] **#9** Удалить legacy код (repository.ts, v1 API) ✅ 2026-02-04
- [x] **#10** Обновить Prisma 5.7.0 → 6.19.2 ✅ 2026-02-04
- [x] **#11** Параметризировать salary ranges ✅ 2026-02-04
- [x] **#13** IP whitelist для webhooks ✅ 2026-02-04
- [x] **#15** AI модель в env переменную ✅ 2026-02-04
- [x] **#14** Админ-панель v2 — реорганизация компонентов ✅ 2026-02-04

### ✅ Выполнено

- [x] **#1** Синхронизировать goal: `find-job` → `first-job` ✅ 2026-01-10
- [x] **#3** Сохранять варианты в Redis (24h TTL) ✅ 2026-01-10
- [x] **#12** E2E тесты для wizard flow ✅ 2026-01-17 (включены в roadmap.spec.ts)

---

## Changelog

| Дата | Изменение |
|------|-----------|
| 2026-02-04 | ✅ Админ-панель v2: рефакторинг компонентов (841→339 строк AdminDashboard) |
| 2026-02-04 | ✅ Созданы переиспользуемые компоненты: StatsCard, SubscriptionStatsCard, SubmissionsCharts, CoursePopularityTable, TaskAnalyticsTables |
| 2026-02-04 | ✅ Rate limiting для roadmap generation (1 req/min) |
| 2026-02-04 | ✅ Параметризация salary ranges через env (SALARY_RANGES) |
| 2026-02-04 | ✅ IP whitelist для webhooks (IpWhitelistGuard) |
| 2026-02-04 | ✅ AI модель в env переменную (AI_MODEL_NAME) |
| 2026-02-04 | ✅ Исправлены тесты admin.service.spec.ts и settings.service.spec.ts (добавлен mock AuditService) |
| 2026-02-04 | ✅ Удалён весь legacy код roadmap (~600 строк кода + ~400 строк тестов) |
| 2026-02-04 | ✅ Обновлена Prisma 5.7.0 → 6.19.2 |
| 2026-02-04 | 🆕 Добавлен полный план Админ-панели v2 (3 фазы, 9 функций) |
| 2026-02-04 | 🆕 NR-4: Добавлен план управления лимитами из админки |
| 2026-02-04 | 🆕 NR-5: Добавлен план аналитики в админке |
| 2026-02-04 | 🆕 Добавлена архитектура Админ-панели v2 |
| 2026-02-04 | ✅ Java E2E тесты работают (259 задач, Judge0 настроен) |
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

---

## Админ-панель v2 — План реализации

### Текущее состояние (v1)

**Тип:** Read-only аналитика  
**6 endpoints:** dashboard, courses, tasks, submissions, subscriptions, ai-usage  
**Размер компонента:** ~850 строк (AdminDashboard.tsx)

### Архитектура v2

```
/admin
├── /dashboard          # Общая статистика (текущее)
├── /analytics          # Детальная аналитика (текущее)
├── /limits             # 🆕 Управление лимитами
│   ├── /ai             # AI Tutor лимиты
│   └── /api            # Rate limiting API
├── /users              # 🆕 Управление пользователями
│   ├── /search         # Поиск пользователей
│   ├── /[id]           # Профиль пользователя
│   └── /bans           # Заблокированные
├── /bug-reports        # 🆕 Bug reports от пользователей
├── /payments           # 🆕 Управление платежами
│   ├── /transactions   # История транзакций
│   └── /refunds        # Возвраты
├── /promocodes         # 🆕 Промокоды
└── /audit-log          # 🆕 История действий админов
```

### План реализации по фазам

#### Фаза 1 — MVP (Критические функции)

| # | Функционал | Описание | Приоритет | Статус |
|---|-----------|----------|-----------|--------|
| 1 | **Управление лимитами AI** | Изменение лимитов AI для тиров (free/course/premium) | 🔴 HIGH | TODO |
| 2 | **Просмотр баг-репортов** | Список баг-репортов, статусы, ответы | 🔴 HIGH | TODO |
| 3 | **Поиск пользователей** | Поиск по email/username, просмотр профиля | 🟠 MEDIUM | TODO |

#### Фаза 2 — Расширение

| # | Функционал | Описание | Приоритет | Статус |
|---|-----------|----------|-----------|--------|
| 4 | **Бан/разбан пользователей** | Блокировка нарушителей, управление IP-банами | 🟠 MEDIUM | TODO |
| 5 | **Управление платежами** | Просмотр платежей, возвраты, отмена подписок | 🟠 MEDIUM | TODO |
| 6 | **Промокоды** | Создание, редактирование, деактивация | 🟠 MEDIUM | TODO |

#### Фаза 3 — Улучшения

| # | Функционал | Описание | Приоритет | Статус |
|---|-----------|----------|-----------|--------|
| 7 | **Audit logs** | История действий админов | 🟡 LOW | TODO |
| 8 | **Экспорт данных** | CSV/JSON экспорт аналитики | 🟢 LOW | TODO |
| 9 | **Фильтры и пагинация** | Поиск, сортировка в таблицах | 🟢 LOW | TODO |

### Детали реализации

#### 1. Управление лимитами AI

**Backend:**
```
POST /admin/settings/ai
GET  /admin/settings/ai
```

**Настраиваемые параметры:**
| Параметр | Описание | По умолчанию |
|----------|----------|--------------|
| `ai.enabled` | Глобальное вкл/выкл AI | true |
| `ai.limits.free` | Лимит для бесплатных | 5 |
| `ai.limits.course` | Лимит для подписчиков курса | 30 |
| `ai.limits.premium` | Лимит для premium | 100 |
| `ai.limits.promptEngineering` | Лимит для курса PE | 100 |

**Frontend:**
- `src/features/admin/pages/AiLimitsPage.tsx`
- Компоненты: NumberInput, Toggle, SaveButton

#### 2. Просмотр баг-репортов

**Backend:**
```
GET    /admin/bug-reports         # Список с фильтрами
GET    /admin/bug-reports/:id     # Детали репорта
PATCH  /admin/bug-reports/:id     # Обновить статус/ответ
DELETE /admin/bug-reports/:id     # Удалить
```

**Статусы:** `new`, `in_progress`, `resolved`, `wont_fix`, `duplicate`

#### 3. Поиск пользователей

**Backend:**
```
GET /admin/users/search?q=email@example.com
GET /admin/users/:id
GET /admin/users/:id/activity   # История активности
```

**Отображаемые данные:**
- Профиль (email, username, createdAt)
- Подписки (активные, история)
- Прогресс по курсам
- Статистика решений
- AI использование

---

*Документ обновлён: 2026-02-04*
