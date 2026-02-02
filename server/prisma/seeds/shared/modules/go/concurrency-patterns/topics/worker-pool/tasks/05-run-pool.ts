import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-workerpool-run-pool',
	title: 'Run Pool',
	difficulty: 'medium',	tags: ['go', 'concurrency', 'worker-pool', 'channels'],
	estimatedTime: '30m',	isPremium: false,
	youtubeUrl: '',
	description: `Implement **RunPool** that creates a fixed pool of workers that consume jobs from a channel.

**Requirements:**
1. Create function \`RunPool(ctx context.Context, jobs <-chan Job, workers int) error\`
2. Handle nil context (return nil)
3. Handle workers <= 0 (set to 1)
4. Create fixed number of worker goroutines
5. Each worker reads jobs from channel until channel closes or context cancels
6. Skip nil jobs
7. Return first error encountered (use sync.Once)
8. Wait for all workers to finish using sync.WaitGroup

**Worker Pattern:**
Each worker should:
- Loop reading from jobs channel
- Exit when channel closes
- Exit when context is cancelled
- Execute non-nil jobs
- Record errors

**Example:**
\`\`\`go
jobs := make(chan Job, 10)

// Send jobs to channel
go func() {
    for i := 0; i < 5; i++ {
        num := i
        jobs <- func(ctx context.Context) error {
            fmt.Printf("Processing job %d\\n", num)
            return nil
        }
    }
    close(jobs) // Close when done sending
}()

// Create pool with 3 workers
err := RunPool(ctx, jobs, 3)
// 3 workers process jobs concurrently from channel
\`\`\`

**Constraints:**
- Must create exactly \`workers\` goroutines
- Must read from jobs channel until closed or cancelled
- Must use sync.WaitGroup to track workers
- Workers must exit cleanly when channel closes or context cancels`,
	initialCode: `package concurrency

import (
	"context"
	"sync"
)

type Job func(context.Context) error

// TODO: Implement RunPool
func RunPool($2) error {
	return nil // TODO: Implement
}`,
	solutionCode: `package concurrency

import (
	"context"
	"sync"
)

type Job func(context.Context) error

func RunPool(ctx context.Context, jobs <-chan Job, workers int) error {
	if ctx == nil {                                                 // Handle nil context
		return nil                                              // Return nil for safety
	}
	if workers <= 0 {                                               // Handle invalid workers count
		workers = 1                                             // Set minimum workers
	}
	var (
		wg       sync.WaitGroup                                 // Track all workers
		once     sync.Once                                      // Capture first error only
		firstErr error                                          // Store first error
	)
	recordErr := func(err error) {                                  // Helper to record error
		if err != nil {                                         // Only if error exists
			once.Do(func() { firstErr = err })              // Set first error once
		}
	}
	worker := func() {                                              // Worker function
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
				if err := job(ctx); err != nil {        // Execute job
					recordErr(err)                  // Record error
				}
			}
		}
	}
	wg.Add(workers)                                                 // Add all workers to wait group
	for i := 0; i < workers; i++ {                                  // Create workers
		go worker()                                             // Launch worker goroutine
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
	testCode: `package concurrency

import (
	"context"
	"errors"
	"sync/atomic"
	"testing"
	"time"
)

func TestRunPool1(t *testing.T) {
	// Test basic worker pool execution
	ctx := context.Background()
	jobs := make(chan Job, 10)
	var counter int32

	for i := 0; i < 10; i++ {
		jobs <- func(ctx context.Context) error {
			atomic.AddInt32(&counter, 1)
			return nil
		}
	}
	close(jobs)

	err := RunPool(ctx, jobs, 3)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if counter != 10 {
		t.Errorf("expected 10 jobs executed, got %d", counter)
	}
}

func TestRunPool2(t *testing.T) {
	// Test with single worker
	ctx := context.Background()
	jobs := make(chan Job, 5)
	var counter int32

	for i := 0; i < 5; i++ {
		jobs <- func(ctx context.Context) error {
			atomic.AddInt32(&counter, 1)
			return nil
		}
	}
	close(jobs)

	err := RunPool(ctx, jobs, 1)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if counter != 5 {
		t.Errorf("expected 5 jobs executed, got %d", counter)
	}
}

