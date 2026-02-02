# Testing Plan - Practix/Practix

> **Last Updated:** 2026-01-16
> **E2E Framework:** Playwright (planned)

## Overview

This document outlines the comprehensive testing strategy for the Practix/Practix platform.

| Layer | Framework | Status | Target Coverage |
|-------|-----------|--------|-----------------|
| Backend Unit | Jest | **43 spec files, 1076/1076 tests passing (100%)** | 90%+ ✅ |
| Backend Integration | Jest + Supertest | 5 e2e spec files | 80%+ |
| Frontend Unit | Vitest | **8 test files** | 70%+ |
| Frontend Integration | Vitest + Testing Library | Not started | 60%+ |
| E2E | Playwright | **Planning complete, setup needed** | Critical paths |

---

## Part 1: Backend Testing Strategy

### 1.1 Current State (Updated January 16, 2026)

```
Test Suites:             43/43 passing (100%)
Total Tests:             1076/1076 passing (100%)
Total spec files:        43
Failing tests:           0
```

**Status:** All tests passing after mock configuration fixes.

**Recent Fixes:**
- Added `AiService` mock to `submissions.service.spec.ts`
- Added `CacheService` mock to `roadmaps.service.spec.ts`
- Updated `accessControlService` mock with `getTaskAccess`
- Updated `cacheService` mock with `getRunValidation`, `clearRunValidation`
- Fixed XP values in `gamification.service.spec.ts` (easy=25, medium=50, hard=100)
- Updated security middleware tests for new patterns (INSERT/UPDATE/DELETE not blocked)

### 1.2 Testing Priorities

#### Priority 1: CRITICAL (Business Core)
These services handle money, user data, and core functionality.

| Service | Risk Level | Complexity | Test Cases Needed |
|---------|------------|------------|-------------------|
| `submissions.service.ts` | HIGH | HIGH | ~25 tests |
| `ai.service.ts` | HIGH | MEDIUM | ~15 tests |
| `subscriptions.service.ts` | HIGH | HIGH | ~20 tests |
| `access-control.service.ts` | HIGH | MEDIUM | ~15 tests |
| `auth.service.ts` | HIGH | MEDIUM | ✅ Done (~12 tests) |

#### Priority 2: IMPORTANT (User Experience)
These affect user progression and engagement.

| Service | Risk Level | Complexity | Test Cases Needed |
|---------|------------|------------|-------------------|
| `gamification.service.ts` | MEDIUM | HIGH | ~20 tests |
| `users.service.ts` | MEDIUM | LOW | ~10 tests |
| `piston.service.ts` | MEDIUM | HIGH | ~15 tests |
| `code-execution.service.ts` | MEDIUM | MEDIUM | ~12 tests |
| `tasks.service.ts` | MEDIUM | LOW | ✅ Done (~6 tests) |
| `courses.service.ts` | MEDIUM | MEDIUM | ✅ Done (~7 tests) |

#### Priority 3: STANDARD (Supporting Features)
Less critical but still important.

| Service | Risk Level | Complexity | Test Cases Needed |
|---------|------------|------------|-------------------|
| `admin.service.ts` | LOW | MEDIUM | ~10 tests |
| `bugreports.service.ts` | LOW | LOW | ~8 tests |
| `user-courses.service.ts` | LOW | LOW | ~8 tests |
| `sessions.service.ts` | LOW | LOW | ~6 tests |
| `cache.service.ts` | LOW | LOW | ~5 tests |
| `roadmaps.service.ts` | LOW | LOW | ~5 tests |

---

#### 1.3.7 bugreports.service.ts (~8 tests)

```typescript
describe('BugReportsService', () => {
  describe('create()', () => {
    it('should create bug report with valid data')
    it('should associate report with task if taskId provided')
    it('should include user info in response')
  })

  describe('findByUser()', () => {
    it('should return only user own reports')
    it('should order by createdAt desc')
  })

  describe('findAll() - admin', () => {
    it('should return all reports')
    it('should filter by status')
    it('should filter by severity and category')
  })

  describe('updateStatus()', () => {
    it('should update status to valid enum value')
  })
})
```

