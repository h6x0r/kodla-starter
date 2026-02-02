import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-metrics-thread-safe-counter',
	title: 'Thread-Safe Metrics Counter',
	difficulty: 'medium',	tags: ['go', 'metrics', 'concurrency', 'sync'],
	estimatedTime: '25m',	isPremium: false,
	youtubeUrl: '',
	description: `Implement a thread-safe counter for tracking metrics with concurrent access.

**Requirements:**
1. **Counter Type**: Store float64 value with sync.RWMutex for protection
2. **Inc(delta)**: Atomically increment counter and return new value
3. **Value()**: Safely read current value under lock
4. **Reset()**: Set counter to zero and return previous value
5. **RenderCounter**: Format counter as Prometheus metric line

**Thread Safety Pattern:**
\`\`\`go
type Counter struct {
    mu    sync.RWMutex
    value float64
}

// Write operation - exclusive lock
func (c *Counter) Inc(delta float64) float64 {
    c.mu.Lock()
    defer c.mu.Unlock()
    // Modify value...
    return c.value
}

// Read operation - shared lock
func (c *Counter) Value() float64 {
    c.mu.RLock()
    defer c.mu.RUnlock()
    return c.value
}
\`\`\`

**Key Concepts:**
- Use sync.RWMutex for better read performance
- Lock protects value from concurrent modification
- defer ensures unlock even if panic occurs
- RLock allows multiple concurrent readers
- Lock provides exclusive write access

**Example Usage:**
\`\`\`go
var requestCounter Counter

// Concurrent handlers incrementing counter
func HandleRequest(w http.ResponseWriter, r *http.Request) {
    // Multiple goroutines can safely increment
    newValue := requestCounter.Inc(1)
    log.Printf("Request #%g", newValue)
}

// Metrics endpoint reads counter
func MetricsHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, RenderCounter("http_requests_total", &requestCounter))
    // Output: http_requests_total 1523
}

// Periodic reset for rate calculations
func ResetCounters() {
    prev := requestCounter.Reset()
    ratePerMinute := prev / 60.0
    log.Printf("Rate: %g requests/sec", ratePerMinute)
}
\`\`\`

**Prometheus Format:**
\`\`\`go
RenderCounter("http_requests_total", counter)
// Returns: "http_requests_total 1234.5\\n"

// Used in metrics endpoint:
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total 1234.5
\`\`\`

**Constraints:**
- Must use sync.RWMutex for thread safety
- Inc must return new value after increment
- Reset must return previous value before zeroing
- RenderCounter must handle nil counter (return "name 0\\n")
- All values are float64 for Prometheus compatibility
- Output must end with newline`,
	initialCode: `package metricsx

import (
	"fmt"
	"sync"
)

// TODO: Implement Counter type
// Store float64 value with sync.RWMutex
type Counter struct {
	mu    sync.RWMutex
	value float64
}

// TODO: Implement Inc
// Increment counter by delta under lock
// Return new value after increment
func (c *Counter) Inc(delta float64) float64 {
	// TODO: Implement
}

// TODO: Implement Value
// Read current value under RLock
// Return the value safely
func (c *Counter) Value() float64 {
	// TODO: Implement
}

// TODO: Implement Reset
// Set value to zero and return previous value
// Use Lock for exclusive access
func (c *Counter) Reset() float64 {
	// TODO: Implement
}

// TODO: Implement RenderCounter
// Format: "name value\\n"
// Handle nil counter by returning "name 0\\n"
// Use counter.Value() to read safely
func RenderCounter(name string, c *Counter) string {
	return "" // TODO: Implement
}`,
	solutionCode: `package metricsx

import (
	"fmt"
	"sync"
)

type Counter struct {
	mu    sync.RWMutex
	value float64
}

func (c *Counter) Inc(delta float64) float64 {
	c.mu.Lock()	// acquire exclusive write lock
	defer c.mu.Unlock()	// ensure lock released on return
	c.value += delta	// safely modify value
	return c.value	// return new value to caller
}

func (c *Counter) Value() float64 {
	c.mu.RLock()	// acquire shared read lock for better concurrency
	defer c.mu.RUnlock()	// release read lock when done
	return c.value	// safely read current value
}

func (c *Counter) Reset() float64 {
	c.mu.Lock()	// need exclusive lock for write
	defer c.mu.Unlock()
	out := c.value	// save current value to return
	c.value = 0	// reset counter to zero
	return out	// return previous value
}

func RenderCounter(name string, c *Counter) string {
	if c == nil {	// handle nil counter gracefully
		return fmt.Sprintf("%s 0\\n", name)	// return zero value for missing counter
	}
	value := c.Value()	// read value using thread-safe method
	return fmt.Sprintf("%s %g\\n", name, value)	// format as prometheus metric line
}`,
	testCode: `package metricsx

import (
	"strings"
	"sync"
	"testing"
)

func Test1(t *testing.T) {
	// Basic Inc returns new value
	var c Counter
	result := c.Inc(5)
	if result != 5 {
		t.Errorf("expected 5, got %g", result)
	}
}

func Test2(t *testing.T) {
	// Multiple increments accumulate
	var c Counter
	c.Inc(1)
	c.Inc(2)
	result := c.Inc(3)
	if result != 6 {
		t.Errorf("expected 6, got %g", result)
	}
}

func Test3(t *testing.T) {
	// Value returns current counter value
	var c Counter
	c.Inc(42)
	if c.Value() != 42 {
		t.Errorf("expected 42, got %g", c.Value())
	}
}

func Test4(t *testing.T) {
	// Reset returns previous value and sets to zero
	var c Counter
	c.Inc(100)
	prev := c.Reset()
	if prev != 100 {
		t.Errorf("expected previous value 100, got %g", prev)
	}
	if c.Value() != 0 {
		t.Errorf("expected value 0 after reset, got %g", c.Value())
	}
}

func Test5(t *testing.T) {
	// RenderCounter formats correctly
	var c Counter
	c.Inc(123.5)
	result := RenderCounter("my_metric", &c)
	if result != "my_metric 123.5\\n" {
		t.Errorf("expected 'my_metric 123.5\\n', got '%s'", result)
	}
}

func Test6(t *testing.T) {
	// RenderCounter handles nil counter
	result := RenderCounter("empty_metric", nil)
	if result != "empty_metric 0\\n" {
		t.Errorf("expected 'empty_metric 0\\n', got '%s'", result)
	}
}

func Test7(t *testing.T) {
	// Inc with negative delta (decrement)
	var c Counter
	c.Inc(10)
	c.Inc(-3)
	if c.Value() != 7 {
		t.Errorf("expected 7, got %g", c.Value())
	}
}

func Test8(t *testing.T) {
	// Zero counter initial value
	var c Counter
	if c.Value() != 0 {
		t.Errorf("expected 0 initial value, got %g", c.Value())
	}
}

func Test9(t *testing.T) {
	// Concurrent increments are thread-safe
	var c Counter
	var wg sync.WaitGroup
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			c.Inc(1)
		}()
	}
	wg.Wait()
	if c.Value() != 100 {
		t.Errorf("expected 100 after concurrent increments, got %g", c.Value())
	}
}

func Test10(t *testing.T) {
	// RenderCounter output ends with newline
	var c Counter
	c.Inc(42)
	result := RenderCounter("test_metric", &c)
	if !strings.HasSuffix(result, "\\n") {
		t.Errorf("output should end with newline, got '%s'", result)
	}
}
`,
			hint1: `Use c.mu.Lock() before modifying value, and c.mu.RLock() for reading. Always defer the unlock.`,
			hint2: `In RenderCounter, check if c == nil first, then use c.Value() to read safely. Use %g format for float64.`,
			whyItMatters: `Thread-safe counters are essential for accurate metrics collection in concurrent applications.

**Why This Matters:**

**1. The Race Condition Problem**
Without proper synchronization, concurrent increments corrupt your metrics:
\`\`\`go
// BROKEN - race condition!
type UnsafeCounter struct {
    value int
}

func (c *UnsafeCounter) Inc() {
    c.value++ // Race! Lost updates!
}

// Running with -race detector:
// 1000 goroutines each increment by 1
// Expected: 1000
// Actual: 743 (lost 257 updates!)
\`\`\`

**2. Real Production Scenario**
E-commerce site tracking metrics:
\`\`\`go
var (
    requestsCounter   Counter  // Total HTTP requests
    ordersCounter     Counter  // Completed orders
    errorsCounter     Counter  // Failed requests
    checkoutDuration  Counter  // Total checkout time
)

// Hundreds of concurrent requests
func HandleCheckout(w http.ResponseWriter, r *http.Request) {
    start := time.Now()
    requestsCounter.Inc(1)  // Thread-safe increment

    if err := processOrder(); err != nil {
        errorsCounter.Inc(1)  // Safe even with concurrent errors
        http.Error(w, "Failed", 500)
        return
    }

    ordersCounter.Inc(1)  // Multiple goroutines can increment safely
    duration := time.Since(start).Seconds()
    checkoutDuration.Inc(duration)  // Accumulate timing data

    w.WriteHeader(200)
}

// Metrics endpoint - reads all counters safely
func MetricsHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, RenderCounter("http_requests_total", &requestsCounter))
    fmt.Fprint(w, RenderCounter("orders_completed_total", &ordersCounter))
    fmt.Fprint(w, RenderCounter("errors_total", &errorsCounter))

    // Calculate average checkout time
    avgTime := checkoutDuration.Value() / ordersCounter.Value()
    fmt.Fprintf(w, "checkout_avg_seconds %g\\n", avgTime)
}
\`\`\`

**3. Why RWMutex vs Mutex?**
RWMutex allows multiple concurrent readers:
\`\`\`go
// Scenario: 1000 reads/sec, 10 writes/sec

// With sync.Mutex:
// All operations block each other
// Throughput: ~200 ops/sec

// With sync.RWMutex:
// Reads can happen concurrently
// Only writes block
// Throughput: ~900 ops/sec

// Perfect for metrics: mostly reads (scraping), occasional writes (increments)
\`\`\`

**4. Reset for Rate Calculations**
Track requests per minute:
\`\`\`go
var minuteCounter Counter

// Increment throughout the minute
http.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) {
    minuteCounter.Inc(1)
    // ... handle request
})

// Every 60 seconds, calculate rate
ticker := time.NewTicker(60 * time.Second)
go func() {
    for range ticker.C {
        count := minuteCounter.Reset()  // Get count and reset to zero
        rate := count / 60.0
        log.Printf("Request rate: %.2f/sec", rate)

        // Alert if rate too high
        if rate > 100 {
            alert("High request rate detected!")
        }
    }
}()
\`\`\`

**5. Production Monitoring Dashboard**
\`\`\`go
// Collect various metrics
var metrics = struct {
    httpRequests     Counter
    dbQueries        Counter
    cacheHits        Counter
    cacheMisses      Counter
    activeUsers      Counter  // Can decrease - use Set instead of Inc
}{}

// Prometheus scrapes every 15 seconds
func PrometheusMetrics(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/plain")

    // All counters rendered safely
    fmt.Fprint(w, "# HELP http_requests_total Total HTTP requests\\n")
    fmt.Fprint(w, "# TYPE http_requests_total counter\\n")
    fmt.Fprint(w, RenderCounter("http_requests_total", &metrics.httpRequests))

    fmt.Fprint(w, "# HELP db_queries_total Database queries executed\\n")
    fmt.Fprint(w, "# TYPE db_queries_total counter\\n")
    fmt.Fprint(w, RenderCounter("db_queries_total", &metrics.dbQueries))

    // Calculate cache hit rate
    hits := metrics.cacheHits.Value()
    misses := metrics.cacheMisses.Value()
    total := hits + misses
    var hitRate float64
    if total > 0 {
        hitRate = hits / total * 100
    }
    fmt.Fprintf(w, "cache_hit_rate_percent %g\\n", hitRate)
}
\`\`\`

**6. Memory Efficiency**
Counter struct is tiny:
\`\`\`go
// Only 3 fields per counter
type Counter struct {
    mu    sync.RWMutex  // ~8 bytes
    value float64       // 8 bytes
}
// Total: ~16 bytes per counter

// Can have thousands of counters without memory concerns
var perEndpointCounters = make(map[string]*Counter)
\`\`\`

**7. Why Float64?**
Prometheus uses float64 for all metrics:
- Supports fractional values (response times, percentages)
- Large range (up to 1.7e+308)
- Standard format for time-series data
- Compatible with all Prometheus metric types

**Real-World Impact:**
Payment processing company tracked metrics with unsafe counters:
- **Problem**: Lost ~5% of metric updates due to races
- **Result**: Dashboards showed 95% of actual traffic
- **Impact**: Missed detecting a DDoS attack (looked like normal traffic)

After implementing thread-safe counters:
- **Accurate metrics**: 100% of updates captured
- **Reliable alerting**: Detected attack within 2 minutes
- **Cost savings**: Prevented $50K in fraudulent transactions

**Production Best Practices:**
1. Always use sync.RWMutex for counters (better read performance)
2. Prefer Inc() over Set() for monotonic metrics
3. Use Reset() carefully (only for rate calculations)
4. Initialize counters at startup, not on first use
5. Consider using atomic.Int64 for simple counters without reset
6. Document counter purpose and units in comments
7. Test with -race flag to catch synchronization bugs

Thread-safe counters are the foundation of reliable production metrics. Get them right, and you'll have accurate insights into your system's behavior.`,	order: 1,
	translations: {
		ru: {
			title: 'Потокобезопасный счётчик метрик',
			solutionCode: `package metricsx

import (
	"fmt"
	"sync"
)

type Counter struct {
	mu    sync.RWMutex
	value float64
}

func (c *Counter) Inc(delta float64) float64 {
	c.mu.Lock()                 // захватываем эксклюзивную блокировку записи
	defer c.mu.Unlock()         // гарантируем освобождение блокировки при возврате
	c.value += delta            // безопасно модифицируем значение
	return c.value              // возвращаем новое значение вызывающему
}

func (c *Counter) Value() float64 {
	c.mu.RLock()                // захватываем разделяемую блокировку чтения для лучшей конкурентности
	defer c.mu.RUnlock()        // освобождаем блокировку чтения когда закончили
	return c.value              // безопасно читаем текущее значение
}

func (c *Counter) Reset() float64 {
	c.mu.Lock()                 // нужна эксклюзивная блокировка для записи
	defer c.mu.Unlock()
	out := c.value              // сохраняем текущее значение для возврата
	c.value = 0                 // сбрасываем счетчик в ноль
	return out                  // возвращаем предыдущее значение
}

func RenderCounter(name string, c *Counter) string {
	if c == nil {                                    // обрабатываем nil счетчик gracefully
		return fmt.Sprintf("%s 0\\n", name)           // возвращаем нулевое значение для отсутствующего счетчика
	}
	value := c.Value()                               // читаем значение используя потокобезопасный метод
	return fmt.Sprintf("%s %g\\n", name, value)      // форматируем как строку prometheus метрики
}`,
			description: `Реализуйте потокобезопасный счетчик для отслеживания метрик с конкурентным доступом.

**Требования:**
1. **Counter Type**: Хранить float64 значение с sync.RWMutex для защиты
2. **Inc(delta)**: Атомарно увеличить счетчик и вернуть новое значение
3. **Value()**: Безопасно прочитать текущее значение под блокировкой
4. **Reset()**: Установить счетчик в ноль и вернуть предыдущее значение
5. **RenderCounter**: Отформатировать счетчик как строку Prometheus метрики

**Паттерн потокобезопасности:**
\`\`\`go
type Counter struct {
    mu    sync.RWMutex
    value float64
}

// Операция записи - эксклюзивная блокировка
func (c *Counter) Inc(delta float64) float64 {
    c.mu.Lock()
    defer c.mu.Unlock()
    // Изменить значение...
    return c.value
}

// Операция чтения - разделяемая блокировка
func (c *Counter) Value() float64 {
    c.mu.RLock()
    defer c.mu.RUnlock()
    return c.value
}
\`\`\`

**Ключевые концепции:**
- Используйте sync.RWMutex для лучшей производительности чтения
- Lock защищает значение от конкурентной модификации
- defer гарантирует разблокировку даже при панике
- RLock позволяет нескольким конкурентным читателям
- Lock дает эксклюзивный доступ на запись

**Ограничения:**
- Должен использовать sync.RWMutex для потокобезопасности
- Inc должен возвращать новое значение после инкремента
- Reset должен возвращать предыдущее значение перед обнулением
- RenderCounter должен обрабатывать nil counter (вернуть "name 0\\n")
- Все значения float64 для совместимости с Prometheus
- Вывод должен заканчиваться переводом строки`,
			hint1: `Используйте c.mu.Lock() перед изменением значения, и c.mu.RLock() для чтения. Всегда используйте defer для unlock.`,
			hint2: `В RenderCounter сначала проверьте c == nil, затем используйте c.Value() для безопасного чтения. Используйте формат %g для float64.`,
			whyItMatters: `Потокобезопасные счетчики критичны для точного сбора метрик в конкурентных приложениях.

**Почему это важно:**

**1. Проблема Race Condition (гонки данных)**
Без правильной синхронизации конкурентные инкременты разрушают ваши метрики:

\`\`\`go
// ОШИБКА - race condition!
type UnsafeCounter struct {
    value int
}

func (c *UnsafeCounter) Inc() {
    c.value++ // Гонка! Потерянные обновления!
}

// Запуск с -race детектором:
// 1000 горутин, каждая инкрементирует на 1
// Ожидаем: 1000
// Реально: 743 (потеряно 257 обновлений!)
\`\`\`

**Что происходит при гонке:**
\`\`\`
Горутина A: читает value=100
Горутина B: читает value=100  ← оба читают одно значение!
Горутина A: пишет value=101
Горутина B: пишет value=101   ← перезаписывает A, потеря +1!
\`\`\`

**2. Real-World Production Сценарий**
E-commerce сайт отслеживает критичные метрики:

\`\`\`go
var (
    requestsCounter   Counter  // Всего HTTP запросов
    ordersCounter     Counter  // Завершенные заказы
    errorsCounter     Counter  // Ошибки запросов
    checkoutDuration  Counter  // Общее время checkout
)

// Сотни конкурентных запросов
func HandleCheckout(w http.ResponseWriter, r *http.Request) {
    start := time.Now()
    requestsCounter.Inc(1)  // Thread-safe инкремент

    if err := processOrder(); err != nil {
        errorsCounter.Inc(1)  // Безопасно даже при конкурентных ошибках
        http.Error(w, "Failed", 500)
        return
    }

    ordersCounter.Inc(1)  // Множество горутин могут инкрементировать безопасно
    duration := time.Since(start).Seconds()
    checkoutDuration.Inc(duration)  // Накапливаем данные по времени

    w.WriteHeader(200)
}

// Metrics endpoint - читает все счетчики безопасно
func MetricsHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, RenderCounter("http_requests_total", &requestsCounter))
    fmt.Fprint(w, RenderCounter("orders_completed_total", &ordersCounter))
    fmt.Fprint(w, RenderCounter("errors_total", &errorsCounter))

    // Вычисляем среднее время checkout
    avgTime := checkoutDuration.Value() / ordersCounter.Value()
    fmt.Fprintf(w, "checkout_avg_seconds %g\\n", avgTime)
}
\`\`\`

**Без thread-safety:**
- 10,000 реальных запросов → счетчик показывает 9,200 (потеря 8%)
- Упущены критичные ошибки
- Неправильное планирование capacity

**3. Почему RWMutex вместо Mutex?**
RWMutex позволяет множество конкурентных читателей - критично для производительности:

\`\`\`go
// Сценарий: 1000 чтений/сек, 10 записей/сек

// С sync.Mutex:
// Все операции блокируют друг друга
// Пропускная способность: ~200 ops/sec

// С sync.RWMutex:
// Чтения происходят конкурентно
// Только записи блокируют
// Пропускная способность: ~900 ops/sec

// Идеально для метрик: в основном чтения (scraping Prometheus),
// редкие записи (инкременты)
\`\`\`

**Бенчмарк на реальной нагрузке:**
\`\`\`go
// Prometheus scrapes каждые 15 секунд
// 100 HTTP handlers инкрементируют конкурентно

Mutex:    45,000 ops/sec
RWMutex:  380,000 ops/sec  ← 8.4x быстрее!
\`\`\`

**4. Reset для Rate Calculations (расчета темпов)**
Отслеживание запросов в минуту:

\`\`\`go
var minuteCounter Counter

// Инкрементируем в течение минуты
http.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) {
    minuteCounter.Inc(1)
    // ... обработка запроса
})

// Каждые 60 секунд вычисляем темп
ticker := time.NewTicker(60 * time.Second)
go func() {
    for range ticker.C {
        count := minuteCounter.Reset()  // Получить значение и сбросить в ноль
        rate := count / 60.0
        log.Printf("Request rate: %.2f/sec", rate)

        // Алерт при превышении
        if rate > 100 {
            alert("High request rate detected!")
        }
    }
}()
\`\`\`

**Real production use case:** API rate limiting:
- Отслеживаем запросы от каждого клиента
- Сбрасываем счетчики каждую минуту
- Блокируем клиентов, превышающих лимит

**5. Production Monitoring Dashboard**
Полноценная панель метрик:

\`\`\`go
// Собираем разнообразные метрики
var metrics = struct {
    httpRequests     Counter
    dbQueries        Counter
    cacheHits        Counter
    cacheMisses      Counter
    errorsByType     map[string]*Counter  // Разбивка по типам ошибок
}{}

// Prometheus scrapes каждые 15 секунд
func PrometheusMetrics(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/plain")

    // Все счетчики рендерятся безопасно
    fmt.Fprint(w, "# HELP http_requests_total Total HTTP requests\\n")
    fmt.Fprint(w, "# TYPE http_requests_total counter\\n")
    fmt.Fprint(w, RenderCounter("http_requests_total", &metrics.httpRequests))

    fmt.Fprint(w, "# HELP db_queries_total Database queries executed\\n")
    fmt.Fprint(w, "# TYPE db_queries_total counter\\n")
    fmt.Fprint(w, RenderCounter("db_queries_total", &metrics.dbQueries))

    // Вычисляем cache hit rate
    hits := metrics.cacheHits.Value()
    misses := metrics.cacheMisses.Value()
    total := hits + misses
    var hitRate float64
    if total > 0 {
        hitRate = hits / total * 100
    }
    fmt.Fprintf(w, "cache_hit_rate_percent %g\\n", hitRate)
}
\`\`\`

**6. Memory Efficiency (эффективность памяти)**
Структура Counter очень компактна:

\`\`\`go
// Всего 2 поля на счетчик
type Counter struct {
    mu    sync.RWMutex  // ~8 bytes
    value float64       // 8 bytes
}
// Всего: ~16 bytes на счетчик

// Можно иметь тысячи счетчиков без проблем с памятью
var perEndpointCounters = make(map[string]*Counter)

// Отслеживание метрик для каждого endpoint отдельно
for _, endpoint := range []string{"/api/users", "/api/orders", "/api/products"} {
    perEndpointCounters[endpoint] = &Counter{}
}
\`\`\`

**7. Почему Float64?**
Prometheus использует float64 для всех метрик:
- Поддержка дробных значений (время отклика, проценты)
- Огромный диапазон (до 1.7e+308)
- Стандартный формат для time-series данных
- Совместимость со всеми типами метрик Prometheus

**Real-World Impact (реальное влияние):**
Компания по обработке платежей отслеживала метрики с небезопасными счетчиками:

**Проблема:**
- Потеряно ~5% обновлений метрик из-за гонок
- Дашборды показывали 95% реального трафика
- Пропущена атака DDoS (выглядела как обычный трафик)

**После внедрения thread-safe счетчиков:**
- **Точность метрик**: 100% обновлений захвачено
- **Надежные алерты**: Атака обнаружена за 2 минуты
- **Экономия**: Предотвращено $50K мошеннических транзакций

**Production Best Practices:**
1. **Всегда используйте sync.RWMutex** для счетчиков (лучшая производительность чтения)
2. **Предпочитайте Inc() вместо Set()** для монотонных метрик
3. **Используйте Reset() осторожно** (только для расчета темпов)
4. **Инициализируйте счетчики при запуске**, не при первом использовании
5. **Рассмотрите atomic.Int64** для простых счетчиков без reset (еще быстрее)

**Вывод:**
Thread-safe счетчики - это не оптимизация, а **обязательное требование** для production метрик. Потеря даже 1% данных метрик может привести к пропущенным инцидентам, неправильным решениям по масштабированию и финансовым потерям.`
		},
		uz: {
			title: `Thread-safe metrik hisoblagich`,
			solutionCode: `package metricsx

import (
	"fmt"
	"sync"
)

type Counter struct {
	mu    sync.RWMutex
	value float64
}

func (c *Counter) Inc(delta float64) float64 {
	c.mu.Lock()                 // eksklyuziv yozish qulfini olamiz
	defer c.mu.Unlock()         // qaytishda qulf bo'shatilishini kafolatlaymiz
	c.value += delta            // qiymatni xavfsiz o'zgartiramiz
	return c.value              // chaqiruvchiga yangi qiymatni qaytaramiz
}

func (c *Counter) Value() float64 {
	c.mu.RLock()                // yaxshiroq parallellik uchun umumiy o'qish qulfini olamiz
	defer c.mu.RUnlock()        // tugaganda o'qish qulfini bo'shatamiz
	return c.value              // joriy qiymatni xavfsiz o'qiymiz
}

func (c *Counter) Reset() float64 {
	c.mu.Lock()                 // yozish uchun eksklyuziv qulf kerak
	defer c.mu.Unlock()
	out := c.value              // qaytarish uchun joriy qiymatni saqlaymiz
	c.value = 0                 // hisoblagichni nolga qaytaramiz
	return out                  // oldingi qiymatni qaytaramiz
}

func RenderCounter(name string, c *Counter) string {
	if c == nil {                                    // nil hisoblagichni gracefully qayta ishlaymiz
		return fmt.Sprintf("%s 0\\n", name)           // yo'q hisoblagich uchun nol qiymat qaytaramiz
	}
	value := c.Value()                               // thread-safe usul orqali qiymatni o'qiymiz
	return fmt.Sprintf("%s %g\\n", name, value)      // prometheus metrika qatori sifatida formatlaymiz
}`,
			description: `Parallel kirish bilan metrikalarni kuzatish uchun thread-safe hisoblagichni amalga oshiring.

**Talablar:**
1. **Counter Turi**: Himoya uchun sync.RWMutex bilan float64 qiymatni saqlash
2. **Inc(delta)**: Atomik ravishda hisoblagichni oshirish va yangi qiymatni qaytarish
3. **Value()**: Joriy qiymatni qulflash ostida xavfsiz o'qish
4. **Reset()**: Hisoblagichni nolga o'rnatish va oldingi qiymatni qaytarish
5. **RenderCounter**: Hisoblagichni Prometheus metrika qatori sifatida formatlash

**Thread xavfsizligi patterni:**
\`\`\`go
type Counter struct {
    mu    sync.RWMutex
    value float64
}

// Yozish operatsiyasi - eksklyuziv qulflash
func (c *Counter) Inc(delta float64) float64 {
    c.mu.Lock()
    defer c.mu.Unlock()
    // Qiymatni o'zgartirish...
    return c.value
}

// O'qish operatsiyasi - umumiy qulflash
func (c *Counter) Value() float64 {
    c.mu.RLock()
    defer c.mu.RUnlock()
    return c.value
}
\`\`\`

**Cheklovlar:**
- Thread xavfsizligi uchun sync.RWMutex ishlatish kerak
- Inc oshirishdan keyin yangi qiymatni qaytarishi kerak
- Reset nolga o'rnatishdan oldin oldingi qiymatni qaytarishi kerak
- RenderCounter nil hisoblagichni qayta ishlashi kerak ("name 0\\n" qaytaring)
- Prometheus moslilik uchun barcha qiymatlar float64
- Chiqish yangi qator bilan tugashi kerak`,
			hint1: `Qiymatni o'zgartirishdan oldin c.mu.Lock(), o'qish uchun c.mu.RLock() ishlating. Har doim unlock ni defer qiling.`,
			hint2: `RenderCounter da avval c == nil ni tekshiring, keyin xavfsiz o'qish uchun c.Value() ishlating. float64 uchun %g formatini ishlating.`,
			whyItMatters: `Thread-safe hisoblagichlar parallel ilovalarda aniq metrikalar yig'ish uchun muhimdir.

**Nima uchun bu muhim:**

**1. Race Condition Muammosi (ma'lumot poygasi)**
To'g'ri sinxronizatsiyasiz parallel oshirishlar metrikalaringizni buzadi:

\`\`\`go
// XATO - race condition!
type UnsafeCounter struct {
    value int
}

func (c *UnsafeCounter) Inc() {
    c.value++ // Poyga! Yo'qolgan yangilanishlar!
}

// -race detektori bilan ishga tushirish:
// 1000 goroutine, har biri 1 ga oshiradi
// Kutilmoqda: 1000
// Haqiqat: 743 (257 yangilanish yo'qoldi!)
\`\`\`

**Poyga paytida nima bo'ladi:**
\`\`\`
Goroutine A: value=100 o'qiydi
Goroutine B: value=100 o'qiydi  ← ikkalasi bir qiymatni o'qiydi!
Goroutine A: value=101 yozadi
Goroutine B: value=101 yozadi   ← A ni qayta yozadi, +1 yo'qoldi!
\`\`\`

**2. Real-World Production Stsenariysi**
E-commerce sayti muhim metrikalarni kuzatadi:

\`\`\`go
var (
    requestsCounter   Counter  // Jami HTTP so'rovlar
    ordersCounter     Counter  // Yakunlangan buyurtmalar
    errorsCounter     Counter  // So'rov xatolari
    checkoutDuration  Counter  // Umumiy checkout vaqti
)

// Yuzlab parallel so'rovlar
func HandleCheckout(w http.ResponseWriter, r *http.Request) {
    start := time.Now()
    requestsCounter.Inc(1)  // Thread-safe oshirish

    if err := processOrder(); err != nil {
        errorsCounter.Inc(1)  // Parallel xatolarda ham xavfsiz
        http.Error(w, "Failed", 500)
        return
    }

    ordersCounter.Inc(1)  // Ko'plab goroutinelar xavfsiz oshirishi mumkin
    duration := time.Since(start).Seconds()
    checkoutDuration.Inc(duration)  // Vaqt ma'lumotlarini to'playmiz

    w.WriteHeader(200)
}

// Metrics endpoint - barcha hisoblagichlarni xavfsiz o'qiydi
func MetricsHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, RenderCounter("http_requests_total", &requestsCounter))
    fmt.Fprint(w, RenderCounter("orders_completed_total", &ordersCounter))
    fmt.Fprint(w, RenderCounter("errors_total", &errorsCounter))

    // O'rtacha checkout vaqtini hisoblaymiz
    avgTime := checkoutDuration.Value() / ordersCounter.Value()
    fmt.Fprintf(w, "checkout_avg_seconds %g\\n", avgTime)
}
\`\`\`

**Thread-safetysiz:**
- 10,000 haqiqiy so'rovlar → hisoblagich 9,200 ni ko'rsatadi (8% yo'qotish)
- Muhim xatolar o'tkazib yuborildi
- Noto'g'ri capacity rejalashtirish

**3. Nega RWMutex Mutex o'rniga?**
RWMutex ko'plab parallel o'quvchilarga ruxsat beradi - ishlash uchun juda muhim:

\`\`\`go
// Stsenariy: 1000 o'qish/sek, 10 yozish/sek

// sync.Mutex bilan:
// Barcha operatsiyalar bir-birini bloklaydi
// Throughput: ~200 ops/sec

// sync.RWMutex bilan:
// O'qishlar parallel bo'ladi
// Faqat yozishlar bloklaydi
// Throughput: ~900 ops/sec

// Metrikalar uchun ideal: asosan o'qishlar (Prometheus scraping),
// kam yozishlar (oshirishlar)
\`\`\`

**Haqiqiy yuk benchmarki:**
\`\`\`go
// Prometheus har 15 soniyada scrape qiladi
// 100 HTTP handler parallel oshiradi

Mutex:    45,000 ops/sec
RWMutex:  380,000 ops/sec  ← 8.4x tezroq!
\`\`\`

**4. Reset Rate Calculations Uchun (tezlik hisoblash)**
Daqiqadagi so'rovlarni kuzatish:

\`\`\`go
var minuteCounter Counter

// Daqiqa davomida oshiramiz
http.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) {
    minuteCounter.Inc(1)
    // ... so'rovni qayta ishlash
})

// Har 60 soniyada tezlikni hisoblaymiz
ticker := time.NewTicker(60 * time.Second)
go func() {
    for range ticker.C {
        count := minuteCounter.Reset()  // Qiymatni oling va nolga qaytaring
        rate := count / 60.0
        log.Printf("Request rate: %.2f/sec", rate)

        // Oshib ketganda alert
        if rate > 100 {
            alert("Yuqori so'rov tezligi aniqlandi!")
        }
    }
}()
\`\`\`

**Real production foydalanish:** API rate limiting:
- Har bir mijozdan so'rovlarni kuzatamiz
- Har daqiqa hisoblagichlarni qayta tiklaymiz
- Limitdan oshgan mijozlarni bloklaymiz

**5. Production Monitoring Dashboard**
To'liq metrikalar paneli:

\`\`\`go
// Turli metrikalarni to'playmiz
var metrics = struct {
    httpRequests     Counter
    dbQueries        Counter
    cacheHits        Counter
    cacheMisses      Counter
    errorsByType     map[string]*Counter  // Xato turlari bo'yicha ajratish
}{}

// Prometheus har 15 soniyada scrape qiladi
func PrometheusMetrics(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/plain")

    // Barcha hisoblagichlar xavfsiz render qilinadi
    fmt.Fprint(w, "# HELP http_requests_total Total HTTP requests\\n")
    fmt.Fprint(w, "# TYPE http_requests_total counter\\n")
    fmt.Fprint(w, RenderCounter("http_requests_total", &metrics.httpRequests))

    fmt.Fprint(w, "# HELP db_queries_total Database queries executed\\n")
    fmt.Fprint(w, "# TYPE db_queries_total counter\\n")
    fmt.Fprint(w, RenderCounter("db_queries_total", &metrics.dbQueries))

    // Cache hit rate ni hisoblaymiz
    hits := metrics.cacheHits.Value()
    misses := metrics.cacheMisses.Value()
    total := hits + misses
    var hitRate float64
    if total > 0 {
        hitRate = hits / total * 100
    }
    fmt.Fprintf(w, "cache_hit_rate_percent %g\\n", hitRate)
}
\`\`\`

**6. Memory Efficiency (xotira samaradorligi)**
Counter struktura juda ixcham:

\`\`\`go
// Hisoblagich uchun faqat 2 field
type Counter struct {
    mu    sync.RWMutex  // ~8 bytes
    value float64       // 8 bytes
}
// Jami: ~16 bytes har bir hisoblagich

// Minglab hisoblagichlar xotira muammosiz
var perEndpointCounters = make(map[string]*Counter)

// Har bir endpoint uchun alohida metrikalarni kuzatish
for _, endpoint := range []string{"/api/users", "/api/orders", "/api/products"} {
    perEndpointCounters[endpoint] = &Counter{}
}
\`\`\`

**7. Nega Float64?**
Prometheus barcha metrikalar uchun float64 ishlatadi:
- Kasr qiymatlari qo'llab-quvvatlash (javob vaqti, foizlar)
- Katta oralig'i (1.7e+308 gacha)
- Time-series ma'lumotlar uchun standart format
- Prometheus barcha metrik turlari bilan mos keladi

**Real-World Ta'siri (haqiqiy ta'sir):**
To'lov qayta ishlash kompaniyasi xavfli hisoblagichlar bilan metrikalarni kuzatdi:

**Muammo:**
- Poyga tufayli metrik yangilanishlarining ~5% i yo'qoldi
- Dashboardlar haqiqiy trafikning 95% ini ko'rsatdi
- DDoS hujumi o'tkazib yuborildi (oddiy trafik kabi ko'rinardi)

**Thread-safe hisoblagichlarni joriy qilgandan keyin:**
- **Metrikalar aniqligi**: 100% yangilanishlar ushlandi
- **Ishonchli alertlar**: Hujum 2 daqiqada aniqlandi
- **Tejamkorlik**: $50K firibgarlik tranzaksiyalarining oldini olindi

**Production Best Practices:**
1. **Har doim sync.RWMutex ishlatiladi** hisoblagichlar uchun (yaxshiroq o'qish ishlashi)
2. **Inc() ni Set() dan afzal ko'ring** monoton metrikalar uchun
3. **Reset() dan ehtiyotkorlik bilan foydalaning** (faqat tezlik hisoblash uchun)
4. **Hisoblagichlarni ishga tushirishda initsializatsiya qiling**, birinchi foydalanishda emas
5. **atomic.Int64 ni ko'rib chiqing** reset bo'lmagan oddiy hisoblagichlar uchun (yanada tezroq)

**Xulosa:**
Thread-safe hisoblagichlar optimallashtirish emas, balki production metrikalari uchun **majburiy talab**. Hatto 1% metrik ma'lumotlarni yo'qotish o'tkazib yuborilgan hodisalarga, noto'g'ri masshtablash qarorlariga va moliyaviy yo'qotishlarga olib kelishi mumkin.`
		}
	}
};

export default task;
