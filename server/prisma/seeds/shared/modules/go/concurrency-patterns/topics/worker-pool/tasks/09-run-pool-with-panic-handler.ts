import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-workerpool-run-pool-panic-handler',
	title: 'Run Pool With Panic Handler',
	difficulty: 'hard',	tags: ['go', 'concurrency', 'worker-pool', 'panic', 'recovery', 'error-handling'],
	estimatedTime: '40m',	isPremium: false,
	youtubeUrl: '',
	description: `Implement **RunPoolWithPanicHandler** that creates a worker pool with panic recovery, allowing graceful handling of panicking jobs.

**Requirements:**
1. Create function \`RunPoolWithPanicHandler(ctx context.Context, jobs <-chan Job, workers int, handler func(context.Context, int, any)) error\`
2. Handle nil context (return nil)
3. Handle workers <= 0 (set to 1)
4. Handle nil handler (use no-op handler)
5. Create cancellable context for early termination
6. Each worker wraps job execution with defer/recover
7. When panic occurs, call handler with (ctx, workerID, panic value)
8. Continue processing after panic (don't stop worker)
9. Return first error encountered (not panics)
10. Workers should exit gracefully on context cancel or channel close

**Handler Signature:**
\`\`\`go
func(ctx context.Context, workerID int, panicValue any)
\`\`\`

**Example:**
\`\`\`go
jobs := make(chan Job, 5)

go func() {
    jobs <- func(ctx context.Context) error {
        return nil // normal job
    }
    jobs <- func(ctx context.Context) error {
        panic("something went wrong") // panicking job
    }
    jobs <- func(ctx context.Context) error {
        return errors.New("error") // error job
    }
    jobs <- func(ctx context.Context) error {
        return nil // continues after panic
    }
    close(jobs)
}()

var panicCount int
handler := func(ctx context.Context, workerID int, p any) {
    panicCount++
    log.Printf("Worker %d panicked: %v", workerID, p)
}

err := RunPoolWithPanicHandler(ctx, jobs, 2, handler)
// panicCount = 1 (panic was handled)
// err = "error" (first error returned)
// All jobs processed despite panic
\`\`\`

**Constraints:**
- Must use defer/recover pattern for panic handling
- Must continue processing after panic (don't exit worker)
- Must still return first error from non-panicking jobs
- Worker should not stop on panic, only on error`,
	initialCode: `package concurrency

import (
	"context"
	"sync"
)

type Job func(context.Context) error

// TODO: Implement RunPoolWithPanicHandler
func RunPoolWithPanicHandler(ctx context.Context, jobs <-chan Job, workers int, handler func(context.Context, int, any)) error {
	// TODO: Implement
}`,
	testCode: `package concurrency

import (
	"context"
	"errors"
	"sync/atomic"
	"testing"
	"time"
)

func Test1(t *testing.T) {
	err := RunPoolWithPanicHandler(nil, nil, 1, nil)
	if err != nil {
		t.Errorf("expected nil for nil context, got %v", err)
	}
}

func Test2(t *testing.T) {
	jobs := make(chan Job)
	close(jobs)
	err := RunPoolWithPanicHandler(context.Background(), jobs, 1, nil)
	if err != nil {
		t.Errorf("expected nil for closed channel, got %v", err)
	}
}

func Test3(t *testing.T) {
	jobs := make(chan Job, 2)
	jobs <- func(ctx context.Context) error { return nil }
	jobs <- func(ctx context.Context) error { return nil }
	close(jobs)
	err := RunPoolWithPanicHandler(context.Background(), jobs, 2, nil)
	if err != nil {
		t.Errorf("expected nil for successful jobs, got %v", err)
	}
}

func Test4(t *testing.T) {
	jobs := make(chan Job, 1)
	expectedErr := errors.New("test error")
	jobs <- func(ctx context.Context) error { return expectedErr }
	close(jobs)
	err := RunPoolWithPanicHandler(context.Background(), jobs, 1, nil)
	if err != expectedErr {
		t.Errorf("expected %v, got %v", expectedErr, err)
	}
}

func Test5(t *testing.T) {
	jobs := make(chan Job, 2)
	var panicCount atomic.Int32
	jobs <- func(ctx context.Context) error { panic("test panic") }
	jobs <- func(ctx context.Context) error { return nil }
	close(jobs)
	handler := func(ctx context.Context, workerID int, p any) {
		panicCount.Add(1)
	}
	err := RunPoolWithPanicHandler(context.Background(), jobs, 1, handler)
	if err != nil {
		t.Errorf("expected nil (panic handled), got %v", err)
	}
	if panicCount.Load() != 1 {
		t.Errorf("expected 1 panic handled, got %d", panicCount.Load())
	}
}

func Test6(t *testing.T) {
	jobs := make(chan Job, 3)
	var panicCount atomic.Int32
	jobs <- func(ctx context.Context) error { panic("panic 1") }
	jobs <- func(ctx context.Context) error { panic("panic 2") }
	jobs <- func(ctx context.Context) error { return nil }
	close(jobs)
	handler := func(ctx context.Context, workerID int, p any) {
		panicCount.Add(1)
	}
	err := RunPoolWithPanicHandler(context.Background(), jobs, 1, handler)
	if err != nil {
		t.Errorf("expected nil (panics handled), got %v", err)
	}
	if panicCount.Load() != 2 {
		t.Errorf("expected 2 panics handled, got %d", panicCount.Load())
	}
}

func Test7(t *testing.T) {
	jobs := make(chan Job, 1)
	jobs <- func(ctx context.Context) error { return nil }
	close(jobs)
	err := RunPoolWithPanicHandler(context.Background(), jobs, 0, nil)
	if err != nil {
		t.Errorf("expected nil with workers=0, got %v", err)
	}
}

func Test8(t *testing.T) {
	jobs := make(chan Job, 1)
	jobs <- func(ctx context.Context) error { return nil }
	close(jobs)
	err := RunPoolWithPanicHandler(context.Background(), jobs, -5, nil)
	if err != nil {
		t.Errorf("expected nil with negative workers, got %v", err)
	}
}

func Test9(t *testing.T) {
	jobs := make(chan Job, 2)
	var workerIDs []int
	jobs <- func(ctx context.Context) error { panic("test") }
	close(jobs)
	handler := func(ctx context.Context, workerID int, p any) {
		workerIDs = append(workerIDs, workerID)
	}
	RunPoolWithPanicHandler(context.Background(), jobs, 3, handler)
	if len(workerIDs) != 1 {
		t.Errorf("expected 1 panic with worker ID, got %d", len(workerIDs))
	}
	if workerIDs[0] < 0 || workerIDs[0] >= 3 {
		t.Errorf("expected worker ID 0-2, got %d", workerIDs[0])
	}
}

func Test10(t *testing.T) {
	jobs := make(chan Job, 3)
	expectedErr := errors.New("error after panic")
	var panicCount atomic.Int32
	jobs <- func(ctx context.Context) error { panic("panic first") }
	jobs <- func(ctx context.Context) error { return expectedErr }
	jobs <- func(ctx context.Context) error { return nil }
	close(jobs)
	handler := func(ctx context.Context, workerID int, p any) {
		panicCount.Add(1)
	}
	err := RunPoolWithPanicHandler(context.Background(), jobs, 1, handler)
	if panicCount.Load() != 1 {
		t.Errorf("expected 1 panic, got %d", panicCount.Load())
	}
	if err != expectedErr {
		t.Errorf("expected error after panic, got %v", err)
	}
}
`,
	solutionCode: `package concurrency

import (
	"context"
	"sync"
)

type Job func(context.Context) error

func RunPoolWithPanicHandler(ctx context.Context, jobs <-chan Job, workers int, handler func(context.Context, int, any)) error {
	if ctx == nil {                                                 // Handle nil context
		return nil                                              // Return nil for safety
	}
	if workers <= 0 {                                               // Handle invalid workers count
		workers = 1                                             // Set minimum workers
	}
	if handler == nil {                                             // Handle nil handler
		handler = func(context.Context, int, any) {}            // No-op handler
	}
	ctx, cancel := context.WithCancel(ctx)                          // Create cancellable context
	defer cancel()                                                  // Always cancel to free resources
	var (
		wg       sync.WaitGroup                                 // Track all workers
		once     sync.Once                                      // Capture first error only
		firstErr error                                          // Store first error
	)
	worker := func(id int) {                                        // Worker function with ID
		defer wg.Done()                                         // Decrement counter when done
		for {                                                   // Worker loop
			select {                                        // Check context or receive job
			case <-ctx.Done():                              // Context cancelled
				return                                  // Exit worker
			case job, ok := <-jobs:                         // Receive job from channel
				if !ok {                                // Channel closed
					return                          // Exit worker
				}
				if job == nil {                         // Skip nil job
					continue                        // Next iteration
				}
				func() {                                // Panic recovery wrapper
					defer func() {                  // Defer recover
						if r := recover(); r != nil { // Panic occurred
							handler(ctx, id, r) // Call panic handler
						}
					}()
					if err := job(ctx); err != nil { // Execute job
						once.Do(func() {        // Execute once only
							firstErr = err  // Store first error
						})
					}
				}()                                     // Call wrapper immediately
			}
		}
	}
	wg.Add(workers)                                                 // Add all workers to wait group
	for i := 0; i < workers; i++ {                                  // Create workers
		go worker(i)                                            // Launch worker with ID
	}
	wg.Wait()                                                       // Wait for all workers to finish
	if firstErr != nil {                                            // Check if error occurred
		return firstErr                                         // Return first error
	}
	if err := ctx.Err(); err != nil {                               // Check context state
		return err                                              // Return context error
	}
	return nil                                                      // No errors
}`,
			hint1: `Pass worker ID to worker function: worker := func(id int). Wrap job execution in anonymous function with defer/recover pattern.`,
			hint2: `Panic recovery pattern: func() { defer func() { if r := recover(); r != nil { handler(ctx, id, r) } }(); job(ctx) }(). Continue worker loop after panic, only return on error.`,
			whyItMatters: `RunPoolWithPanicHandler provides robustness by preventing panics from crashing the entire worker pool, essential for production systems processing untrusted code.

**Why Panic Handling:**
- **Resilience:** One bad job doesn't kill entire pool
- **Observability:** Track and log panics
- **Debugging:** Identify problematic jobs
- **Continuity:** Service continues despite errors

**Production Pattern:**
\`\`\`go
// Processing user-provided code
func ExecuteUserScripts(ctx context.Context, scripts []Script) error {
    jobs := make(chan Job, len(scripts))

    go func() {
        defer close(jobs)
        for _, script := range scripts {
            s := script
            jobs <- func(ctx context.Context) error {
                // User code might panic
                return executeScript(ctx, s)
            }
        }
    }()

    panicHandler := func(ctx context.Context, workerID int, p any) {
        log.Error().
            Int("worker", workerID).
            Interface("panic", p).
            Msg("Script execution panicked")

        // Send alert
        alerting.SendAlert("Script panic", fmt.Sprintf("Worker %d: %v", workerID, p))

        // Record metrics
        metrics.RecordPanic(workerID, p)
    }

    return RunPoolWithPanicHandler(ctx, jobs, 5, panicHandler)
}

// Plugin system
func LoadPlugins(ctx context.Context, pluginPaths []string) error {
    jobs := make(chan Job, len(pluginPaths))

    go func() {
        defer close(jobs)
        for _, path := range pluginPaths {
            pluginPath := path
            jobs <- func(ctx context.Context) error {
                // Plugin loading might panic
                return loadPlugin(pluginPath)
            }
        }
    }()

    panicHandler := func(ctx context.Context, workerID int, p any) {
        log.Printf("Plugin loading panicked in worker %d: %v", workerID, p)
        // Continue loading other plugins
    }

    return RunPoolWithPanicHandler(ctx, jobs, 3, panicHandler)
}

// Data processing with transformations
func ProcessRecords(ctx context.Context, records []Record) error {
    jobs := make(chan Job, len(records))

    go func() {
        defer close(jobs)
        for _, record := range records {
            r := record
            jobs <- func(ctx context.Context) error {
                // Custom transformations might panic
                return transform(ctx, r)
            }
        }
    }()

    var panicCount atomic.Int32

    panicHandler := func(ctx context.Context, workerID int, p any) {
        count := panicCount.Add(1)
        log.Printf("Transform panic #%d in worker %d: %v", count, workerID, p)

        // If too many panics, consider canceling context
        if count > 100 {
            log.Error("Too many panics, system might be unstable")
        }
    }

    return RunPoolWithPanicHandler(ctx, jobs, 10, panicHandler)
}

// API handler pool
func ProcessAPIRequests(ctx context.Context, requests <-chan Request) error {
    jobs := make(chan Job, 100)

    go func() {
        defer close(jobs)
        for req := range requests {
            r := req
            jobs <- func(ctx context.Context) error {
                // Handler might panic on malformed input
                return handleRequest(ctx, r)
            }
        }
    }()

    panicHandler := func(ctx context.Context, workerID int, p any) {
        // Extract stack trace
        stack := debug.Stack()

        log.Error().
            Int("worker", workerID).
            Interface("panic", p).
            Str("stack", string(stack)).
            Msg("Request handler panicked")

        // Send to error tracking service
        sentry.CaptureException(fmt.Errorf("panic in worker %d: %v", workerID, p))
    }

    return RunPoolWithPanicHandler(ctx, jobs, 20, panicHandler)
}

// Image processing with potentially buggy codecs
func ProcessImages(ctx context.Context, images []Image) error {
    jobs := make(chan Job, len(images))

    go func() {
        defer close(jobs)
        for _, img := range images {
            image := img
            jobs <- func(ctx context.Context) error {
                // Image decoding might panic on corrupt data
                return processImage(ctx, image)
            }
        }
    }()

    var failedImages []string
    var mu sync.Mutex

    panicHandler := func(ctx context.Context, workerID int, p any) {
        mu.Lock()
        defer mu.Unlock()
        // Track failed images for retry or manual review
        if img, ok := getCurrentImage(); ok {
            failedImages = append(failedImages, img.Path)
        }
        log.Printf("Image processing panic: %v", p)
    }

    err := RunPoolWithPanicHandler(ctx, jobs, 4, panicHandler)

    if len(failedImages) > 0 {
        log.Printf("Failed to process %d images: %v", len(failedImages), failedImages)
    }

    return err
}

// Database migration with custom migrations
func RunMigrations(ctx context.Context, migrations []Migration) error {
    jobs := make(chan Job, len(migrations))

    go func() {
        defer close(jobs)
        for _, mig := range migrations {
            migration := mig
            jobs <- func(ctx context.Context) error {
                // Custom migration code might panic
                return migration.Execute(ctx)
            }
        }
    }()

    panicHandler := func(ctx context.Context, workerID int, p any) {
        log.Error().
            Interface("panic", p).
            Msg("Migration panicked - database might be in inconsistent state")

        // Mark migration as failed
        // Trigger rollback
        // Alert DBA
        panic("Critical: migration panicked, manual intervention required")
    }

    return RunPoolWithPanicHandler(ctx, jobs, 1, panicHandler)
}

// Panic statistics collector
type PanicStats struct {
    mu         sync.Mutex
    totalPanics int
    panicsByWorker map[int]int
    panicTypes  map[string]int
}

func (ps *PanicStats) Record(workerID int, p any) {
    ps.mu.Lock()
    defer ps.mu.Unlock()

    ps.totalPanics++
    ps.panicsByWorker[workerID]++

    panicType := fmt.Sprintf("%T", p)
    ps.panicTypes[panicType]++
}

func (ps *PanicStats) Report() {
    ps.mu.Lock()
    defer ps.mu.Unlock()

    log.Printf("Total panics: %d", ps.totalPanics)
    log.Printf("Panics by worker: %v", ps.panicsByWorker)
    log.Printf("Panic types: %v", ps.panicTypes)
}

func ProcessWithStats(ctx context.Context, jobs <-chan Job) error {
    stats := &PanicStats{
        panicsByWorker: make(map[int]int),
        panicTypes:     make(map[string]int),
    }

    handler := func(ctx context.Context, workerID int, p any) {
        stats.Record(workerID, p)
        log.Printf("Worker %d panic: %v", workerID, p)
    }

    err := RunPoolWithPanicHandler(ctx, jobs, 10, handler)
    stats.Report()

    return err
}
\`\`\`

**Real-World Benefits:**
- **Fault Isolation:** One panic doesn't crash everything
- **Continued Service:** Pool keeps processing
- **Observability:** Track panic patterns
- **Debugging:** Get worker ID and panic value

**Panic Recovery Pattern:**
\`\`\`go
func() {
    defer func() {
        if r := recover(); r != nil {
            // Handle panic
            handler(ctx, workerID, r)
        }
    }()
    // Execute potentially panicking code
    job(ctx)
}()
\`\`\`

**Important Considerations:**

1. **Continue Processing:** Worker continues after panic, doesn't exit
2. **Error vs Panic:** Errors are returned, panics are handled
3. **Worker ID:** Helps identify which worker is problematic
4. **Handler Safety:** Handler itself should not panic

**When to Use:**
- Processing untrusted user code
- Plugin systems
- Custom transformations
- Third-party library integration
- Any code that might panic

**Common Panic Scenarios:**
- Nil pointer dereference
- Index out of bounds
- Type assertion failures
- Division by zero
- Explicit panic() calls

**Monitoring Strategy:**
\`\`\`go
handler := func(ctx context.Context, workerID int, p any) {
    // 1. Log with full context
    log.Error("Panic", "worker", workerID, "panic", p, "stack", debug.Stack())

    // 2. Send to error tracking
    sentry.CaptureException(...)

    // 3. Update metrics
    panicCounter.Inc()

    // 4. Alert if threshold exceeded
    if panicRate.TooHigh() {
        alerting.Send("High panic rate")
    }
}
\`\`\`

This pattern is critical for building robust production systems that can handle unexpected failures gracefully.`,	order: 8,
	translations: {
		ru: {
			title: 'Пул воркеров с обработкой паник',
			description: `Реализуйте **RunPoolWithPanicHandler**, который создаёт пул воркеров с восстановлением после паник, позволяя gracefully обрабатывать паникующие задачи.

**Требования:**
1. Создайте функцию \`RunPoolWithPanicHandler(ctx context.Context, jobs <-chan Job, workers int, handler func(context.Context, int, any)) error\`
2. Обработайте nil context (верните nil)
3. Обработайте workers <= 0 (установите в 1)
4. Обработайте nil handler (используйте no-op handler)
5. Создайте отменяемый контекст для раннего завершения
6. Каждый воркер оборачивает выполнение задачи в defer/recover
7. При панике вызовите handler с (ctx, workerID, значение паники)
8. Продолжайте обработку после паники (не останавливайте воркер)
9. Верните первую встреченную ошибку (не паники)
10. Воркеры должны корректно выходить при отмене контекста или закрытии канала

**Сигнатура обработчика:**
\`\`\`go
func(ctx context.Context, workerID int, panicValue any)
\`\`\`

**Пример:**
\`\`\`go
jobs := make(chan Job, 5)

go func() {
    jobs <- func(ctx context.Context) error {
        return nil // обычная задача
    }
    jobs <- func(ctx context.Context) error {
        panic("something went wrong") // паникующая задача
    }
    jobs <- func(ctx context.Context) error {
        return errors.New("error") // задача с ошибкой
    }
    jobs <- func(ctx context.Context) error {
        return nil // продолжается после паники
    }
    close(jobs)
}()

var panicCount int
handler := func(ctx context.Context, workerID int, p any) {
    panicCount++
    log.Printf("Worker %d panicked: %v", workerID, p)
}

err := RunPoolWithPanicHandler(ctx, jobs, 2, handler)
// panicCount = 1 (паника обработана)
// err = "error" (первая ошибка возвращена)
// Все задачи обработаны несмотря на панику
`,
			hint1: `Передайте ID воркера в функцию воркера: worker := func(id int). Оберните выполнение задачи в анонимную функцию с паттерном defer/recover.`,
			hint2: `Паттерн восстановления паники: func() { defer func() { if r := recover(); r != nil { handler(ctx, id, r) } }(); job(ctx) }(). Продолжайте цикл воркера после паники, возвращайтесь только при ошибке.`,
			whyItMatters: `RunPoolWithPanicHandler обеспечивает устойчивость предотвращая крах всего пула воркеров из-за паник, критически важен для production систем обрабатывающих ненадёжный или пользовательский код.

**Почему обработка паник:**
- **Устойчивость:** Одна паникующая задача не убивает весь пул воркеров
- **Наблюдаемость:** Отслеживание паттернов паник и логирование
- **Отладка:** Идентификация проблемных задач с ID воркера
- **Непрерывность:** Сервис продолжает работу несмотря на ошибки
- **Изоляция сбоев:** Паника локализована в одной задаче

**Продакшен паттерн:**
\`\`\`go
// Обработка пользовательских скриптов
func ExecuteUserScripts(ctx context.Context, scripts []Script) error {
    jobs := make(chan Job, len(scripts))

    go func() {
        defer close(jobs)
        for _, script := range scripts {
            s := script
            jobs <- func(ctx context.Context) error {
                // Пользовательский код может паниковать
                return executeScript(ctx, s)
            }
        }
    }()

    panicHandler := func(ctx context.Context, workerID int, p any) {
        log.Error().
            Int("worker", workerID).
            Interface("panic", p).
            Msg("Выполнение скрипта запаниковало")

        // Отправка оповещения
        alerting.SendAlert("Script panic", fmt.Sprintf("Worker %d: %v", workerID, p))

        // Запись метрик
        metrics.RecordPanic(workerID, p)
    }

    return RunPoolWithPanicHandler(ctx, jobs, 5, panicHandler)
}

// Система плагинов
func LoadPlugins(ctx context.Context, pluginPaths []string) error {
    jobs := make(chan Job, len(pluginPaths))

    go func() {
        defer close(jobs)
        for _, path := range pluginPaths {
            pluginPath := path
            jobs <- func(ctx context.Context) error {
                // Загрузка плагинов может паниковать
                return loadPlugin(pluginPath)
            }
        }
    }()

    panicHandler := func(ctx context.Context, workerID int, p any) {
        log.Printf("Загрузка плагина запаниковала в воркере %d: %v", workerID, p)
        // Продолжить загрузку других плагинов
    }

    return RunPoolWithPanicHandler(ctx, jobs, 3, panicHandler)
}

// Обработка данных с трансформациями
func ProcessRecords(ctx context.Context, records []Record) error {
    jobs := make(chan Job, len(records))

    go func() {
        defer close(jobs)
        for _, record := range records {
            r := record
            jobs <- func(ctx context.Context) error {
                // Кастомные трансформации могут паниковать
                return transform(ctx, r)
            }
        }
    }()

    var panicCount atomic.Int32

    panicHandler := func(ctx context.Context, workerID int, p any) {
        count := panicCount.Add(1)
        log.Printf("Паника трансформации #%d в воркере %d: %v", count, workerID, p)

        // Если слишком много паник, рассмотреть отмену контекста
        if count > 100 {
            log.Error("Слишком много паник, система может быть нестабильна")
        }
    }

    return RunPoolWithPanicHandler(ctx, jobs, 10, panicHandler)
}

// Пул обработчиков API
func ProcessAPIRequests(ctx context.Context, requests <-chan Request) error {
    jobs := make(chan Job, 100)

    go func() {
        defer close(jobs)
        for req := range requests {
            r := req
            jobs <- func(ctx context.Context) error {
                // Обработчик может паниковать на неверных данных
                return handleRequest(ctx, r)
            }
        }
    }()

    panicHandler := func(ctx context.Context, workerID int, p any) {
        // Извлечение stack trace
        stack := debug.Stack()

        log.Error().
            Int("worker", workerID).
            Interface("panic", p).
            Str("stack", string(stack)).
            Msg("Обработчик запроса запаниковал")

        // Отправка в сервис отслеживания ошибок
        sentry.CaptureException(fmt.Errorf("panic in worker %d: %v", workerID, p))
    }

    return RunPoolWithPanicHandler(ctx, jobs, 20, panicHandler)
}

// Обработка изображений с потенциально баговыми кодеками
func ProcessImages(ctx context.Context, images []Image) error {
    jobs := make(chan Job, len(images))

    go func() {
        defer close(jobs)
        for _, img := range images {
            image := img
            jobs <- func(ctx context.Context) error {
                // Декодирование изображения может паниковать на повреждённых данных
                return processImage(ctx, image)
            }
        }
    }()

    var failedImages []string
    var mu sync.Mutex

    panicHandler := func(ctx context.Context, workerID int, p any) {
        mu.Lock()
        defer mu.Unlock()
        // Отслеживание неудачных изображений для повтора или ручной проверки
        if img, ok := getCurrentImage(); ok {
            failedImages = append(failedImages, img.Path)
        }
        log.Printf("Паника обработки изображения: %v", p)
    }

    err := RunPoolWithPanicHandler(ctx, jobs, 4, panicHandler)

    if len(failedImages) > 0 {
        log.Printf("Не удалось обработать %d изображений: %v", len(failedImages), failedImages)
    }

    return err
}

// Миграция БД с кастомными миграциями
func RunMigrations(ctx context.Context, migrations []Migration) error {
    jobs := make(chan Job, len(migrations))

    go func() {
        defer close(jobs)
        for _, mig := range migrations {
            migration := mig
            jobs <- func(ctx context.Context) error {
                // Кастомный код миграции может паниковать
                return migration.Execute(ctx)
            }
        }
    }()

    panicHandler := func(ctx context.Context, workerID int, p any) {
        log.Error().
            Interface("panic", p).
            Msg("Миграция запаниковала - БД может быть в несогласованном состоянии")

        // Пометить миграцию как неудачную
        // Запустить откат
        // Оповестить DBA
        panic("Критично: миграция запаниковала, требуется ручное вмешательство")
    }

    return RunPoolWithPanicHandler(ctx, jobs, 1, panicHandler)
}

// Сборщик статистики паник
type PanicStats struct {
    mu             sync.Mutex
    totalPanics    int
    panicsByWorker map[int]int
    panicTypes     map[string]int
}

func (ps *PanicStats) Record(workerID int, p any) {
    ps.mu.Lock()
    defer ps.mu.Unlock()

    ps.totalPanics++
    ps.panicsByWorker[workerID]++

    panicType := fmt.Sprintf("%T", p)
    ps.panicTypes[panicType]++
}

func (ps *PanicStats) Report() {
    ps.mu.Lock()
    defer ps.mu.Unlock()

    log.Printf("Всего паник: %d", ps.totalPanics)
    log.Printf("Паники по воркерам: %v", ps.panicsByWorker)
    log.Printf("Типы паник: %v", ps.panicTypes)
}

func ProcessWithStats(ctx context.Context, jobs <-chan Job) error {
    stats := &PanicStats{
        panicsByWorker: make(map[int]int),
        panicTypes:     make(map[string]int),
    }

    handler := func(ctx context.Context, workerID int, p any) {
        stats.Record(workerID, p)
        log.Printf("Паника воркера %d: %v", workerID, p)
    }

    err := RunPoolWithPanicHandler(ctx, jobs, 10, handler)
    stats.Report()

    return err
}
\`\`\`

**Практические преимущества:**
- **Изоляция сбоев:** Одна паника не роняет всё
- **Продолжение сервиса:** Пул продолжает обработку
- **Наблюдаемость:** Отслеживание паттернов паник
- **Отладка:** Получение ID воркера и значения паники
- **Мониторинг:** Сбор метрик по паникам

**Паттерн восстановления паники:**
\`\`\`go
func() {
    defer func() {
        if r := recover(); r != nil {
            // Обработка паники
            handler(ctx, workerID, r)
        }
    }()
    // Выполнение потенциально паникующего кода
    job(ctx)
}()
\`\`\`

**Важные соображения:**

1. **Продолжение обработки:** Воркер продолжает после паники, не выходит
2. **Ошибка vs Паника:** Ошибки возвращаются, паники обрабатываются
3. **ID воркера:** Помогает идентифицировать проблемный воркер
4. **Безопасность обработчика:** Сам обработчик не должен паниковать

**Когда использовать:**
- Обработка ненадёжного пользовательского кода
- Системы плагинов
- Кастомные трансформации данных
- Интеграция с библиотеками третьих сторон
- Любой код который может паниковать

**Типичные сценарии паник:**
- Разыменование nil указателя
- Индекс вне границ массива
- Неудачное приведение типов
- Деление на ноль
- Явные вызовы panic()

**Стратегия мониторинга:**
\`\`\`go
handler := func(ctx context.Context, workerID int, p any) {
    // 1. Логирование с полным контекстом
    log.Error("Panic", "worker", workerID, "panic", p, "stack", debug.Stack())

    // 2. Отправка в отслеживание ошибок
    sentry.CaptureException(...)

    // 3. Обновление метрик
    panicCounter.Inc()

    // 4. Оповещение при превышении порога
    if panicRate.TooHigh() {
        alerting.Send("Высокий уровень паник")
    }
}
\`\`\`

Этот паттерн критически важен для построения устойчивых production систем способных gracefully обрабатывать неожиданные сбои.`,
			solutionCode: `package concurrency

import (
	"context"
	"sync"
)

type Job func(context.Context) error

func RunPoolWithPanicHandler(ctx context.Context, jobs <-chan Job, workers int, handler func(context.Context, int, any)) error {
	if ctx == nil {                                                 // Обработка nil контекста
		return nil                                              // Возврат nil для безопасности
	}
	if workers <= 0 {                                               // Обработка неверного количества воркеров
		workers = 1                                             // Установка минимального количества воркеров
	}
	if handler == nil {                                             // Обработка nil обработчика
		handler = func(context.Context, int, any) {}            // No-op обработчик
	}
	ctx, cancel := context.WithCancel(ctx)                          // Создание отменяемого контекста
	defer cancel()                                                  // Всегда отменять для освобождения ресурсов
	var (
		wg       sync.WaitGroup                                 // Отслеживание всех воркеров
		once     sync.Once                                      // Захват только первой ошибки
		firstErr error                                          // Хранение первой ошибки
	)
	worker := func(id int) {                                        // Функция воркера с ID
		defer wg.Done()                                         // Уменьшение счётчика при завершении
		for {                                                   // Цикл воркера
			select {                                        // Проверка контекста или получение задачи
			case <-ctx.Done():                              // Контекст отменён
				return                                  // Выход из воркера
			case job, ok := <-jobs:                         // Получение задачи из канала
				if !ok {                                // Канал закрыт
					return                          // Выход из воркера
				}
				if job == nil {                         // Пропуск nil задачи
					continue                        // Следующая итерация
				}
				func() {                                // Обёртка для восстановления паники
					defer func() {                  // Defer recover
						if r := recover(); r != nil { // Произошла паника
							handler(ctx, id, r) // Вызов обработчика паники
						}
					}()
					if err := job(ctx); err != nil { // Выполнение задачи
						once.Do(func() {        // Выполнить только один раз
							firstErr = err  // Сохранить первую ошибку
						})
					}
				}()                                     // Немедленный вызов обёртки
			}
		}
	}
	wg.Add(workers)                                                 // Добавление всех воркеров в wait group
	for i := 0; i < workers; i++ {                                  // Создание воркеров
		go worker(i)                                            // Запуск воркера с ID
	}
	wg.Wait()                                                       // Ожидание завершения всех воркеров
	if firstErr != nil {                                            // Проверка возникновения ошибки
		return firstErr                                         // Возврат первой ошибки
	}
	if err := ctx.Err(); err != nil {                               // Проверка состояния контекста
		return err                                              // Возврат ошибки контекста
	}
	return nil                                                      // Без ошибок
}`
		},
		uz: {
			title: 'Paniklarni qayta ishlaydigan worker puli',
			description: `Panikdan keyingi tiklash bilan worker pulini yaratadigan, panikaga tushgan vazifalarni yaxshi boshqarishga imkon beradigan **RunPoolWithPanicHandler** ni amalga oshiring.

**Talablar:**
1. \`RunPoolWithPanicHandler(ctx context.Context, jobs <-chan Job, workers int, handler func(context.Context, int, any)) error\` funksiyasini yarating
2. nil kontekstni ishlang (nil qaytaring)
3. workers <= 0 ni ishlang (1 ga o'rnating)
4. nil handlerni ishlang (no-op handlerdan foydalaning)
5. Erta tugatish uchun bekor qilinadigan kontekst yarating
6. Har bir worker vazifani bajarishni defer/recover bilan o'raydi
7. Panika yuz berganda handlerni (ctx, workerID, panika qiymati) bilan chaqiring
8. Panikadan keyin qayta ishlashni davom ettiring (workerni to'xtatmang)
9. Duch kelgan birinchi xatoni qaytaring (panikalar emas)
10. Workerlar kontekst bekor qilinganda yoki kanal yopilganda to'g'ri chiqishlari kerak

**Handler imzosi:**
\`\`\`go
func(ctx context.Context, workerID int, panicValue any)
\`\`\`

**Misol:**
\`\`\`go
jobs := make(chan Job, 5)

go func() {
    jobs <- func(ctx context.Context) error {
        return nil // oddiy vazifa
    }
    jobs <- func(ctx context.Context) error {
        panic("something went wrong") // panikaga tushgan vazifa
    }
    jobs <- func(ctx context.Context) error {
        return errors.New("error") // xatoli vazifa
    }
    jobs <- func(ctx context.Context) error {
        return nil // panikadan keyin davom etadi
    }
    close(jobs)
}()

var panicCount int
handler := func(ctx context.Context, workerID int, p any) {
    panicCount++
    log.Printf("Worker %d panicked: %v", workerID, p)
}

err := RunPoolWithPanicHandler(ctx, jobs, 2, handler)
// panicCount = 1 (panika boshqarildi)
// err = "error" (birinchi xato qaytarildi)
// Panikaga qaramay barcha vazifalar qayta ishlandi
`,
			hint1: `Worker ID ni worker funksiyasiga o'tkazing: worker := func(id int). Vazifani bajarishni defer/recover patterni bilan anonim funksiyaga o'rang.`,
			hint2: `Panikani tiklash patterni: func() { defer func() { if r := recover(); r != nil { handler(ctx, id, r) } }(); job(ctx) }(). Panikadan keyin worker tsiklini davom ettiring, faqat xatoda qaytaring.`,
			whyItMatters: `RunPoolWithPanicHandler panikalarning butun worker pulini buzishining oldini olib chidamlilikni ta'minlaydi, ishonchsiz yoki foydalanuvchi kodini qayta ishlaydigan production tizimlar uchun juda muhim.

**Nima uchun panikalarni boshqarish:**
- **Chidamlilik:** Bitta panikayadigan vazifa butun worker pulini o'ldirmaydi
- **Kuzatish:** Panika patternlarini kuzatish va jurnalga yozish
- **Tuzatish:** Worker ID bilan muammoli vazifalarni aniqlash
- **Uzluksizlik:** Xatolarga qaramay xizmat davom etadi
- **Nosozlikni ajratish:** Panika bitta vazifada lokalizatsiya qilingan

**Ishlab chiqarish patterni:**
\`\`\`go
// Foydalanuvchi skriptlarini qayta ishlash
func ExecuteUserScripts(ctx context.Context, scripts []Script) error {
    jobs := make(chan Job, len(scripts))

    go func() {
        defer close(jobs)
        for _, script := range scripts {
            s := script
            jobs <- func(ctx context.Context) error {
                // Foydalanuvchi kodi panikaga tushishi mumkin
                return executeScript(ctx, s)
            }
        }
    }()

    panicHandler := func(ctx context.Context, workerID int, p any) {
        log.Error().
            Int("worker", workerID).
            Interface("panic", p).
            Msg("Skript bajarish panikaga tushdi")

        // Ogohlantirish yuborish
        alerting.SendAlert("Script panic", fmt.Sprintf("Worker %d: %v", workerID, p))

        // Metrikalarni yozish
        metrics.RecordPanic(workerID, p)
    }

    return RunPoolWithPanicHandler(ctx, jobs, 5, panicHandler)
}

// Plugin tizimi
func LoadPlugins(ctx context.Context, pluginPaths []string) error {
    jobs := make(chan Job, len(pluginPaths))

    go func() {
        defer close(jobs)
        for _, path := range pluginPaths {
            pluginPath := path
            jobs <- func(ctx context.Context) error {
                // Plugin yuklash panikaga tushishi mumkin
                return loadPlugin(pluginPath)
            }
        }
    }()

    panicHandler := func(ctx context.Context, workerID int, p any) {
        log.Printf("Plugin yuklash %d workerda panikaga tushdi: %v", workerID, p)
        // Boshqa pluginlarni yuklashni davom ettirish
    }

    return RunPoolWithPanicHandler(ctx, jobs, 3, panicHandler)
}

// Transformatsiyalar bilan ma'lumotlarni qayta ishlash
func ProcessRecords(ctx context.Context, records []Record) error {
    jobs := make(chan Job, len(records))

    go func() {
        defer close(jobs)
        for _, record := range records {
            r := record
            jobs <- func(ctx context.Context) error {
                // Maxsus transformatsiyalar panikaga tushishi mumkin
                return transform(ctx, r)
            }
        }
    }()

    var panicCount atomic.Int32

    panicHandler := func(ctx context.Context, workerID int, p any) {
        count := panicCount.Add(1)
        log.Printf("Transformatsiya panikasi #%d %d workerda: %v", count, workerID, p)

        // Agar juda ko'p panikalar bo'lsa, kontekstni bekor qilishni ko'rib chiqish
        if count > 100 {
            log.Error("Juda ko'p panikalar, tizim barqaror bo'lmasligi mumkin")
        }
    }

    return RunPoolWithPanicHandler(ctx, jobs, 10, panicHandler)
}

// API handlerlar puli
func ProcessAPIRequests(ctx context.Context, requests <-chan Request) error {
    jobs := make(chan Job, 100)

    go func() {
        defer close(jobs)
        for req := range requests {
            r := req
            jobs <- func(ctx context.Context) error {
                // Handler noto'g'ri ma'lumotlarda panikaga tushishi mumkin
                return handleRequest(ctx, r)
            }
        }
    }()

    panicHandler := func(ctx context.Context, workerID int, p any) {
        // Stack trace ni olish
        stack := debug.Stack()

        log.Error().
            Int("worker", workerID).
            Interface("panic", p).
            Str("stack", string(stack)).
            Msg("So'rov handleri panikaga tushdi")

        // Xatolarni kuzatish xizmatiga yuborish
        sentry.CaptureException(fmt.Errorf("panic in worker %d: %v", workerID, p))
    }

    return RunPoolWithPanicHandler(ctx, jobs, 20, panicHandler)
}

// Potentsial xatoli kodeklar bilan rasmlarni qayta ishlash
func ProcessImages(ctx context.Context, images []Image) error {
    jobs := make(chan Job, len(images))

    go func() {
        defer close(jobs)
        for _, img := range images {
            image := img
            jobs <- func(ctx context.Context) error {
                // Rasm depractixsh buzilgan ma'lumotlarda panikaga tushishi mumkin
                return processImage(ctx, image)
            }
        }
    }()

    var failedImages []string
    var mu sync.Mutex

    panicHandler := func(ctx context.Context, workerID int, p any) {
        mu.Lock()
        defer mu.Unlock()
        // Qayta urinish yoki qo'lda tekshirish uchun muvaffaqiyatsiz rasmlarni kuzatish
        if img, ok := getCurrentImage(); ok {
            failedImages = append(failedImages, img.Path)
        }
        log.Printf("Rasmni qayta ishlash panikasi: %v", p)
    }

    err := RunPoolWithPanicHandler(ctx, jobs, 4, panicHandler)

    if len(failedImages) > 0 {
        log.Printf("%d rasmni qayta ishlab bo'lmadi: %v", len(failedImages), failedImages)
    }

    return err
}

// Maxsus migratsiyalar bilan DB migratsiyasi
func RunMigrations(ctx context.Context, migrations []Migration) error {
    jobs := make(chan Job, len(migrations))

    go func() {
        defer close(jobs)
        for _, mig := range migrations {
            migration := mig
            jobs <- func(ctx context.Context) error {
                // Maxsus migratsiya kodi panikaga tushishi mumkin
                return migration.Execute(ctx)
            }
        }
    }()

    panicHandler := func(ctx context.Context, workerID int, p any) {
        log.Error().
            Interface("panic", p).
            Msg("Migratsiya panikaga tushdi - DB nomuvofiq holatda bo'lishi mumkin")

        // Migratsiyani muvaffaqiyatsiz deb belgilash
        // Orqaga qaytishni boshlash
        // DBA ga xabar berish
        panic("Kritik: migratsiya panikaga tushdi, qo'lda aralashuv talab qilinadi")
    }

    return RunPoolWithPanicHandler(ctx, jobs, 1, panicHandler)
}

// Panika statistikasini to'plovchi
type PanicStats struct {
    mu             sync.Mutex
    totalPanics    int
    panicsByWorker map[int]int
    panicTypes     map[string]int
}

func (ps *PanicStats) Record(workerID int, p any) {
    ps.mu.Lock()
    defer ps.mu.Unlock()

    ps.totalPanics++
    ps.panicsByWorker[workerID]++

    panicType := fmt.Sprintf("%T", p)
    ps.panicTypes[panicType]++
}

func (ps *PanicStats) Report() {
    ps.mu.Lock()
    defer ps.mu.Unlock()

    log.Printf("Jami panikalar: %d", ps.totalPanics)
    log.Printf("Workerlar bo'yicha panikalar: %v", ps.panicsByWorker)
    log.Printf("Panika turlari: %v", ps.panicTypes)
}

func ProcessWithStats(ctx context.Context, jobs <-chan Job) error {
    stats := &PanicStats{
        panicsByWorker: make(map[int]int),
        panicTypes:     make(map[string]int),
    }

    handler := func(ctx context.Context, workerID int, p any) {
        stats.Record(workerID, p)
        log.Printf("Worker %d panikasi: %v", workerID, p)
    }

    err := RunPoolWithPanicHandler(ctx, jobs, 10, handler)
    stats.Report()

    return err
}
\`\`\`

**Amaliy afzalliklar:**
- **Nosozlikni ajratish:** Bitta panika hamma narsani buzmayd
- **Xizmat davom etishi:** Pul qayta ishlashni davom ettiradi
- **Kuzatish:** Panika patternlarini kuzatish
- **Tuzatish:** Worker ID va panika qiymatini olish
- **Monitoring:** Panikalar bo'yicha metrikalarni to'plash

**Panikani tiklash patterni:**
\`\`\`go
func() {
    defer func() {
        if r := recover(); r != nil {
            // Panikani boshqarish
            handler(ctx, workerID, r)
        }
    }()
    // Potentsial panikaga tushadigan kodni bajarish
    job(ctx)
}()
\`\`\`

**Muhim fikrlar:**

1. **Qayta ishlashni davom ettirish:** Worker panikadan keyin davom etadi, chiqmaydi
2. **Xato vs Panika:** Xatolar qaytariladi, panikalar boshqariladi
3. **Worker ID:** Muammoli workerni aniqlashga yordam beradi
4. **Handler xavfsizligi:** Handlerning o'zi panikaga tushmasligi kerak

**Qachon ishlatish:**
- Ishonchsiz foydalanuvchi kodini qayta ishlash
- Plugin tizimlari
- Maxsus ma'lumotlar transformatsiyalari
- Uchinchi tomon kutubxonalari bilan integratsiya
- Panikaga tushishi mumkin bo'lgan har qanday kod

**Odatiy panika stsenariylari:**
- nil ko'rsatkichni dereferenslash
- Massiv chegarasidan tashqari indeks
- Muvaffaqiyatsiz tip tasdiqlamalari
- Nolga bo'lish
- Aniq panic() chaqiruvlari

**Monitoring strategiyasi:**
\`\`\`go
handler := func(ctx context.Context, workerID int, p any) {
    // 1. To'liq kontekst bilan jurnalga yozish
    log.Error("Panic", "worker", workerID, "panic", p, "stack", debug.Stack())

    // 2. Xatolarni kuzatishga yuborish
    sentry.CaptureException(...)

    // 3. Metrikalarni yangilash
    panicCounter.Inc()

    // 4. Chegara oshirilganda ogohlantirish
    if panicRate.TooHigh() {
        alerting.Send("Yuqori panika darajasi")
    }
}
\`\`\`

Bu pattern kutilmagan nosozliklarni yaxshi boshqarishga qodir chidamli production tizimlarini qurish uchun juda muhim.`,
			solutionCode: `package concurrency

import (
	"context"
	"sync"
)

type Job func(context.Context) error

func RunPoolWithPanicHandler(ctx context.Context, jobs <-chan Job, workers int, handler func(context.Context, int, any)) error {
	if ctx == nil {                                                 // nil kontekstni ishlash
		return nil                                              // Xavfsizlik uchun nil qaytarish
	}
	if workers <= 0 {                                               // Noto'g'ri workerlar sonini ishlash
		workers = 1                                             // Minimal workerlar sonini o'rnatish
	}
	if handler == nil {                                             // nil handlerni ishlash
		handler = func(context.Context, int, any) {}            // No-op handler
	}
	ctx, cancel := context.WithCancel(ctx)                          // Bekor qilinadigan kontekst yaratish
	defer cancel()                                                  // Resurslarni ozod qilish uchun doim bekor qilish
	var (
		wg       sync.WaitGroup                                 // Barcha workerlarni kuzatish
		once     sync.Once                                      // Faqat birinchi xatoni ushlash
		firstErr error                                          // Birinchi xatoni saqlash
	)
	worker := func(id int) {                                        // ID bilan worker funksiyasi
		defer wg.Done()                                         // Tugaganda hisoblagichni kamaytirish
		for {                                                   // Worker tsikli
			select {                                        // Kontekstni tekshirish yoki vazifani qabul qilish
			case <-ctx.Done():                              // Kontekst bekor qilindi
				return                                  // Workerdan chiqish
			case job, ok := <-jobs:                         // Kanaldan vazifani qabul qilish
				if !ok {                                // Kanal yopildi
					return                          // Workerdan chiqish
				}
				if job == nil {                         // nil vazifani o'tkazib yuborish
					continue                        // Keyingi iteratsiya
				}
				func() {                                // Panikani tiklash uchun o'rash
					defer func() {                  // Defer recover
						if r := recover(); r != nil { // Panika yuz berdi
							handler(ctx, id, r) // Panika handlerini chaqirish
						}
					}()
					if err := job(ctx); err != nil { // Vazifani bajarish
						once.Do(func() {        // Faqat bir marta bajarish
							firstErr = err  // Birinchi xatoni saqlash
						})
					}
				}()                                     // O'rashni darhol chaqirish
			}
		}
	}
	wg.Add(workers)                                                 // Barcha workerlarni wait groupga qo'shish
	for i := 0; i < workers; i++ {                                  // Workerlarni yaratish
		go worker(i)                                            // Workerni ID bilan ishga tushirish
	}
	wg.Wait()                                                       // Barcha workerlar tugashini kutish
	if firstErr != nil {                                            // Xato yuz berganligini tekshirish
		return firstErr                                         // Birinchi xatoni qaytarish
	}
	if err := ctx.Err(); err != nil {                               // Kontekst holatini tekshirish
		return err                                              // Kontekst xatosini qaytarish
	}
	return nil                                                      // Xatolar yo'q
}`
		}
	}
};

export default task;