#### 1.3.8 sessions.service.ts (~6 tests)

```typescript
describe('SessionsService', () => {
  describe('createSession()', () => {
    it('should create session for user and course')
    it('should track startedAt timestamp')
  })

  describe('updateSession()', () => {
    it('should update completedTasks')
    it('should update totalTimeSpent')
  })

  describe('getSessionStats()', () => {
    it('should return user session statistics')
    it('should calculate average time per task')
  })
})
```

#### 1.3.9 user-courses.service.ts (~8 tests)

```typescript
describe('UserCoursesService', () => {
  describe('enrollUser()', () => {
    it('should create enrollment record')
    it('should handle duplicate enrollment')
  })

  describe('getUserCourses()', () => {
    it('should return user enrolled courses')
    it('should include progress data')
  })

  describe('updateProgress()', () => {
    it('should update completedTasks count')
    it('should calculate completion percentage')
  })

  describe('getCourseLeaderboard()', () => {
    it('should return top users by progress')
    it('should respect limit parameter')
  })
})
```

#### Priority 4: INFRASTRUCTURE
Usually tested implicitly.

| Service | Notes |
|---------|-------|
| `prisma.service.ts` | Tested via integration tests |

---

### 1.3 Detailed Test Specifications

#### 1.3.1 submissions.service.ts (~25 tests)

```typescript
describe('SubmissionsService', () => {
  describe('create()', () => {
    // Happy paths
    it('should create submission for valid task and code')
    it('should execute code via Piston service')
    it('should save submission to database')
    it('should return test results with pass/fail status')
    it('should award XP on successful submission')
    it('should respect queue priority based on subscription')

    // Edge cases
    it('should handle task not found')
    it('should handle invalid language')
    it('should handle code execution timeout')
    it('should handle Piston service unavailable')
    it('should sanitize error messages for users')

    // Security
    it('should validate user has access to task')
    it('should not expose solution code in response')
  })

  describe('runTests()', () => {
    it('should run limited tests (5) for quick mode')
    it('should not save to database')
    it('should return partial results')
    it('should handle compilation errors gracefully')
  })

  describe('getTaskSubmissions()', () => {
    it('should return user submissions for task')
    it('should order by createdAt desc')
    it('should not return other users submissions')
  })

  describe('getRecentSubmissions()', () => {
    it('should return recent submissions with limit')
    it('should include task info')
  })
})
```

#### 1.3.2 ai.service.ts (~15 tests)

```typescript
describe('AiService', () => {
  describe('askTutor()', () => {
    // Access control
    it('should check subscription access before processing')
    it('should throw ForbiddenException if no AI access')

    // Rate limiting
    it('should check daily usage limit')
    it('should increment usage count atomically')
    it('should throw ForbiddenException when limit exceeded')
    it('should handle race conditions in usage tracking')
    it('should rollback usage on API failure')

    // API interaction (mocked)
    it('should format prompt correctly with task context')
    it('should include user code in prompt')
    it('should respect UI language setting')
    it('should return AI response')
    it('should handle API timeout gracefully')
    it('should handle API error gracefully')

    // Edge cases
    it('should handle missing API key')
    it('should handle empty question')
  })
})
```

#### 1.3.3 subscriptions.service.ts (~20 tests)

```typescript
describe('SubscriptionsService', () => {
  describe('getMySubscriptions()', () => {
    it('should return active subscriptions for user')
    it('should include plan details')
    it('should filter expired subscriptions')
  })

  describe('createSubscription()', () => {
    it('should create subscription with correct dates')
    it('should set status to active')
    it('should update user isPremium flag')
    it('should handle duplicate subscription gracefully')
  })

  describe('cancelSubscription()', () => {
    it('should set status to cancelled')
    it('should keep access until end date')
    it('should update user isPremium if no other active subs')
  })

  describe('checkAccess()', () => {
    it('should return true for global subscription')
    it('should return true for course-specific subscription')
    it('should return false for expired subscription')
    it('should return false for no subscription')
  })

  describe('handleWebhook()', () => {
    it('should process payment.completed event')
    it('should process subscription.cancelled event')
    it('should ignore unknown events')
    it('should validate webhook signature')
  })
})
```

