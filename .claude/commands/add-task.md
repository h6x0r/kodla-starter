# Add or Migrate Task Command

This command helps Claude add new tasks or migrate existing tasks to the practix-starter platform.

## Task Structure

Each task in `server/prisma/seeds/go-concurrency.ts` follows this structure:

```typescript
{
  slug: 'unique-task-slug',
  title: 'Task Title in English',
  difficulty: 'easy' | 'medium' | 'hard',
  tags: ['go', 'concurrency', ...],
  estimatedTime: '15m',
  isPremium: boolean,
  description: `English description with:
    - Requirements section
    - Example code block
    - Constraints section`,
  initialCode: `// Starter code template`,
  solutionCode: `// Solution with inline comments at column ~50
    // Example: if ctx == nil {                                    // comment here`,
  solutionExplanation: null, // Always null - use inline comments instead
  whyItMatters: `Why this pattern matters in production...`,
  hint1: 'First hint',
  hint2: 'Second hint',
  order: 0,
  translations: {
    ru: {
      title: 'Russian title',
      description: `Russian description with same sections`,
      hint1: 'Russian hint 1',
      hint2: 'Russian hint 2',
      solutionCode: `// Same solution with Russian inline comments`,
      whyItMatters: `Russian whyItMatters`
    },
    uz: {
      title: 'Uzbek title',
      description: `Uzbek description with same sections`,
      hint1: 'Uzbek hint 1',
      hint2: 'Uzbek hint 2',
      solutionCode: `// Same solution with Uzbek inline comments`,
      whyItMatters: `Uzbek whyItMatters`
    }
  }
}
```

## Inline Comments Format

Comments should be aligned at approximately column 50-55:

```go
func Example() error {
    if ctx == nil {                                         // Explain the check
        ctx = context.Background()                          // Explain the fallback
    }
    ctxWithTimeout, cancel := context.WithTimeout(ctx, d)   // Explain the operation
    defer cancel()                                          // Explain why defer is important
}
```

## Translation Requirements

### Description sections to translate:
- Requirements (**Требования:** / **Talablar:**)
- Example (**Пример:** / **Misol:**)
- Constraints (**Ограничения:** / **Cheklovlar:**)

### Russian comment style:
```go
if ctx == nil {                                         // Безопасная обработка nil контекста
    ctx = context.Background()                          // Используем Background как значение по умолчанию
}
```

### Uzbek comment style:
```go
if ctx == nil {                                         // nil contextni xavfsiz qayta ishlash
    ctx = context.Background()                          // Standart sifatida Background dan foydalaning
}
```

## Adding a New Task

1. Identify the correct module and topic in `go-concurrency.ts`
2. Add the task object with all required fields
3. Ensure inline comments in solutionCode explain each line
4. Add complete translations for RU and UZ including:
   - title, description, hint1, hint2
   - solutionCode with localized comments
   - whyItMatters

## Testing After Adding

After adding/modifying tasks:

```bash
# Reset database and reseed
docker exec practix_postgres psql -U practix_user -d practix_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO practix_user;"

# Rebuild and restart backend
docker compose build backend --no-cache
docker compose up -d

# Wait for seed to complete
docker logs practix-starter-backend-1 --tail 50
```

## Files to Modify

- `server/prisma/seeds/go-concurrency.ts` - Task definitions
- `src/contexts/LanguageContext.tsx` - UI translations (if adding new UI strings)
- `server/prisma/schema.prisma` - Schema (if adding new fields)

## Common Translation Terms

| English | Russian | Uzbek |
|---------|---------|-------|
| Requirements | Требования | Talablar |
| Example | Пример | Misol |
| Constraints | Ограничения | Cheklovlar |
| Hint | Подсказка | Maslahat |
| goroutine | горутина | goroutine |
| channel | канал | kanal |
| context | контекст | context |
| timeout | таймаут | timeout |
| deadline | дедлайн | deadline |
