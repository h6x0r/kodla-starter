import { Task } from '../../../../../../../types';

const task: Task = {
	slug: 'goml-middleware',
	title: 'Inference Middleware',
	difficulty: 'medium',
	tags: ['go', 'ml', 'http', 'middleware'],
	estimatedTime: '30m',
	isPremium: true,
	order: 3,
	description: `# Inference Middleware

Implement middleware for ML inference servers.

## Task

Build middleware that:
- Logs inference requests and latencies
- Implements rate limiting
- Adds request tracing
- Handles timeouts

## Example

\`\`\`go
handler := LoggingMiddleware(
    RateLimitMiddleware(
        TimeoutMiddleware(inferenceHandler, 5*time.Second),
        100, // requests per second
    ),
)
\`\`\``,

	initialCode: `package main

import (
	"fmt"
	"net/http"
	"time"
)

// LoggingMiddleware logs requests and latencies
func LoggingMiddleware(next http.Handler) http.Handler {
	// Your code here
	return nil
}

// RateLimitMiddleware limits requests per second
func RateLimitMiddleware(next http.Handler, rps int) http.Handler {
	// Your code here
	return nil
}

// TimeoutMiddleware enforces request timeout
func TimeoutMiddleware(next http.Handler, timeout time.Duration) http.Handler {
	// Your code here
	return nil
}

func main() {
	fmt.Println("Inference Middleware")
}`,

	solutionCode: `package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"sync/atomic"
	"time"
)

// LoggingMiddleware logs requests and latencies
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Wrap response writer to capture status
		lrw := &loggingResponseWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}

		next.ServeHTTP(lrw, r)

		latency := time.Since(start)
		log.Printf("%s %s %d %v", r.Method, r.URL.Path, lrw.statusCode, latency)
	})
}

type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (lrw *loggingResponseWriter) WriteHeader(code int) {
	lrw.statusCode = code
	lrw.ResponseWriter.WriteHeader(code)
}

// RateLimiter implements token bucket rate limiting
type RateLimiter struct {
	tokens     float64
	maxTokens  float64
	refillRate float64
	lastRefill time.Time
	mu         sync.Mutex
}

func NewRateLimiter(rps int) *RateLimiter {
	return &RateLimiter{
		tokens:     float64(rps),
		maxTokens:  float64(rps),
		refillRate: float64(rps),
		lastRefill: time.Now(),
	}
}

func (rl *RateLimiter) Allow() bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	elapsed := now.Sub(rl.lastRefill).Seconds()
	rl.tokens += elapsed * rl.refillRate
	if rl.tokens > rl.maxTokens {
		rl.tokens = rl.maxTokens
	}
	rl.lastRefill = now

	if rl.tokens >= 1 {
		rl.tokens--
		return true
	}
	return false
}

// RateLimitMiddleware limits requests per second
func RateLimitMiddleware(next http.Handler, rps int) http.Handler {
	limiter := NewRateLimiter(rps)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !limiter.Allow() {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Retry-After", "1")
			w.WriteHeader(http.StatusTooManyRequests)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "Rate limit exceeded",
			})
			return
		}
		next.ServeHTTP(w, r)
	})
}

// TimeoutMiddleware enforces request timeout
func TimeoutMiddleware(next http.Handler, timeout time.Duration) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), timeout)
		defer cancel()

		r = r.WithContext(ctx)

		done := make(chan struct{})
		go func() {
			next.ServeHTTP(w, r)
			close(done)
		}()

		select {
		case <-done:
			// Request completed
		case <-ctx.Done():
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusGatewayTimeout)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "Request timeout",
			})
		}
	})
}

// TracingMiddleware adds request tracing
func TracingMiddleware(next http.Handler) http.Handler {
	var requestID uint64

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := atomic.AddUint64(&requestID, 1)
		traceID := fmt.Sprintf("req-%d-%d", time.Now().UnixNano(), id)

		// Add trace ID to context
		ctx := context.WithValue(r.Context(), "trace_id", traceID)
		r = r.WithContext(ctx)

		// Add trace ID to response header
		w.Header().Set("X-Trace-ID", traceID)

		next.ServeHTTP(w, r)
	})
}

// RecoveryMiddleware recovers from panics
func RecoveryMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Panic recovered: %v", err)
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{
					"error": "Internal server error",
				})
			}
		}()
		next.ServeHTTP(w, r)
	})
}

// MetricsMiddleware collects request metrics
type MetricsMiddleware struct {
	requestCount   int64
	errorCount     int64
	totalLatencyMs int64
}

func NewMetricsMiddleware() *MetricsMiddleware {
	return &MetricsMiddleware{}
}

func (m *MetricsMiddleware) Handler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		lrw := &loggingResponseWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}

		next.ServeHTTP(lrw, r)

		latency := time.Since(start).Milliseconds()
		atomic.AddInt64(&m.requestCount, 1)
		atomic.AddInt64(&m.totalLatencyMs, latency)

		if lrw.statusCode >= 400 {
			atomic.AddInt64(&m.errorCount, 1)
		}
	})
}

func (m *MetricsMiddleware) Stats() (requests, errors int64, avgLatencyMs float64) {
	requests = atomic.LoadInt64(&m.requestCount)
	errors = atomic.LoadInt64(&m.errorCount)
	totalLatency := atomic.LoadInt64(&m.totalLatencyMs)

	if requests > 0 {
		avgLatencyMs = float64(totalLatency) / float64(requests)
	}
	return
}

// ChainMiddleware chains multiple middleware
func ChainMiddleware(middlewares ...func(http.Handler) http.Handler) func(http.Handler) http.Handler {
	return func(final http.Handler) http.Handler {
		for i := len(middlewares) - 1; i >= 0; i-- {
			final = middlewares[i](final)
		}
		return final
	}
}

func main() {
	// Simple inference handler
	inferenceHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(10 * time.Millisecond) // Simulate inference
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"prediction": []float32{0.8, 0.2},
		})
	})

	// Chain middleware
	chain := ChainMiddleware(
		RecoveryMiddleware,
		TracingMiddleware,
		LoggingMiddleware,
	)

	handler := chain(
		RateLimitMiddleware(
			TimeoutMiddleware(inferenceHandler, 5*time.Second),
			100,
		),
	)

	mux := http.NewServeMux()
	mux.Handle("/predict", handler)

	fmt.Println("Starting server on :8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}`,

	testCode: `package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestLoggingMiddleware(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	wrapped := LoggingMiddleware(handler)

	r := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()

	wrapped.ServeHTTP(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w.Code)
	}
}

func TestRateLimiter(t *testing.T) {
	limiter := NewRateLimiter(2)

	if !limiter.Allow() {
		t.Error("First request should be allowed")
	}
	if !limiter.Allow() {
		t.Error("Second request should be allowed")
	}
	if limiter.Allow() {
		t.Error("Third request should be denied")
	}

	time.Sleep(time.Second)
	if !limiter.Allow() {
		t.Error("Request after refill should be allowed")
	}
}

func TestRateLimitMiddleware(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	wrapped := RateLimitMiddleware(handler, 1)

	// First request should succeed
	r := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()
	wrapped.ServeHTTP(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("First request should succeed, got %d", w.Code)
	}

	// Second immediate request should be rate limited
	r = httptest.NewRequest(http.MethodGet, "/test", nil)
	w = httptest.NewRecorder()
	wrapped.ServeHTTP(w, r)

	if w.Code != http.StatusTooManyRequests {
		t.Errorf("Expected 429, got %d", w.Code)
	}
}

func TestTimeoutMiddleware(t *testing.T) {
	slowHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		select {
		case <-time.After(100 * time.Millisecond):
			w.WriteHeader(http.StatusOK)
		case <-r.Context().Done():
			return
		}
	})

	wrapped := TimeoutMiddleware(slowHandler, 10*time.Millisecond)

	r := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()

	wrapped.ServeHTTP(w, r)

	if w.Code != http.StatusGatewayTimeout {
		t.Errorf("Expected 504, got %d", w.Code)
	}
}

func TestTracingMiddleware(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	wrapped := TracingMiddleware(handler)

	r := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()

	wrapped.ServeHTTP(w, r)

	traceID := w.Header().Get("X-Trace-ID")
	if traceID == "" {
		t.Error("Trace ID should be set")
	}
}

func TestRecoveryMiddleware(t *testing.T) {
	panicHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		panic("test panic")
	})

	wrapped := RecoveryMiddleware(panicHandler)

	r := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()

	wrapped.ServeHTTP(w, r)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected 500, got %d", w.Code)
	}
}

func TestMetricsMiddleware(t *testing.T) {
	metrics := NewMetricsMiddleware()

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	wrapped := metrics.Handler(handler)

	r := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()

	wrapped.ServeHTTP(w, r)

	requests, errors, _ := metrics.Stats()
	if requests != 1 {
		t.Errorf("Expected 1 request, got %d", requests)
	}
	if errors != 0 {
		t.Errorf("Expected 0 errors, got %d", errors)
	}
}

func TestMetricsMiddlewareErrors(t *testing.T) {
	metrics := NewMetricsMiddleware()

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	})

	wrapped := metrics.Handler(handler)

	r := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()

	wrapped.ServeHTTP(w, r)

	_, errors, _ := metrics.Stats()
	if errors != 1 {
		t.Errorf("Expected 1 error, got %d", errors)
	}
}

func TestChainMiddleware(t *testing.T) {
	order := make([]int, 0)

	middleware1 := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			order = append(order, 1)
			next.ServeHTTP(w, r)
		})
	}

	middleware2 := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			order = append(order, 2)
			next.ServeHTTP(w, r)
		})
	}

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		order = append(order, 3)
		w.WriteHeader(http.StatusOK)
	})

	chain := ChainMiddleware(middleware1, middleware2)
	wrapped := chain(handler)

	r := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()

	wrapped.ServeHTTP(w, r)

	if len(order) != 3 || order[0] != 1 || order[1] != 2 || order[2] != 3 {
		t.Errorf("Expected order [1,2,3], got %v", order)
	}
}

func TestLoggingResponseWriter(t *testing.T) {
	recorder := httptest.NewRecorder()
	lrw := &loggingResponseWriter{
		ResponseWriter: recorder,
		statusCode:     http.StatusOK,
	}

	lrw.WriteHeader(http.StatusNotFound)

	if lrw.statusCode != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", lrw.statusCode)
	}
}`,

	hint1: 'Use token bucket algorithm for rate limiting',
	hint2: 'Wrap ResponseWriter to capture status codes for logging',

	whyItMatters: `Middleware is essential for production ML services:

- **Observability**: Logging and tracing for debugging
- **Protection**: Rate limiting prevents overload
- **Reliability**: Timeouts prevent hanging requests
- **Composability**: Stack middleware for clean architecture

Well-designed middleware makes ML services robust and maintainable.`,

	translations: {
		ru: {
			title: 'Middleware инференса',
			description: `# Middleware инференса

Реализуйте middleware для серверов ML инференса.

## Задача

Создайте middleware:
- Логирование запросов и латентности
- Реализация rate limiting
- Добавление трейсинга запросов
- Обработка таймаутов

## Пример

\`\`\`go
handler := LoggingMiddleware(
    RateLimitMiddleware(
        TimeoutMiddleware(inferenceHandler, 5*time.Second),
        100, // requests per second
    ),
)
\`\`\``,
			hint1: 'Используйте алгоритм token bucket для rate limiting',
			hint2: 'Оберните ResponseWriter для захвата статус кодов при логировании',
			whyItMatters: `Middleware необходим для production ML сервисов:

- **Наблюдаемость**: Логирование и трейсинг для отладки
- **Защита**: Rate limiting предотвращает перегрузку
- **Надежность**: Таймауты предотвращают зависшие запросы
- **Композируемость**: Стекирование middleware для чистой архитектуры`,
		},
		uz: {
			title: 'Inference middleware',
			description: `# Inference middleware

ML inference serverlari uchun middleware ni amalga oshiring.

## Topshiriq

Middleware yarating:
- So'rovlar va latency ni logging qilish
- Rate limiting ni amalga oshirish
- So'rov tracing ni qo'shish
- Timeoutlarni qayta ishlash

## Misol

\`\`\`go
handler := LoggingMiddleware(
    RateLimitMiddleware(
        TimeoutMiddleware(inferenceHandler, 5*time.Second),
        100, // requests per second
    ),
)
\`\`\``,
			hint1: "Rate limiting uchun token bucket algoritmidan foydalaning",
			hint2: "Logging uchun status practixrini ushlash uchun ResponseWriter ni o'rang",
			whyItMatters: `Middleware production ML xizmatlari uchun zarur:

- **Kuzatuvchanlik**: Debugging uchun logging va tracing
- **Himoya**: Rate limiting ortiqcha yuklanishni oldini oladi
- **Ishonchlilik**: Timeoutlar osilib qolgan so'rovlarni oldini oladi
- **Kompozitsiya**: Toza arxitektura uchun middleware ni staklashtirish`,
		},
	},
};

export default task;