#### 1.3.4 access-control.service.ts (~15 tests)

```typescript
describe('AccessControlService', () => {
  describe('getTaskAccess()', () => {
    it('should return full access for premium user')
    it('should return limited access for free user')
    it('should check course-specific subscription')
    it('should handle premium task access')
  })

  describe('getCourseAccess()', () => {
    it('should return access for global subscription')
    it('should return access for course subscription')
    it('should return no access for free user on premium course')
  })

  describe('canUseAiTutor()', () => {
    it('should return true for premium user')
    it('should return false for free user')
    it('should check task-specific access')
  })

  describe('getQueuePriority()', () => {
    it('should return high priority for premium')
    it('should return low priority for free')
    it('should consider course subscription')
  })
})
```

#### 1.3.5 gamification.service.ts (~20 tests)

```typescript
describe('GamificationService', () => {
  describe('awardTaskXp()', () => {
    it('should award XP based on difficulty')
    it('should update user total XP')
    it('should calculate new level correctly')
    it('should detect level up')
    it('should update streak on consecutive days')
    it('should reset streak after gap')
    it('should not change streak on same day')
  })

  describe('checkAndAwardBadges()', () => {
    it('should award milestone badges')
    it('should award streak badges')
    it('should award level badges')
    it('should award XP badges')
    it('should not duplicate badges')
    it('should handle race conditions')
    it('should award bonus XP for badge')
  })

  describe('calculateLevel()', () => {
    it('should return level 1 for 0 XP')
    it('should calculate level from thresholds')
    it('should handle XP beyond max threshold')
  })

  describe('getUserStats()', () => {
    it('should return complete user stats')
    it('should calculate progress to next level')
    it('should include badges')
  })

  describe('getLeaderboard()', () => {
    it('should return top users by XP')
    it('should include rank')
    it('should respect limit parameter')
  })
})
```

#### 1.3.6 piston.service.ts (~15 tests)

```typescript
describe('PistonService', () => {
  describe('execute()', () => {
    it('should execute Go code')
    it('should execute Java code')
    it('should execute Python code')
    it('should return stdout and stderr')
    it('should handle compilation errors')
    it('should handle runtime errors')
    it('should respect timeout')
    it('should handle Piston API unavailable')
  })

  describe('executeWithTests()', () => {
    it('should combine solution and test code')
    it('should parse test results')
    it('should limit tests when maxTests specified')
    it('should handle test framework errors')
  })

  describe('checkHealth()', () => {
    it('should return true when Piston available')
    it('should return false when Piston unavailable')
  })

  describe('getSupportedLanguages()', () => {
    it('should return list of supported languages')
  })
})
```

---

### 1.4 Controller Testing Strategy

Controllers should have integration tests using Supertest.

```typescript
// Example: auth.controller.spec.ts
describe('AuthController (e2e)', () => {
  describe('POST /auth/register', () => {
    it('should register new user and return token')
    it('should return 400 for invalid email')
    it('should return 400 for weak password')
    it('should return 409 for existing email')
    it('should be rate limited')
  })

  describe('POST /auth/login', () => {
    it('should login and return token')
    it('should return 401 for wrong password')
    it('should return 401 for non-existent user')
    it('should be rate limited')
  })
})
```

### 1.5 Mocking Strategy

#### External Services to Mock:
```typescript
// 1. Prisma - use in-memory database or mock
const mockPrisma = {
  user: { findUnique: jest.fn(), create: jest.fn(), ... },
  submission: { findMany: jest.fn(), create: jest.fn(), ... },
  // ...
}

// 2. Piston API - mock HTTP responses
jest.mock('../piston/piston.service', () => ({
  PistonService: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({ stdout: '', stderr: '', code: 0 }),
    executeWithTests: jest.fn().mockResolvedValue({ ... }),
  })),
}))

// 3. Gemini API - mock responses
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({ text: 'AI response' }),
    },
  })),
}))

// 4. Redis/BullMQ - mock queue operations
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: 'job-1' }),
    getJob: jest.fn(),
  })),
}))
```

