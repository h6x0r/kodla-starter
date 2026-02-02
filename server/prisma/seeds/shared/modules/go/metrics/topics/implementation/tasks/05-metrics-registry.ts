import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-metrics-registry',
	title: 'Metrics Registry for Multiple Metrics',
	difficulty: 'medium',
	tags: ['go', 'metrics', 'registry', 'architecture'],
	estimatedTime: '35m',
	isPremium: false,
	youtubeUrl: '',
	description: `Implement a metrics registry to manage and expose multiple metrics in a centralized way.

**Requirements:**
1. **Registry Type**: Store map of metric name to metric interface
2. **RegisterCounter/RegisterGauge/RegisterHistogram**: Add metrics with validation
3. **GetMetric(name)**: Retrieve registered metric by name
4. **RenderAll()**: Generate Prometheus output for all registered metrics
5. **Unregister(name)**: Remove metric from registry

**Registry Pattern:**
\`\`\`go
type Metric interface {
    Type() string       // "counter", "gauge", "histogram"
    Render() string     // Prometheus format output
}

type Registry struct {
    mu      sync.RWMutex
    metrics map[string]Metric
}

// Register a metric
func (r *Registry) Register(name string, metric Metric) error {
    // Validate name (no duplicates)
    // Store in map
}

// Render all metrics
func (r *Registry) RenderAll() string {
    // Iterate all metrics
    // Concatenate their output
}
\`\`\`

**Key Concepts:**
- Registry provides single source of truth for metrics
- Prevents duplicate metric names
- Makes metrics discoverable
- Simplifies metrics endpoint implementation
- Supports dynamic metric registration

**Example Usage:**
\`\`\`go
var registry = NewRegistry()

func init() {
    // Register application metrics
    registry.RegisterCounter("http_requests_total", &requestCounter)
    registry.RegisterCounter("http_errors_total", &errorCounter)
    registry.RegisterGauge("http_connections_active", &activeConnections)
    registry.RegisterHistogram("http_request_duration_seconds", requestLatency)

    // Register custom metrics
    registry.RegisterGauge("cache_size_items", &cacheSize)
    registry.RegisterCounter("cache_hits_total", &cacheHits)
    registry.RegisterCounter("cache_misses_total", &cacheMisses)
}

// Single metrics endpoint for all metrics
func MetricsHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/plain; version=0.0.4")
    fmt.Fprint(w, registry.RenderAll())
}

// Output includes all registered metrics:
// # HELP http_requests_total Total HTTP requests
// # TYPE http_requests_total counter
// http_requests_total 1523
//
// # HELP http_errors_total Total HTTP errors
// # TYPE http_errors_total counter
// http_errors_total 47
//
// # HELP http_connections_active Active HTTP connections
// # TYPE http_connections_active gauge
// http_connections_active 12
// ...

// Dynamic metric registration
func RegisterServiceMetrics(serviceName string) {
    counter := NewCounter()
    registry.RegisterCounter(
        fmt.Sprintf("%s_requests_total", serviceName),
        counter,
    )
}

// Get metric by name
func GetRequestCounter() (*Counter, error) {
    metric, err := registry.GetMetric("http_requests_total")
    if err != nil {
        return nil, err
    }
    return metric.(*Counter), nil
}

// Remove metric
func UnregisterMetric(name string) {
    registry.Unregister(name)
}
\`\`\`

**Metric Interface:**
\`\`\`go
// All metrics implement this interface
type Metric interface {
    Type() string    // Returns metric type for Prometheus
    Render() string  // Returns Prometheus formatted output
}

// Counter implements Metric
func (c *Counter) Type() string { return "counter" }
func (c *Counter) Render() string {
    return fmt.Sprintf("%g", c.Value())
}

// Gauge implements Metric
func (g *Gauge) Type() string { return "gauge" }
func (g *Gauge) Render() string {
    return fmt.Sprintf("%g", g.Value())
}

// Histogram implements Metric
func (h *Histogram) Type() string { return "histogram" }
func (h *Histogram) Render() string {
    // Return buckets, sum, count
}
\`\`\`

**Registry Benefits:**
1. **Centralized Management**: All metrics in one place
2. **No Duplicate Names**: Registry validates uniqueness
3. **Discoverable**: List all registered metrics
4. **Type Safety**: Ensure correct metric types
5. **Dynamic Registration**: Add/remove metrics at runtime
6. **Testing**: Easy to mock and inspect metrics

**Production Example:**
\`\`\`go
// Production application with registry
type Application struct {
    registry *Registry
    server   *http.Server
}

func NewApplication() *Application {
    registry := NewRegistry()

    // Core HTTP metrics
    registry.RegisterCounter("http_requests_total",
        &httpRequestsTotal)
    registry.RegisterHistogram("http_request_duration_seconds",
        httpRequestDuration)

    // Database metrics
    registry.RegisterGauge("db_connections_active",
        &dbConnectionsActive)
    registry.RegisterCounter("db_queries_total",
        &dbQueriesTotal)

    // Cache metrics
    registry.RegisterGauge("cache_items_total",
        &cacheItems)
    registry.RegisterCounter("cache_hits_total",
        &cacheHits)
    registry.RegisterCounter("cache_misses_total",
        &cacheMisses)

    // Business metrics
    registry.RegisterCounter("orders_completed_total",
        &ordersCompleted)
    registry.RegisterCounter("orders_failed_total",
        &ordersFailed)
    registry.RegisterGauge("revenue_total_usd",
        &revenueTotal)

    return &Application{registry: registry}
}

// Single endpoint exposes all metrics
func (app *Application) MetricsHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, app.registry.RenderAll())
}

// Health check includes metrics validation
func (app *Application) HealthCheck() error {
    metrics := app.registry.ListMetrics()
    if len(metrics) == 0 {
        return errors.New("no metrics registered")
    }
    return nil
}
\`\`\`

**Constraints:**
- Must use sync.RWMutex for thread-safe access
- Register must reject duplicate names (return error)
- GetMetric must return error if metric not found
- RenderAll must iterate all metrics in consistent order
- Support Counter, Gauge, Histogram metric types
- Metric names must follow Prometheus naming conventions (a-z, 0-9, _)`,
	initialCode: `package metricsx

import (
	"errors"
	"fmt"
	"sort"
	"sync"
)

// TODO: Define Metric interface
// All metrics must implement this
type Metric interface {
	Type() string       // Returns "counter", "gauge", or "histogram"
	Render() string     // Returns metric value in Prometheus format
}

// TODO: Implement Registry type
// Store map[string]Metric with sync.RWMutex
type Registry struct {
	mu      sync.RWMutex
	metrics map[string]Metric
}

// TODO: Implement NewRegistry
// Initialize empty registry
func NewRegistry() *Registry {
	// TODO: Implement
}

// TODO: Implement Register
// Add metric to registry with name
// Return error if name already exists
// Return error if name is invalid
func (r *Registry) Register(name string, metric Metric) error {
	return nil // TODO: Implement
}

// TODO: Implement GetMetric
// Retrieve metric by name
// Return error if not found
func (r *Registry) GetMetric(name string) (Metric, error) {
	// TODO: Implement
}

// TODO: Implement Unregister
// Remove metric from registry
// No-op if metric doesn't exist
func (r *Registry) Unregister(name string) {
	// TODO: Implement
}

// TODO: Implement RenderAll
// Generate Prometheus output for all metrics
// Include HELP and TYPE comments
// Sort metrics by name for consistent output
func (r *Registry) RenderAll() string {
	return "" // TODO: Implement
}

// TODO: Implement ListMetrics
// Return list of all registered metric names
// Sorted alphabetically
func (r *Registry) ListMetrics() []string {
	// TODO: Implement
}`,
	solutionCode: `package metricsx

import (
	"errors"
	"fmt"
	"regexp"
	"sort"
	"sync"
)

// Metric interface that all metrics must implement
type Metric interface {
	Type() string       // returns metric type for prometheus TYPE comment
	Render() string     // returns prometheus formatted metric value
}

type Registry struct {
	mu      sync.RWMutex
	metrics map[string]Metric
}

func NewRegistry() *Registry {
	return &Registry{
		metrics: make(map[string]Metric),  // initialize empty metrics map
	}
}

var validMetricName = regexp.MustCompile("^[a-zA-Z_][a-zA-Z0-9_]*$")  // prometheus naming rules

func (r *Registry) Register(name string, metric Metric) error {
	if name == "" {                                      // validate name is not empty
		return errors.New("metric name cannot be empty")
	}
	if !validMetricName.MatchString(name) {             // validate prometheus naming convention
		return fmt.Errorf("invalid metric name: %s", name)
	}

	r.mu.Lock()                                          // acquire write lock for modification
	defer r.mu.Unlock()

	if _, exists := r.metrics[name]; exists {            // check for duplicate name
		return fmt.Errorf("metric already registered: %s", name)
	}

	r.metrics[name] = metric                             // store metric in registry
	return nil
}

func (r *Registry) GetMetric(name string) (Metric, error) {
	r.mu.RLock()                                         // acquire read lock for lookup
	defer r.mu.RUnlock()

	metric, exists := r.metrics[name]                    // lookup metric by name
	if !exists {
		return nil, fmt.Errorf("metric not found: %s", name)
	}
	return metric, nil
}

func (r *Registry) Unregister(name string) {
	r.mu.Lock()                                          // acquire write lock for deletion
	defer r.mu.Unlock()
	delete(r.metrics, name)                              // remove metric from map (safe if not exists)
}

func (r *Registry) RenderAll() string {
	r.mu.RLock()                                         // acquire read lock for iteration
	defer r.mu.RUnlock()

	// Get sorted metric names for consistent output
	names := make([]string, 0, len(r.metrics))
	for name := range r.metrics {
		names = append(names, name)
	}
	sort.Strings(names)                                  // sort alphabetically for deterministic output

	var result string
	for _, name := range names {                         // iterate metrics in sorted order
		metric := r.metrics[name]
		// Add HELP and TYPE comments for each metric
		result += fmt.Sprintf("# HELP %s %s metric\\n", name, metric.Type())
		result += fmt.Sprintf("# TYPE %s %s\\n", name, metric.Type())
		result += fmt.Sprintf("%s %s\\n", name, metric.Render())  // add metric value line
	}

	return result
}

func (r *Registry) ListMetrics() []string {
	r.mu.RLock()                                         // acquire read lock for reading names
	defer r.mu.RUnlock()

	names := make([]string, 0, len(r.metrics))           // allocate slice for names
	for name := range r.metrics {                        // collect all metric names
		names = append(names, name)
	}
	sort.Strings(names)                                  // sort for consistent ordering
	return names
}`,
	testCode: `package metricsx

import (
	"strings"
	"sync"
	"testing"
)

// Mock metric for testing
type mockMetric struct {
	typ   string
	value string
}

func (m *mockMetric) Type() string   { return m.typ }
func (m *mockMetric) Render() string { return m.value }

func Test1(t *testing.T) {
	// NewRegistry creates empty registry
	r := NewRegistry()
	if r == nil {
		t.Error("NewRegistry returned nil")
	}
	if len(r.ListMetrics()) != 0 {
		t.Error("new registry should be empty")
	}
}

func Test2(t *testing.T) {
	// Register adds metric successfully
	r := NewRegistry()
	err := r.Register("test_metric", &mockMetric{"counter", "42"})
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
	if len(r.ListMetrics()) != 1 {
		t.Error("expected 1 metric registered")
	}
}

func Test3(t *testing.T) {
	// Register rejects duplicate name
	r := NewRegistry()
	r.Register("my_metric", &mockMetric{"gauge", "10"})
	err := r.Register("my_metric", &mockMetric{"counter", "20"})
	if err == nil {
		t.Error("expected error for duplicate metric")
	}
}

func Test4(t *testing.T) {
	// Register validates metric name
	r := NewRegistry()
	err := r.Register("", &mockMetric{"counter", "1"})
	if err == nil {
		t.Error("expected error for empty name")
	}
	err = r.Register("123invalid", &mockMetric{"counter", "1"})
	if err == nil {
		t.Error("expected error for invalid name starting with digit")
	}
}

func Test5(t *testing.T) {
	// GetMetric retrieves registered metric
	r := NewRegistry()
	original := &mockMetric{"gauge", "100"}
	r.Register("test_gauge", original)
	metric, err := r.GetMetric("test_gauge")
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	if metric != original {
		t.Error("retrieved metric doesn't match original")
	}
}

func Test6(t *testing.T) {
	// GetMetric returns error for unknown metric
	r := NewRegistry()
	_, err := r.GetMetric("nonexistent")
	if err == nil {
		t.Error("expected error for unknown metric")
	}
}

func Test7(t *testing.T) {
	// Unregister removes metric
	r := NewRegistry()
	r.Register("to_remove", &mockMetric{"counter", "1"})
	r.Unregister("to_remove")
	_, err := r.GetMetric("to_remove")
	if err == nil {
		t.Error("metric should be removed")
	}
}

func Test8(t *testing.T) {
	// RenderAll includes all metrics
	r := NewRegistry()
	r.Register("alpha_metric", &mockMetric{"gauge", "10"})
	r.Register("beta_metric", &mockMetric{"counter", "20"})
	output := r.RenderAll()
	if !strings.Contains(output, "alpha_metric") {
		t.Error("missing alpha_metric in output")
	}
	if !strings.Contains(output, "beta_metric") {
		t.Error("missing beta_metric in output")
	}
	if !strings.Contains(output, "# TYPE") {
		t.Error("missing TYPE comment in output")
	}
}

func Test9(t *testing.T) {
	// ListMetrics returns sorted names
	r := NewRegistry()
	r.Register("zebra", &mockMetric{"gauge", "1"})
	r.Register("alpha", &mockMetric{"gauge", "2"})
	r.Register("beta", &mockMetric{"gauge", "3"})
	names := r.ListMetrics()
	if len(names) != 3 {
		t.Errorf("expected 3 names, got %d", len(names))
	}
	if names[0] != "alpha" || names[1] != "beta" || names[2] != "zebra" {
		t.Errorf("names not sorted: %v", names)
	}
}

func Test10(t *testing.T) {
	// Concurrent registration is thread-safe
	r := NewRegistry()
	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			name := strings.Repeat("a", idx+1) + "_metric"
			r.Register(name, &mockMetric{"counter", "1"})
		}(i)
	}
	wg.Wait()
	if len(r.ListMetrics()) != 10 {
		t.Errorf("expected 10 metrics, got %d", len(r.ListMetrics()))
	}
}
`,
	hint1: `Use r.mu.Lock() for Register/Unregister (writes). Use r.mu.RLock() for GetMetric/RenderAll (reads). Check for duplicates in Register.`,
	hint2: `For RenderAll, collect metric names into a slice, sort them, then iterate in sorted order. Include HELP and TYPE comments for each metric.`,
	whyItMatters: `A metrics registry provides centralized management and organization for production observability.

**Why This Matters:**

**1. The Chaos Without a Registry**
Without centralized metrics management:
\`\`\`go
// PROBLEMATIC: Scattered metrics everywhere
var (
    httpRequests   Counter   // In http package
    dbQueries      Counter   // In database package
    cacheHits      Counter   // In cache package
    // ... metrics spread across 20+ files
)

// Metrics endpoint is a nightmare
func MetricsHandler(w http.ResponseWriter, r *http.Request) {
    // Have to manually import and reference each metric
    fmt.Fprintf(w, "http_requests_total %d\n", httpRequests.Value())
    fmt.Fprintf(w, "db_queries_total %d\n", dbQueries.Value())
    fmt.Fprintf(w, "cache_hits_total %d\n", cacheHits.Value())
    // ... 50 more lines
    // Easy to miss metrics
    // Hard to maintain
    // No validation
}

// Duplicate name? Won't know until runtime!
var requestsTotal Counter   // In package A
var requestsTotal Counter   // In package B - name collision!
\`\`\`

**2. With a Registry - Organized and Safe**
\`\`\`go
// BETTER: Centralized registry
var DefaultRegistry = NewRegistry()

// HTTP package registers its metrics
func init() {
    DefaultRegistry.Register("http_requests_total", &httpRequests)
    DefaultRegistry.Register("http_errors_total", &httpErrors)
    DefaultRegistry.Register("http_duration_seconds", httpDuration)
}

// Database package registers its metrics
func init() {
    DefaultRegistry.Register("db_queries_total", &dbQueries)
    DefaultRegistry.Register("db_connections_active", &dbConnections)
}

// Cache package registers its metrics
func init() {
    DefaultRegistry.Register("cache_hits_total", &cacheHits)
    DefaultRegistry.Register("cache_misses_total", &cacheMisses)
}

// Metrics endpoint is simple and complete
func MetricsHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, DefaultRegistry.RenderAll())  // All metrics automatically included!
}

// Duplicate detection at startup
func init() {
    if err := registry.Register("requests_total", counter1); err != nil {
        log.Fatal(err)  // Fails fast: "metric already registered"
    }
}
\`\`\`

**3. Real Production Scenario**
Microservice with comprehensive metrics:
\`\`\`go
type Service struct {
    registry *Registry
    // ... other fields
}

func NewService() *Service {
    registry := NewRegistry()

    // Register all metrics at startup
    // HTTP layer
    registry.Register("http_requests_total", httpMetrics.Requests)
    registry.Register("http_errors_total", httpMetrics.Errors)
    registry.Register("http_duration_seconds", httpMetrics.Duration)

    // Business logic
    registry.Register("orders_created_total", orderMetrics.Created)
    registry.Register("orders_failed_total", orderMetrics.Failed)
    registry.Register("orders_revenue_usd", orderMetrics.Revenue)

    // Infrastructure
    registry.Register("db_connections_active", dbMetrics.Connections)
    registry.Register("db_queries_total", dbMetrics.Queries)
    registry.Register("cache_items_total", cacheMetrics.Items)
    registry.Register("cache_hit_rate", cacheMetrics.HitRate)

    // System resources
    registry.Register("memory_usage_bytes", sysMetrics.Memory)
    registry.Register("goroutines_active", sysMetrics.Goroutines)
    registry.Register("cpu_usage_percent", sysMetrics.CPU)

    return &Service{registry: registry}
}

// Metrics endpoint automatically includes everything
func (s *Service) MetricsEndpoint(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/plain; version=0.0.4")
    fmt.Fprint(w, s.registry.RenderAll())
}

// Health check validates metrics are registered
func (s *Service) HealthCheck() error {
    metrics := s.registry.ListMetrics()
    if len(metrics) < 10 {
        return fmt.Errorf("expected at least 10 metrics, got %d", len(metrics))
    }
    return nil
}
\`\`\`

**4. Dynamic Metrics Registration**
Support multi-tenant systems:
\`\`\`go
type TenantManager struct {
    registry *Registry
}

// Register metrics for each tenant dynamically
func (tm *TenantManager) OnboardTenant(tenantID string) error {
    // Create metrics for this tenant
    requestsCounter := NewCounter()
    errorsCounter := NewCounter()
    latencyHistogram := NewHistogram([]float64{0.1, 0.5, 1.0, 5.0})

    // Register with tenant prefix
    prefix := fmt.Sprintf("tenant_%s", tenantID)
    tm.registry.Register(fmt.Sprintf("%s_requests_total", prefix), requestsCounter)
    tm.registry.Register(fmt.Sprintf("%s_errors_total", prefix), errorsCounter)
    tm.registry.Register(fmt.Sprintf("%s_latency_seconds", prefix), latencyHistogram)

    log.Printf("Registered metrics for tenant: %s", tenantID)
    return nil
}

// Remove metrics when tenant is offboarded
func (tm *TenantManager) OffboardTenant(tenantID string) {
    prefix := fmt.Sprintf("tenant_%s", tenantID)
    tm.registry.Unregister(fmt.Sprintf("%s_requests_total", prefix))
    tm.registry.Unregister(fmt.Sprintf("%s_errors_total", prefix))
    tm.registry.Unregister(fmt.Sprintf("%s_latency_seconds", prefix))

    log.Printf("Unregistered metrics for tenant: %s", tenantID)
}

// Result: Clean metric registration/cleanup per tenant
\`\`\`

**5. Testing Benefits**
Registry makes testing much easier:
\`\`\`go
func TestMetricsRegistration(t *testing.T) {
    registry := NewRegistry()

    // Test duplicate detection
    counter := NewCounter()
    err := registry.Register("test_metric", counter)
    assert.NoError(t, err)

    err = registry.Register("test_metric", counter)
    assert.Error(t, err)  // Should fail on duplicate
    assert.Contains(t, err.Error(), "already registered")
}

func TestMetricsEndpoint(t *testing.T) {
    registry := NewRegistry()

    // Register test metrics
    counter := NewCounter()
    counter.Inc(42)
    registry.Register("test_counter", counter)

    // Render and verify output
    output := registry.RenderAll()
    assert.Contains(t, output, "# TYPE test_counter counter")
    assert.Contains(t, output, "test_counter 42")
}

func TestServiceMetrics(t *testing.T) {
    service := NewService()

    // Verify all expected metrics are registered
    metrics := service.registry.ListMetrics()
    expectedMetrics := []string{
        "http_requests_total",
        "db_queries_total",
        "cache_hits_total",
    }

    for _, expected := range expectedMetrics {
        assert.Contains(t, metrics, expected)
    }
}
\`\`\`

**6. Debugging and Observability**
\`\`\`go
// List all registered metrics for debugging
func DebugMetrics() {
    metrics := DefaultRegistry.ListMetrics()
    log.Printf("Registered metrics (%d):", len(metrics))
    for _, name := range metrics {
        metric, _ := DefaultRegistry.GetMetric(name)
        log.Printf("  - %s [%s]: %s", name, metric.Type(), metric.Render())
    }
}

// Validate metric configuration at startup
func ValidateMetrics() error {
    required := []string{
        "http_requests_total",
        "http_errors_total",
        "db_connections_active",
    }

    for _, name := range required {
        if _, err := DefaultRegistry.GetMetric(name); err != nil {
            return fmt.Errorf("required metric missing: %s", name)
        }
    }

    return nil
}

// Call at startup
func main() {
    if err := ValidateMetrics(); err != nil {
        log.Fatal("Metrics validation failed:", err)
    }
    log.Println("All required metrics registered")
}
\`\`\`

**7. Prometheus Client Library Pattern**
This pattern is used by official Prometheus clients:
\`\`\`go
// Similar to prometheus.Registry
import "github.com/prometheus/client_golang/prometheus"

// They use the same pattern!
registry := prometheus.NewRegistry()

counter := prometheus.NewCounter(...)
registry.MustRegister(counter)  // Register metric

// Their promhttp.HandlerFor uses registry
http.Handle("/metrics", promhttp.HandlerFor(registry, promhttp.HandlerOpts{}))
\`\`\`

**8. Real-World Impact**
SaaS platform before registry:
- **Problem**: 50+ metrics scattered across codebase
- **Issues**:
  - Forgot to expose 12 metrics in endpoint
  - Duplicate metric names in different packages
  - No way to list all metrics
  - Testing was difficult

After implementing registry:
- **Result**:
  - All metrics automatically exposed
  - Duplicate detection at startup
  - Easy to audit metric coverage
  - Simple to test
  - Development velocity +30%
  - Zero duplicate name incidents
  - Complete metrics visibility

**Production Best Practices:**
1. Use single global registry for entire application
2. Register metrics in package init() functions
3. Validate required metrics at startup
4. Use consistent naming conventions
5. Sort metrics alphabetically in output
6. Include metric documentation in registry
7. Use registry for service health checks
8. Log metric registration in development mode

A metrics registry is the foundation of organized, maintainable observability infrastructure.`,
	order: 4,
	translations: {
		ru: {
			title: 'Реестр метрик',
			solutionCode: `package metricsx

import (
	"errors"
	"fmt"
	"regexp"
	"sort"
	"sync"
)

// Metric интерфейс который должны реализовать все метрики
type Metric interface {
	Type() string       // возвращает тип метрики для prometheus TYPE комментария
	Render() string     // возвращает prometheus отформатированное значение метрики
}

type Registry struct {
	mu      sync.RWMutex
	metrics map[string]Metric
}

func NewRegistry() *Registry {
	return &Registry{
		metrics: make(map[string]Metric),  // инициализируем пустую карту метрик
	}
}

var validMetricName = regexp.MustCompile("^[a-zA-Z_][a-zA-Z0-9_]*$")  // правила именования prometheus

func (r *Registry) Register(name string, metric Metric) error {
	if name == "" {                                      // валидируем что имя не пустое
		return errors.New("metric name cannot be empty")
	}
	if !validMetricName.MatchString(name) {             // валидируем соглашения об именовании prometheus
		return fmt.Errorf("invalid metric name: %s", name)
	}

	r.mu.Lock()                                          // захватываем блокировку записи для модификации
	defer r.mu.Unlock()

	if _, exists := r.metrics[name]; exists {            // проверяем дублирующееся имя
		return fmt.Errorf("metric already registered: %s", name)
	}

	r.metrics[name] = metric                             // сохраняем метрику в реестре
	return nil
}

func (r *Registry) GetMetric(name string) (Metric, error) {
	r.mu.RLock()                                         // захватываем блокировку чтения для поиска
	defer r.mu.RUnlock()

	metric, exists := r.metrics[name]                    // ищем метрику по имени
	if !exists {
		return nil, fmt.Errorf("metric not found: %s", name)
	}
	return metric, nil
}

func (r *Registry) Unregister(name string) {
	r.mu.Lock()                                          // захватываем блокировку записи для удаления
	defer r.mu.Unlock()
	delete(r.metrics, name)                              // удаляем метрику из карты (безопасно если не существует)
}

func (r *Registry) RenderAll() string {
	r.mu.RLock()                                         // захватываем блокировку чтения для итерации
	defer r.mu.RUnlock()

	// Получаем отсортированные имена метрик для согласованного вывода
	names := make([]string, 0, len(r.metrics))
	for name := range r.metrics {
		names = append(names, name)
	}
	sort.Strings(names)                                  // сортируем алфавитно для детерминированного вывода

	var result string
	for _, name := range names {                         // итерируем метрики в отсортированном порядке
		metric := r.metrics[name]
		// Добавляем HELP и TYPE комментарии для каждой метрики
		result += fmt.Sprintf("# HELP %s %s metric\\n", name, metric.Type())
		result += fmt.Sprintf("# TYPE %s %s\\n", name, metric.Type())
		result += fmt.Sprintf("%s %s\\n", name, metric.Render())  // добавляем строку значения метрики
	}

	return result
}

func (r *Registry) ListMetrics() []string {
	r.mu.RLock()                                         // захватываем блокировку чтения для чтения имен
	defer r.mu.RUnlock()

	names := make([]string, 0, len(r.metrics))           // выделяем срез для имен
	for name := range r.metrics {                        // собираем все имена метрик
		names = append(names, name)
	}
	sort.Strings(names)                                  // сортируем для согласованного упорядочения
	return names
}`,
			description: `Реализуйте реестр метрик для централизованного управления и экспонирования множественных метрик.

**Требования:**
1. **Registry Type**: Хранить map имени метрики к интерфейсу метрики
2. **RegisterCounter/RegisterGauge/RegisterHistogram**: Добавить метрики с валидацией
3. **GetMetric(name)**: Извлечь зарегистрированную метрику по имени
4. **RenderAll()**: Сгенерировать Prometheus вывод для всех зарегистрированных метрик
5. **Unregister(name)**: Удалить метрику из реестра

**Ключевые концепции:**
- Реестр предоставляет единый источник истины для метрик
- Предотвращает дублирующиеся имена метрик
- Делает метрики обнаруживаемыми
- Упрощает реализацию endpoint метрик
- Поддерживает динамическую регистрацию метрик

**Ограничения:**
- Должен использовать sync.RWMutex для потокобезопасного доступа
- Register должен отклонять дублирующиеся имена (вернуть ошибку)
- GetMetric должен вернуть ошибку если метрика не найдена
- RenderAll должен итерировать все метрики в согласованном порядке
- Поддерживать типы метрик Counter, Gauge, Histogram
- Имена метрик должны следовать соглашениям об именовании Prometheus (a-z, 0-9, _)`,
			hint1: `Используйте r.mu.Lock() для Register/Unregister (записи). Используйте r.mu.RLock() для GetMetric/RenderAll (чтения). Проверяйте дубликаты в Register.`,
			hint2: `Для RenderAll соберите имена метрик в срез, отсортируйте их, затем итерируйте в отсортированном порядке. Включите HELP и TYPE комментарии для каждой метрики.`,
			whyItMatters: `Реестр метрик обеспечивает централизованное управление и организацию для production observability.

**Почему важно:**

**1. Хаос без реестра**
Без централизованного управления метриками:
\`\`\`go
// ПРОБЛЕМНО: Разбросанные метрики везде
var (
    httpRequests   Counter   // В http пакете
    dbQueries      Counter   // В database пакете
    cacheHits      Counter   // В cache пакете
    // ... метрики разбросаны по 20+ файлам
)

// Endpoint метрик - кошмар
func MetricsHandler(w http.ResponseWriter, r *http.Request) {
    // Нужно вручную импортировать и ссылаться на каждую метрику
    fmt.Fprintf(w, "http_requests_total %d\n", httpRequests.Value())
    fmt.Fprintf(w, "db_queries_total %d\n", dbQueries.Value())
    fmt.Fprintf(w, "cache_hits_total %d\n", cacheHits.Value())
    // ... еще 50 строк
    // Легко пропустить метрики
    // Сложно поддерживать
    // Нет валидации
}

// Дублирующееся имя? Не узнаете до runtime!
var requestsTotal Counter   // В пакете A
var requestsTotal Counter   // В пакете B - коллизия имен!
\`\`\`

**2. С реестром - организованно и безопасно**
\`\`\`go
// ЛУЧШЕ: Централизованный реестр
var DefaultRegistry = NewRegistry()

// HTTP пакет регистрирует свои метрики
func init() {
    DefaultRegistry.Register("http_requests_total", &httpRequests)
    DefaultRegistry.Register("http_errors_total", &httpErrors)
    DefaultRegistry.Register("http_duration_seconds", httpDuration)
}

// Database пакет регистрирует свои метрики
func init() {
    DefaultRegistry.Register("db_queries_total", &dbQueries)
    DefaultRegistry.Register("db_connections_active", &dbConnections)
}

// Cache пакет регистрирует свои метрики
func init() {
    DefaultRegistry.Register("cache_hits_total", &cacheHits)
    DefaultRegistry.Register("cache_misses_total", &cacheMisses)
}

// Endpoint метрик простой и полный
func MetricsHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, DefaultRegistry.RenderAll())  // Все метрики автоматически включены!
}

// Обнаружение дубликатов при запуске
func init() {
    if err := registry.Register("requests_total", counter1); err != nil {
        log.Fatal(err)  // Падает быстро: "metric already registered"
    }
}
\`\`\`

**3. Real Production сценарий**
Микросервис с комплексными метриками:
\`\`\`go
type Service struct {
    registry *Registry
    // ... другие поля
}

func NewService() *Service {
    registry := NewRegistry()

    // Регистрируем все метрики при старте
    // HTTP слой
    registry.Register("http_requests_total", httpMetrics.Requests)
    registry.Register("http_errors_total", httpMetrics.Errors)
    registry.Register("http_duration_seconds", httpMetrics.Duration)

    // Бизнес-логика
    registry.Register("orders_created_total", orderMetrics.Created)
    registry.Register("orders_failed_total", orderMetrics.Failed)
    registry.Register("orders_revenue_usd", orderMetrics.Revenue)

    // Инфраструктура
    registry.Register("db_connections_active", dbMetrics.Connections)
    registry.Register("db_queries_total", dbMetrics.Queries)
    registry.Register("cache_items_total", cacheMetrics.Items)
    registry.Register("cache_hit_rate", cacheMetrics.HitRate)

    // Системные ресурсы
    registry.Register("memory_usage_bytes", sysMetrics.Memory)
    registry.Register("goroutines_active", sysMetrics.Goroutines)
    registry.Register("cpu_usage_percent", sysMetrics.CPU)

    return &Service{registry: registry}
}

// Endpoint метрик автоматически включает всё
func (s *Service) MetricsEndpoint(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/plain; version=0.0.4")
    fmt.Fprint(w, s.registry.RenderAll())
}

// Health check валидирует что метрики зарегистрированы
func (s *Service) HealthCheck() error {
    metrics := s.registry.ListMetrics()
    if len(metrics) < 10 {
        return fmt.Errorf("ожидалось минимум 10 метрик, получено %d", len(metrics))
    }
    return nil
}
\`\`\`

**4. Динамическая регистрация метрик**
Поддержка multi-tenant систем:
\`\`\`go
type TenantManager struct {
    registry *Registry
}

// Регистрируем метрики для каждого tenant динамически
func (tm *TenantManager) OnboardTenant(tenantID string) error {
    // Создаем метрики для этого tenant
    requestsCounter := NewCounter()
    errorsCounter := NewCounter()
    latencyHistogram := NewHistogram([]float64{0.1, 0.5, 1.0, 5.0})

    // Регистрируем с префиксом tenant
    prefix := fmt.Sprintf("tenant_%s", tenantID)
    tm.registry.Register(fmt.Sprintf("%s_requests_total", prefix), requestsCounter)
    tm.registry.Register(fmt.Sprintf("%s_errors_total", prefix), errorsCounter)
    tm.registry.Register(fmt.Sprintf("%s_latency_seconds", prefix), latencyHistogram)

    log.Printf("Зарегистрированы метрики для tenant: %s", tenantID)
    return nil
}

// Удаляем метрики когда tenant offboarded
func (tm *TenantManager) OffboardTenant(tenantID string) {
    prefix := fmt.Sprintf("tenant_%s", tenantID)
    tm.registry.Unregister(fmt.Sprintf("%s_requests_total", prefix))
    tm.registry.Unregister(fmt.Sprintf("%s_errors_total", prefix))
    tm.registry.Unregister(fmt.Sprintf("%s_latency_seconds", prefix))

    log.Printf("Отменена регистрация метрик для tenant: %s", tenantID)
}

// Результат: Чистая регистрация/очистка метрик на tenant
\`\`\`

**5. Преимущества для тестирования**
Реестр делает тестирование намного проще:
\`\`\`go
func TestMetricsRegistration(t *testing.T) {
    registry := NewRegistry()

    // Тест обнаружения дубликатов
    counter := NewCounter()
    err := registry.Register("test_metric", counter)
    assert.NoError(t, err)

    err = registry.Register("test_metric", counter)
    assert.Error(t, err)  // Должен упасть на дубликате
    assert.Contains(t, err.Error(), "already registered")
}

func TestMetricsEndpoint(t *testing.T) {
    registry := NewRegistry()

    // Регистрируем тестовые метрики
    counter := NewCounter()
    counter.Inc(42)
    registry.Register("test_counter", counter)

    // Рендерим и проверяем вывод
    output := registry.RenderAll()
    assert.Contains(t, output, "# TYPE test_counter counter")
    assert.Contains(t, output, "test_counter 42")
}

func TestServiceMetrics(t *testing.T) {
    service := NewService()

    // Проверяем что все ожидаемые метрики зарегистрированы
    metrics := service.registry.ListMetrics()
    expectedMetrics := []string{
        "http_requests_total",
        "db_queries_total",
        "cache_hits_total",
    }

    for _, expected := range expectedMetrics {
        assert.Contains(t, metrics, expected)
    }
}
\`\`\`

**6. Отладка и observability**
\`\`\`go
// Список всех зарегистрированных метрик для отладки
func DebugMetrics() {
    metrics := DefaultRegistry.ListMetrics()
    log.Printf("Зарегистрированные метрики (%d):", len(metrics))
    for _, name := range metrics {
        metric, _ := DefaultRegistry.GetMetric(name)
        log.Printf("  - %s [%s]: %s", name, metric.Type(), metric.Render())
    }
}

// Валидация конфигурации метрик при старте
func ValidateMetrics() error {
    required := []string{
        "http_requests_total",
        "http_errors_total",
        "db_connections_active",
    }

    for _, name := range required {
        if _, err := DefaultRegistry.GetMetric(name); err != nil {
            return fmt.Errorf("требуемая метрика отсутствует: %s", name)
        }
    }

    return nil
}

// Вызов при старте
func main() {
    if err := ValidateMetrics(); err != nil {
        log.Fatal("Валидация метрик провалилась:", err)
    }
    log.Println("Все требуемые метрики зарегистрированы")
}
\`\`\`

**7. Паттерн Prometheus Client Library**
Этот паттерн используется официальными Prometheus клиентами:
\`\`\`go
// Похоже на prometheus.Registry
import "github.com/prometheus/client_golang/prometheus"

// Они используют тот же паттерн!
registry := prometheus.NewRegistry()

counter := prometheus.NewCounter(...)
registry.MustRegister(counter)  // Регистрируем метрику

// Их promhttp.HandlerFor использует registry
http.Handle("/metrics", promhttp.HandlerFor(registry, promhttp.HandlerOpts{}))
\`\`\`

**8. Real-World влияние**
SaaS платформа до реестра:
- **Проблема**: 50+ метрик разбросаны по кодовой базе
- **Проблемы**:
  - Забыли экспонировать 12 метрик в endpoint
  - Дублирующиеся имена метрик в разных пакетах
  - Нет способа перечислить все метрики
  - Тестирование было сложным

После внедрения реестра:
- **Результат**:
  - Все метрики автоматически экспонированы
  - Обнаружение дубликатов при старте
  - Легко аудитировать покрытие метриками
  - Просто тестировать
  - Velocity разработки +30%
  - Ноль инцидентов с дублирующимися именами
  - Полная видимость метрик

**Production лучшие практики:**
1. Используйте единый глобальный реестр для всего приложения
2. Регистрируйте метрики в init() функциях пакетов
3. Валидируйте требуемые метрики при старте
4. Используйте консистентные соглашения об именовании
5. Сортируйте метрики алфавитно в выводе
6. Включайте документацию метрик в реестр
7. Используйте реестр для health checks сервиса
8. Логируйте регистрацию метрик в development mode

Реестр метрик - это фундамент организованной, поддерживаемой инфраструктуры observability.`
		},
		uz: {
			title: `Metriklar registri`,
			solutionCode: `package metricsx

import (
	"errors"
	"fmt"
	"regexp"
	"sort"
	"sync"
)

// Barcha metrikalar amalga oshirishi kerak bo'lgan Metric interfeysi
type Metric interface {
	Type() string       // prometheus TYPE izohi uchun metrika turini qaytaradi
	Render() string     // prometheus formatida metrika qiymatini qaytaradi
}

type Registry struct {
	mu      sync.RWMutex
	metrics map[string]Metric
}

func NewRegistry() *Registry {
	return &Registry{
		metrics: make(map[string]Metric),  // bo'sh metrikalar xaritasini initsializatsiya qilamiz
	}
}

var validMetricName = regexp.MustCompile("^[a-zA-Z_][a-zA-Z0-9_]*$")  // prometheus nomlash qoidalari

func (r *Registry) Register(name string, metric Metric) error {
	if name == "" {                                      // nom bo'sh emasligini tekshiramiz
		return errors.New("metric name cannot be empty")
	}
	if !validMetricName.MatchString(name) {             // prometheus nomlash konvensiyasini tekshiramiz
		return fmt.Errorf("invalid metric name: %s", name)
	}

	r.mu.Lock()                                          // o'zgartirish uchun yozish qulfini olamiz
	defer r.mu.Unlock()

	if _, exists := r.metrics[name]; exists {            // takrorlanuvchi nomni tekshiramiz
		return fmt.Errorf("metric already registered: %s", name)
	}

	r.metrics[name] = metric                             // registrda metrikani saqlaymiz
	return nil
}

func (r *Registry) GetMetric(name string) (Metric, error) {
	r.mu.RLock()                                         // qidiruv uchun o'qish qulfini olamiz
	defer r.mu.RUnlock()

	metric, exists := r.metrics[name]                    // nom bo'yicha metrikani qidiramiz
	if !exists {
		return nil, fmt.Errorf("metric not found: %s", name)
	}
	return metric, nil
}

func (r *Registry) Unregister(name string) {
	r.mu.Lock()                                          // o'chirish uchun yozish qulfini olamiz
	defer r.mu.Unlock()
	delete(r.metrics, name)                              // xaritadan metrikani o'chiramiz (mavjud bo'lmasa xavfsiz)
}

func (r *Registry) RenderAll() string {
	r.mu.RLock()                                         // iteratsiya uchun o'qish qulfini olamiz
	defer r.mu.RUnlock()

	// Izchil chiqish uchun saralangan metrika nomlarini olamiz
	names := make([]string, 0, len(r.metrics))
	for name := range r.metrics {
		names = append(names, name)
	}
	sort.Strings(names)                                  // deterministik chiqish uchun alifbo tartibida saralamiz

	var result string
	for _, name := range names {                         // saralangan tartibda metrikalarni takrorlaymiz
		metric := r.metrics[name]
		// Har bir metrika uchun HELP va TYPE izohlarini qo'shamiz
		result += fmt.Sprintf("# HELP %s %s metric\\n", name, metric.Type())
		result += fmt.Sprintf("# TYPE %s %s\\n", name, metric.Type())
		result += fmt.Sprintf("%s %s\\n", name, metric.Render())  // metrika qiymati qatorini qo'shamiz
	}

	return result
}

func (r *Registry) ListMetrics() []string {
	r.mu.RLock()                                         // nomlarni o'qish uchun o'qish qulfini olamiz
	defer r.mu.RUnlock()

	names := make([]string, 0, len(r.metrics))           // nomlar uchun slice ajratamiz
	for name := range r.metrics {                        // barcha metrika nomlarini yig'amiz
		names = append(names, name)
	}
	sort.Strings(names)                                  // izchil tartiblash uchun saralamiz
	return names
}`,
			description: `Bir nechta metrikalarni markazlashtirilgan tarzda boshqarish va ochish uchun metrics registry'ni amalga oshiring.

**Talablar:**
1. **Registry Turi**: Metrika nomi dan metrika interfeysi ga map saqlash
2. **RegisterCounter/RegisterGauge/RegisterHistogram**: Tekshiruv bilan metrikalar qo'shish
3. **GetMetric(name)**: Nom bo'yicha ro'yxatdan o'tgan metrikani olish
4. **RenderAll()**: Barcha ro'yxatdan o'tgan metrikalar uchun Prometheus chiqishini yaratish
5. **Unregister(name)**: Registrydan metrikani o'chirish

**Asosiy tushunchalar:**
- Registry metrikalar uchun yagona haqiqat manbai
- Takrorlanuvchi metrika nomlarining oldini oladi
- Metrikalarni kashf etish imkonini beradi
- Metrikalar endpoint amalga oshirishni soddalashtiradi
- Dinamik metrika ro'yxatdan o'tkazishni qo'llab-quvvatlaydi

**Cheklovlar:**
- Thread-safe kirish uchun sync.RWMutex ishlatish kerak
- Register takrorlanuvchi nomlarni rad etishi kerak (xato qaytarish)
- GetMetric metrika topilmasa xato qaytarishi kerak
- RenderAll barcha metrikalarni izchil tartibda takrorlashi kerak
- Counter, Gauge, Histogram metrika turlarini qo'llab-quvvatlash
- Metrika nomlari Prometheus nomlash konvensiyalariga rioya qilishi kerak (a-z, 0-9, _)`,
			hint1: `Register/Unregister (yozishlar) uchun r.mu.Lock() ishlating. GetMetric/RenderAll (o'qishlar) uchun r.mu.RLock() ishlating. Register da takrorlanishlarni tekshiring.`,
			hint2: `RenderAll uchun metrika nomlarini slice'ga yig'ing, ularni saralang, keyin saralangan tartibda takrorlang. Har bir metrika uchun HELP va TYPE izohlarini qo'shing.`,
			whyItMatters: `Metrics registry production observability uchun markazlashtirilgan boshqaruv va tashkilot beradi.

**Nima uchun bu muhim:**

**1. Registrysiz tartibsizlik**
Markazlashtirilgan metrikalar boshqaruvisiz:
\`\`\`go
// MUAMMOLI: Hamma joyda tarqalgan metrikalar
var (
    httpRequests   Counter   // http paketida
    dbQueries      Counter   // database paketida
    cacheHits      Counter   // cache paketida
    // ... 20+ faylga tarqalgan metrikalar
)

// Metrikalar endpoint - dahshat
func MetricsHandler(w http.ResponseWriter, r *http.Request) {
    // Har bir metrikani qo'lda import qilish va havola qilish kerak
    fmt.Fprintf(w, "http_requests_total %d\n", httpRequests.Value())
    fmt.Fprintf(w, "db_queries_total %d\n", dbQueries.Value())
    fmt.Fprintf(w, "cache_hits_total %d\n", cacheHits.Value())
    // ... yana 50 qator
    // Metrikalarni o'tkazib yuborish oson
    // Saqlash qiyin
    // Tekshiruv yo'q
}

// Takrorlanuvchi nom? Runtime gacha bilmaysiz!
var requestsTotal Counter   // A paketida
var requestsTotal Counter   // B paketida - nom to'qnashuvi!
\`\`\`

**2. Registry bilan - tartibli va xavfsiz**
\`\`\`go
// YAXSHI: Markazlashtirilgan registry
var DefaultRegistry = NewRegistry()

// HTTP paketi o'z metrikalarini ro'yxatdan o'tkazadi
func init() {
    DefaultRegistry.Register("http_requests_total", &httpRequests)
    DefaultRegistry.Register("http_errors_total", &httpErrors)
    DefaultRegistry.Register("http_duration_seconds", httpDuration)
}

// Database paketi o'z metrikalarini ro'yxatdan o'tkazadi
func init() {
    DefaultRegistry.Register("db_queries_total", &dbQueries)
    DefaultRegistry.Register("db_connections_active", &dbConnections)
}

// Cache paketi o'z metrikalarini ro'yxatdan o'tkazadi
func init() {
    DefaultRegistry.Register("cache_hits_total", &cacheHits)
    DefaultRegistry.Register("cache_misses_total", &cacheMisses)
}

// Metrikalar endpoint oddiy va to'liq
func MetricsHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, DefaultRegistry.RenderAll())  // Barcha metrikalar avtomatik qo'shiladi!
}

// Ishga tushirishda takrorlanishni aniqlash
func init() {
    if err := registry.Register("requests_total", counter1); err != nil {
        log.Fatal(err)  // Tez muvaffaqiyatsiz: "metric already registered"
    }
}
\`\`\`

**3. Haqiqiy Production stsenariysi**
Kompleks metrikalar bilan mikroservis:
\`\`\`go
type Service struct {
    registry *Registry
    // ... boshqa maydonlar
}

func NewService() *Service {
    registry := NewRegistry()

    // Ishga tushirishda barcha metrikalarni ro'yxatdan o'tkazamiz
    // HTTP qatlami
    registry.Register("http_requests_total", httpMetrics.Requests)
    registry.Register("http_errors_total", httpMetrics.Errors)
    registry.Register("http_duration_seconds", httpMetrics.Duration)

    // Biznes mantiq
    registry.Register("orders_created_total", orderMetrics.Created)
    registry.Register("orders_failed_total", orderMetrics.Failed)
    registry.Register("orders_revenue_usd", orderMetrics.Revenue)

    // Infratuzilma
    registry.Register("db_connections_active", dbMetrics.Connections)
    registry.Register("db_queries_total", dbMetrics.Queries)
    registry.Register("cache_items_total", cacheMetrics.Items)

    // Tizim resurslari
    registry.Register("memory_usage_bytes", sysMetrics.Memory)
    registry.Register("goroutines_active", sysMetrics.Goroutines)
    registry.Register("cpu_usage_percent", sysMetrics.CPU)

    return &Service{registry: registry}
}

// Metrikalar endpoint avtomatik ravishda hammasini o'z ichiga oladi
func (s *Service) MetricsEndpoint(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/plain; version=0.0.4")
    fmt.Fprint(w, s.registry.RenderAll())
}

// Health check metrikalar ro'yxatdan o'tganligini tekshiradi
func (s *Service) HealthCheck() error {
    metrics := s.registry.ListMetrics()
    if len(metrics) < 10 {
        return fmt.Errorf("kamida 10 metrika kutilgan, %d olindi", len(metrics))
    }
    return nil
}
\`\`\`

**4. Dinamik metrikalar ro'yxatdan o'tkazish**
Multi-tenant tizimlarni qo'llab-quvvatlash:
\`\`\`go
type TenantManager struct {
    registry *Registry
}

// Har bir tenant uchun metrikalarni dinamik ro'yxatdan o'tkazamiz
func (tm *TenantManager) OnboardTenant(tenantID string) error {
    // Bu tenant uchun metrikalar yaratamiz
    requestsCounter := NewCounter()
    errorsCounter := NewCounter()
    latencyHistogram := NewHistogram([]float64{0.1, 0.5, 1.0, 5.0})

    // Tenant prefiksi bilan ro'yxatdan o'tkazamiz
    prefix := fmt.Sprintf("tenant_%s", tenantID)
    tm.registry.Register(fmt.Sprintf("%s_requests_total", prefix), requestsCounter)
    tm.registry.Register(fmt.Sprintf("%s_errors_total", prefix), errorsCounter)
    tm.registry.Register(fmt.Sprintf("%s_latency_seconds", prefix), latencyHistogram)

    log.Printf("Tenant uchun metrikalar ro'yxatdan o'tkazildi: %s", tenantID)
    return nil
}

// Tenant o'chirilganda metrikalarni o'chiramiz
func (tm *TenantManager) OffboardTenant(tenantID string) {
    prefix := fmt.Sprintf("tenant_%s", tenantID)
    tm.registry.Unregister(fmt.Sprintf("%s_requests_total", prefix))
    tm.registry.Unregister(fmt.Sprintf("%s_errors_total", prefix))
    tm.registry.Unregister(fmt.Sprintf("%s_latency_seconds", prefix))

    log.Printf("Tenant uchun metrikalar ro'yxatdan chiqarildi: %s", tenantID)
}

// Natija: Har bir tenant uchun toza metrikalar ro'yxatdan o'tkazish/tozalash
\`\`\`

**5. Test qilish uchun afzalliklar**
Registry testni ancha osonlashtiradi:
\`\`\`go
func TestMetricsRegistration(t *testing.T) {
    registry := NewRegistry()

    // Takrorlanishni aniqlash testi
    counter := NewCounter()
    err := registry.Register("test_metric", counter)
    assert.NoError(t, err)

    err = registry.Register("test_metric", counter)
    assert.Error(t, err)  // Takrorlanishda muvaffaqiyatsiz bo'lishi kerak
    assert.Contains(t, err.Error(), "already registered")
}

func TestMetricsEndpoint(t *testing.T) {
    registry := NewRegistry()

    // Test metrikalarini ro'yxatdan o'tkazamiz
    counter := NewCounter()
    counter.Inc(42)
    registry.Register("test_counter", counter)

    // Render qilamiz va chiqishni tekshiramiz
    output := registry.RenderAll()
    assert.Contains(t, output, "# TYPE test_counter counter")
    assert.Contains(t, output, "test_counter 42")
}
\`\`\`

**6. Debugging va observability**
\`\`\`go
// Debugging uchun barcha ro'yxatdan o'tkazilgan metrikalarni ro'yxatlash
func DebugMetrics() {
    metrics := DefaultRegistry.ListMetrics()
    log.Printf("Ro'yxatdan o'tkazilgan metrikalar (%d):", len(metrics))
    for _, name := range metrics {
        metric, _ := DefaultRegistry.GetMetric(name)
        log.Printf("  - %s [%s]: %s", name, metric.Type(), metric.Render())
    }
}

// Ishga tushirishda metrikalar konfiguratsiyasini tekshirish
func ValidateMetrics() error {
    required := []string{
        "http_requests_total",
        "http_errors_total",
        "db_connections_active",
    }

    for _, name := range required {
        if _, err := DefaultRegistry.GetMetric(name); err != nil {
            return fmt.Errorf("kerakli metrika yo'q: %s", name)
        }
    }

    return nil
}

// Ishga tushirishda chaqirish
func main() {
    if err := ValidateMetrics(); err != nil {
        log.Fatal("Metrikalar tekshiruvi muvaffaqiyatsiz:", err)
    }
    log.Println("Barcha kerakli metrikalar ro'yxatdan o'tkazildi")
}
\`\`\`

**7. Prometheus Client Library patterni**
Bu pattern rasmiy Prometheus klientlari tomonidan ishlatiladi:
\`\`\`go
// prometheus.Registry ga o'xshaydi
import "github.com/prometheus/client_golang/prometheus"

// Ular bir xil patternni ishlatadi!
registry := prometheus.NewRegistry()

counter := prometheus.NewCounter(...)
registry.MustRegister(counter)  // Metrikani ro'yxatdan o'tkazish

// Ularning promhttp.HandlerFor registry ishlatadi
http.Handle("/metrics", promhttp.HandlerFor(registry, promhttp.HandlerOpts{}))
\`\`\`

**8. Real-World ta'siri**
SaaS platformasi registrydan oldin:
- **Muammo**: 50+ metrikalar kod bazasi bo'ylab tarqalgan
- **Muammolar**:
  - Endpointda 12 metrikani ochishni unutdilar
  - Turli paketlarda takrorlanuvchi metrika nomlari
  - Barcha metrikalarni ro'yxatlash yo'li yo'q
  - Test qilish qiyin edi

Registryni joriy qilgandan keyin:
- **Natija**:
  - Barcha metrikalar avtomatik ochiladi
  - Ishga tushirishda takrorlanishni aniqlash
  - Metrikalar qamrovini audit qilish oson
  - Test qilish oddiy
  - Ishlab chiqish tezligi +30%
  - Takrorlanuvchi nomlar bilan nol hodisalar
  - To'liq metrikalar ko'rinishi

**Production eng yaxshi amaliyotlar:**
1. Butun ilova uchun bitta global registry dan foydalaning
2. Paketlarning init() funksiyalarida metrikalarni ro'yxatdan o'tkazing
3. Ishga tushirishda kerakli metrikalarni tekshiring
4. Izchil nomlash konvensiyalaridan foydalaning
5. Chiqishda metrikalarni alifbo tartibida saralang
6. Registryga metrika hujjatlarini qo'shing
7. Xizmat health check lari uchun registrydan foydalaning
8. Development rejimida metrikalarni ro'yxatdan o'tkazishni loglang

Metrikalar registri - tashkil etilgan, saqlash mumkin bo'lgan observability infratuzilmasining asosi.`
		}
	}
};

export default task;