func TestRunPool3(t *testing.T) {
	// Test with job error
	ctx := context.Background()
	jobs := make(chan Job, 3)
	expectedErr := errors.New("job failed")

	jobs <- func(ctx context.Context) error {
		return nil
	}
	jobs <- func(ctx context.Context) error {
		return expectedErr
	}
	jobs <- func(ctx context.Context) error {
		return nil
	}
	close(jobs)

	err := RunPool(ctx, jobs, 2)
	if err != expectedErr {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestRunPool4(t *testing.T) {
	// Test with zero workers (should use 1)
	ctx := context.Background()
	jobs := make(chan Job, 2)
	var counter int32

	jobs <- func(ctx context.Context) error {
		atomic.AddInt32(&counter, 1)
		return nil
	}
	jobs <- func(ctx context.Context) error {
		atomic.AddInt32(&counter, 1)
		return nil
	}
	close(jobs)

	err := RunPool(ctx, jobs, 0)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if counter != 2 {
		t.Errorf("expected 2 jobs executed, got %d", counter)
	}
}

func TestRunPool5(t *testing.T) {
	// Test with negative workers (should use 1)
	ctx := context.Background()
	jobs := make(chan Job, 2)
	var counter int32

	jobs <- func(ctx context.Context) error {
		atomic.AddInt32(&counter, 1)
		return nil
	}
	close(jobs)

	err := RunPool(ctx, jobs, -3)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if counter != 1 {
		t.Errorf("expected 1 job executed, got %d", counter)
	}
}

func TestRunPool6(t *testing.T) {
	// Test with nil jobs (should skip)
	ctx := context.Background()
	jobs := make(chan Job, 3)
	var counter int32

	jobs <- func(ctx context.Context) error {
		atomic.AddInt32(&counter, 1)
		return nil
	}
	jobs <- nil
	jobs <- func(ctx context.Context) error {
		atomic.AddInt32(&counter, 1)
		return nil
	}
	close(jobs)

	err := RunPool(ctx, jobs, 2)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if counter != 2 {
		t.Errorf("expected 2 jobs executed (nil skipped), got %d", counter)
	}
}

func TestRunPool7(t *testing.T) {
	// Test with nil context
	jobs := make(chan Job, 1)
	jobs <- func(ctx context.Context) error {
		return nil
	}
	close(jobs)

	err := RunPool(nil, jobs, 2)
	if err != nil {
		t.Errorf("expected no error with nil context, got %v", err)
	}
}

func TestRunPool8(t *testing.T) {
	// Test context cancellation
	ctx, cancel := context.WithCancel(context.Background())
	jobs := make(chan Job, 100)

	for i := 0; i < 100; i++ {
		jobs <- func(ctx context.Context) error {
			time.Sleep(50 * time.Millisecond)
			return nil
		}
	}
	close(jobs)

	go func() {
		time.Sleep(25 * time.Millisecond)
		cancel()
	}()

	err := RunPool(ctx, jobs, 3)
	// Should get cancellation error or nil depending on timing
	_ = err
}

func TestRunPool9(t *testing.T) {
	// Test empty job channel
	ctx := context.Background()
	jobs := make(chan Job)
	close(jobs)

	err := RunPool(ctx, jobs, 3)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
}

func TestRunPool10(t *testing.T) {
	// Test many workers with few jobs
	ctx := context.Background()
	jobs := make(chan Job, 2)
	var counter int32

	jobs <- func(ctx context.Context) error {
		atomic.AddInt32(&counter, 1)
		return nil
	}
	jobs <- func(ctx context.Context) error {
		atomic.AddInt32(&counter, 1)
		return nil
	}
	close(jobs)

	err := RunPool(ctx, jobs, 100)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if counter != 2 {
		t.Errorf("expected 2 jobs executed, got %d", counter)
	}
}`,
			hint1: `Define a worker function that loops with select statement: select { case <-ctx.Done(): return; case job, ok := <-jobs: ... }.`,
			hint2: `Check if channel is closed with the ok variable. Launch exactly workers goroutines, each running the worker function. Use wg.Add(workers) before launching.`,
			whyItMatters: `RunPool is the classic worker pool pattern, providing efficient job processing with controlled concurrency and clean resource management.

**Why Worker Pool:**
- **Efficient Resource Use:** Fixed number of goroutines, no spawning overhead
- **Controlled Concurrency:** Predictable parallelism level
- **Backpressure:** Channel naturally throttles job submission
- **Clean Shutdown:** Workers exit cleanly when channel closes

**Production Pattern:**
\`\`\`go
// Background job processor
func StartJobProcessor(ctx context.Context) error {
    jobs := make(chan Job, 100)

    // Producer: receive jobs from queue
    go func() {
        defer close(jobs)
        for {
            select {
            case <-ctx.Done():
                return
            default:
                job := pollJobQueue()
                if job != nil {
                    select {
                    case jobs <- job:
                    case <-ctx.Done():
                        return
                    }
                }
            }
        }
    }()

    // Consumer: process jobs with worker pool
    return RunPool(ctx, jobs, 10)
}

// Image processing service
func ProcessImageQueue(ctx context.Context) error {
    jobs := make(chan Job, 50)

    go func() {
        defer close(jobs)
        for imageURL := range getImageURLs() {
            url := imageURL
            select {
            case jobs <- func(ctx context.Context) error {
                return processImage(ctx, url)
            }:
            case <-ctx.Done():
                return
            }
        }
    }()

    // 5 workers for CPU-intensive image processing
    return RunPool(ctx, jobs, 5)
}

// Data pipeline
func RunDataPipeline(ctx context.Context, input <-chan Data) error {
    jobs := make(chan Job, 20)

    // Transform input data to jobs
    go func() {
        defer close(jobs)
        for data := range input {
            d := data
            select {
            case jobs <- func(ctx context.Context) error {
                return processData(ctx, d)
            }:
            case <-ctx.Done():
                return
            }
        }
    }()

    return RunPool(ctx, jobs, runtime.NumCPU())
}

// API request handler pool
func HandleAPIRequests(ctx context.Context) error {
    requests := make(chan Job, 100)

    // Receive requests from HTTP handlers
    http.HandleFunc("/process", func(w http.ResponseWriter, r *http.Request) {
        req := parseRequest(r)
        select {
        case requests <- func(ctx context.Context) error {
            return handleRequest(ctx, req, w)
        }:
        case <-time.After(time.Second):
            http.Error(w, "queue full", http.StatusServiceUnavailable)
        }
    })

    return RunPool(ctx, requests, 20)
}

// Batch processor with staged pipeline
func ProcessBatchWithStages(ctx context.Context, items []Item) error {
    // Stage 1: Validation
    validatedJobs := make(chan Job, 10)
    go func() {
        defer close(validatedJobs)
        for _, item := range items {
            i := item
            validatedJobs <- func(ctx context.Context) error {
                return validate(ctx, i)
            }
        }
    }()

    if err := RunPool(ctx, validatedJobs, 5); err != nil {
        return fmt.Errorf("validation failed: %w", err)
    }

    // Stage 2: Processing
    processingJobs := make(chan Job, 10)
    go func() {
        defer close(processingJobs)
        for _, item := range items {
            i := item
            processingJobs <- func(ctx context.Context) error {
                return process(ctx, i)
            }
        }
    }()

    return RunPool(ctx, processingJobs, 3)
}

// Message queue consumer
func ConsumeMessageQueue(ctx context.Context, queue MessageQueue) error {
    jobs := make(chan Job, 50)

    go func() {
        defer close(jobs)
        for {
            msg, err := queue.Receive(ctx)
            if err != nil {
                return
            }

            select {
            case jobs <- func(ctx context.Context) error {
                if err := handleMessage(ctx, msg); err != nil {
                    return err
                }
                return queue.Acknowledge(msg.ID)
            }:
            case <-ctx.Done():
                return
            }
        }
    }()

    return RunPool(ctx, jobs, 15)
}
\`\`\`

**Real-World Benefits:**
- **Efficiency:** No goroutine spawning overhead per job
- **Predictable:** Fixed resource usage
- **Scalable:** Easy to adjust worker count
- **Reliable:** Clean shutdown and error handling

**Worker Pool vs Other Patterns:**
\`\`\`
RunSequential:       1 job at a time, slowest
RunParallel:         N goroutines for N jobs, high overhead
RunParallelBounded:  Limited goroutines, still spawns per job
RunPool:             Fixed workers, most efficient for many jobs
\`\`\`

**Performance Characteristics:**
- **Best for:** Continuous job processing, many jobs
- **Startup cost:** Create workers once
- **Per-job cost:** Minimal (channel send/receive)
- **Memory:** Fixed (workers + channel buffer)

**Channel Buffer Size:**
- **Small (1-10):** Tight backpressure, memory efficient
- **Medium (10-100):** Balance between throughput and memory
- **Large (100-1000):** High throughput, more memory
- **Unbounded:** Risk of memory issues

**Worker Count Guidelines:**
- **CPU-bound:** runtime.NumCPU()
- **I/O-bound:** 2-10x runtime.NumCPU()
- **Network-bound:** Based on rate limits
- **Memory-bound:** Based on available memory

**When to Use:**
- Background job processing
- Message queue consumers
- Continuous data pipelines
- Long-running services
- Processing streams of work

**Clean Shutdown:**
The pattern ensures clean shutdown:
1. Producer closes jobs channel
2. Workers finish current jobs
3. Workers exit when channel closes
4. RunPool waits for all workers
5. Returns any errors

This is the foundation pattern for production worker pools and job processors.`,	order: 4,
	translations: {
		ru: {
			title: 'Создание пула параллельных обработчиков',
			description: `Реализуйте **RunPool**, который создаёт фиксированный пул воркеров, потребляющих задачи из канала.

**Требования:**
1. Создайте функцию \`RunPool(ctx context.Context, jobs <-chan Job, workers int) error\`
2. Обработайте nil context (верните nil)
3. Обработайте workers <= 0 (установите в 1)
4. Создайте фиксированное количество воркер-горутин
5. Каждый воркер читает задачи из канала пока канал не закроется или контекст не отменится
6. Пропускайте nil задачи
7. Верните первую встреченную ошибку (используйте sync.Once)
8. Ждите завершения всех воркеров используя sync.WaitGroup

**Паттерн воркера:**
Каждый воркер должен:
- Читать из канала задач в цикле
- Выходить когда канал закрывается
- Выходить когда контекст отменяется
- Выполнять не-nil задачи
- Записывать ошибки

**Пример:**
\`\`\`go
jobs := make(chan Job, 10)

// Отправить задачи в канал
go func() {
    for i := 0; i < 5; i++ {
        num := i
        jobs <- func(ctx context.Context) error {
            fmt.Printf("Processing job %d\\n", num)
            return nil
        }
    }
    close(jobs) // Закрыть когда закончили отправку
}()

// Создать пул с 3 воркерами
err := RunPool(ctx, jobs, 3)
// 3 воркера обрабатывают задачи одновременно из канала
`,
			hint1: `Определите функцию воркера которая зацикливается с select: select { case <-ctx.Done(): return; case job, ok := <-jobs: ... }.`,
			hint2: `Проверяйте закрытие канала переменной ok. Запустите ровно workers горутин, каждая выполняет функцию воркера. Используйте wg.Add(workers) перед запуском.`,
			whyItMatters: `RunPool - это классический паттерн пула воркеров, обеспечивающий эффективную обработку задач с контролируемой конкурентностью и чистым управлением ресурсами.

**Почему пул воркеров:**
- **Эффективное использование ресурсов:** Фиксированное количество горутин, нет накладных расходов на порождение
- **Контролируемая конкурентность:** Предсказуемый уровень параллелизма
- **Обратное давление:** Канал естественно ограничивает отправку задач
- **Чистое завершение:** Воркеры корректно завершаются при закрытии канала

**Продакшен паттерн:**
\`\`\`go
// Background job processor
func StartJobProcessor(ctx context.Context) error {
    jobs := make(chan Job, 100)

    // Producer: receive jobs from queue
    go func() {
        defer close(jobs)
        for {
            select {
            case <-ctx.Done():
                return
            default:
                job := pollJobQueue()
                if job != nil {
                    select {
                    case jobs <- job:
                    case <-ctx.Done():
                        return
                    }
                }
            }
        }
    }()

    // Consumer: process jobs with worker pool
    return RunPool(ctx, jobs, 10)
}

// Image processing service
func ProcessImageQueue(ctx context.Context) error {
    jobs := make(chan Job, 50)

    go func() {
        defer close(jobs)
        for imageURL := range getImageURLs() {
            url := imageURL
            select {
            case jobs <- func(ctx context.Context) error {
                return processImage(ctx, url)
            }:
            case <-ctx.Done():
                return
            }
        }
    }()

    // 5 workers for CPU-intensive image processing
    return RunPool(ctx, jobs, 5)
}

// Data pipeline
func RunDataPipeline(ctx context.Context, input <-chan Data) error {
    jobs := make(chan Job, 20)

    // Transform input data to jobs
    go func() {
        defer close(jobs)
        for data := range input {
            d := data
            select {
            case jobs <- func(ctx context.Context) error {
                return processData(ctx, d)
            }:
            case <-ctx.Done():
                return
            }
        }
    }()

    return RunPool(ctx, jobs, runtime.NumCPU())
}

// API request handler pool
func HandleAPIRequests(ctx context.Context) error {
    requests := make(chan Job, 100)

    // Receive requests from HTTP handlers
    http.HandleFunc("/process", func(w http.ResponseWriter, r *http.Request) {
        req := parseRequest(r)
        select {
        case requests <- func(ctx context.Context) error {
            return handleRequest(ctx, req, w)
        }:
        case <-time.After(time.Second):
            http.Error(w, "queue full", http.StatusServiceUnavailable)
        }
    })

    return RunPool(ctx, requests, 20)
}

// Message queue consumer
func ConsumeMessageQueue(ctx context.Context, queue MessageQueue) error {
    jobs := make(chan Job, 50)

    go func() {
        defer close(jobs)
        for {
            msg, err := queue.Receive(ctx)
            if err != nil {
                return
            }

            select {
            case jobs <- func(ctx context.Context) error {
                if err := handleMessage(ctx, msg); err != nil {
                    return err
                }
                return queue.Acknowledge(msg.ID)
            }:
            case <-ctx.Done():
                return
            }
        }
    }()

    return RunPool(ctx, jobs, 15)
}
\`\`\`

**Практические преимущества:**
- **Эффективность:** Нет накладных расходов на порождение горутин на задачу
- **Предсказуемость:** Фиксированное использование ресурсов
- **Масштабируемость:** Легко настроить количество воркеров
- **Надёжность:** Чистое завершение и обработка ошибок

**Пул воркеров vs Другие паттерны:**
\`\`\`
RunSequential:       1 задача за раз, медленнее всего
RunParallel:         N горутин для N задач, большие накладные расходы
RunParallelBounded:  Ограниченные горутины, но всё ещё порождает на задачу
RunPool:             Фиксированные воркеры, наиболее эффективен для многих задач
\`\`\`

**Характеристики производительности:**
- **Лучше для:** Непрерывная обработка задач, много задач
- **Стоимость запуска:** Создание воркеров один раз
- **Стоимость на задачу:** Минимальная (отправка/получение из канала)
- **Память:** Фиксированная (воркеры + буфер канала)

**Размер буфера канала:**
- **Малый (1-10):** Жёсткое обратное давление, эффективно по памяти
- **Средний (10-100):** Баланс между пропускной способностью и памятью
- **Большой (100-1000):** Высокая пропускная способность, больше памяти
- **Неограниченный:** Риск проблем с памятью

**Рекомендации по количеству воркеров:**
- **CPU-bound:** runtime.NumCPU()
- **I/O-bound:** 2-10x runtime.NumCPU()
- **Network-bound:** На основе лимитов скорости
- **Memory-bound:** На основе доступной памяти

**Когда использовать:**
- Фоновая обработка задач
- Потребители очередей сообщений
- Непрерывные конвейеры данных
- Долгоживущие сервисы
- Обработка потоков работ

**Чистое завершение:**
Паттерн обеспечивает чистое завершение:
1. Продюсер закрывает канал jobs
2. Воркеры завершают текущие задачи
3. Воркеры выходят когда канал закрывается
4. RunPool ждёт всех воркеров
5. Возвращает любые ошибки

Это фундаментальный паттерн для production пулов воркеров и обработчиков задач.`,
			solutionCode: `package concurrency

import (
	"context"
	"sync"
)

type Job func(context.Context) error

func RunPool(ctx context.Context, jobs <-chan Job, workers int) error {
	if ctx == nil {                                                 // Обработка nil контекста
		return nil                                              // Возврат nil для безопасности
	}
	if workers <= 0 {                                               // Обработка неверного количества воркеров
		workers = 1                                             // Установка минимального количества воркеров
	}
	var (
		wg       sync.WaitGroup                                 // Отслеживание всех воркеров
		once     sync.Once                                      // Захват только первой ошибки
		firstErr error                                          // Хранение первой ошибки
	)
	recordErr := func(err error) {                                  // Помощник для записи ошибки
		if err != nil {                                         // Только если ошибка существует
			once.Do(func() { firstErr = err })              // Установить первую ошибку один раз
		}
	}
	worker := func() {                                              // Функция воркера
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
				if err := job(ctx); err != nil {        // Выполнение задачи
					recordErr(err)                  // Запись ошибки
				}
			}
		}
	}
	wg.Add(workers)                                                 // Добавление всех воркеров в wait group
	for i := 0; i < workers; i++ {                                  // Создание воркеров
		go worker()                                             // Запуск горутины воркера
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
			title: 'Parallel ishlovchilar pulini yaratish',
			description: `Kanaldan vazifalarni iste'mol qiladigan fixed worker pulidini yaratadigan **RunPool** ni amalga oshiring.

**Talablar:**
1. \`RunPool(ctx context.Context, jobs <-chan Job, workers int) error\` funksiyasini yarating
2. nil kontekstni ishlang (nil qaytaring)
3. workers <= 0 ni ishlang (1 ga o'rnating)
4. Belgilangan miqdorda worker goroutinalarini yarating
5. Har bir worker kanal yopilgunga yoki kontekst bekor qilinguncha kanaldan vazifalarni o'qiydi
6. nil vazifalarni o'tkazib yuboring
7. Duch kelgan birinchi xatoni qaytaring (sync.Once dan foydalaning)
8. sync.WaitGroup dan foydalanib barcha workerlar tugashini kuting

**Worker patterni:**
Har bir worker:
- Vazifalar kanalidan tsiklda o'qiydi
- Kanal yopilganda chiqadi
- Kontekst bekor qilinganda chiqadi
- Nil bo'lmagan vazifalarni bajaradi
- Xatolarni yozib oladi

**Misol:**
\`\`\`go
jobs := make(chan Job, 10)

// Kanalga vazifalarni yuborish
go func() {
    for i := 0; i < 5; i++ {
        num := i
        jobs <- func(ctx context.Context) error {
            fmt.Printf("Processing job %d\\n", num)
            return nil
        }
    }
    close(jobs) // Yuborish tugaganda yopish
}()

// 3 ta worker bilan pul yaratish
err := RunPool(ctx, jobs, 3)
// 3 ta worker kanaldan vazifalarni bir vaqtda qayta ishlaydi
`,
			hint1: `Select bilan tsiklanadigan worker funksiyasini aniqlang: select { case <-ctx.Done(): return; case job, ok := <-jobs: ... }.`,
			hint2: `ok o'zgaruvchisi bilan kanal yopilishini tekshiring. Aynan workers goroutinalarini ishga tushiring, har biri worker funksiyasini bajaradi. Ishga tushirishdan oldin wg.Add(workers) dan foydalaning.`,
			whyItMatters: `RunPool - bu klassik worker pul patterni bo'lib, boshqariladigan parallellik va toza resurslarni boshqarish bilan samarali vazifalarni qayta ishlashni ta'minlaydi.

**Nima uchun worker pul:**
- **Samarali resurslardan foydalanish:** Fixed goroutinalar soni, yaratish xarajatlari yo'q
- **Boshqariladigan parallellik:** Oldindan aytib beriladigan parallellik darajasi
- **Orqa bosim:** Kanal tabiiy ravishda vazifalarni yuborishni cheklaydi
- **Toza tugatish:** Workerlar kanal yopilganda to'g'ri tugaydi

**Ishlab chiqarish patterni:**
\`\`\`go
// Background job processor
func StartJobProcessor(ctx context.Context) error {
    jobs := make(chan Job, 100)

    // Producer: receive jobs from queue
    go func() {
        defer close(jobs)
        for {
            select {
            case <-ctx.Done():
                return
            default:
                job := pollJobQueue()
                if job != nil {
                    select {
                    case jobs <- job:
                    case <-ctx.Done():
                        return
                    }
                }
            }
        }
    }()

    // Consumer: process jobs with worker pool
    return RunPool(ctx, jobs, 10)
}

// Image processing service
func ProcessImageQueue(ctx context.Context) error {
    jobs := make(chan Job, 50)

    go func() {
        defer close(jobs)
        for imageURL := range getImageURLs() {
            url := imageURL
            select {
            case jobs <- func(ctx context.Context) error {
                return processImage(ctx, url)
            }:
            case <-ctx.Done():
                return
            }
        }
    }()

    // 5 workers for CPU-intensive image processing
    return RunPool(ctx, jobs, 5)
}

// Data pipeline
func RunDataPipeline(ctx context.Context, input <-chan Data) error {
    jobs := make(chan Job, 20)

    // Transform input data to jobs
    go func() {
        defer close(jobs)
        for data := range input {
            d := data
            select {
            case jobs <- func(ctx context.Context) error {
                return processData(ctx, d)
            }:
            case <-ctx.Done():
                return
            }
        }
    }()

    return RunPool(ctx, jobs, runtime.NumCPU())
}

// API request handler pool
func HandleAPIRequests(ctx context.Context) error {
    requests := make(chan Job, 100)

    // Receive requests from HTTP handlers
    http.HandleFunc("/process", func(w http.ResponseWriter, r *http.Request) {
        req := parseRequest(r)
        select {
        case requests <- func(ctx context.Context) error {
            return handleRequest(ctx, req, w)
        }:
        case <-time.After(time.Second):
            http.Error(w, "queue full", http.StatusServiceUnavailable)
        }
    })

    return RunPool(ctx, requests, 20)
}

// Message queue consumer
func ConsumeMessageQueue(ctx context.Context, queue MessageQueue) error {
    jobs := make(chan Job, 50)

    go func() {
        defer close(jobs)
        for {
            msg, err := queue.Receive(ctx)
            if err != nil {
                return
            }

            select {
            case jobs <- func(ctx context.Context) error {
                if err := handleMessage(ctx, msg); err != nil {
                    return err
                }
                return queue.Acknowledge(msg.ID)
            }:
            case <-ctx.Done():
                return
            }
        }
    }()

    return RunPool(ctx, jobs, 15)
}
\`\`\`

**Amaliy foydalari:**
- **Samaradorlik:** Vazifa uchun goroutinalarni yaratish xarajatlari yo'q
- **Oldindan bilish mumkin:** Fixed resurslardan foydalanish
- **Kengayish:** Workerlar sonini sozlash oson
- **Ishonchlilik:** Toza tugatish va xatolarni boshqarish

**Worker pul vs Boshqa patternlar:**
\`\`\`
RunSequential:       Bir vaqtda 1 vazifa, eng sekin
RunParallel:         N vazifa uchun N goroutinalar, katta xarajatlar
RunParallelBounded:  Cheklangan goroutinalar, lekin vazifa uchun hali ham yaratadi
RunPool:             Fixed workerlar, ko'p vazifalar uchun eng samarali
\`\`\`

**Samaradorlik xususiyatlari:**
- **Eng yaxshisi:** Uzluksiz vazifalarni qayta ishlash, ko'plab vazifalar
- **Boshlash xarajati:** Workerlarni bir marta yaratish
- **Vazifa uchun xarajat:** Minimal (kanalga yuborish/qabul qilish)
- **Xotira:** Fixed (workerlar + kanal buferi)

**Kanal bufer hajmi:**
- **Kichik (1-10):** Qattiq orqa bosim, xotira samarali
- **O'rtacha (10-100):** O'tkazuvchanlik va xotira o'rtasidagi muvozanat
- **Katta (100-1000):** Yuqori o'tkazuvchanlik, ko'proq xotira
- **Cheksiz:** Xotira muammolari xavfi

**Workerlar soni bo'yicha tavsiyalar:**
- **CPU-bound:** runtime.NumCPU()
- **I/O-bound:** 2-10x runtime.NumCPU()
- **Network-bound:** Tezlik limitlariga qarab
- **Memory-bound:** Mavjud xotiraga qarab

**Qachon ishlatiladi:**
- Fonda vazifalarni qayta ishlash
- Xabarlar navbatini iste'mol qiluvchilar
- Uzluksiz ma'lumotlar quvurlari
- Uzoq yashovchi xizmatlar
- Ish oqimlarini qayta ishlash

**Toza tugatish:**
Pattern toza tugatishni ta'minlaydi:
1. Ishlab chiqaruvchi jobs kanalini yopadi
2. Workerlar joriy vazifalarni tugatadi
3. Workerlar kanal yopilganda chiqadi
4. RunPool barcha workerlarni kutadi
5. Har qanday xatolarni qaytaradi

Bu production worker pullari va vazifalarni qayta ishlash uchun asosiy pattern.`,
			solutionCode: `package concurrency

import (
	"context"
	"sync"
)

type Job func(context.Context) error

func RunPool(ctx context.Context, jobs <-chan Job, workers int) error {
	if ctx == nil {                                                 // nil kontekstni ishlash
		return nil                                              // Xavfsizlik uchun nil qaytarish
	}
	if workers <= 0 {                                               // Noto'g'ri workerlar sonini ishlash
		workers = 1                                             // Minimal workerlar sonini o'rnatish
	}
	var (
		wg       sync.WaitGroup                                 // Barcha workerlarni kuzatish
		once     sync.Once                                      // Faqat birinchi xatoni ushlash
		firstErr error                                          // Birinchi xatoni saqlash
	)
	recordErr := func(err error) {                                  // Xatoni yozish yordamchisi
		if err != nil {                                         // Faqat xato mavjud bo'lsa
			once.Do(func() { firstErr = err })              // Birinchi xatoni bir marta o'rnatish
		}
	}
	worker := func() {                                              // Worker funksiyasi
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
				if err := job(ctx); err != nil {        // Vazifani bajarish
					recordErr(err)                  // Xatoni yozish
				}
			}
		}
	}
	wg.Add(workers)                                                 // Barcha workerlarni wait groupga qo'shish
	for i := 0; i < workers; i++ {                                  // Workerlarni yaratish
		go worker()                                             // Worker goroutinasini ishga tushirish
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