---

## Part 2: Frontend Testing Strategy

### 2.1 Testing Priorities

#### Priority 1: Hooks (Business Logic)
```
❌ useAuth.ts          - Auth state management
❌ useTaskRunner.ts    - Code execution flow
❌ useAiChat.ts        - AI chat interactions
❌ useTaskState.ts     - Task data fetching
❌ useTaskNavigation.ts - Navigation logic
❌ useSubscription (context) - Subscription state
```

#### Priority 2: API Services
```
❌ taskService.ts
❌ subscriptionService.ts
❌ geminiService.ts
```

#### Priority 3: Utils
```
✅ storage.ts (done)
❌ api/client.ts
❌ logger.ts
```

#### Priority 4: Components (with Testing Library)
```
❌ TaskWorkspace.tsx
❌ CodeEditorPanel.tsx
❌ RunResultsPanel.tsx
❌ AiTutorPanel.tsx
```

---

## Part 3: E2E Testing Strategy

### 3.1 Tool Comparison

| Feature | Playwright | Cypress | Selenium | WebdriverIO |
|---------|------------|---------|----------|-------------|
| **Language** | TypeScript native | JavaScript | Java/Python/JS | TypeScript |
| **Speed** | Very Fast | Fast | Slow | Medium |
| **Browsers** | All (Chromium, Firefox, WebKit) | Chromium only* | All | All |
| **Auto-wait** | Yes | Yes | Manual | Yes |
| **Parallel** | Built-in | Paid feature | Manual | Built-in |
| **Mobile** | Emulation | Limited | Appium needed | Built-in |
| **Network mocking** | Excellent | Good | Manual | Good |
| **Video/Screenshots** | Built-in | Built-in | Manual | Plugin |
| **CI/CD** | Excellent | Good | Complex | Good |
| **Learning curve** | Low | Low | High | Medium |
| **Community** | Growing fast | Large | Huge | Medium |
| **Maintenance** | Microsoft | Cypress.io | Selenium HQ | Community |

*Cypress now supports Firefox/WebKit in beta

### 3.2 Recommendation: Playwright

**Why Playwright over Selenium:**

1. **Native TypeScript** - No Java needed, same language as codebase
2. **Modern API** - Async/await, auto-waiting, less flaky tests
3. **Speed** - 3-5x faster than Selenium
4. **Built-in features** - Screenshots, video, tracing, network mocking
5. **Cross-browser** - Single API for all browsers
6. **Better debugging** - Playwright Inspector, trace viewer
7. **Active development** - Microsoft backing, monthly releases

**Migration from Selenium mindset:**
```java
// Selenium (Java)
driver.get("https://example.com");
WebElement element = driver.findElement(By.id("submit"));
WebDriverWait wait = new WebDriverWait(driver, 10);
wait.until(ExpectedConditions.elementToBeClickable(element));
element.click();
```

```typescript
// Playwright (TypeScript)
await page.goto('https://example.com');
await page.click('#submit'); // Auto-waits for clickable
```

### 3.3 E2E Test Scenarios

#### Critical User Flows (Must Have)

```typescript
// 1. Authentication Flow
describe('Authentication', () => {
  test('user can register with email')
  test('user can login with credentials')
  test('user can logout')
  test('user sees error for invalid credentials')
  test('user is redirected to login when accessing protected route')
})

// 2. Task Solving Flow
describe('Task Solving', () => {
  test('user can view task description')
  test('user can write code in editor')
  test('user can run quick tests')
  test('user can see test results')
  test('user can submit solution')
  test('user sees success message on passing all tests')
  test('user sees failure details on failed tests')
  test('user can view submission history')
})

// 3. Course Navigation
describe('Course Navigation', () => {
  test('user can browse courses')
  test('user can view course structure')
  test('user can navigate between tasks')
  test('user sees progress indicators')
})

// 4. Premium Features (with mocked subscription)
describe('Premium Features', () => {
  test('free user cannot access AI tutor')
  test('premium user can use AI tutor')
  test('free user sees upgrade prompt')
  test('premium user can see solution')
})
```

