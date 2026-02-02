import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-metrics-gauge-tracking',
	title: 'Gauge for Current Value Tracking',
	difficulty: 'easy',
	tags: ['go', 'metrics', 'gauge', 'monitoring'],
	estimatedTime: '20m',
	isPremium: false,
	youtubeUrl: '',
	description: `Implement a gauge metric to track current values like active connections, memory usage, or queue depth.

**Requirements:**
1. **Gauge Type**: Store float64 value with sync.RWMutex for thread-safe access
2. **Set(value)**: Set gauge to specific value (replaces current)
3. **Inc(delta)**: Increment gauge by delta (can be negative for decrement)
4. **Dec(delta)**: Decrement gauge by delta (convenience method)
5. **Value()**: Read current gauge value safely
6. **RenderGauge**: Format gauge as Prometheus metric line

**Gauge vs Counter:**
\`\`\`go
// Counter: Only goes up (total requests, errors)
counter.Inc(1)  // 0 -> 1 -> 2 -> 3 -> ...

// Gauge: Can go up or down (connections, memory, queue size)
gauge.Set(5)    // Set to 5
gauge.Inc(3)    // 5 -> 8
gauge.Dec(2)    // 8 -> 6
gauge.Set(0)    // Reset to 0
\`\`\`

**Key Concepts:**
- Gauge tracks current state, not cumulative total
- Value can increase or decrease freely
- Use Set() for absolute values (memory: 256MB)
- Use Inc/Dec for relative changes (connections +1, -1)
- Thread-safe for concurrent updates

**Example Usage:**
\`\`\`go
var (
    activeConnections Gauge  // Current active DB connections
    queueDepth        Gauge  // Items waiting in queue
    memoryUsageMB     Gauge  // Current memory usage
    goroutineCount    Gauge  // Active goroutines
)

// Connection pool
func AcquireConnection() *Conn {
    conn := pool.Get()
    activeConnections.Inc(1)  // Connection acquired
    return conn
}

func ReleaseConnection(conn *Conn) {
    pool.Put(conn)
    activeConnections.Dec(1)  // Connection released
}

// Queue management
func EnqueueJob(job Job) {
    queue.Add(job)
    queueDepth.Inc(1)  // Queue size increased
}

func DequeueJob() Job {
    job := queue.Remove()
    queueDepth.Dec(1)  // Queue size decreased
    return job
}

// Resource monitoring
func UpdateMetrics() {
    // Absolute values
    var m runtime.MemStats
    runtime.ReadMemStats(&m)
    memoryUsageMB.Set(float64(m.Alloc) / 1024 / 1024)

    goroutineCount.Set(float64(runtime.NumGoroutine()))
}

// Metrics endpoint
func MetricsHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, "# HELP db_connections_active Active database connections\n")
    fmt.Fprint(w, "# TYPE db_connections_active gauge\n")
    fmt.Fprint(w, RenderGauge("db_connections_active", &activeConnections))

    fmt.Fprint(w, "# HELP queue_depth_items Items in processing queue\n")
    fmt.Fprint(w, "# TYPE queue_depth_items gauge\n")
    fmt.Fprint(w, RenderGauge("queue_depth_items", &queueDepth))

    fmt.Fprint(w, "# HELP memory_usage_mb Memory usage in megabytes\n")
    fmt.Fprint(w, "# TYPE memory_usage_mb gauge\n")
    fmt.Fprint(w, RenderGauge("memory_usage_mb", &memoryUsageMB))
}
\`\`\`

**Prometheus Format:**
\`\`\`go
// Simple gauge output
db_connections_active 12
queue_depth_items 47
memory_usage_mb 256.5
goroutines_active 145

// Used for monitoring current state
// Prometheus can alert on thresholds:
// - db_connections_active > 90 (pool exhaustion)
// - queue_depth_items > 1000 (backlog building)
// - memory_usage_mb > 1024 (memory leak?)
\`\`\`

**Common Gauge Use Cases:**
1. **Connection Pools**: Active DB/HTTP connections
2. **Queue Depths**: Jobs waiting to be processed
3. **Resource Usage**: Memory, CPU, disk space
4. **Concurrent Operations**: Active goroutines, threads
5. **Cache Sizes**: Number of cached items
6. **Rate Limiters**: Current rate limit remaining
7. **Circuit Breakers**: Current state (open/closed)

**Constraints:**
- Must use sync.RWMutex for thread safety
- Set replaces value completely
- Inc/Dec modify relative to current value
- Value can be negative (e.g., financial balance)
- RenderGauge must handle nil gauge (return "name 0\n")
- Use float64 for Prometheus compatibility`,
	initialCode: `package metricsx

import (
	"fmt"
	"sync"
)

// TODO: Implement Gauge type
// Store float64 value with sync.RWMutex
type Gauge struct {
	mu    sync.RWMutex
	value float64
}

// TODO: Implement Set
// Set gauge to specific value under lock
func (g *Gauge) Set(value float64) {
	// TODO: Implement
}

// TODO: Implement Inc
// Increment gauge by delta (can be negative)
// Use Lock for exclusive access
func (g *Gauge) Inc(delta float64) {
	// TODO: Implement
}

// TODO: Implement Dec
// Decrement gauge by delta (convenience method)
// Just call Inc with negative delta
func (g *Gauge) Dec(delta float64) {
	// TODO: Implement
}

// TODO: Implement Value
// Read current value under RLock
func (g *Gauge) Value() float64 {
	// TODO: Implement
}

// TODO: Implement RenderGauge
// Format: "name value\n"
// Handle nil gauge by returning "name 0\n"
func RenderGauge(name string, g *Gauge) string {
	return "" // TODO: Implement
}`,
	solutionCode: `package metricsx

import (
	"fmt"
	"sync"
)

type Gauge struct {
	mu    sync.RWMutex
	value float64
}

func (g *Gauge) Set(value float64) {
	g.mu.Lock()                 // acquire exclusive lock for write operation
	defer g.mu.Unlock()         // ensure lock released on return
	g.value = value             // set gauge to new absolute value
}

func (g *Gauge) Inc(delta float64) {
	g.mu.Lock()                 // need exclusive lock for modification
	defer g.mu.Unlock()
	g.value += delta            // increment by delta (positive or negative)
}

func (g *Gauge) Dec(delta float64) {
	g.Inc(-delta)               // decrement is increment with negative delta
}

func (g *Gauge) Value() float64 {
	g.mu.RLock()                // use read lock for concurrent reads
	defer g.mu.RUnlock()        // release read lock when done
	return g.value              // return current gauge value
}

func RenderGauge(name string, g *Gauge) string {
	if g == nil {                                    // handle nil gauge gracefully
		return fmt.Sprintf("%s 0\\n", name)           // return zero for missing gauge
	}
	value := g.Value()                               // read value using thread-safe method
	return fmt.Sprintf("%s %g\\n", name, value)       // format as prometheus gauge line
}`,
	testCode: `package metricsx

import (
	"strings"
	"sync"
	"testing"
)

func Test1(t *testing.T) {
	// Set assigns value
	var g Gauge
	g.Set(42.5)
	if g.Value() != 42.5 {
		t.Errorf("expected 42.5, got %g", g.Value())
	}
}

func Test2(t *testing.T) {
	// Set replaces previous value
	var g Gauge
	g.Set(100)
	g.Set(50)
	if g.Value() != 50 {
		t.Errorf("expected 50, got %g", g.Value())
	}
}

func Test3(t *testing.T) {
	// Inc increments value
	var g Gauge
	g.Set(10)
	g.Inc(5)
	if g.Value() != 15 {
		t.Errorf("expected 15, got %g", g.Value())
	}
}

func Test4(t *testing.T) {
	// Dec decrements value
	var g Gauge
	g.Set(10)
	g.Dec(3)
	if g.Value() != 7 {
		t.Errorf("expected 7, got %g", g.Value())
	}
}

func Test5(t *testing.T) {
	// Value can be negative
	var g Gauge
	g.Set(5)
	g.Dec(10)
	if g.Value() != -5 {
		t.Errorf("expected -5, got %g", g.Value())
	}
}

func Test6(t *testing.T) {
	// Initial value is zero
	var g Gauge
	if g.Value() != 0 {
		t.Errorf("expected 0 initial value, got %g", g.Value())
	}
}

func Test7(t *testing.T) {
	// RenderGauge formats correctly
	var g Gauge
	g.Set(123.5)
	result := RenderGauge("my_gauge", &g)
	if result != "my_gauge 123.5\\n" {
		t.Errorf("expected 'my_gauge 123.5\\n', got '%s'", result)
	}
}

func Test8(t *testing.T) {
	// RenderGauge handles nil
	result := RenderGauge("empty_gauge", nil)
	if result != "empty_gauge 0\\n" {
		t.Errorf("expected 'empty_gauge 0\\n', got '%s'", result)
	}
}

func Test9(t *testing.T) {
	// Concurrent operations are thread-safe
	var g Gauge
	var wg sync.WaitGroup
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			g.Inc(1)
		}()
	}
	wg.Wait()
	if g.Value() != 100 {
		t.Errorf("expected 100, got %g", g.Value())
	}
}

func Test10(t *testing.T) {
	// RenderGauge output ends with newline
	var g Gauge
	g.Set(42)
	result := RenderGauge("test", &g)
	if !strings.HasSuffix(result, "\\n") {
		t.Error("output should end with newline")
	}
}
`,
	hint1: `Use g.mu.Lock() for Set and Inc (write operations). Use g.mu.RLock() for Value (read). Always defer unlock.`,
	hint2: `Dec is simple - just call g.Inc(-delta). RenderGauge should check nil and use g.Value() for thread-safety.`,
	whyItMatters: `Gauges are essential for monitoring current system state and resource utilization in production.

**Why This Matters:**

**1. Monitoring Current State vs Historical Total**
Different metrics need different approaches:
\`\`\`go
// COUNTER: Total requests since start (only goes up)
// Good for: Total API calls, errors, bytes transferred
http_requests_total 1,234,567

// GAUGE: Current active connections (goes up and down)
// Good for: Active users, memory usage, queue depth
db_connections_active 42

// Why it matters:
// Counter tells you volume over time
// Gauge tells you state RIGHT NOW
\`\`\`

**2. Real Production Scenario**
Database connection pool management:
\`\`\`go
type ConnectionPool struct {
    connections chan *Conn
    active      Gauge  // Track current usage
    maxSize     int
}

func NewConnectionPool(maxSize int) *ConnectionPool {
    return &ConnectionPool{
        connections: make(chan *Conn, maxSize),
        maxSize:     maxSize,
    }
}

func (p *ConnectionPool) Acquire() (*Conn, error) {
    select {
    case conn := <-p.connections:
        p.active.Inc(1)  // Connection in use
        return conn, nil
    case <-time.After(5 * time.Second):
        // Check current usage for error message
        current := p.active.Value()
        return nil, fmt.Errorf("timeout: %g/%d connections in use", current, p.maxSize)
    }
}

func (p *ConnectionPool) Release(conn *Conn) {
    p.connections <- conn
    p.active.Dec(1)  // Connection returned to pool
}

// Alert on pool exhaustion
func (p *ConnectionPool) MonitorHealth() {
    ticker := time.NewTicker(10 * time.Second)
    for range ticker.C {
        usage := p.active.Value()
        utilizationPct := (usage / float64(p.maxSize)) * 100

        if utilizationPct > 80 {
            log.Printf("WARNING: Connection pool %g%% utilized", utilizationPct)
        }
        if utilizationPct > 95 {
            alertPagerDuty("CRITICAL: Connection pool nearly exhausted: %g/%d", usage, p.maxSize)
        }
    }
}
\`\`\`

**3. Queue Depth Monitoring**
Detect backlog before it causes problems:
\`\`\`go
type JobQueue struct {
    jobs  chan Job
    depth Gauge
}

func (q *JobQueue) Enqueue(job Job) error {
    select {
    case q.jobs <- job:
        q.depth.Inc(1)  // Queue growing

        // Alert if queue backing up
        if q.depth.Value() > 1000 {
            log.Printf("WARNING: Queue depth high: %g jobs", q.depth.Value())
        }
        return nil
    default:
        return errors.New("queue full")
    }
}

func (q *JobQueue) Process() {
    for job := range q.jobs {
        q.depth.Dec(1)  // Job removed from queue
        job.Execute()
    }
}

// Metrics show queue health
func MetricsEndpoint(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, RenderGauge("job_queue_depth", &q.depth))
    // Output: job_queue_depth 245

    // Prometheus alert:
    // Alert if queue_depth > 1000 for 5 minutes
    // Indicates processing can't keep up with incoming rate
}
\`\`\`

**4. Memory Leak Detection**
Track memory usage over time:
\`\`\`go
var memoryUsageMB Gauge

func UpdateMemoryMetrics() {
    ticker := time.NewTicker(30 * time.Second)
    for range ticker.C {
        var m runtime.MemStats
        runtime.ReadMemStats(&m)

        // Update gauge with current memory
        memoryMB := float64(m.Alloc) / 1024 / 1024
        memoryUsageMB.Set(memoryMB)

        // Check for potential leak
        if memoryMB > 1024 {  // Over 1GB
            log.Printf("WARNING: High memory usage: %.2f MB", memoryMB)
        }
    }
}

// Prometheus query to detect leak:
// deriv(memory_usage_mb[1h]) > 10
// If memory increases by >10MB/hour steadily = leak
\`\`\`

**5. Circuit Breaker State**
Monitor system health:
\`\`\`go
type CircuitBreaker struct {
    state      string  // "closed", "open", "half-open"
    stateGauge Gauge   // 0=closed, 1=open, 2=half-open
    failures   int
}

func (cb *CircuitBreaker) Open() {
    cb.state = "open"
    cb.stateGauge.Set(1)  // Circuit opened
    log.Printf("Circuit breaker opened due to failures")
}

func (cb *CircuitBreaker) Close() {
    cb.state = "closed"
    cb.stateGauge.Set(0)  // Circuit closed
    log.Printf("Circuit breaker closed - system healthy")
}

func (cb *CircuitBreaker) HalfOpen() {
    cb.state = "half-open"
    cb.stateGauge.Set(2)  // Circuit testing
}

// Alert when circuit breaker opens
// circuit_breaker_state == 1
// Indicates downstream service is failing
\`\`\`

**6. Resource Capacity Planning**
\`\`\`go
var (
    goroutineCount    Gauge
    heapObjectsCount  Gauge
    diskUsagePercent  Gauge
)

func MonitorResources() {
    ticker := time.NewTicker(1 * time.Minute)
    for range ticker.C {
        // Goroutines
        goroutineCount.Set(float64(runtime.NumGoroutine()))

        // Heap objects
        var m runtime.MemStats
        runtime.ReadMemStats(&m)
        heapObjectsCount.Set(float64(m.HeapObjects))

        // Disk usage
        stat := getDiskStats()
        diskUsagePercent.Set(stat.UsedPercent)

        // Alert on resource exhaustion
        if goroutineCount.Value() > 10000 {
            alert("Goroutine leak detected")
        }
        if diskUsagePercent.Value() > 90 {
            alert("Disk nearly full")
        }
    }
}
\`\`\`

**7. Prometheus Alerting Rules**
\`\`\`yaml
groups:
  - name: gauge_alerts
    rules:
      # Connection pool exhaustion
      - alert: ConnectionPoolHigh
        expr: db_connections_active / db_connections_max > 0.9
        for: 5m
        annotations:
          summary: "Connection pool 90% utilized"

      # Queue backlog
      - alert: QueueBacklog
        expr: job_queue_depth > 1000
        for: 10m
        annotations:
          summary: "Job queue backing up"

      # Memory leak
      - alert: MemoryLeak
        expr: deriv(memory_usage_mb[1h]) > 10
        for: 2h
        annotations:
          summary: "Memory increasing steadily"

      # Disk full
      - alert: DiskFull
        expr: disk_usage_percent > 90
        for: 5m
        annotations:
          summary: "Disk usage critical"
\`\`\`

**8. Real-World Impact**
Streaming platform monitoring:
- **Before gauges**: "Users report buffering issues"
  - No visibility into current system state
  - Can't tell if problem is capacity or transient
  - Reactive debugging after users complain

- **After gauges**:
  \`\`\`go
  active_streams_gauge 4523
  cdn_bandwidth_mbps_gauge 8234
  encoder_queue_depth_gauge 127
  transcoding_workers_active_gauge 45/50
  \`\`\`

- **Result**:
  - Alert when active_streams > 4000 (approaching capacity)
  - Scale up transcoders when queue_depth > 100
  - Monitor bandwidth in real-time
  - Proactive scaling before users notice
  - User-reported issues dropped 85%

**Production Best Practices:**
1. Use gauges for current state (connections, memory, queue size)
2. Use counters for cumulative totals (requests, errors)
3. Update gauges periodically (every 30-60 seconds for resources)
4. Alert on gauge thresholds (>90% capacity = danger zone)
5. Track both absolute values and percentages
6. Use gauges for capacity planning (trend analysis)
7. Combine gauges with counters for complete picture

Gauges provide real-time visibility into your system's current state, enabling proactive monitoring and capacity planning.`,
	order: 3,
	translations: {
		ru: {
			title: 'Gauge для отслеживания значений',
			solutionCode: `package metricsx

import (
	"fmt"
	"sync"
)

type Gauge struct {
	mu    sync.RWMutex
	value float64
}

func (g *Gauge) Set(value float64) {
	g.mu.Lock()                 // захватываем эксклюзивную блокировку для операции записи
	defer g.mu.Unlock()         // гарантируем освобождение блокировки при возврате
	g.value = value             // устанавливаем gauge в новое абсолютное значение
}

func (g *Gauge) Inc(delta float64) {
	g.mu.Lock()                 // нужна эксклюзивная блокировка для модификации
	defer g.mu.Unlock()
	g.value += delta            // инкрементируем на delta (положительную или отрицательную)
}

func (g *Gauge) Dec(delta float64) {
	g.Inc(-delta)               // декремент это инкремент с отрицательной delta
}

func (g *Gauge) Value() float64 {
	g.mu.RLock()                // используем блокировку чтения для конкурентных чтений
	defer g.mu.RUnlock()        // освобождаем блокировку чтения когда закончили
	return g.value              // возвращаем текущее значение gauge
}

func RenderGauge(name string, g *Gauge) string {
	if g == nil {                                    // обрабатываем nil gauge gracefully
		return fmt.Sprintf("%s 0\\n", name)           // возвращаем ноль для отсутствующего gauge
	}
	value := g.Value()                               // читаем значение используя потокобезопасный метод
	return fmt.Sprintf("%s %g\\n", name, value)       // форматируем как строку prometheus gauge
}`,
			description: `Реализуйте gauge метрику для отслеживания текущих значений таких как активные соединения, использование памяти или глубина очереди.

**Требования:**
1. **Gauge Type**: Хранить float64 значение с sync.RWMutex для потокобезопасного доступа
2. **Set(value)**: Установить gauge в конкретное значение (заменяет текущее)
3. **Inc(delta)**: Увеличить gauge на delta (может быть отрицательным для уменьшения)
4. **Dec(delta)**: Уменьшить gauge на delta (метод удобства)
5. **Value()**: Безопасно прочитать текущее значение gauge
6. **RenderGauge**: Отформатировать gauge как строку Prometheus метрики

**Gauge vs Counter:**
\`\`\`go
// Counter: Только растет (общие запросы, ошибки)
counter.Inc(1)  // 0 -> 1 -> 2 -> 3 -> ...

// Gauge: Может расти или падать (соединения, память, размер очереди)
gauge.Set(5)    // Установить в 5
gauge.Inc(3)    // 5 -> 8
gauge.Dec(2)    // 8 -> 6
gauge.Set(0)    // Сбросить в 0
\`\`\`

**Ключевые концепции:**
- Gauge отслеживает текущее состояние, а не кумулятивный итог
- Значение может свободно увеличиваться или уменьшаться
- Используйте Set() для абсолютных значений (память: 256MB)
- Используйте Inc/Dec для относительных изменений (соединения +1, -1)
- Потокобезопасно для конкурентных обновлений

**Ограничения:**
- Должен использовать sync.RWMutex для потокобезопасности
- Set полностью заменяет значение
- Inc/Dec изменяют относительно текущего значения
- Значение может быть отрицательным (например, финансовый баланс)
- RenderGauge должен обрабатывать nil gauge (вернуть "name 0\\n")
- Используйте float64 для совместимости с Prometheus`,
			hint1: `Используйте g.mu.Lock() для Set и Inc (операции записи). Используйте g.mu.RLock() для Value (чтение). Всегда defer unlock.`,
			hint2: `Dec простой - просто вызовите g.Inc(-delta). RenderGauge должен проверить nil и использовать g.Value() для потокобезопасности.`,
			whyItMatters: `Gauges критичны для мониторинга текущего состояния системы и использования ресурсов в production.

**Почему важно:**

**1. Мониторинг текущего состояния vs исторического итога**
Разные метрики требуют разных подходов:
\`\`\`go
// COUNTER: Общие запросы с начала (только растет)
// Подходит для: Общих API вызовов, ошибок, переданных байт
http_requests_total 1,234,567

// GAUGE: Текущие активные соединения (растет и падает)
// Подходит для: Активных пользователей, использования памяти, глубины очереди
db_connections_active 42

// Почему это важно:
// Counter показывает объем со временем
// Gauge показывает состояние ПРЯМО СЕЙЧАС
\`\`\`

**2. Real Production сценарий**
Управление пулом соединений базы данных:
\`\`\`go
type ConnectionPool struct {
    connections chan *Conn
    active      Gauge  // Отслеживаем текущее использование
    maxSize     int
}

func NewConnectionPool(maxSize int) *ConnectionPool {
    return &ConnectionPool{
        connections: make(chan *Conn, maxSize),
        maxSize:     maxSize,
    }
}

func (p *ConnectionPool) Acquire() (*Conn, error) {
    select {
    case conn := <-p.connections:
        p.active.Inc(1)  // Соединение используется
        return conn, nil
    case <-time.After(5 * time.Second):
        // Проверяем текущее использование для сообщения об ошибке
        current := p.active.Value()
        return nil, fmt.Errorf("timeout: %g/%d соединений используется", current, p.maxSize)
    }
}

func (p *ConnectionPool) Release(conn *Conn) {
    p.connections <- conn
    p.active.Dec(1)  // Соединение возвращено в пул
}

// Алерт при исчерпании пула
func (p *ConnectionPool) MonitorHealth() {
    ticker := time.NewTicker(10 * time.Second)
    for range ticker.C {
        usage := p.active.Value()
        utilizationPct := (usage / float64(p.maxSize)) * 100

        if utilizationPct > 80 {
            log.Printf("WARNING: Пул соединений использован на %g%%", utilizationPct)
        }
        if utilizationPct > 95 {
            alertPagerDuty("CRITICAL: Пул соединений почти исчерпан: %g/%d", usage, p.maxSize)
        }
    }
}
\`\`\`

**3. Мониторинг глубины очереди**
Обнаруживаем backlog до возникновения проблем:
\`\`\`go
type JobQueue struct {
    jobs  chan Job
    depth Gauge
}

func (q *JobQueue) Enqueue(job Job) error {
    select {
    case q.jobs <- job:
        q.depth.Inc(1)  // Очередь растет

        // Алерт если очередь накапливается
        if q.depth.Value() > 1000 {
            log.Printf("WARNING: Глубина очереди высокая: %g jobs", q.depth.Value())
        }
        return nil
    default:
        return errors.New("очередь полна")
    }
}

func (q *JobQueue) Process() {
    for job := range q.jobs {
        q.depth.Dec(1)  // Job удален из очереди
        job.Execute()
    }
}

// Метрики показывают здоровье очереди
func MetricsEndpoint(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, RenderGauge("job_queue_depth", &q.depth))
    // Output: job_queue_depth 245

    // Prometheus алерт:
    // Алерт если queue_depth > 1000 в течение 5 минут
    // Указывает что обработка не успевает за входящей скоростью
}
\`\`\`

**4. Обнаружение утечки памяти**
Отслеживаем использование памяти со временем:
\`\`\`go
var memoryUsageMB Gauge

func UpdateMemoryMetrics() {
    ticker := time.NewTicker(30 * time.Second)
    for range ticker.C {
        var m runtime.MemStats
        runtime.ReadMemStats(&m)

        // Обновляем gauge текущей памятью
        memoryMB := float64(m.Alloc) / 1024 / 1024
        memoryUsageMB.Set(memoryMB)

        // Проверяем потенциальную утечку
        if memoryMB > 1024 {  // Больше 1GB
            log.Printf("WARNING: Высокое использование памяти: %.2f MB", memoryMB)
        }
    }
}

// Prometheus query для обнаружения утечки:
// deriv(memory_usage_mb[1h]) > 10
// Если память стабильно растет >10MB/час = утечка
\`\`\`

**5. Состояние Circuit Breaker**
Мониторим здоровье системы:
\`\`\`go
type CircuitBreaker struct {
    state      string  // "closed", "open", "half-open"
    stateGauge Gauge   // 0=closed, 1=open, 2=half-open
    failures   int
}

func (cb *CircuitBreaker) Open() {
    cb.state = "open"
    cb.stateGauge.Set(1)  // Circuit открыт
    log.Printf("Circuit breaker открыт из-за сбоев")
}

func (cb *CircuitBreaker) Close() {
    cb.state = "closed"
    cb.stateGauge.Set(0)  // Circuit закрыт
    log.Printf("Circuit breaker закрыт - система здорова")
}

func (cb *CircuitBreaker) HalfOpen() {
    cb.state = "half-open"
    cb.stateGauge.Set(2)  // Circuit тестируется
}

// Алерт когда circuit breaker открывается
// circuit_breaker_state == 1
// Указывает что downstream сервис падает
\`\`\`

**6. Планирование ресурсной емкости**
\`\`\`go
var (
    goroutineCount    Gauge
    heapObjectsCount  Gauge
    diskUsagePercent  Gauge
)

func MonitorResources() {
    ticker := time.NewTicker(1 * time.Minute)
    for range ticker.C {
        // Goroutines
        goroutineCount.Set(float64(runtime.NumGoroutine()))

        // Heap объекты
        var m runtime.MemStats
        runtime.ReadMemStats(&m)
        heapObjectsCount.Set(float64(m.HeapObjects))

        // Использование диска
        stat := getDiskStats()
        diskUsagePercent.Set(stat.UsedPercent)

        // Алерт при исчерпании ресурсов
        if goroutineCount.Value() > 10000 {
            alert("Обнаружена утечка goroutine")
        }
        if diskUsagePercent.Value() > 90 {
            alert("Диск почти полон")
        }
    }
}
\`\`\`

**7. Prometheus правила алертинга**
\`\`\`yaml
groups:
  - name: gauge_alerts
    rules:
      # Исчерпание пула соединений
      - alert: ConnectionPoolHigh
        expr: db_connections_active / db_connections_max > 0.9
        for: 5m
        annotations:
          summary: "Пул соединений использован на 90%"

      # Backlog очереди
      - alert: QueueBacklog
        expr: job_queue_depth > 1000
        for: 10m
        annotations:
          summary: "Очередь jobs накапливается"

      # Утечка памяти
      - alert: MemoryLeak
        expr: deriv(memory_usage_mb[1h]) > 10
        for: 2h
        annotations:
          summary: "Память стабильно растет"

      # Полный диск
      - alert: DiskFull
        expr: disk_usage_percent > 90
        for: 5m
        annotations:
          summary: "Использование диска критичное"
\`\`\`

**8. Real-World влияние**
Мониторинг streaming платформы:
- **До gauges**: "Пользователи сообщают о проблемах буферизации"
  - Нет видимости текущего состояния системы
  - Невозможно определить проблема в capacity или временная
  - Реактивная отладка после жалоб пользователей

- **После gauges**:
  \`\`\`go
  active_streams_gauge 4523
  cdn_bandwidth_mbps_gauge 8234
  encoder_queue_depth_gauge 127
  transcoding_workers_active_gauge 45/50
  \`\`\`

- **Результат**:
  - Алерт когда active_streams > 4000 (приближение к capacity)
  - Масштабирование transcoders когда queue_depth > 100
  - Мониторинг bandwidth в реальном времени
  - Проактивное масштабирование до того как пользователи заметят
  - Жалобы пользователей снизились на 85%

**Production лучшие практики:**
1. Используйте gauges для текущего состояния (соединения, память, размер очереди)
2. Используйте counters для кумулятивных итогов (запросы, ошибки)
3. Обновляйте gauges периодически (каждые 30-60 секунд для ресурсов)
4. Алерты на пороги gauge (>90% capacity = опасная зона)
5. Отслеживайте как абсолютные значения так и проценты
6. Используйте gauges для capacity planning (анализ трендов)
7. Комбинируйте gauges с counters для полной картины

Gauges обеспечивают видимость текущего состояния вашей системы в реальном времени, позволяя проактивный мониторинг и планирование capacity.`
		},
		uz: {
			title: `Qiymatlarni kuzatish uchun Gauge`,
			solutionCode: `package metricsx

import (
	"fmt"
	"sync"
)

type Gauge struct {
	mu    sync.RWMutex
	value float64
}

func (g *Gauge) Set(value float64) {
	g.mu.Lock()                 // yozish operatsiyasi uchun eksklyuziv qulfni olamiz
	defer g.mu.Unlock()         // qaytishda qulf bo'shatilishini kafolatlaymiz
	g.value = value             // gauge'ni yangi mutlaq qiymatga o'rnatamiz
}

func (g *Gauge) Inc(delta float64) {
	g.mu.Lock()                 // o'zgartirish uchun eksklyuziv qulf kerak
	defer g.mu.Unlock()
	g.value += delta            // delta (ijobiy yoki salbiy) ga oshiramiz
}

func (g *Gauge) Dec(delta float64) {
	g.Inc(-delta)               // kamaytirish salbiy delta bilan oshirish
}

func (g *Gauge) Value() float64 {
	g.mu.RLock()                // parallel o'qishlar uchun o'qish qulfini ishlatamiz
	defer g.mu.RUnlock()        // tugaganda o'qish qulfini bo'shatamiz
	return g.value              // joriy gauge qiymatini qaytaramiz
}

func RenderGauge(name string, g *Gauge) string {
	if g == nil {                                    // nil gauge'ni gracefully qayta ishlaymiz
		return fmt.Sprintf("%s 0\\n", name)           // yo'q gauge uchun nol qaytaramiz
	}
	value := g.Value()                               // thread-safe usul orqali qiymatni o'qiymiz
	return fmt.Sprintf("%s %g\\n", name, value)       // prometheus gauge qatori sifatida formatlaymiz
}`,
			description: `Faol ulanishlar, xotira ishlatilishi yoki navbat chuqurligi kabi joriy qiymatlarni kuzatish uchun gauge metrikasini amalga oshiring.

**Talablar:**
1. **Gauge Turi**: Thread-safe kirish uchun sync.RWMutex bilan float64 qiymatni saqlash
2. **Set(value)**: Gauge'ni aniq qiymatga o'rnatish (joriyni almashtiradi)
3. **Inc(delta)**: Gauge'ni delta ga oshirish (kamaytirish uchun salbiy bo'lishi mumkin)
4. **Dec(delta)**: Gauge'ni delta ga kamaytirish (qulaylik usuli)
5. **Value()**: Joriy gauge qiymatini xavfsiz o'qish
6. **RenderGauge**: Gauge'ni Prometheus metrika qatori sifatida formatlash

**Gauge vs Counter:**
\`\`\`go
// Counter: Faqat ortadi (jami so'rovlar, xatolar)
counter.Inc(1)  // 0 -> 1 -> 2 -> 3 -> ...

// Gauge: Ortishi yoki kamayishi mumkin (ulanishlar, xotira, navbat hajmi)
gauge.Set(5)    // 5 ga o'rnatish
gauge.Inc(3)    // 5 -> 8
gauge.Dec(2)    // 8 -> 6
gauge.Set(0)    // 0 ga qaytarish
\`\`\`

**Asosiy tushunchalar:**
- Gauge joriy holatni kuzatadi, kumulyativ jami emas
- Qiymat erkin oshishi yoki kamayishi mumkin
- Mutlaq qiymatlar uchun Set() ishlating (xotira: 256MB)
- Nisbiy o'zgarishlar uchun Inc/Dec ishlating (ulanishlar +1, -1)
- Parallel yangilanishlar uchun thread-safe

**Cheklovlar:**
- Thread xavfsizligi uchun sync.RWMutex ishlatish kerak
- Set qiymatni to'liq almashtiradi
- Inc/Dec joriy qiymatga nisbatan o'zgartiradi
- Qiymat salbiy bo'lishi mumkin (masalan, moliyaviy balans)
- RenderGauge nil gauge'ni qayta ishlashi kerak ("name 0\\n" qaytaring)
- Prometheus moslik uchun float64 ishlating`,
			hint1: `Set va Inc (yozish operatsiyalari) uchun g.mu.Lock() ishlating. Value (o'qish) uchun g.mu.RLock() ishlating. Har doim unlock ni defer qiling.`,
			hint2: `Dec oddiy - shunchaki g.Inc(-delta) chaqiring. RenderGauge nil tekshirishi va thread-safety uchun g.Value() ishlatishi kerak.`,
			whyItMatters: `Gauge'lar production da joriy tizim holati va resurs foydalanishini monitoring qilish uchun muhimdir.

**Nima uchun bu muhim:**

**1. Joriy holat vs tarixiy jami monitoring**
Turli metrikalar turli yondashuvlarni talab qiladi:
\`\`\`go
// COUNTER: Boshlanganidan beri jami so'rovlar (faqat ortadi)
// Mos: Jami API chaqiruvlari, xatolar, uzatilgan baytlar
http_requests_total 1,234,567

// GAUGE: Joriy faol ulanishlar (ortadi va kamayadi)
// Mos: Faol foydalanuvchilar, xotira foydalanishi, navbat chuqurligi
db_connections_active 42

// Nima uchun bu muhim:
// Counter vaqt o'tishi bilan hajmni ko'rsatadi
// Gauge HOZIR holatni ko'rsatadi
\`\`\`

**2. Haqiqiy Production stsenariysi**
Ma'lumotlar bazasi ulanish puli boshqaruvi:
\`\`\`go
type ConnectionPool struct {
    connections chan *Conn
    active      Gauge  // Joriy foydalanishni kuzatamiz
    maxSize     int
}

func NewConnectionPool(maxSize int) *ConnectionPool {
    return &ConnectionPool{
        connections: make(chan *Conn, maxSize),
        maxSize:     maxSize,
    }
}

func (p *ConnectionPool) Acquire() (*Conn, error) {
    select {
    case conn := <-p.connections:
        p.active.Inc(1)  // Ulanish ishlatilmoqda
        return conn, nil
    case <-time.After(5 * time.Second):
        // Xato xabari uchun joriy foydalanishni tekshiramiz
        current := p.active.Value()
        return nil, fmt.Errorf("timeout: %g/%d ulanish ishlatilmoqda", current, p.maxSize)
    }
}

func (p *ConnectionPool) Release(conn *Conn) {
    p.connections <- conn
    p.active.Dec(1)  // Ulanish pulga qaytarildi
}

// Pul tugashi paytida alert
func (p *ConnectionPool) MonitorHealth() {
    ticker := time.NewTicker(10 * time.Second)
    for range ticker.C {
        usage := p.active.Value()
        utilizationPct := (usage / float64(p.maxSize)) * 100

        if utilizationPct > 80 {
            log.Printf("WARNING: Ulanish puli %g%% ishlatilgan", utilizationPct)
        }
        if utilizationPct > 95 {
            alertPagerDuty("CRITICAL: Ulanish puli deyarli tugadi: %g/%d", usage, p.maxSize)
        }
    }
}
\`\`\`

**3. Navbat chuqurligi monitoringi**
Muammolar paydo bo'lishidan oldin backlog'ni aniqlaymiz:
\`\`\`go
type JobQueue struct {
    jobs  chan Job
    depth Gauge
}

func (q *JobQueue) Enqueue(job Job) error {
    select {
    case q.jobs <- job:
        q.depth.Inc(1)  // Navbat o'smoqda

        // Agar navbat to'planayotgan bo'lsa alert
        if q.depth.Value() > 1000 {
            log.Printf("WARNING: Navbat chuqurligi yuqori: %g jobs", q.depth.Value())
        }
        return nil
    default:
        return errors.New("navbat to'liq")
    }
}

func (q *JobQueue) Process() {
    for job := range q.jobs {
        q.depth.Dec(1)  // Job navbatdan o'chirildi
        job.Execute()
    }
}

// Metrikalar navbat sog'lig'ini ko'rsatadi
func MetricsEndpoint(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, RenderGauge("job_queue_depth", &q.depth))
    // Output: job_queue_depth 245

    // Prometheus alert:
    // Agar queue_depth 5 daqiqa davomida > 1000 bo'lsa alert
    // Qayta ishlash kiruvchi tezlikka yetolmayotganini ko'rsatadi
}
\`\`\`

**4. Xotira oqishi aniqlash**
Vaqt o'tishi bilan xotira foydalanishini kuzatamiz:
\`\`\`go
var memoryUsageMB Gauge

func UpdateMemoryMetrics() {
    ticker := time.NewTicker(30 * time.Second)
    for range ticker.C {
        var m runtime.MemStats
        runtime.ReadMemStats(&m)

        // Gauge'ni joriy xotira bilan yangilaymiz
        memoryMB := float64(m.Alloc) / 1024 / 1024
        memoryUsageMB.Set(memoryMB)

        // Potentsial oqishni tekshiramiz
        if memoryMB > 1024 {  // 1GB dan ortiq
            log.Printf("WARNING: Yuqori xotira foydalanishi: %.2f MB", memoryMB)
        }
    }
}

// Oqishni aniqlash uchun Prometheus query:
// deriv(memory_usage_mb[1h]) > 10
// Agar xotira barqaror ravishda >10MB/soat o'ssa = oqish
\`\`\`

**5. Circuit Breaker holati**
Tizim sog'lig'ini monitoring qilamiz:
\`\`\`go
type CircuitBreaker struct {
    state      string  // "closed", "open", "half-open"
    stateGauge Gauge   // 0=closed, 1=open, 2=half-open
    failures   int
}

func (cb *CircuitBreaker) Open() {
    cb.state = "open"
    cb.stateGauge.Set(1)  // Circuit ochildi
    log.Printf("Circuit breaker nosozliklar tufayli ochildi")
}

func (cb *CircuitBreaker) Close() {
    cb.state = "closed"
    cb.stateGauge.Set(0)  // Circuit yopildi
    log.Printf("Circuit breaker yopildi - tizim sog'lom")
}

func (cb *CircuitBreaker) HalfOpen() {
    cb.state = "half-open"
    cb.stateGauge.Set(2)  // Circuit test qilinmoqda
}

// Circuit breaker ochilganda alert
// circuit_breaker_state == 1
// Downstream xizmat ishlamayotganini ko'rsatadi
\`\`\`

**6. Resurs sig'imini rejalashtirish**
\`\`\`go
var (
    goroutineCount    Gauge
    heapObjectsCount  Gauge
    diskUsagePercent  Gauge
)

func MonitorResources() {
    ticker := time.NewTicker(1 * time.Minute)
    for range ticker.C {
        // Goroutinelar
        goroutineCount.Set(float64(runtime.NumGoroutine()))

        // Heap obyektlari
        var m runtime.MemStats
        runtime.ReadMemStats(&m)
        heapObjectsCount.Set(float64(m.HeapObjects))

        // Disk foydalanishi
        stat := getDiskStats()
        diskUsagePercent.Set(stat.UsedPercent)

        // Resurs tugashi paytida alert
        if goroutineCount.Value() > 10000 {
            alert("Goroutine oqishi aniqlandi")
        }
        if diskUsagePercent.Value() > 90 {
            alert("Disk deyarli to'liq")
        }
    }
}
\`\`\`

**7. Prometheus alerting qoidalari**
\`\`\`yaml
groups:
  - name: gauge_alerts
    rules:
      # Ulanish puli tugashi
      - alert: ConnectionPoolHigh
        expr: db_connections_active / db_connections_max > 0.9
        for: 5m
        annotations:
          summary: "Ulanish puli 90% ishlatilgan"

      # Navbat backlog
      - alert: QueueBacklog
        expr: job_queue_depth > 1000
        for: 10m
        annotations:
          summary: "Job navbati to'planmoqda"

      # Xotira oqishi
      - alert: MemoryLeak
        expr: deriv(memory_usage_mb[1h]) > 10
        for: 2h
        annotations:
          summary: "Xotira barqaror o'smoqda"

      # Disk to'liq
      - alert: DiskFull
        expr: disk_usage_percent > 90
        for: 5m
        annotations:
          summary: "Disk foydalanishi kritik"
\`\`\`

**8. Real-World ta'sir**
Streaming platformasi monitoringi:
- **Gauge'lardan oldin**: "Foydalanuvchilar buferlanish muammolari haqida xabar berishadi"
  - Joriy tizim holatiga ko'rish yo'q
  - Muammo sig'imda yoki vaqtinchami aniqlash mumkin emas
  - Foydalanuvchi shikoyatlaridan keyin reaktiv debugging

- **Gauge'lardan keyin**:
  \`\`\`go
  active_streams_gauge 4523
  cdn_bandwidth_mbps_gauge 8234
  encoder_queue_depth_gauge 127
  transcoding_workers_active_gauge 45/50
  \`\`\`

- **Natija**:
  - active_streams > 4000 bo'lganda alert (sig'imga yaqinlashish)
  - queue_depth > 100 bo'lganda transcoderlarni masshtablash
  - Real vaqtda bandwidth monitoring
  - Foydalanuvchilar sezishdan oldin proaktiv masshtablash
  - Foydalanuvchi shikoyatlari 85% kamaydi

**Production eng yaxshi amaliyotlar:**
1. Joriy holat uchun gauge'lardan foydalaning (ulanishlar, xotira, navbat hajmi)
2. Kumulyativ jami uchun counterlardan foydalaning (so'rovlar, xatolar)
3. Gauge'larni davriy yangilang (resurslar uchun har 30-60 soniya)
4. Gauge chegaralarida alertlar (>90% sig'im = xavfli zona)
5. Ham mutlaq qiymatlar ham foizlarni kuzating
6. Sig'im rejalashtirish uchun gauge'lardan foydalaning (trend tahlili)
7. To'liq rasm uchun gauge'larni counterlar bilan birlashtiring

Gauge'lar real vaqtda tizimingizning joriy holatiga ko'rinish beradi, proaktiv monitoring va sig'im rejalashtirishni ta'minlaydi.`
		}
	}
};

export default task;
