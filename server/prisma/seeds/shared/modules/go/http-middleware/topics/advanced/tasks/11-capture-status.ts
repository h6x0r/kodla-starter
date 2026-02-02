import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-http-capture-status',
	title: 'Capture Status Middleware',
	difficulty: 'medium',	tags: ['go', 'http', 'middleware', 'response'],
	estimatedTime: '30m',	isPremium: false,
	youtubeUrl: '',
	description: `Implement **CaptureStatus** middleware that captures HTTP response status code and makes it available in context.

**Requirements:**
1. Create function \`CaptureStatus(key ctxKey, next http.Handler) http.Handler\`
2. Create custom ResponseWriter wrapper that captures status
3. Store status pointer in context before calling next
4. Update status in WriteHeader and Write methods
5. Default to 200 OK if no status was written
6. Handle nil next handler

**Example:**
\`\`\`go
const StatusKey ctxKey = "status"

handler := CaptureStatus(StatusKey, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusCreated)
    fmt.Fprintf(w, "Created")

	// After writing, check status from context
    status := *r.Context().Value(StatusKey).(*int)
	// status = 201
}))

// Response: 201 Created
\`\`\`

**Constraints:**
- Must wrap ResponseWriter to intercept WriteHeader/Write
- Must store status as pointer to allow updates
- Must default to 200 if handler doesn't call WriteHeader`,
	initialCode: `package httpx

import (
	"context"
	"net/http"
)

type ctxKey string

// TODO: Implement CaptureStatus middleware
func CaptureStatus(key ctxKey, next http.Handler) http.Handler {
	// TODO: Implement
}`,
	solutionCode: `package httpx

import (
	"context"
	"net/http"
)

type ctxKey string

func CaptureStatus(key ctxKey, next http.Handler) http.Handler {
	if next == nil {	// Handle nil next handler
		return http.HandlerFunc(func(http.ResponseWriter, *http.Request) {})
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		status := 0	// Create status variable
		rec := &statusWriter{ResponseWriter: w, status: &status}	// Wrap ResponseWriter
		ctx := context.WithValue(r.Context(), key, rec.status)	// Store status pointer in context
		next.ServeHTTP(rec, r.WithContext(ctx))	// Pass wrapped writer and modified request
		if *rec.status == 0 {	// Check if status was set
			*rec.status = http.StatusOK	// Default to 200 OK
		}
	})
}

type statusWriter struct {	// Custom ResponseWriter wrapper
	http.ResponseWriter	// Embedded ResponseWriter
	status *int	// Status pointer for updates
}

func (s *statusWriter) WriteHeader(code int) {	// Intercept WriteHeader
	*s.status = code	// Capture status code
	s.ResponseWriter.WriteHeader(code)	// Call original WriteHeader
}

func (s *statusWriter) Write(b []byte) (int, error) {	// Intercept Write
	if *s.status == 0 {	// Check if status not set
		*s.status = http.StatusOK	// Default to 200 OK
	}
	return s.ResponseWriter.Write(b)	// Call original Write
}`,
			hint1: `Create a struct that embeds http.ResponseWriter and adds a *int field for status. Override WriteHeader and Write methods.`,
			hint2: `Store the status pointer in context so it can be read even after the response is written.`,
			testCode: `package httpx

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func Test1(t *testing.T) {
	// Test middleware returns non-nil handler
	const key ctxKey = "status"
	h := CaptureStatus(key, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	if h == nil {
		t.Error("handler should not be nil")
	}
}

func Test2(t *testing.T) {
	// Test nil handler returns non-nil
	h := CaptureStatus("status", nil)
	if h == nil {
		t.Error("nil handler should return non-nil")
	}
}

func Test3(t *testing.T) {
	// Test status captured from WriteHeader
	const key ctxKey = "status"
	var status *int
	h := CaptureStatus(key, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		status = r.Context().Value(key).(*int)
		w.WriteHeader(http.StatusCreated)
	}))
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest("GET", "/", nil))
	if *status != http.StatusCreated {
		t.Errorf("status = %d, want 201", *status)
	}
}

func Test4(t *testing.T) {
	// Test default status 200 when no WriteHeader
	const key ctxKey = "status"
	var status *int
	h := CaptureStatus(key, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		status = r.Context().Value(key).(*int)
		w.Write([]byte("ok"))
	}))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("GET", "/", nil))
	if *status != http.StatusOK {
		t.Errorf("status = %d, want 200 (default)", *status)
	}
}

func Test5(t *testing.T) {
	// Test 404 status captured
	const key ctxKey = "status"
	var status *int
	h := CaptureStatus(key, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		status = r.Context().Value(key).(*int)
		w.WriteHeader(http.StatusNotFound)
	}))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("GET", "/", nil))
	if *status != http.StatusNotFound {
		t.Errorf("status = %d, want 404", *status)
	}
}

func Test6(t *testing.T) {
	// Test response body passes through
	const key ctxKey = "status"
	h := CaptureStatus(key, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("response"))
	}))
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest("GET", "/", nil))
	if rec.Body.String() != "response" {
		t.Errorf("body = %q, want 'response'", rec.Body.String())
	}
}

func Test7(t *testing.T) {
	// Test actual response status code matches
	const key ctxKey = "status"
	h := CaptureStatus(key, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusAccepted)
	}))
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest("GET", "/", nil))
	if rec.Code != http.StatusAccepted {
		t.Errorf("recorder status = %d, want 202", rec.Code)
	}
}

func Test8(t *testing.T) {
	// Test headers are preserved
	const key ctxKey = "status"
	h := CaptureStatus(key, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Custom", "value")
		w.WriteHeader(http.StatusOK)
	}))
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest("GET", "/", nil))
	if rec.Header().Get("X-Custom") != "value" {
		t.Error("custom header should be preserved")
	}
}

func Test9(t *testing.T) {
	// Test request method preserved
	const key ctxKey = "status"
	var method string
	h := CaptureStatus(key, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		method = r.Method
	}))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("DELETE", "/", nil))
	if method != "DELETE" {
		t.Errorf("method = %q, want DELETE", method)
	}
}

func Test10(t *testing.T) {
	// Test 500 status captured
	const key ctxKey = "status"
	var status *int
	h := CaptureStatus(key, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		status = r.Context().Value(key).(*int)
		w.WriteHeader(http.StatusInternalServerError)
	}))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("GET", "/", nil))
	if *status != http.StatusInternalServerError {
		t.Errorf("status = %d, want 500", *status)
	}
}`,
			whyItMatters: `CaptureStatus enables logging, metrics, and monitoring by making response status codes accessible throughout the middleware chain.

**Why Capture Status:**
- **Request Logging:** Log complete request info including response status
- **Metrics:** Track status code distribution (2xx, 4xx, 5xx)
- **Monitoring:** Alert on high error rates
- **Audit:** Record all operations with their outcomes

**Production Pattern:**
\`\`\`go
const StatusKey ctxKey = "status"

// Enhanced logger with status
func StructuredLogger(next http.Handler) http.Handler {
    return CaptureStatus(StatusKey, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        next.ServeHTTP(w, r)

        status := *r.Context().Value(StatusKey).(*int)
        duration := time.Since(start)

        log.Printf(
            "method=%s path=%s status=%d duration=%v ip=%s",
            r.Method,
            r.URL.Path,
            status,
            duration,
            r.RemoteAddr,
        )

	// Alert on errors
        if status >= 500 {
            alerting.SendAlert("server_error", fmt.Sprintf("%s %s returned %d", r.Method, r.URL.Path, status))
        }
    }))
}

// Metrics collection
func MetricsMiddleware(next http.Handler) http.Handler {
    return CaptureStatus(StatusKey, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        next.ServeHTTP(w, r)

        status := *r.Context().Value(StatusKey).(*int)
        duration := time.Since(start)

	// Record metrics by status class
        statusClass := fmt.Sprintf("%dxx", status/100)
        metrics.IncrementCounter("http_requests_total", map[string]string{
            "method": r.Method,
            "path":   r.URL.Path,
            "status": statusClass,
        })

        metrics.RecordHistogram("http_request_duration_seconds", duration.Seconds(), map[string]string{
            "method": r.Method,
            "path":   r.URL.Path,
        })
    }))
}

// SLA tracking
func SLATracker(next http.Handler) http.Handler {
    return CaptureStatus(StatusKey, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        next.ServeHTTP(w, r)

        status := *r.Context().Value(StatusKey).(*int)
        duration := time.Since(start)

	// Track SLA compliance
        sla := SLA{
            Endpoint:   r.URL.Path,
            StatusCode: status,
            Duration:   duration,
            Timestamp:  start,
        }

	// Check if within SLA
        if duration > 100*time.Millisecond || status >= 500 {
            sla.Violated = true
            log.Printf("SLA VIOLATION: %s took %v, status %d", r.URL.Path, duration, status)
        }

        slaTracker.Record(sla)
    }))
}

// Conditional behavior based on status
func ErrorNotification(next http.Handler) http.Handler {
    return CaptureStatus(StatusKey, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        next.ServeHTTP(w, r)

        status := *r.Context().Value(StatusKey).(*int)

	// Send notification on critical errors
        if status == http.StatusInternalServerError {
            userID := r.Context().Value("user_id")
            notifyDevelopers(fmt.Sprintf(
                "Internal server error for user %v on %s %s",
                userID,
                r.Method,
                r.URL.Path,
            ))
        }
    }))
}
\`\`\`

**Real-World Benefits:**
- **Complete Logging:** Log requests with their response status
- **Error Tracking:** Automatically send errors to tracking systems
- **SLO Monitoring:** Track service level objectives
- **Performance Analysis:** Correlate slow requests with error rates

**ResponseWriter Wrapper Best Practices:**
- **Embed Interface:** Use http.ResponseWriter embedding for default behavior
- **Capture Early:** Intercept WriteHeader before it's called
- **Handle Implicit 200:** Write() implicitly calls WriteHeader(200)
- **Pointer Storage:** Store status as pointer to allow updates after response

**Common Use Cases:**
- **Access Logs:** Apache/Nginx-style access logs with status codes
- **APM Tools:** Send traces with response status to APM platforms
- **Circuit Breaker:** Track error rates to open/close circuit breakers
- **Rate Limiting:** Different limits based on response status

Without CaptureStatus, middleware must either chain custom writers (complex) or log before knowing the response status (incomplete).`,	order: 10,
	translations: {
		ru: {
			title: 'Перехват и логирование статус кода',
			description: `Реализуйте middleware **CaptureStatus**, который перехватывает HTTP статус код ответа и делает его доступным в контексте.

**Требования:**
1. Создайте функцию \`CaptureStatus(key ctxKey, next http.Handler) http.Handler\`
2. Создайте кастомную обёртку ResponseWriter которая перехватывает статус
3. Сохраните указатель на статус в контексте перед вызовом next
4. Обновляйте статус в методах WriteHeader и Write
5. По умолчанию 200 OK если статус не был записан
6. Обработайте nil handler

**Пример:**
\`\`\`go
const StatusKey ctxKey = "status"

handler := CaptureStatus(StatusKey, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusCreated)
    fmt.Fprintf(w, "Created")

	// После записи, проверка статуса из контекста
    status := *r.Context().Value(StatusKey).(*int)
	// status = 201
}))

// Ответ: 201 Created
\`\`\`

**Ограничения:**
- Должен оборачивать ResponseWriter для перехвата WriteHeader/Write
- Должен хранить статус как указатель для обновлений
- Должен по умолчанию быть 200 если handler не вызвал WriteHeader`,
			hint1: `Создайте структуру которая встраивает http.ResponseWriter и добавляет поле *int для статуса. Переопределите методы WriteHeader и Write.`,
			hint2: `Сохраните указатель на статус в контексте чтобы его можно было прочитать даже после записи ответа.`,
			whyItMatters: `CaptureStatus позволяет осуществлять логирование, метрики и мониторинг, делая статус коды ответов доступными во всей middleware chain.

**Почему Capture Status:**
- **Логирование запросов:** Логирование полной информации о запросе включая статус ответа
- **Метрики:** Отслеживание распределения статус кодов (2xx, 4xx, 5xx)
- **Мониторинг:** Алерты на высокий уровень ошибок
- **Аудит:** Запись всех операций с их результатами

**Продакшен паттерн:**
\`\`\`go
const StatusKey ctxKey = "status"

// Расширенный logger со статусом
func StructuredLogger(next http.Handler) http.Handler {
    return CaptureStatus(StatusKey, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        next.ServeHTTP(w, r)

        status := *r.Context().Value(StatusKey).(*int)
        duration := time.Since(start)

        log.Printf(
            "method=%s path=%s status=%d duration=%v ip=%s",
            r.Method,
            r.URL.Path,
            status,
            duration,
            r.RemoteAddr,
        )

        if status >= 500 {
            alerting.SendAlert("server_error", fmt.Sprintf("%s returned %d", r.URL.Path, status))
        }
    }))
}

// Сбор метрик
func MetricsMiddleware(next http.Handler) http.Handler {
    return CaptureStatus(StatusKey, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        next.ServeHTTP(w, r)

        status := *r.Context().Value(StatusKey).(*int)
        duration := time.Since(start)

        statusClass := fmt.Sprintf("%dxx", status/100)
        metrics.IncrementCounter("http_requests_total", map[string]string{
            "method": r.Method,
            "status": statusClass,
        })

        metrics.RecordHistogram("http_request_duration_seconds", duration.Seconds())
    }))
}

// SLA трекинг
func SLATracker(next http.Handler) http.Handler {
    return CaptureStatus(StatusKey, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        next.ServeHTTP(w, r)

        status := *r.Context().Value(StatusKey).(*int)
        duration := time.Since(start)

        if duration > 100*time.Millisecond || status >= 500 {
            log.Printf("SLA VIOLATION: %s took %v, status %d", r.URL.Path, duration, status)
        }
    }))
}

// Условное поведение на основе статуса
func ErrorNotification(next http.Handler) http.Handler {
    return CaptureStatus(StatusKey, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        next.ServeHTTP(w, r)

        status := *r.Context().Value(StatusKey).(*int)

	// Отправка уведомлений при критических ошибках
        if status == http.StatusInternalServerError {
            userID := r.Context().Value("user_id")
            notifyDevelopers(fmt.Sprintf(
                "Internal server error for user %v on %s %s",
                userID,
                r.Method,
                r.URL.Path,
            ))
        }
    }))
}
\`\`\`

**Практические преимущества:**
- **Полное логирование:** Логирование запросов с их статусом ответа
- **Error Tracking:** Автоматическая отправка ошибок в системы трекинга
- **SLO Мониторинг:** Отслеживание service level objectives
- **Performance Analysis:** Корреляция медленных запросов с error rates

**Best practices для ResponseWriter Wrapper:**
- **Embed Interface:** Используйте http.ResponseWriter embedding для default behavior
- **Capture Early:** Перехватывайте WriteHeader до вызова
- **Handle Implicit 200:** Write() неявно вызывает WriteHeader(200)
- **Pointer Storage:** Храните статус как pointer для обновлений после ответа

**Общие сценарии использования:**
- **Access Logs:** Apache/Nginx-стиль логи доступа с кодами статуса
- **APM Tools:** Отправка трейсов с статусом ответа на APM платформы
- **Circuit Breaker:** Отслеживание error rates для открытия/закрытия circuit breakers
- **Rate Limiting:** Разные лимиты на основе статуса ответа

Без CaptureStatus middleware должен либо chain custom writers (сложно), либо логировать до знания статуса ответа (неполно).`,
			solutionCode: `package httpx

import (
	"context"
	"net/http"
)

type ctxKey string

func CaptureStatus(key ctxKey, next http.Handler) http.Handler {
	if next == nil {	// Обработка nil next handler
		return http.HandlerFunc(func(http.ResponseWriter, *http.Request) {})
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		status := 0	// Создание переменной статуса
		rec := &statusWriter{ResponseWriter: w, status: &status}	// Обёртывание ResponseWriter
		ctx := context.WithValue(r.Context(), key, rec.status)	// Сохранение указателя на статус в контексте
		next.ServeHTTP(rec, r.WithContext(ctx))	// Передача обёрнутого writer и модифицированного запроса
		if *rec.status == 0 {	// Проверка был ли установлен статус
			*rec.status = http.StatusOK	// По умолчанию 200 OK
		}
	})
}

type statusWriter struct {	// Кастомная обёртка ResponseWriter
	http.ResponseWriter	// Встроенный ResponseWriter
	status *int	// Указатель на статус для обновлений
}

func (s *statusWriter) WriteHeader(code int) {	// Перехват WriteHeader
	*s.status = code	// Захват кода статуса
	s.ResponseWriter.WriteHeader(code)	// Вызов оригинального WriteHeader
}

func (s *statusWriter) Write(b []byte) (int, error) {	// Перехват Write
	if *s.status == 0 {	// Проверка не установлен ли статус
		*s.status = http.StatusOK	// По умолчанию 200 OK
	}
	return s.ResponseWriter.Write(b)	// Вызов оригинального Write
}`
		},
		uz: {
			title: 'Status kodini ushlash va loglash',
			description: `HTTP response status kodini ushlab qoluvchi va kontekstda mavjud qiluvchi **CaptureStatus** middleware ni amalga oshiring.

**Talablar:**
1. \`CaptureStatus(key ctxKey, next http.Handler) http.Handler\` funksiyasini yarating
2. Statusni ushlab qoluvchi custom ResponseWriter wrapperini yarating
3. next chaqirishdan oldin status pointerini kontekstda saqlang
4. WriteHeader va Write metodlarida statusni yangilang
5. Agar status yozilmagan bo'lsa, standart 200 OK
6. nil handlerni ishlang

**Misol:**
\`\`\`go
const StatusKey ctxKey = "status"

handler := CaptureStatus(StatusKey, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusCreated)
    fmt.Fprintf(w, "Created")

	// Yozilgandan keyin, kontekstdan statusni tekshirish
    status := *r.Context().Value(StatusKey).(*int)
	// status = 201
}))

// Response: 201 Created
\`\`\`

**Cheklovlar:**
- WriteHeader/Write ni ushlab qolish uchun ResponseWriter ni o'rashi kerak
- Yangilanishlar uchun statusni pointer sifatida saqlashi kerak
- Agar handler WriteHeader ni chaqirmasa, standart 200 bo'lishi kerak`,
			hint1: `http.ResponseWriter ni ichiga oluvchi va status uchun *int field qo'shuvchi struct yarating. WriteHeader va Write metodlarini override qiling.`,
			hint2: `Response yozilgandan keyin ham o'qilishi uchun status pointerini kontekstda saqlang.`,
			whyItMatters: `CaptureStatus response status practixrini butun middleware zanjiri bo'ylab mavjud qilish orqali loglash, metrikalar va monitoring imkonini beradi.

**Nima uchun Capture Status:**
- **Request loglash:** Response statusni o'z ichiga olgan to'liq request ma'lumotini loglash
- **Metrikalar:** Status kod taqsimotini kuzatish (2xx, 4xx, 5xx)
- **Monitoring:** Yuqori xato darajalarida alertlar
- **Audit:** Barcha operatsiyalarni ularning natijalari bilan yozib qolish

**Ishlab chiqarish patterni:**
\`\`\`go
const StatusKey ctxKey = "status"

// Status bilan kengaytirilgan logger
func StructuredLogger(next http.Handler) http.Handler {
    return CaptureStatus(StatusKey, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        next.ServeHTTP(w, r)

        status := *r.Context().Value(StatusKey).(*int)
        duration := time.Since(start)

        log.Printf(
            "method=%s path=%s status=%d duration=%v ip=%s",
            r.Method,
            r.URL.Path,
            status,
            duration,
            r.RemoteAddr,
        )

        if status >= 500 {
            alerting.SendAlert("server_error", fmt.Sprintf("%s returned %d", r.URL.Path, status))
        }
    }))
}

// Metrikalar to'plash
func MetricsMiddleware(next http.Handler) http.Handler {
    return CaptureStatus(StatusKey, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        next.ServeHTTP(w, r)

        status := *r.Context().Value(StatusKey).(*int)
        duration := time.Since(start)

        statusClass := fmt.Sprintf("%dxx", status/100)
        metrics.IncrementCounter("http_requests_total", map[string]string{
            "method": r.Method,
            "status": statusClass,
        })

        metrics.RecordHistogram("http_request_duration_seconds", duration.Seconds())
    }))
}

// SLA tracking
func SLATracker(next http.Handler) http.Handler {
    return CaptureStatus(StatusKey, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        next.ServeHTTP(w, r)

        status := *r.Context().Value(StatusKey).(*int)
        duration := time.Since(start)

        if duration > 100*time.Millisecond || status >= 500 {
            log.Printf("SLA VIOLATION: %s took %v, status %d", r.URL.Path, duration, status)
        }
    }))
}
\`\`\`

**Amaliy foydalari:**
- **To'liq loglash:** Requestlarni ularning response statusi bilan loglash
- **Error Tracking:** Xatolarni tracking tizimlariga avtomatik yuborish
- **SLO Monitoring:** Service level objectivesni kuzatish
- **Performance Analysis:** Sekin requestlarni error rates bilan bog'lash

**ResponseWriter Wrapper uchun best practices:**
- **Embed Interface:** Default xatti-harakat uchun http.ResponseWriter embeddingdan foydalaning
- **Capture Early:** WriteHeader chaqirilishidan oldin ushlang
- **Handle Implicit 200:** Write() bilvosita WriteHeader(200) ni chaqiradi
- **Pointer Storage:** Responsedan keyin yangilanishlar uchun statusni pointer sifatida saqlang

CaptureStatus siz middleware yoki custom writerlarni chain qilishi kerak (murakkab), yoki response statusini bilishdan oldin loglashi kerak (to'liq emas).`,
			solutionCode: `package httpx

import (
	"context"
	"net/http"
)

type ctxKey string

func CaptureStatus(key ctxKey, next http.Handler) http.Handler {
	if next == nil {	// nil next handlerni ishlash
		return http.HandlerFunc(func(http.ResponseWriter, *http.Request) {})
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		status := 0	// Status o'zgaruvchisini yaratish
		rec := &statusWriter{ResponseWriter: w, status: &status}	// ResponseWriter ni o'rash
		ctx := context.WithValue(r.Context(), key, rec.status)	// Status pointerini kontekstda saqlash
		next.ServeHTTP(rec, r.WithContext(ctx))	// O'ralgan writer va o'zgartirilgan requestni o'tkazish
		if *rec.status == 0 {	// Status o'rnatilganligini tekshirish
			*rec.status = http.StatusOK	// Standart 200 OK
		}
	})
}

type statusWriter struct {	// Custom ResponseWriter wrapper
	http.ResponseWriter	// Ichki ResponseWriter
	status *int	// Yangilanishlar uchun status pointer
}

func (s *statusWriter) WriteHeader(code int) {	// WriteHeader ni ushlash
	*s.status = code	// Status kodini saqlash
	s.ResponseWriter.WriteHeader(code)	// Asl WriteHeader ni chaqirish
}

func (s *statusWriter) Write(b []byte) (int, error) {	// Write ni ushlash
	if *s.status == 0 {	// Status o'rnatilmaganligini tekshirish
		*s.status = http.StatusOK	// Standart 200 OK
	}
	return s.ResponseWriter.Write(b)	// Asl Write ni chaqirish
}`
		}
	}
};

export default task;