#### Nice to Have Flows

```typescript
// 5. Gamification
describe('Gamification', () => {
  test('user earns XP on task completion')
  test('user sees level up notification')
  test('user can view leaderboard')
})

// 6. Settings
describe('Settings', () => {
  test('user can change language')
  test('user can change theme')
  test('user can update editor preferences')
})
```

### 3.4 Playwright Setup Plan

```
/e2e
├── fixtures/
│   ├── auth.fixture.ts      # Login/register helpers
│   ├── task.fixture.ts      # Task interaction helpers
│   └── db.fixture.ts        # Database seeding
├── pages/
│   ├── login.page.ts        # Page Object Model
│   ├── course.page.ts
│   └── task.page.ts
├── tests/
│   ├── auth.spec.ts
│   ├── task-solving.spec.ts
│   ├── course-navigation.spec.ts
│   └── premium.spec.ts
├── playwright.config.ts
└── global-setup.ts          # DB setup before tests
```

---

## Part 4: Implementation Plan

### Phase 1: Backend Unit Tests (Week 1-2)
```
Day 1-2:  submissions.service.ts (~25 tests)
Day 3:    ai.service.ts (~15 tests) - mock Gemini API
Day 4-5:  subscriptions.service.ts (~20 tests)
Day 6:    access-control.service.ts (~15 tests)
Day 7-8:  gamification.service.ts (~20 tests)
Day 9:    piston.service.ts (~15 tests)
Day 10:   Remaining services (~40 tests)
```

### Phase 2: Backend Integration Tests (Week 3)
```
Day 1-2:  Auth controller e2e tests
Day 3-4:  Submissions controller e2e tests
Day 5:    Courses/Tasks controller e2e tests
```

### Phase 3: Frontend Unit Tests (Week 4)
```
Day 1-2:  Hooks (useTaskRunner, useAiChat, useAuth)
Day 3:    API services
Day 4-5:  Critical components
```

### Phase 4: E2E Tests with Playwright (Week 5)
```
Day 1:    Setup Playwright, fixtures, page objects
Day 2-3:  Auth and Task solving flows
Day 4:    Course navigation and premium features
Day 5:    CI/CD integration
```

---

## Part 5: CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd server && npm ci
      - run: cd server && npm test -- --coverage
      - uses: codecov/codecov-action@v4
        with:
          files: ./server/coverage/lcov.info

  frontend-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4

  e2e:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Part 6: Coverage Targets

| Metric | Current | Target | Deadline |
|--------|---------|--------|----------|
| Backend Unit | 17% | 90% | Week 2 |
| Backend Integration | 0% | 80% | Week 3 |
| Frontend Unit | 3% | 70% | Week 4 |
| E2E Critical Paths | 0% | 100% | Week 5 |

### Definition of Done for Tests

- [ ] All critical services have >90% line coverage
- [ ] All controllers have integration tests
- [ ] All user-facing flows have E2E tests
- [ ] Tests run in CI on every PR
- [ ] Coverage reports published to Codecov
- [ ] No flaky tests (retry mechanism in place)

---

## Appendix A: Test Commands

```bash
# Backend
cd server
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # With coverage
npm test -- auth.service    # Specific file

# Frontend
npm test                    # Run all tests
npm run test:run           # Single run
npm run test:coverage      # With coverage

# E2E (after setup)
npx playwright test                    # Run all
npx playwright test auth.spec.ts       # Specific file
npx playwright test --ui               # UI mode
npx playwright show-report             # View report
```

## Appendix B: Useful Links

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Library](https://testing-library.com/docs/)
