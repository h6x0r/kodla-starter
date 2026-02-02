import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'go-dp-chain-of-responsibility',
	title: 'Chain of Responsibility',
	difficulty: 'medium',
	tags: ['go', 'design-patterns', 'behavioral', 'chain-of-responsibility'],
	estimatedTime: '35m',
	isPremium: false,
	youtubeUrl: '',
	description: `Implement the Chain of Responsibility pattern in Go - pass requests along a chain of handlers.

**You will implement:**

1. **Handler interface** - SetNext, Handle methods
2. **BaseHandler** - Default chaining logic
3. **AuthHandler** - Checks authentication
4. **RateLimitHandler** - Checks rate limits
5. **LoggingHandler** - Logs requests

**Example Usage:**

\`\`\`go
auth := &AuthHandler{}	// first handler - check authentication
rateLimit := NewRateLimitHandler(10)	// second handler - rate limit to 10 requests
logging := &LoggingHandler{}	// third handler - log all requests

auth.SetNext(rateLimit)	// auth -> rateLimit
rateLimit.SetNext(logging)	// rateLimit -> logging

// Authenticated request passes through chain
req1 := &Request{User: "admin", Path: "/api", Authenticated: true}
auth.Handle(req1)	// "Request processed" - all handlers pass

// Unauthenticated request stops at AuthHandler
req2 := &Request{User: "guest", Path: "/api", Authenticated: false}
auth.Handle(req2)	// "Auth failed for guest" - stopped at auth
\`\`\``,
	initialCode: `package patterns

import "fmt"

type Request struct {
	User     string
	Path     string
	Authenticated bool
}

type Handler interface {
}

type BaseHandler struct {
	next Handler
}

func (h *BaseHandler) SetNext(handler Handler) {
}

func (h *BaseHandler) HandleNext(request *Request) string {
	if h.next != nil {
		return h.next.Handle(request)
	}
}

type AuthHandler struct {
	BaseHandler
}

func (h *AuthHandler) Handle(request *Request) string {
}

type RateLimitHandler struct {
	BaseHandler
	requestCount int
	limit        int
}

func NewRateLimitHandler(limit int) *RateLimitHandler {
}

func (h *RateLimitHandler) Handle(request *Request) string {
}

type LoggingHandler struct {
	BaseHandler
}

func (h *LoggingHandler) Handle(request *Request) string {
}

func (h *LoggingHandler) GetLogs() []string {
	return h.logs
}`,
	solutionCode: `package patterns

import "fmt"

type Request struct {	// data being passed through the chain
	User          string	// username making the request
	Path          string	// resource path being accessed
	Authenticated bool	// whether user is authenticated
}

type Handler interface {	// handler contract
	SetNext(handler Handler)	// link to next handler in chain
	Handle(request *Request) string	// process the request
}

type BaseHandler struct {	// provides default chaining behavior
	next Handler	// reference to next handler
}

func (h *BaseHandler) SetNext(handler Handler) {	// configure chain link
	h.next = handler	// store reference to next handler
}

func (h *BaseHandler) HandleNext(request *Request) string {	// pass to next or complete
	if h.next != nil {	// check if there's a next handler
		return h.next.Handle(request)	// delegate to next handler
	}
	return "Request processed"	// end of chain - success
}

type AuthHandler struct {	// authentication check handler
	BaseHandler	// embed base for chaining support
}

func (h *AuthHandler) Handle(request *Request) string {	// check authentication
	if !request.Authenticated {	// user not authenticated?
		return fmt.Sprintf("Auth failed for %s", request.User)	// stop chain with error
	}
	return h.HandleNext(request)	// pass to next handler
}

type RateLimitHandler struct {	// rate limiting handler
	BaseHandler	// embed base for chaining support
	requestCount int	// current request count
	limit        int	// maximum allowed requests
}

func NewRateLimitHandler(limit int) *RateLimitHandler {	// factory with configured limit
	return &RateLimitHandler{limit: limit}	// initialize with specified limit
}

func (h *RateLimitHandler) Handle(request *Request) string {	// check rate limit
	if h.requestCount >= h.limit {	// limit exceeded?
		return "Rate limit exceeded"	// stop chain with error
	}
	h.requestCount++	// increment counter before proceeding
	return h.HandleNext(request)	// pass to next handler
}

type LoggingHandler struct {	// request logging handler
	BaseHandler	// embed base for chaining support
	logs []string	// accumulated log entries
}

func (h *LoggingHandler) Handle(request *Request) string {	// log and continue
	h.logs = append(h.logs, fmt.Sprintf("Log: %s accessed %s", request.User, request.Path))	// record access
	return h.HandleNext(request)	// pass to next handler
}

func (h *LoggingHandler) GetLogs() []string {	// retrieve collected logs
	return h.logs	// return all log entries
}`,
	hint1: `**Handler Decision Flow:**

Each handler has three choices:
1. **Stop the chain** - return error message if validation fails
2. **Continue the chain** - call h.HandleNext(request) to pass to next handler
3. **Modify and continue** - update state/request then continue

\`\`\`go
// AuthHandler example - stop if not authenticated
func (h *AuthHandler) Handle(request *Request) string {
	if !request.Authenticated {	// validation failed
		return fmt.Sprintf("Auth failed for %s", request.User)	// stop chain
	}
	return h.HandleNext(request)	// continue chain
}
\`\`\`

Use fmt.Sprintf to format the error message with the user name.`,
	hint2: `**RateLimitHandler and LoggingHandler:**

\`\`\`go
// RateLimitHandler - check limit, increment, then continue
func (h *RateLimitHandler) Handle(request *Request) string {
	if h.requestCount >= h.limit {	// check BEFORE incrementing
		return "Rate limit exceeded"	// stop chain
	}
	h.requestCount++	// increment count
	return h.HandleNext(request)	// continue chain
}

// LoggingHandler - always logs, then continues
func (h *LoggingHandler) Handle(request *Request) string {
	h.logs = append(h.logs, fmt.Sprintf("Log: %s accessed %s", request.User, request.Path))
	return h.HandleNext(request)	// always continues
}
\`\`\`

LoggingHandler never stops the chain - it always passes to the next handler.`,
	whyItMatters: `## Why Chain of Responsibility Exists

**Problem:** Hard-coded processing logic with tight coupling between steps.

\`\`\`go
// Without Chain - monolithic processing
func HandleRequest(req *Request) string {
	// Auth check
	if !req.Authenticated {	// all logic in one place
		return "Auth failed"
	}
	// Rate limit check
	if requestCount >= limit {	// can't reorder or remove
		return "Rate limit exceeded"
	}
	requestCount++
	// Logging
	log.Printf("Request: %s", req.Path)	// adding new checks means modifying this
	return "Success"
}
\`\`\`

**Solution:** Chain handlers that each handle one concern:

\`\`\`go
// With Chain - composable handlers
auth := &AuthHandler{}	// each handler is independent
rateLimit := NewRateLimitHandler(100)
logging := &LoggingHandler{}

auth.SetNext(rateLimit)	// chain them in any order
rateLimit.SetNext(logging)

auth.Handle(request)	// request flows through chain
// Easy to add, remove, or reorder handlers
\`\`\`

---

## Real-World Chain of Responsibility in Go

**1. HTTP Middleware (net/http):**
- Authentication, logging, compression, CORS
- Each middleware wraps the next handler

**2. Validation Pipelines:**
- Input sanitization -> format validation -> business rules
- Each validator can reject or pass the request

**3. Event Processing:**
- GUI event bubbling (click -> button -> panel -> window)
- Each level can handle or propagate

**4. Support Escalation:**
- Level 1 -> Level 2 -> Level 3 -> Manager
- Each level handles what it can, escalates the rest

---

## Production Pattern: HTTP Middleware Chain

\`\`\`go
package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

// Middleware is a function that wraps an http.Handler
type Middleware func(http.Handler) http.Handler

// Chain applies middlewares in order
func Chain(middlewares ...Middleware) Middleware {	// combine multiple middlewares
	return func(final http.Handler) http.Handler {	// return a single middleware
		for i := len(middlewares) - 1; i >= 0; i-- {	// apply in reverse order
			final = middlewares[i](final)	// wrap handler with each middleware
		}
		return final	// return fully wrapped handler
	}
}

// LoggingMiddleware logs request details
func LoggingMiddleware(next http.Handler) http.Handler {	// logging middleware
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()	// record start time
		next.ServeHTTP(w, r)	// call next handler
		duration := time.Since(start)	// calculate duration
		fmt.Printf("[%s] %s %s - %v\n", r.Method, r.URL.Path, r.RemoteAddr, duration)
	})
}

// AuthMiddleware checks for valid API key
func AuthMiddleware(validKeys map[string]bool) Middleware {	// auth middleware factory
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			key := r.Header.Get("X-API-Key")	// extract API key
			if key == "" || !validKeys[key] {	// validate key
				http.Error(w, "Unauthorized", http.StatusUnauthorized)	// stop chain
				return	// don't call next
			}
			next.ServeHTTP(w, r)	// continue chain
		})
	}
}

// RateLimitMiddleware limits requests per IP
func RateLimitMiddleware(limit int, window time.Duration) Middleware {
	var (
		mu       sync.Mutex	// protect map access
		requests = make(map[string][]time.Time)	// track requests per IP
	)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := strings.Split(r.RemoteAddr, ":")[0]	// extract IP

			mu.Lock()	// thread-safe access
			now := time.Now()
			cutoff := now.Add(-window)	// remove old requests

			// Filter to recent requests only
			var recent []time.Time
			for _, t := range requests[ip] {
				if t.After(cutoff) {
					recent = append(recent, t)
				}
			}
			requests[ip] = recent

			if len(recent) >= limit {	// check limit
				mu.Unlock()
				http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
				return	// stop chain
			}

			requests[ip] = append(requests[ip], now)	// record request
			mu.Unlock()

			next.ServeHTTP(w, r)	// continue chain
		})
	}
}

// CORSMiddleware handles CORS headers
func CORSMiddleware(allowedOrigins []string) Middleware {	// CORS middleware factory
	originsSet := make(map[string]bool)	// convert to set for O(1) lookup
	for _, o := range allowedOrigins {
		originsSet[o] = true
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")	// get request origin
			if originsSet[origin] || originsSet["*"] {	// check if allowed
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-API-Key")
			}

			if r.Method == "OPTIONS" {	// handle preflight
				w.WriteHeader(http.StatusOK)
				return	// stop chain for OPTIONS
			}

			next.ServeHTTP(w, r)	// continue chain
		})
	}
}

// Usage:
// validKeys := map[string]bool{"secret-key": true}
// chain := Chain(
//     LoggingMiddleware,
//     CORSMiddleware([]string{"https://example.com"}),
//     AuthMiddleware(validKeys),
//     RateLimitMiddleware(100, time.Minute),
// )
// http.Handle("/api/", chain(apiHandler))
\`\`\`

---

## Common Mistakes to Avoid

**1. Not calling next handler:**
\`\`\`go
// Wrong - breaks the chain
func (h *LoggingHandler) Handle(request *Request) string {
	h.logs = append(h.logs, "Logged")
	return "Logged"	// forgot to call HandleNext!
}

// Right - always call HandleNext for non-blocking handlers
func (h *LoggingHandler) Handle(request *Request) string {
	h.logs = append(h.logs, "Logged")
	return h.HandleNext(request)	// continue chain
}
\`\`\`

**2. Circular chain references:**
\`\`\`go
// Wrong - infinite loop!
a := &AuthHandler{}
b := &LoggingHandler{}
a.SetNext(b)
b.SetNext(a)	// circular reference - infinite loop

// Right - linear chain with clear end
a.SetNext(b)
// b.next is nil - chain ends here
\`\`\`

**3. Order-dependent bugs:**
\`\`\`go
// Wrong order - logging unauthenticated requests
logging.SetNext(auth)	// logs before auth check
logging.Handle(req)	// logs even failed requests

// Right order - auth before logging
auth.SetNext(logging)	// only log authenticated requests
auth.Handle(req)	// failed requests don't reach logging
\`\`\``,
	order: 4,
	testCode: `package patterns

import (
	"strings"
	"testing"
)

// Test1: AuthHandler passes authenticated request
func Test1(t *testing.T) {
	auth := &AuthHandler{}
	req := &Request{User: "admin", Path: "/api", Authenticated: true}
	result := auth.Handle(req)
	if result != "Request processed" {
		t.Errorf("Should pass authenticated request, got: %s", result)
	}
}

// Test2: AuthHandler blocks unauthenticated request
func Test2(t *testing.T) {
	auth := &AuthHandler{}
	req := &Request{User: "guest", Path: "/api", Authenticated: false}
	result := auth.Handle(req)
	if !strings.Contains(result, "Auth failed") {
		t.Error("Should block unauthenticated request")
	}
}

// Test3: RateLimitHandler allows requests under limit
func Test3(t *testing.T) {
	rateLimit := NewRateLimitHandler(5)
	req := &Request{User: "user", Path: "/api", Authenticated: true}
	result := rateLimit.Handle(req)
	if result != "Request processed" {
		t.Error("Should allow request under limit")
	}
}

// Test4: RateLimitHandler blocks after limit exceeded
func Test4(t *testing.T) {
	rateLimit := NewRateLimitHandler(2)
	req := &Request{User: "user", Path: "/api", Authenticated: true}
	rateLimit.Handle(req)
	rateLimit.Handle(req)
	result := rateLimit.Handle(req)
	if result != "Rate limit exceeded" {
		t.Error("Should block after limit exceeded")
	}
}

// Test5: LoggingHandler logs and continues
func Test5(t *testing.T) {
	logging := &LoggingHandler{}
	req := &Request{User: "admin", Path: "/dashboard", Authenticated: true}
	result := logging.Handle(req)
	if result != "Request processed" {
		t.Error("LoggingHandler should continue chain")
	}
}

// Test6: LoggingHandler stores log entries
func Test6(t *testing.T) {
	logging := &LoggingHandler{}
	req := &Request{User: "admin", Path: "/dashboard", Authenticated: true}
	logging.Handle(req)
	logs := logging.GetLogs()
	if len(logs) != 1 || !strings.Contains(logs[0], "admin") {
		t.Error("Should store log entry with user")
	}
}

// Test7: Chain of handlers works correctly
func Test7(t *testing.T) {
	auth := &AuthHandler{}
	logging := &LoggingHandler{}
	auth.SetNext(logging)
	req := &Request{User: "admin", Path: "/api", Authenticated: true}
	result := auth.Handle(req)
	if result != "Request processed" {
		t.Error("Chain should process valid request")
	}
}

// Test8: Chain stops at failing handler
func Test8(t *testing.T) {
	auth := &AuthHandler{}
	logging := &LoggingHandler{}
	auth.SetNext(logging)
	req := &Request{User: "guest", Path: "/api", Authenticated: false}
	auth.Handle(req)
	if len(logging.GetLogs()) != 0 {
		t.Error("Chain should stop at auth failure")
	}
}

// Test9: NewRateLimitHandler creates with limit
func Test9(t *testing.T) {
	rateLimit := NewRateLimitHandler(10)
	if rateLimit == nil {
		t.Error("Should create rate limit handler")
	}
}

// Test10: Log format includes user and path
func Test10(t *testing.T) {
	logging := &LoggingHandler{}
	req := &Request{User: "testuser", Path: "/test/path", Authenticated: true}
	logging.Handle(req)
	logs := logging.GetLogs()
	if !strings.Contains(logs[0], "testuser") || !strings.Contains(logs[0], "/test/path") {
		t.Error("Log should contain user and path")
	}
}
`,
	translations: {
		ru: {
			title: 'Паттерн Chain of Responsibility',
			description: `Реализуйте паттерн Chain of Responsibility на Go — передавайте запросы по цепочке обработчиков.

**Вы реализуете:**

1. **Интерфейс Handler** - методы SetNext, Handle
2. **BaseHandler** - Логика связывания по умолчанию
3. **AuthHandler** - Проверяет аутентификацию
4. **RateLimitHandler** - Проверяет лимиты запросов
5. **LoggingHandler** - Логирует запросы

**Пример использования:**

\`\`\`go
auth := &AuthHandler{}	// первый обработчик - проверка аутентификации
rateLimit := NewRateLimitHandler(10)	// второй обработчик - лимит 10 запросов
logging := &LoggingHandler{}	// третий обработчик - логирование всех запросов

auth.SetNext(rateLimit)	// auth -> rateLimit
rateLimit.SetNext(logging)	// rateLimit -> logging

// Аутентифицированный запрос проходит через цепочку
req1 := &Request{User: "admin", Path: "/api", Authenticated: true}
auth.Handle(req1)	// "Request processed" - все обработчики пропустили

// Неаутентифицированный запрос останавливается на AuthHandler
req2 := &Request{User: "guest", Path: "/api", Authenticated: false}
auth.Handle(req2)	// "Auth failed for guest" - остановлен на auth
\`\`\``,
			hint1: `**Логика принятия решений обработчиком:**

У каждого обработчика три варианта:
1. **Остановить цепочку** - вернуть сообщение об ошибке при неудачной валидации
2. **Продолжить цепочку** - вызвать h.HandleNext(request) для передачи следующему
3. **Изменить и продолжить** - обновить состояние/запрос и продолжить

\`\`\`go
// Пример AuthHandler - остановка если не аутентифицирован
func (h *AuthHandler) Handle(request *Request) string {
	if !request.Authenticated {	// валидация провалена
		return fmt.Sprintf("Auth failed for %s", request.User)	// остановить цепочку
	}
	return h.HandleNext(request)	// продолжить цепочку
}
\`\`\`

Используйте fmt.Sprintf для форматирования сообщения об ошибке с именем пользователя.`,
			hint2: `**RateLimitHandler и LoggingHandler:**

\`\`\`go
// RateLimitHandler - проверить лимит, увеличить счётчик, продолжить
func (h *RateLimitHandler) Handle(request *Request) string {
	if h.requestCount >= h.limit {	// проверить ДО увеличения
		return "Rate limit exceeded"	// остановить цепочку
	}
	h.requestCount++	// увеличить счётчик
	return h.HandleNext(request)	// продолжить цепочку
}

// LoggingHandler - всегда логирует, затем продолжает
func (h *LoggingHandler) Handle(request *Request) string {
	h.logs = append(h.logs, fmt.Sprintf("Log: %s accessed %s", request.User, request.Path))
	return h.HandleNext(request)	// всегда продолжает
}
\`\`\`

LoggingHandler никогда не останавливает цепочку - он всегда передаёт следующему обработчику.`,
			whyItMatters: `## Зачем нужен паттерн Chain of Responsibility

**Проблема:** Жёстко закодированная логика обработки с тесной связанностью между шагами.

\`\`\`go
// Без Chain - монолитная обработка
func HandleRequest(req *Request) string {
	// Проверка аутентификации
	if !req.Authenticated {	// вся логика в одном месте
		return "Auth failed"
	}
	// Проверка лимита
	if requestCount >= limit {	// нельзя изменить порядок или убрать
		return "Rate limit exceeded"
	}
	requestCount++
	// Логирование
	log.Printf("Request: %s", req.Path)	// добавление проверок = изменение этого кода
	return "Success"
}
\`\`\`

**Решение:** Цепочка обработчиков, каждый из которых отвечает за одну задачу:

\`\`\`go
// С Chain - компонуемые обработчики
auth := &AuthHandler{}	// каждый обработчик независим
rateLimit := NewRateLimitHandler(100)
logging := &LoggingHandler{}

auth.SetNext(rateLimit)	// связываем в любом порядке
rateLimit.SetNext(logging)

auth.Handle(request)	// запрос проходит через цепочку
// Легко добавлять, удалять или менять порядок обработчиков
\`\`\`

---

## Реальные примеры Chain of Responsibility в Go

**1. HTTP Middleware (net/http):**
- Аутентификация, логирование, сжатие, CORS
- Каждый middleware оборачивает следующий обработчик

**2. Конвейеры валидации:**
- Санитизация ввода -> валидация формата -> бизнес-правила
- Каждый валидатор может отклонить или пропустить запрос

**3. Обработка событий:**
- Всплытие событий GUI (клик -> кнопка -> панель -> окно)
- Каждый уровень может обработать или передать дальше

**4. Эскалация в поддержке:**
- Уровень 1 -> Уровень 2 -> Уровень 3 -> Менеджер
- Каждый уровень обрабатывает что может, остальное эскалирует

---

## Production-паттерн: HTTP Middleware Chain

\`\`\`go
package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

// Middleware - функция, оборачивающая http.Handler
type Middleware func(http.Handler) http.Handler

// Chain применяет middleware по порядку
func Chain(middlewares ...Middleware) Middleware {	// объединить несколько middleware
	return func(final http.Handler) http.Handler {	// вернуть один middleware
		for i := len(middlewares) - 1; i >= 0; i-- {	// применить в обратном порядке
			final = middlewares[i](final)	// обернуть обработчик каждым middleware
		}
		return final	// вернуть полностью обёрнутый обработчик
	}
}

// LoggingMiddleware логирует детали запроса
func LoggingMiddleware(next http.Handler) http.Handler {	// middleware логирования
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()	// записать время начала
		next.ServeHTTP(w, r)	// вызвать следующий обработчик
		duration := time.Since(start)	// вычислить длительность
		fmt.Printf("[%s] %s %s - %v\n", r.Method, r.URL.Path, r.RemoteAddr, duration)
	})
}

// AuthMiddleware проверяет валидность API-ключа
func AuthMiddleware(validKeys map[string]bool) Middleware {	// фабрика auth middleware
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			key := r.Header.Get("X-API-Key")	// извлечь API-ключ
			if key == "" || !validKeys[key] {	// валидировать ключ
				http.Error(w, "Unauthorized", http.StatusUnauthorized)	// остановить цепочку
				return	// не вызывать next
			}
			next.ServeHTTP(w, r)	// продолжить цепочку
		})
	}
}

// RateLimitMiddleware ограничивает запросы по IP
func RateLimitMiddleware(limit int, window time.Duration) Middleware {
	var (
		mu       sync.Mutex	// защита доступа к map
		requests = make(map[string][]time.Time)	// отслеживание запросов по IP
	)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := strings.Split(r.RemoteAddr, ":")[0]	// извлечь IP

			mu.Lock()	// потокобезопасный доступ
			now := time.Now()
			cutoff := now.Add(-window)	// удалить старые запросы

			// Оставить только недавние запросы
			var recent []time.Time
			for _, t := range requests[ip] {
				if t.After(cutoff) {
					recent = append(recent, t)
				}
			}
			requests[ip] = recent

			if len(recent) >= limit {	// проверить лимит
				mu.Unlock()
				http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
				return	// остановить цепочку
			}

			requests[ip] = append(requests[ip], now)	// записать запрос
			mu.Unlock()

			next.ServeHTTP(w, r)	// продолжить цепочку
		})
	}
}

// CORSMiddleware обрабатывает CORS-заголовки
func CORSMiddleware(allowedOrigins []string) Middleware {	// фабрика CORS middleware
	originsSet := make(map[string]bool)	// преобразовать в set для O(1) поиска
	for _, o := range allowedOrigins {
		originsSet[o] = true
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")	// получить origin запроса
			if originsSet[origin] || originsSet["*"] {	// проверить разрешён ли
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-API-Key")
			}

			if r.Method == "OPTIONS" {	// обработать preflight
				w.WriteHeader(http.StatusOK)
				return	// остановить цепочку для OPTIONS
			}

			next.ServeHTTP(w, r)	// продолжить цепочку
		})
	}
}

// Использование:
// validKeys := map[string]bool{"secret-key": true}
// chain := Chain(
//     LoggingMiddleware,
//     CORSMiddleware([]string{"https://example.com"}),
//     AuthMiddleware(validKeys),
//     RateLimitMiddleware(100, time.Minute),
// )
// http.Handle("/api/", chain(apiHandler))
\`\`\`

---

## Распространённые ошибки

**1. Не вызывать следующий обработчик:**
\`\`\`go
// Неправильно - разрывает цепочку
func (h *LoggingHandler) Handle(request *Request) string {
	h.logs = append(h.logs, "Logged")
	return "Logged"	// забыли вызвать HandleNext!
}

// Правильно - всегда вызывать HandleNext для неблокирующих обработчиков
func (h *LoggingHandler) Handle(request *Request) string {
	h.logs = append(h.logs, "Logged")
	return h.HandleNext(request)	// продолжить цепочку
}
\`\`\`

**2. Циклические ссылки в цепочке:**
\`\`\`go
// Неправильно - бесконечный цикл!
a := &AuthHandler{}
b := &LoggingHandler{}
a.SetNext(b)
b.SetNext(a)	// циклическая ссылка - бесконечный цикл

// Правильно - линейная цепочка с чётким концом
a.SetNext(b)
// b.next равен nil - цепочка заканчивается здесь
\`\`\`

**3. Баги из-за порядка обработчиков:**
\`\`\`go
// Неправильный порядок - логирование неаутентифицированных запросов
logging.SetNext(auth)	// логирует до проверки auth
logging.Handle(req)	// логирует даже неудачные запросы

// Правильный порядок - auth до логирования
auth.SetNext(logging)	// логировать только аутентифицированные запросы
auth.Handle(req)	// неудачные запросы не достигают логирования
\`\`\``
		},
		uz: {
			title: 'Chain of Responsibility Pattern',
			description: `Go tilida Chain of Responsibility patternini amalga oshiring — so'rovlarni ishlov beruvchilar zanjiri bo'ylab uzating.

**Siz amalga oshirasiz:**

1. **Handler interfeysi** - SetNext, Handle metodlari
2. **BaseHandler** - Standart bog'lash mantiqI
3. **AuthHandler** - Autentifikatsiyani tekshiradi
4. **RateLimitHandler** - So'rov limitlarini tekshiradi
5. **LoggingHandler** - So'rovlarni log qiladi

**Foydalanish namunasi:**

\`\`\`go
auth := &AuthHandler{}	// birinchi ishlov beruvchi - autentifikatsiya tekshiruvi
rateLimit := NewRateLimitHandler(10)	// ikkinchi ishlov beruvchi - 10 ta so'rov limiti
logging := &LoggingHandler{}	// uchinchi ishlov beruvchi - barcha so'rovlarni log qilish

auth.SetNext(rateLimit)	// auth -> rateLimit
rateLimit.SetNext(logging)	// rateLimit -> logging

// Autentifikatsiya qilingan so'rov zanjirdan o'tadi
req1 := &Request{User: "admin", Path: "/api", Authenticated: true}
auth.Handle(req1)	// "Request processed" - barcha ishlov beruvchilar o'tkazdi

// Autentifikatsiya qilinmagan so'rov AuthHandler da to'xtaydi
req2 := &Request{User: "guest", Path: "/api", Authenticated: false}
auth.Handle(req2)	// "Auth failed for guest" - auth da to'xtadi
\`\`\``,
			hint1: `**Ishlov beruvchi qaror mantiqI:**

Har bir ishlov beruvchining uchta tanlovi bor:
1. **Zanjirni to'xtatish** - validatsiya muvaffaqiyatsiz bo'lsa xato xabari qaytarish
2. **Zanjirni davom ettirish** - keyingisiga uzatish uchun h.HandleNext(request) chaqirish
3. **O'zgartirish va davom ettirish** - holatni/so'rovni yangilash va davom ettirish

\`\`\`go
// AuthHandler namunasi - autentifikatsiya qilinmagan bo'lsa to'xtatish
func (h *AuthHandler) Handle(request *Request) string {
	if !request.Authenticated {	// validatsiya muvaffaqiyatsiz
		return fmt.Sprintf("Auth failed for %s", request.User)	// zanjirni to'xtatish
	}
	return h.HandleNext(request)	// zanjirni davom ettirish
}
\`\`\`

Foydalanuvchi nomi bilan xato xabarini formatlash uchun fmt.Sprintf dan foydalaning.`,
			hint2: `**RateLimitHandler va LoggingHandler:**

\`\`\`go
// RateLimitHandler - limitni tekshirish, oshirish, keyin davom ettirish
func (h *RateLimitHandler) Handle(request *Request) string {
	if h.requestCount >= h.limit {	// oshirishdan OLDIN tekshirish
		return "Rate limit exceeded"	// zanjirni to'xtatish
	}
	h.requestCount++	// hisoblagichni oshirish
	return h.HandleNext(request)	// zanjirni davom ettirish
}

// LoggingHandler - har doim log qiladi, keyin davom etadi
func (h *LoggingHandler) Handle(request *Request) string {
	h.logs = append(h.logs, fmt.Sprintf("Log: %s accessed %s", request.User, request.Path))
	return h.HandleNext(request)	// har doim davom etadi
}
\`\`\`

LoggingHandler hech qachon zanjirni to'xtatmaydi - u har doim keyingi ishlov beruvchiga uzatadi.`,
			whyItMatters: `## Chain of Responsibility nima uchun kerak

**Muammo:** Qadamlar orasida qattiq bog'lanish bilan qattiq practixngan qayta ishlash mantiqI.

\`\`\`go
// Chain siz - monolit qayta ishlash
func HandleRequest(req *Request) string {
	// Auth tekshiruvi
	if !req.Authenticated {	// barcha mantiq bir joyda
		return "Auth failed"
	}
	// Limit tekshiruvi
	if requestCount >= limit {	// tartibni o'zgartirish yoki olib tashlash mumkin emas
		return "Rate limit exceeded"
	}
	requestCount++
	// Log qilish
	log.Printf("Request: %s", req.Path)	// yangi tekshiruvlar qo'shish = bu kodni o'zgartirish
	return "Success"
}
\`\`\`

**Yechim:** Har biri bitta vazifaga javobgar bo'lgan ishlov beruvchilar zanjiri:

\`\`\`go
// Chain bilan - tuzilishi mumkin bo'lgan ishlov beruvchilar
auth := &AuthHandler{}	// har bir ishlov beruvchi mustaqil
rateLimit := NewRateLimitHandler(100)
logging := &LoggingHandler{}

auth.SetNext(rateLimit)	// istalgan tartibda bog'lash
rateLimit.SetNext(logging)

auth.Handle(request)	// so'rov zanjirdan o'tadi
// Ishlov beruvchilarni qo'shish, olib tashlash yoki tartibini o'zgartirish oson
\`\`\`

---

## Go da haqiqiy Chain of Responsibility misollari

**1. HTTP Middleware (net/http):**
- Autentifikatsiya, log qilish, siqish, CORS
- Har bir middleware keyingi ishlov beruvchini o'raydi

**2. Validatsiya konveyerlari:**
- Kiritishni tozalash -> format validatsiyasi -> biznes qoidalari
- Har bir validator so'rovni rad etishi yoki o'tkazishi mumkin

**3. Hodisalarni qayta ishlash:**
- GUI hodisa ko'tarilishi (klik -> tugma -> panel -> oyna)
- Har bir daraja qayta ishlashi yoki uzatishi mumkin

**4. Qo'llab-quvvatlash eskalatsiyasi:**
- Daraja 1 -> Daraja 2 -> Daraja 3 -> Menejer
- Har bir daraja imkoni boricha qayta ishlaydi, qolganini eskalatsiya qiladi

---

## Production pattern: HTTP Middleware Chain

\`\`\`go
package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

// Middleware - http.Handler ni o'raydigan funksiya
type Middleware func(http.Handler) http.Handler

// Chain middlewarelarni tartib bilan qo'llaydi
func Chain(middlewares ...Middleware) Middleware {	// bir nechta middlewareni birlashtirish
	return func(final http.Handler) http.Handler {	// bitta middleware qaytarish
		for i := len(middlewares) - 1; i >= 0; i-- {	// teskari tartibda qo'llash
			final = middlewares[i](final)	// ishlov beruvchini har bir middleware bilan o'rash
		}
		return final	// to'liq o'ralgan ishlov beruvchini qaytarish
	}
}

// LoggingMiddleware so'rov tafsilotlarini log qiladi
func LoggingMiddleware(next http.Handler) http.Handler {	// log qilish middleware
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()	// boshlash vaqtini yozib olish
		next.ServeHTTP(w, r)	// keyingi ishlov beruvchini chaqirish
		duration := time.Since(start)	// davomiylikni hisoblash
		fmt.Printf("[%s] %s %s - %v\n", r.Method, r.URL.Path, r.RemoteAddr, duration)
	})
}

// AuthMiddleware to'g'ri API kalitini tekshiradi
func AuthMiddleware(validKeys map[string]bool) Middleware {	// auth middleware fabrikasi
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			key := r.Header.Get("X-API-Key")	// API kalitini olish
			if key == "" || !validKeys[key] {	// kalitni tekshirish
				http.Error(w, "Unauthorized", http.StatusUnauthorized)	// zanjirni to'xtatish
				return	// next ni chaqirmaslik
			}
			next.ServeHTTP(w, r)	// zanjirni davom ettirish
		})
	}
}

// RateLimitMiddleware IP bo'yicha so'rovlarni cheklaydi
func RateLimitMiddleware(limit int, window time.Duration) Middleware {
	var (
		mu       sync.Mutex	// map ga kirishni himoya qilish
		requests = make(map[string][]time.Time)	// IP bo'yicha so'rovlarni kuzatish
	)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := strings.Split(r.RemoteAddr, ":")[0]	// IP ni olish

			mu.Lock()	// xavfsiz kirish
			now := time.Now()
			cutoff := now.Add(-window)	// eski so'rovlarni olib tashlash

			// Faqat yaqindagi so'rovlarni saqlash
			var recent []time.Time
			for _, t := range requests[ip] {
				if t.After(cutoff) {
					recent = append(recent, t)
				}
			}
			requests[ip] = recent

			if len(recent) >= limit {	// limitni tekshirish
				mu.Unlock()
				http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
				return	// zanjirni to'xtatish
			}

			requests[ip] = append(requests[ip], now)	// so'rovni yozib olish
			mu.Unlock()

			next.ServeHTTP(w, r)	// zanjirni davom ettirish
		})
	}
}

// CORSMiddleware CORS sarlavhalarini boshqaradi
func CORSMiddleware(allowedOrigins []string) Middleware {	// CORS middleware fabrikasi
	originsSet := make(map[string]bool)	// O(1) qidirish uchun set ga o'tkazish
	for _, o := range allowedOrigins {
		originsSet[o] = true
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")	// so'rov originini olish
			if originsSet[origin] || originsSet["*"] {	// ruxsat berilganligini tekshirish
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-API-Key")
			}

			if r.Method == "OPTIONS" {	// preflight ni boshqarish
				w.WriteHeader(http.StatusOK)
				return	// OPTIONS uchun zanjirni to'xtatish
			}

			next.ServeHTTP(w, r)	// zanjirni davom ettirish
		})
	}
}

// Foydalanish:
// validKeys := map[string]bool{"secret-key": true}
// chain := Chain(
//     LoggingMiddleware,
//     CORSMiddleware([]string{"https://example.com"}),
//     AuthMiddleware(validKeys),
//     RateLimitMiddleware(100, time.Minute),
// )
// http.Handle("/api/", chain(apiHandler))
\`\`\`

---

## Keng tarqalgan xatolar

**1. Keyingi ishlov beruvchini chaqirmaslik:**
\`\`\`go
// Noto'g'ri - zanjirni uzadi
func (h *LoggingHandler) Handle(request *Request) string {
	h.logs = append(h.logs, "Logged")
	return "Logged"	// HandleNext ni chaqirishni unutdi!
}

// To'g'ri - bloklamaydigan ishlov beruvchilar uchun har doim HandleNext ni chaqirish
func (h *LoggingHandler) Handle(request *Request) string {
	h.logs = append(h.logs, "Logged")
	return h.HandleNext(request)	// zanjirni davom ettirish
}
\`\`\`

**2. Zanjirda aylanma havolalar:**
\`\`\`go
// Noto'g'ri - cheksiz sikl!
a := &AuthHandler{}
b := &LoggingHandler{}
a.SetNext(b)
b.SetNext(a)	// aylanma havola - cheksiz sikl

// To'g'ri - aniq oxiri bilan chiziqli zanjir
a.SetNext(b)
// b.next nil - zanjir bu yerda tugaydi
\`\`\`

**3. Tartibga bog'liq xatolar:**
\`\`\`go
// Noto'g'ri tartib - autentifikatsiya qilinmagan so'rovlarni log qilish
logging.SetNext(auth)	// auth tekshiruvidan oldin log qiladi
logging.Handle(req)	// muvaffaqiyatsiz so'rovlarni ham log qiladi

// To'g'ri tartib - log qilishdan oldin auth
auth.SetNext(logging)	// faqat autentifikatsiya qilingan so'rovlarni log qilish
auth.Handle(req)	// muvaffaqiyatsiz so'rovlar log ga yetmaydi
\`\`\``
		}
	}
};

export default task;
