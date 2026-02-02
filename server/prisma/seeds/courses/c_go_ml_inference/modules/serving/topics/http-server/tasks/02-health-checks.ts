import { Task } from '../../../../../../../types';

const task: Task = {
	slug: 'goml-health-checks',
	title: 'Health Checks',
	difficulty: 'easy',
	tags: ['go', 'ml', 'http', 'health'],
	estimatedTime: '20m',
	isPremium: false,
	order: 2,
	description: `# Health Checks

Implement health check endpoints for ML inference servers.

## Task

Build health check handlers that:
- Provide liveness probe (/healthz)
- Provide readiness probe (/ready)
- Check model availability
- Return appropriate status codes

## Example

\`\`\`go
GET /healthz -> 200 OK
GET /ready   -> 200 OK (if model loaded)
GET /ready   -> 503 Service Unavailable (if not ready)
\`\`\``,

	initialCode: `package main

import (
	"fmt"
	"net/http"
)

// HealthChecker provides health check functionality
type HealthChecker struct {
	// Your fields here
}

// NewHealthChecker creates a health checker
func NewHealthChecker() *HealthChecker {
	// Your code here
	return nil
}

// LivenessHandler returns liveness status
func (h *HealthChecker) LivenessHandler() http.Handler {
	// Your code here
	return nil
}

// ReadinessHandler returns readiness status
func (h *HealthChecker) ReadinessHandler() http.Handler {
	// Your code here
	return nil
}

// SetReady sets the readiness state
func (h *HealthChecker) SetReady(ready bool) {
	// Your code here
}

func main() {
	fmt.Println("Health Checks")
}`,

	solutionCode: `package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"sync/atomic"
	"time"
)

// HealthStatus represents the health check response
type HealthStatus struct {
	Status    string            \`json:"status"\`
	Timestamp string            \`json:"timestamp"\`
	Details   map[string]string \`json:"details,omitempty"\`
}

// Check represents a single health check
type Check struct {
	Name    string
	Check   func() error
	Timeout time.Duration
}

// HealthChecker provides health check functionality
type HealthChecker struct {
	ready     int32
	checks    []Check
	mu        sync.RWMutex
	startTime time.Time
}

// NewHealthChecker creates a health checker
func NewHealthChecker() *HealthChecker {
	return &HealthChecker{
		ready:     0,
		checks:    make([]Check, 0),
		startTime: time.Now(),
	}
}

// AddCheck adds a health check
func (h *HealthChecker) AddCheck(check Check) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.checks = append(h.checks, check)
}

// SetReady sets the readiness state
func (h *HealthChecker) SetReady(ready bool) {
	if ready {
		atomic.StoreInt32(&h.ready, 1)
	} else {
		atomic.StoreInt32(&h.ready, 0)
	}
}

// IsReady returns current readiness state
func (h *HealthChecker) IsReady() bool {
	return atomic.LoadInt32(&h.ready) == 1
}

// LivenessHandler returns liveness status
func (h *HealthChecker) LivenessHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		status := HealthStatus{
			Status:    "alive",
			Timestamp: time.Now().UTC().Format(time.RFC3339),
			Details: map[string]string{
				"uptime": time.Since(h.startTime).String(),
			},
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(status)
	})
}

// ReadinessHandler returns readiness status
func (h *HealthChecker) ReadinessHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h.mu.RLock()
		checks := h.checks
		h.mu.RUnlock()

		details := make(map[string]string)
		allPassed := true

		// Run all registered checks
		for _, check := range checks {
			if check.Timeout == 0 {
				check.Timeout = 5 * time.Second
			}

			done := make(chan error, 1)
			go func(c Check) {
				done <- c.Check()
			}(check)

			select {
			case err := <-done:
				if err != nil {
					details[check.Name] = fmt.Sprintf("failed: %v", err)
					allPassed = false
				} else {
					details[check.Name] = "ok"
				}
			case <-time.After(check.Timeout):
				details[check.Name] = "timeout"
				allPassed = false
			}
		}

		// Check basic readiness flag
		if !h.IsReady() {
			details["ready_flag"] = "not ready"
			allPassed = false
		} else {
			details["ready_flag"] = "ready"
		}

		status := HealthStatus{
			Timestamp: time.Now().UTC().Format(time.RFC3339),
			Details:   details,
		}

		w.Header().Set("Content-Type", "application/json")

		if allPassed {
			status.Status = "ready"
			w.WriteHeader(http.StatusOK)
		} else {
			status.Status = "not ready"
			w.WriteHeader(http.StatusServiceUnavailable)
		}

		json.NewEncoder(w).Encode(status)
	})
}

// StartupHandler for startup probe
func (h *HealthChecker) StartupHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		status := HealthStatus{
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		}

		w.Header().Set("Content-Type", "application/json")

		if h.IsReady() {
			status.Status = "started"
			w.WriteHeader(http.StatusOK)
		} else {
			status.Status = "starting"
			w.WriteHeader(http.StatusServiceUnavailable)
		}

		json.NewEncoder(w).Encode(status)
	})
}

// ModelHealthChecker wraps model-specific checks
type ModelHealthChecker struct {
	*HealthChecker
	modelLoaded int32
	modelName   string
}

// NewModelHealthChecker creates a model health checker
func NewModelHealthChecker(modelName string) *ModelHealthChecker {
	mhc := &ModelHealthChecker{
		HealthChecker: NewHealthChecker(),
		modelName:     modelName,
	}

	// Add model check
	mhc.AddCheck(Check{
		Name: "model",
		Check: func() error {
			if atomic.LoadInt32(&mhc.modelLoaded) == 0 {
				return fmt.Errorf("model %s not loaded", modelName)
			}
			return nil
		},
		Timeout: 1 * time.Second,
	})

	return mhc
}

// SetModelLoaded sets the model loaded state
func (m *ModelHealthChecker) SetModelLoaded(loaded bool) {
	if loaded {
		atomic.StoreInt32(&m.modelLoaded, 1)
	} else {
		atomic.StoreInt32(&m.modelLoaded, 0)
	}
}

func main() {
	health := NewModelHealthChecker("my-model")

	mux := http.NewServeMux()
	mux.Handle("/healthz", health.LivenessHandler())
	mux.Handle("/ready", health.ReadinessHandler())
	mux.Handle("/startup", health.StartupHandler())

	// Simulate model loading
	go func() {
		fmt.Println("Loading model...")
		time.Sleep(2 * time.Second)
		health.SetModelLoaded(true)
		health.SetReady(true)
		fmt.Println("Model loaded, server ready")
	}()

	fmt.Println("Starting server on :8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}`,

	testCode: `package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestLivenessHandler(t *testing.T) {
	health := NewHealthChecker()

	r := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	w := httptest.NewRecorder()

	health.LivenessHandler().ServeHTTP(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w.Code)
	}

	var status HealthStatus
	json.NewDecoder(w.Body).Decode(&status)

	if status.Status != "alive" {
		t.Errorf("Expected 'alive', got '%s'", status.Status)
	}
}

func TestReadinessNotReady(t *testing.T) {
	health := NewHealthChecker()

	r := httptest.NewRequest(http.MethodGet, "/ready", nil)
	w := httptest.NewRecorder()

	health.ReadinessHandler().ServeHTTP(w, r)

	if w.Code != http.StatusServiceUnavailable {
		t.Errorf("Expected 503, got %d", w.Code)
	}
}

func TestReadinessReady(t *testing.T) {
	health := NewHealthChecker()
	health.SetReady(true)

	r := httptest.NewRequest(http.MethodGet, "/ready", nil)
	w := httptest.NewRecorder()

	health.ReadinessHandler().ServeHTTP(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w.Code)
	}
}

func TestModelHealthChecker(t *testing.T) {
	health := NewModelHealthChecker("test-model")

	// Not ready initially
	r := httptest.NewRequest(http.MethodGet, "/ready", nil)
	w := httptest.NewRecorder()
	health.ReadinessHandler().ServeHTTP(w, r)

	if w.Code != http.StatusServiceUnavailable {
		t.Errorf("Expected 503, got %d", w.Code)
	}

	// Set model loaded and ready
	health.SetModelLoaded(true)
	health.SetReady(true)

	r = httptest.NewRequest(http.MethodGet, "/ready", nil)
	w = httptest.NewRecorder()
	health.ReadinessHandler().ServeHTTP(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w.Code)
	}
}

func TestSetReady(t *testing.T) {
	health := NewHealthChecker()

	if health.IsReady() {
		t.Error("Should not be ready initially")
	}

	health.SetReady(true)
	if !health.IsReady() {
		t.Error("Should be ready after SetReady(true)")
	}

	health.SetReady(false)
	if health.IsReady() {
		t.Error("Should not be ready after SetReady(false)")
	}
}

func TestStartupHandler(t *testing.T) {
	health := NewHealthChecker()

	r := httptest.NewRequest(http.MethodGet, "/startup", nil)
	w := httptest.NewRecorder()

	health.StartupHandler().ServeHTTP(w, r)

	if w.Code != http.StatusServiceUnavailable {
		t.Errorf("Expected 503 when not ready, got %d", w.Code)
	}
}

func TestStartupHandlerReady(t *testing.T) {
	health := NewHealthChecker()
	health.SetReady(true)

	r := httptest.NewRequest(http.MethodGet, "/startup", nil)
	w := httptest.NewRecorder()

	health.StartupHandler().ServeHTTP(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("Expected 200 when ready, got %d", w.Code)
	}
}

func TestAddCheck(t *testing.T) {
	health := NewHealthChecker()
	health.SetReady(true)

	checkCalled := false
	health.AddCheck(Check{
		Name: "test-check",
		Check: func() error {
			checkCalled = true
			return nil
		},
	})

	r := httptest.NewRequest(http.MethodGet, "/ready", nil)
	w := httptest.NewRecorder()

	health.ReadinessHandler().ServeHTTP(w, r)

	if !checkCalled {
		t.Error("Check should have been called")
	}
}

func TestSetModelLoaded(t *testing.T) {
	health := NewModelHealthChecker("test-model")

	health.SetModelLoaded(true)
	health.SetReady(true)

	r := httptest.NewRequest(http.MethodGet, "/ready", nil)
	w := httptest.NewRecorder()

	health.ReadinessHandler().ServeHTTP(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("Expected 200 when model loaded, got %d", w.Code)
	}
}

func TestHealthStatusDetails(t *testing.T) {
	health := NewHealthChecker()

	r := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	w := httptest.NewRecorder()

	health.LivenessHandler().ServeHTTP(w, r)

	var status HealthStatus
	json.NewDecoder(w.Body).Decode(&status)

	if status.Details["uptime"] == "" {
		t.Error("Should include uptime in details")
	}
	if status.Timestamp == "" {
		t.Error("Should include timestamp")
	}
}`,

	hint1: 'Use atomic operations for thread-safe state management',
	hint2: 'Return 503 Service Unavailable when not ready',

	whyItMatters: `Health checks are essential for production ML services:

- **Kubernetes integration**: Liveness and readiness probes
- **Load balancer routing**: Route traffic only to healthy instances
- **Graceful startup**: Wait for model loading before serving traffic
- **Debugging**: Quick status check during incidents

Proper health checks enable reliable deployments and zero-downtime updates.`,

	translations: {
		ru: {
			title: 'Проверки здоровья',
			description: `# Проверки здоровья

Реализуйте эндпоинты проверки здоровья для серверов ML инференса.

## Задача

Создайте обработчики проверки здоровья:
- Проба живости (/healthz)
- Проба готовности (/ready)
- Проверка доступности модели
- Возврат соответствующих статус кодов

## Пример

\`\`\`go
GET /healthz -> 200 OK
GET /ready   -> 200 OK (if model loaded)
GET /ready   -> 503 Service Unavailable (if not ready)
\`\`\``,
			hint1: 'Используйте атомарные операции для потокобезопасного управления состоянием',
			hint2: 'Возвращайте 503 Service Unavailable когда сервис не готов',
			whyItMatters: `Проверки здоровья необходимы для production ML сервисов:

- **Интеграция с Kubernetes**: Пробы живости и готовности
- **Маршрутизация балансировщика**: Направление трафика только на здоровые инстансы
- **Плавный старт**: Ожидание загрузки модели перед обслуживанием трафика
- **Отладка**: Быстрая проверка статуса во время инцидентов`,
		},
		uz: {
			title: "Sog'liq tekshiruvlari",
			description: `# Sog'liq tekshiruvlari

ML inference serverlari uchun sog'liq tekshiruvi endpointlarini amalga oshiring.

## Topshiriq

Sog'liq tekshiruvi handlerlarini yarating:
- Jonlilik tekshiruvi (/healthz)
- Tayyorlik tekshiruvi (/ready)
- Model mavjudligini tekshirish
- Tegishli status practixrini qaytarish

## Misol

\`\`\`go
GET /healthz -> 200 OK
GET /ready   -> 200 OK (if model loaded)
GET /ready   -> 503 Service Unavailable (if not ready)
\`\`\``,
			hint1: "Thread-safe holat boshqaruvi uchun atomik operatsiyalardan foydalaning",
			hint2: "Tayyor bo'lmaganda 503 Service Unavailable qaytaring",
			whyItMatters: `Sog'liq tekshiruvlari production ML xizmatlari uchun zarur:

- **Kubernetes integratsiyasi**: Jonlilik va tayyorlik tekshiruvlari
- **Load balancer routing**: Trafikni faqat sog'lom instancelarga yo'naltirish
- **Yumshoq ishga tushirish**: Trafikni xizmat ko'rsatishdan oldin model yuklanishini kutish
- **Debugging**: Intsidentlar vaqtida tezkor status tekshiruvi`,
		},
	},
};

export default task;
