import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-grpc-retry-interceptor',
	title: 'Retry Interceptor',
	difficulty: 'medium',	tags: ['go', 'grpc', 'interceptors', 'resilience'],
	estimatedTime: '35m',	isPremium: false,
	youtubeUrl: '',
	description: `Implement **RetryInterceptor** that automatically retries failed handler calls with exponential backoff.

**Requirements:**
1. Create function \`RetryInterceptor(maxRetries int, backoff func(int) time.Duration) UnaryServerInterceptor\`
2. Default maxRetries to 0 if negative
3. Handle nil handler (use no-op)
4. Retry handler on error up to maxRetries times
5. Use backoff function to calculate delay between retries
6. Check context cancellation before each retry
7. Return success response on first successful attempt
8. Return last error if all retries fail

**Example:**
\`\`\`go
attempts := 0
handler := func(ctx context.Context, req any) (any, error) {
    attempts++
    if attempts < 3 {
        return nil, errors.New("temporary error")
    }
    return "success", nil
}

backoff := func(attempt int) time.Duration {
    return time.Duration(attempt) * 100 * time.Millisecond
}

interceptor := RetryInterceptor(3, backoff)
resp, err := interceptor(ctx, "request", handler)
// attempts = 3, resp = "success", err = nil
// Delays: 0ms, 100ms, 200ms
\`\`\`

**Constraints:**
- Must respect context cancellation
- Must use backoff function for delays
- Must return first successful response`,
	initialCode: `package grpcx

import (
	"context"
	"time"
)

type Handler func(ctx context.Context, req any) (any, error)

type UnaryServerInterceptor func(ctx context.Context, req any, next Handler) (any, error)

// TODO: Implement RetryInterceptor
func RetryInterceptor(maxRetries int, backoff func(int) time.Duration) UnaryServerInterceptor {
	// TODO: Implement
}`,
	solutionCode: `package grpcx

import (
	"context"
	"time"
)

type Handler func(ctx context.Context, req any) (any, error)

type UnaryServerInterceptor func(ctx context.Context, req any, next Handler) (any, error)

func RetryInterceptor(maxRetries int, backoff func(int) time.Duration) UnaryServerInterceptor {
	if maxRetries < 0 {	// Validate maxRetries
		maxRetries = 0	// Default to 0 retries
	}
	return func(ctx context.Context, req any, handler Handler) (any, error) {
		if handler == nil {	// Check if handler is nil
			handler = func(context.Context, any) (any, error) { return nil, nil }	// Use no-op handler
		}
		var (
			resp any
			err  error
		)
		for i := 0; i <= maxRetries; i++ {	// Try maxRetries + 1 times
			if ctx.Err() != nil {	// Check context cancellation
				return nil, ctx.Err()	// Return context error
			}
			resp, err = handler(ctx, req)	// Execute handler
			if err == nil {	// Success
				return resp, nil	// Return successful response
			}
			if i == maxRetries {	// Last attempt
				break	// Don't sleep after last attempt
			}
			delay := time.Duration(0)	// Default delay
			if backoff != nil {	// Check if backoff function exists
				delay = backoff(i)	// Calculate delay for this attempt
			}
			if delay > 0 {	// If delay is positive
				timer := time.NewTimer(delay)	// Create timer for delay
				select {
				case <-ctx.Done():	// Context cancelled during sleep
					if !timer.Stop() {	// Try to stop timer
						<-timer.C	// Drain timer channel
					}
					return nil, ctx.Err()	// Return context error
				case <-timer.C:	// Delay completed
				}
			}
		}
		return resp, err	// Return last response and error
	}
}`,
			hint1: `Loop from 0 to maxRetries, call handler each time. Return immediately on success.`,
			hint2: `Use time.NewTimer with select to sleep while respecting context cancellation.`,
			testCode: `package grpcx

import (
	"context"
	"errors"
	"testing"
	"time"
)

func Test1(t *testing.T) {
	// Test success on first try (no retry)
	interceptor := RetryInterceptor(3, nil)
	callCount := 0
	handler := func(ctx context.Context, req any) (any, error) {
		callCount++
		return "success", nil
	}
	resp, err := interceptor(context.Background(), nil, handler)
	if err != nil || resp != "success" || callCount != 1 {
		t.Errorf("got (%v, %v, calls=%d), want (success, nil, 1)", resp, err, callCount)
	}
}

func Test2(t *testing.T) {
	// Test retry on error then success
	callCount := 0
	interceptor := RetryInterceptor(3, nil)
	handler := func(ctx context.Context, req any) (any, error) {
		callCount++
		if callCount < 2 {
			return nil, errors.New("fail")
		}
		return "success", nil
	}
	resp, err := interceptor(context.Background(), nil, handler)
	if err != nil || resp != "success" || callCount != 2 {
		t.Errorf("got (%v, %v, calls=%d), want (success, nil, 2)", resp, err, callCount)
	}
}

func Test3(t *testing.T) {
	// Test max retries exceeded
	callCount := 0
	interceptor := RetryInterceptor(2, nil)
	handler := func(ctx context.Context, req any) (any, error) {
		callCount++
		return nil, errors.New("always fail")
	}
	_, err := interceptor(context.Background(), nil, handler)
	if err == nil {
		t.Error("expected error after max retries")
	}
	if callCount != 3 { // 1 + 2 retries = 3 attempts
		t.Errorf("callCount = %d, want 3", callCount)
	}
}

func Test4(t *testing.T) {
	// Test negative maxRetries defaults to 0
	callCount := 0
	interceptor := RetryInterceptor(-5, nil)
	handler := func(ctx context.Context, req any) (any, error) {
		callCount++
		return nil, errors.New("fail")
	}
	interceptor(context.Background(), nil, handler)
	if callCount != 1 {
		t.Errorf("callCount = %d, want 1 (no retries)", callCount)
	}
}

func Test5(t *testing.T) {
	// Test context cancellation stops retry
	ctx, cancel := context.WithCancel(context.Background())
	callCount := 0
	interceptor := RetryInterceptor(10, func(i int) time.Duration {
		return 50 * time.Millisecond
	})
	handler := func(c context.Context, req any) (any, error) {
		callCount++
		if callCount == 2 {
			cancel()
		}
		return nil, errors.New("fail")
	}
	_, err := interceptor(ctx, nil, handler)
	if err != context.Canceled {
		t.Errorf("error = %v, want context.Canceled", err)
	}
}

func Test6(t *testing.T) {
	// Test backoff function is called
	backoffCalls := []int{}
	interceptor := RetryInterceptor(3, func(attempt int) time.Duration {
		backoffCalls = append(backoffCalls, attempt)
		return time.Millisecond
	})
	handler := func(ctx context.Context, req any) (any, error) {
		return nil, errors.New("fail")
	}
	interceptor(context.Background(), nil, handler)
	if len(backoffCalls) != 3 { // backoff called between retries
		t.Errorf("backoff calls = %v, want 3 calls", backoffCalls)
	}
}

func Test7(t *testing.T) {
	// Test nil backoff works
	interceptor := RetryInterceptor(2, nil)
	handler := func(ctx context.Context, req any) (any, error) {
		return "success", nil
	}
	resp, err := interceptor(context.Background(), nil, handler)
	if err != nil || resp != "success" {
		t.Errorf("got (%v, %v), want (success, nil)", resp, err)
	}
}

func Test8(t *testing.T) {
	// Test nil handler uses no-op
	interceptor := RetryInterceptor(2, nil)
	resp, err := interceptor(context.Background(), nil, nil)
	if err != nil || resp != nil {
		t.Errorf("got (%v, %v), want (nil, nil)", resp, err)
	}
}

func Test9(t *testing.T) {
	// Test request is passed to handler
	var receivedReq any
	interceptor := RetryInterceptor(1, nil)
	handler := func(ctx context.Context, req any) (any, error) {
		receivedReq = req
		return nil, nil
	}
	interceptor(context.Background(), "test-request", handler)
	if receivedReq != "test-request" {
		t.Errorf("request = %v, want 'test-request'", receivedReq)
	}
}

func Test10(t *testing.T) {
	// Test zero maxRetries means single attempt
	callCount := 0
	interceptor := RetryInterceptor(0, nil)
	handler := func(ctx context.Context, req any) (any, error) {
		callCount++
		return nil, errors.New("fail")
	}
	interceptor(context.Background(), nil, handler)
	if callCount != 1 {
		t.Errorf("callCount = %d, want 1", callCount)
	}
}`,
			whyItMatters: `RetryInterceptor increases service reliability by automatically retrying transient failures, making systems more resilient to temporary issues.

**Why Retry Logic:**
- **Transient Failures:** Handle temporary network glitches
- **Service Resilience:** Recover from brief service unavailability
- **User Experience:** Success instead of error for temporary issues
- **Distributed Systems:** Handle intermittent failures in microservices

**Production Pattern:**
\`\`\`go
// Exponential backoff retry strategy
func ExponentialBackoff(baseDelay time.Duration, maxDelay time.Duration) func(int) time.Duration {
    return func(attempt int) time.Duration {
        delay := baseDelay * time.Duration(1<<uint(attempt)) // 2^attempt
        if delay > maxDelay {
            delay = maxDelay
        }
        return delay
    }
}

// Usage: 100ms, 200ms, 400ms, 800ms, capped at 5s
interceptor := RetryInterceptor(5, ExponentialBackoff(100*time.Millisecond, 5*time.Second))

// Jitter to avoid thundering herd
func JitteredBackoff(base time.Duration) func(int) time.Duration {
    return func(attempt int) time.Duration {
        delay := base * time.Duration(1<<uint(attempt))
        jitter := time.Duration(rand.Int63n(int64(delay / 4))) // ±25% jitter
        return delay + jitter
    }
}

// Conditional retry (only retry specific errors)
func RetryOnTransientErrors(maxRetries int, backoff func(int) time.Duration) UnaryServerInterceptor {
    return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler Handler) (any, error) {
        var resp any
        var err error

        for i := 0; i <= maxRetries; i++ {
            if ctx.Err() != nil {
                return nil, ctx.Err()
            }

            resp, err = handler(ctx, req)
            if err == nil {
                return resp, nil
            }

            // Check if error is retryable
            if !isRetryableError(err) {
                return resp, err // Don't retry permanent errors
            }

            if i == maxRetries {
                break
            }

            delay := backoff(i)
            time.Sleep(delay)
        }

        return resp, err
    }
}

func isRetryableError(err error) bool {
    // Check gRPC status codes
    status := status.Convert(err)
    code := status.Code()

    switch code {
    case codes.Unavailable,      // Service unavailable
        codes.ResourceExhausted, // Rate limited
        codes.Aborted,           // Conflict, may succeed on retry
        codes.DeadlineExceeded:  // Timeout
        return true
    default:
        return false
    }
}

// Per-method retry configuration
func MethodRetryInterceptor() UnaryServerInterceptor {
    configs := map[string]struct {
        maxRetries int
        backoff    func(int) time.Duration
    }{
        "/api.UserService/GetUser": {
            maxRetries: 3,
            backoff:    ExponentialBackoff(100*time.Millisecond, 1*time.Second),
        },
        "/api.PaymentService/ProcessPayment": {
            maxRetries: 0, // Don't retry payments (idempotency required)
            backoff:    nil,
        },
        "/api.ReportService/Generate": {
            maxRetries: 2,
            backoff:    ExponentialBackoff(500*time.Millisecond, 5*time.Second),
        },
    }

    return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler Handler) (any, error) {
        config, ok := configs[info.FullMethod]
        if !ok {
            // Default retry config
            config.maxRetries = 2
            config.backoff = ExponentialBackoff(100*time.Millisecond, 2*time.Second)
        }

        return RetryInterceptor(config.maxRetries, config.backoff)(ctx, req, handler)
    }
}

// Retry with metrics
func RetryWithMetrics(maxRetries int, backoff func(int) time.Duration) UnaryServerInterceptor {
    return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler Handler) (any, error) {
        var resp any
        var err error
        attempts := 0

        for i := 0; i <= maxRetries; i++ {
            attempts++
            if ctx.Err() != nil {
                return nil, ctx.Err()
            }

            resp, err = handler(ctx, req)
            if err == nil {
                // Record successful attempt
                metrics.RecordHistogram("grpc_retry_attempts", float64(attempts), map[string]string{
                    "method": info.FullMethod,
                    "status": "success",
                })
                return resp, nil
            }

            if i == maxRetries {
                break
            }

            delay := backoff(i)
            log.Printf("[Retry] method=%s attempt=%d/%d delay=%v error=%v",
                info.FullMethod, i+1, maxRetries+1, delay, err)

            timer := time.NewTimer(delay)
            select {
            case <-ctx.Done():
                timer.Stop()
                return nil, ctx.Err()
            case <-timer.C:
            }
        }

        // Record failed attempts
        metrics.RecordHistogram("grpc_retry_attempts", float64(attempts), map[string]string{
            "method": info.FullMethod,
            "status": "failed",
        })
        metrics.IncrementCounter("grpc_retry_exhausted", map[string]string{
            "method": info.FullMethod,
        })

        return resp, err
    }
}

// Circuit breaker + retry pattern
type CircuitBreaker struct {
    maxFailures  int
    resetTimeout time.Duration
    failures     int
    lastFailure  time.Time
    state        string // "closed", "open", "half-open"
    mu           sync.Mutex
}

func NewCircuitBreaker(maxFailures int, resetTimeout time.Duration) *CircuitBreaker {
    return &CircuitBreaker{
        maxFailures:  maxFailures,
        resetTimeout: resetTimeout,
        state:        "closed",
    }
}

func (cb *CircuitBreaker) Call(ctx context.Context, req any, handler Handler) (any, error) {
    cb.mu.Lock()

    // Check if circuit should be reset
    if cb.state == "open" && time.Since(cb.lastFailure) > cb.resetTimeout {
        cb.state = "half-open"
        cb.failures = 0
    }

    // Reject if circuit is open
    if cb.state == "open" {
        cb.mu.Unlock()
        return nil, status.Error(codes.Unavailable, "circuit breaker open")
    }

    cb.mu.Unlock()

    // Execute request
    resp, err := handler(ctx, req)

    cb.mu.Lock()
    defer cb.mu.Unlock()

    if err != nil {
        cb.failures++
        cb.lastFailure = time.Now()

        if cb.failures >= cb.maxFailures {
            cb.state = "open"
            log.Printf("[Circuit Breaker] opened after %d failures", cb.failures)
        }
    } else {
        // Success - reset or keep half-open
        if cb.state == "half-open" {
            cb.state = "closed"
            cb.failures = 0
            log.Printf("[Circuit Breaker] closed after successful request")
        }
    }

    return resp, err
}

// Backoff strategies
func ConstantBackoff(delay time.Duration) func(int) time.Duration {
    return func(attempt int) time.Duration {
        return delay
    }
}

func LinearBackoff(baseDelay time.Duration) func(int) time.Duration {
    return func(attempt int) time.Duration {
        return baseDelay * time.Duration(attempt+1)
    }
}

func FibonacciBackoff(baseDelay time.Duration) func(int) time.Duration {
    return func(attempt int) time.Duration {
        fib := fibonacci(attempt + 1)
        return baseDelay * time.Duration(fib)
    }
}

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}
\`\`\`

**Real-World Benefits:**
- **Reliability:** Recover from transient failures automatically
- **Availability:** Service appears more stable to clients
- **User Experience:** Success instead of error for temporary issues
- **Cost Savings:** Avoid manual retries and investigation

**Retry Best Practices:**
- **Idempotency:** Ensure operations are safe to retry
- **Backoff Strategy:** Use exponential backoff with jitter
- **Max Retries:** Limit to 2-5 attempts
- **Selective Retry:** Only retry transient errors
- **Circuit Breaker:** Combine with circuit breaker pattern
- **Metrics:** Track retry rates and success

**Common Backoff Strategies:**
- **Exponential:** 100ms, 200ms, 400ms, 800ms...
- **Linear:** 100ms, 200ms, 300ms, 400ms...
- **Constant:** 100ms, 100ms, 100ms, 100ms...
- **Jittered:** Add randomness to avoid thundering herd

**When NOT to Retry:**
- **Idempotency Issues:** Operation not safe to retry
- **Permanent Errors:** Invalid request, auth failure
- **Client Errors:** 4xx status codes
- **Time-Sensitive:** Operations that must complete quickly

Without RetryInterceptor, clients must implement retry logic themselves—duplicate code and inconsistent behavior.`,	order: 3,
	translations: {
		ru: {
			title: 'Автоматические повторы gRPC вызовов',
			description: `Реализуйте **RetryInterceptor**, который автоматически повторяет неудачные вызовы handler с экспоненциальным backoff.

**Требования:**
1. Создайте функцию \`RetryInterceptor(maxRetries int, backoff func(int) time.Duration) UnaryServerInterceptor\`
2. По умолчанию maxRetries в 0 если отрицательный
3. Обработайте nil handler (используйте no-op)
4. Повторяйте handler при ошибке до maxRetries раз
5. Используйте функцию backoff для вычисления задержки между повторами
6. Проверяйте отмену контекста перед каждым повтором
7. Верните успешный ответ при первой успешной попытке
8. Верните последнюю ошибку если все повторы провалились

**Пример:**
\`\`\`go
attempts := 0
handler := func(ctx context.Context, req any) (any, error) {
    attempts++
    if attempts < 3 {
        return nil, errors.New("temporary error")
    }
    return "success", nil
}

backoff := func(attempt int) time.Duration {
    return time.Duration(attempt) * 100 * time.Millisecond
}

interceptor := RetryInterceptor(3, backoff)
resp, err := interceptor(ctx, "request", handler)
// attempts = 3, resp = "success", err = nil
// Задержки: 0ms, 100ms, 200ms
\`\`\`

**Ограничения:**
- Должен учитывать отмену контекста
- Должен использовать функцию backoff для задержек
- Должен возвращать первый успешный ответ`,
			hint1: `Цикл от 0 до maxRetries, вызывайте handler каждый раз. Возвращайте сразу при успехе.`,
			hint2: `Используйте time.NewTimer с select для сна с учётом отмены контекста.`,
			whyItMatters: `RetryInterceptor увеличивает надёжность сервиса автоматически повторяя временные сбои, делая системы более устойчивыми к временным проблемам.

**Зачем Нужна Retry Логика:**
- **Временные Сбои:** Обработка временных сетевых глитчей
- **Устойчивость Сервиса:** Восстановление от краткой недоступности сервиса
- **Опыт Пользователя:** Успех вместо ошибки для временных проблем
- **Распределённые Системы:** Обработка прерывистых сбоев в микросервисах

**Production Паттерны:**

**Exponential Backoff Стратегия:**
\`\`\`go
func ExponentialBackoff(baseDelay time.Duration, maxDelay time.Duration) func(int) time.Duration {
    return func(attempt int) time.Duration {
        delay := baseDelay * time.Duration(1<<uint(attempt)) // 2^attempt
        if delay > maxDelay {
            delay = maxDelay
        }
        return delay
    }
}

// Использование: 100ms, 200ms, 400ms, 800ms, ограничено 5s
interceptor := RetryInterceptor(5, ExponentialBackoff(100*time.Millisecond, 5*time.Second))
\`\`\`

**Jitter для Избежания Thundering Herd:**
\`\`\`go
func JitteredBackoff(base time.Duration) func(int) time.Duration {
    return func(attempt int) time.Duration {
        delay := base * time.Duration(1<<uint(attempt))
        jitter := time.Duration(rand.Int63n(int64(delay / 4))) // ±25% jitter
        return delay + jitter
    }
}
\`\`\`

**Conditional Retry (Только Определённые Ошибки):**
\`\`\`go
func RetryOnTransientErrors(maxRetries int, backoff func(int) time.Duration) UnaryServerInterceptor {
    return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler Handler) (any, error) {
        var resp any
        var err error

        for i := 0; i <= maxRetries; i++ {
            if ctx.Err() != nil {
                return nil, ctx.Err()
            }

            resp, err = handler(ctx, req)
            if err == nil {
                return resp, nil
            }

            // Проверяем можно ли повторить ошибку
            if !isRetryableError(err) {
                return resp, err // Не повторяем постоянные ошибки
            }

            if i == maxRetries {
                break
            }

            delay := backoff(i)
            time.Sleep(delay)
        }

        return resp, err
    }
}

func isRetryableError(err error) bool {
    status := status.Convert(err)
    code := status.Code()

    switch code {
    case codes.Unavailable,      // Сервис недоступен
        codes.ResourceExhausted, // Rate limited
        codes.Aborted,           // Конфликт, может успешно повториться
        codes.DeadlineExceeded:  // Таймаут
        return true
    default:
        return false
    }
}
\`\`\`

**Per-Method Retry Конфигурация:**
\`\`\`go
func MethodRetryInterceptor() UnaryServerInterceptor {
    configs := map[string]struct {
        maxRetries int
        backoff    func(int) time.Duration
    }{
        "/api.UserService/GetUser": {
            maxRetries: 3,
            backoff:    ExponentialBackoff(100*time.Millisecond, 1*time.Second),
        },
        "/api.PaymentService/ProcessPayment": {
            maxRetries: 0, // Не повторяем платежи (требуется идемпотентность)
            backoff:    nil,
        },
        "/api.ReportService/Generate": {
            maxRetries: 2,
            backoff:    ExponentialBackoff(500*time.Millisecond, 5*time.Second),
        },
    }

    return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler Handler) (any, error) {
        config, ok := configs[info.FullMethod]
        if !ok {
            // Конфигурация retry по умолчанию
            config.maxRetries = 2
            config.backoff = ExponentialBackoff(100*time.Millisecond, 2*time.Second)
        }

        return RetryInterceptor(config.maxRetries, config.backoff)(ctx, req, handler)
    }
}
\`\`\`

**Retry с Метриками:**
\`\`\`go
func RetryWithMetrics(maxRetries int, backoff func(int) time.Duration) UnaryServerInterceptor {
    return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler Handler) (any, error) {
        var resp any
        var err error
        attempts := 0

        for i := 0; i <= maxRetries; i++ {
            attempts++
            if ctx.Err() != nil {
                return nil, ctx.Err()
            }

            resp, err = handler(ctx, req)
            if err == nil {
                // Записываем успешную попытку
                metrics.RecordHistogram("grpc_retry_attempts", float64(attempts), map[string]string{
                    "method": info.FullMethod,
                    "status": "success",
                })
                return resp, nil
            }

            if i == maxRetries {
                break
            }

            delay := backoff(i)
            log.Printf("[Retry] method=%s attempt=%d/%d delay=%v error=%v",
                info.FullMethod, i+1, maxRetries+1, delay, err)

            timer := time.NewTimer(delay)
            select {
            case <-ctx.Done():
                timer.Stop()
                return nil, ctx.Err()
            case <-timer.C:
            }
        }

        // Записываем проваленные попытки
        metrics.RecordHistogram("grpc_retry_attempts", float64(attempts), map[string]string{
            "method": info.FullMethod,
            "status": "failed",
        })
        metrics.IncrementCounter("grpc_retry_exhausted", map[string]string{
            "method": info.FullMethod,
        })

        return resp, err
    }
}
\`\`\`

**Circuit Breaker + Retry Паттерн:**
\`\`\`go
type CircuitBreaker struct {
    maxFailures  int
    resetTimeout time.Duration
    failures     int
    lastFailure  time.Time
    state        string // "closed", "open", "half-open"
    mu           sync.Mutex
}

func NewCircuitBreaker(maxFailures int, resetTimeout time.Duration) *CircuitBreaker {
    return &CircuitBreaker{
        maxFailures:  maxFailures,
        resetTimeout: resetTimeout,
        state:        "closed",
    }
}

func (cb *CircuitBreaker) Call(ctx context.Context, req any, handler Handler) (any, error) {
    cb.mu.Lock()

    // Проверяем должен ли circuit быть сброшен
    if cb.state == "open" && time.Since(cb.lastFailure) > cb.resetTimeout {
        cb.state = "half-open"
        cb.failures = 0
    }

    // Отклоняем если circuit открыт
    if cb.state == "open" {
        cb.mu.Unlock()
        return nil, status.Error(codes.Unavailable, "circuit breaker open")
    }

    cb.mu.Unlock()

    // Выполняем запрос
    resp, err := handler(ctx, req)

    cb.mu.Lock()
    defer cb.mu.Unlock()

    if err != nil {
        cb.failures++
        cb.lastFailure = time.Now()

        if cb.failures >= cb.maxFailures {
            cb.state = "open"
            log.Printf("[Circuit Breaker] opened after %d failures", cb.failures)
        }
    } else {
        // Успех - сбрасываем или оставляем half-open
        if cb.state == "half-open" {
            cb.state = "closed"
            cb.failures = 0
            log.Printf("[Circuit Breaker] closed after successful request")
        }
    }

    return resp, err
}
\`\`\`

**Backoff Стратегии:**
\`\`\`go
func ConstantBackoff(delay time.Duration) func(int) time.Duration {
    return func(attempt int) time.Duration {
        return delay
    }
}

func LinearBackoff(baseDelay time.Duration) func(int) time.Duration {
    return func(attempt int) time.Duration {
        return baseDelay * time.Duration(attempt+1)
    }
}

func FibonacciBackoff(baseDelay time.Duration) func(int) time.Duration {
    return func(attempt int) time.Duration {
        fib := fibonacci(attempt + 1)
        return baseDelay * time.Duration(fib)
    }
}

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}
\`\`\`

**Реальные Преимущества:**
- **Надёжность:** Автоматическое восстановление от временных сбоев
- **Доступность:** Сервис кажется более стабильным для клиентов
- **Опыт Пользователя:** Успех вместо ошибки для временных проблем
- **Экономия Затрат:** Избежание ручных повторов и расследований

**Лучшие Практики Retry:**
- **Идемпотентность:** Убедитесь что операции безопасны для повтора
- **Backoff Стратегия:** Используйте exponential backoff с jitter
- **Максимум Повторов:** Ограничьте до 2-5 попыток
- **Избирательный Повтор:** Повторяйте только временные ошибки
- **Circuit Breaker:** Комбинируйте с circuit breaker паттерном
- **Метрики:** Отслеживайте частоту повторов и успех

**Типичные Backoff Стратегии:**
- **Exponential:** 100ms, 200ms, 400ms, 800ms...
- **Linear:** 100ms, 200ms, 300ms, 400ms...
- **Constant:** 100ms, 100ms, 100ms, 100ms...
- **Jittered:** Добавить случайность чтобы избежать thundering herd

**Когда НЕ Повторять:**
- **Проблемы Идемпотентности:** Операция не безопасна для повтора
- **Постоянные Ошибки:** Невалидный запрос, auth failure
- **Клиентские Ошибки:** 4xx статус коды
- **Критично по Времени:** Операции которые должны завершиться быстро

Без RetryInterceptor клиенты должны реализовывать retry логику сами—дублирование кода и несогласованное поведение.`,
			solutionCode: `package grpcx

import (
	"context"
	"time"
)

type Handler func(ctx context.Context, req any) (any, error)

type UnaryServerInterceptor func(ctx context.Context, req any, next Handler) (any, error)

func RetryInterceptor(maxRetries int, backoff func(int) time.Duration) UnaryServerInterceptor {
	if maxRetries < 0 {	// Валидация maxRetries
		maxRetries = 0	// По умолчанию 0 повторов
	}
	return func(ctx context.Context, req any, handler Handler) (any, error) {
		if handler == nil {	// Проверка на nil handler
			handler = func(context.Context, any) (any, error) { return nil, nil }	// Используем no-op handler
		}
		var (
			resp any
			err  error
		)
		for i := 0; i <= maxRetries; i++ {	// Пытаемся maxRetries + 1 раз
			if ctx.Err() != nil {	// Проверка отмены контекста
				return nil, ctx.Err()	// Возвращаем ошибку контекста
			}
			resp, err = handler(ctx, req)	// Выполняем handler
			if err == nil {	// Успех
				return resp, nil	// Возвращаем успешный ответ
			}
			if i == maxRetries {	// Последняя попытка
				break	// Не спим после последней попытки
			}
			delay := time.Duration(0)	// Задержка по умолчанию
			if backoff != nil {	// Проверка существования функции backoff
				delay = backoff(i)	// Вычисляем задержку для этой попытки
			}
			if delay > 0 {	// Если задержка положительная
				timer := time.NewTimer(delay)	// Создаём таймер для задержки
				select {
				case <-ctx.Done():	// Контекст отменён во время сна
					if !timer.Stop() {	// Пытаемся остановить таймер
						<-timer.C	// Опустошаем канал таймера
					}
					return nil, ctx.Err()	// Возвращаем ошибку контекста
				case <-timer.C:	// Задержка завершена
				}
			}
		}
		return resp, err	// Возвращаем последний ответ и ошибку
	}
}`
		},
		uz: {
			title: 'gRPC chaqiruvlarini avtomatik qayta urinish',
			description: `Eksponensial backoff bilan muvaffaqiyatsiz handler chaqiruvlarini avtomatik qayta urinadigan **RetryInterceptor** ni amalga oshiring.

**Talablar:**
1. \`RetryInterceptor(maxRetries int, backoff func(int) time.Duration) UnaryServerInterceptor\` funksiyasini yarating
2. Agar manfiy bo'lsa, standart maxRetries 0 ga
3. nil handlerni ishlang (no-op dan foydalaning)
4. Xatoda handlerni maxRetries martagacha takrorlang
5. Qayta urinishlar orasidagi kechikishni hisoblash uchun backoff funksiyasidan foydalaning
6. Har bir qayta urinishdan oldin kontekst bekor qilinishini tekshiring
7. Birinchi muvaffaqiyatli urinishda muvaffaqiyatli javobni qaytaring
8. Barcha qayta urinishlar muvaffaqiyatsiz bo'lsa, oxirgi xatoni qaytaring

**Misol:**
\`\`\`go
attempts := 0
handler := func(ctx context.Context, req any) (any, error) {
    attempts++
    if attempts < 3 {
        return nil, errors.New("temporary error")
    }
    return "success", nil
}

backoff := func(attempt int) time.Duration {
    return time.Duration(attempt) * 100 * time.Millisecond
}

interceptor := RetryInterceptor(3, backoff)
resp, err := interceptor(ctx, "request", handler)
// attempts = 3, resp = "success", err = nil
// Kechikishlar: 0ms, 100ms, 200ms
\`\`\`

**Cheklovlar:**
- Kontekst bekor qilinishini hurmat qilishi kerak
- Kechikishlar uchun backoff funksiyasidan foydalanishi kerak
- Birinchi muvaffaqiyatli javobni qaytarishi kerak`,
			hint1: `0 dan maxRetries gacha tsikl, har safar handlerni chaqiring. Muvaffaqiyatda darhol qaytaring.`,
			hint2: `Kontekst bekor qilinishini hurmat qilgan holda uxlash uchun select bilan time.NewTimer dan foydalaning.`,
			whyItMatters: `RetryInterceptor vaqtinchalik nosozliklarni avtomatik qayta urinib, xizmat ishonchliligini oshiradi, tizimlarni vaqtinchalik muammolarga nisbatan barqarorroq qiladi.

**Nega Retry Mantiq Kerak:**
- **Vaqtinchalik Nosozliklar:** Vaqtinchalik tarmoq glitchlarini qayta ishlash
- **Xizmat Barqarorligi:** Qisqa muddatli xizmat mavjud emasligidan tiklanish
- **Foydalanuvchi Tajribasi:** Vaqtinchalik muammolar uchun xato o'rniga muvaffaqiyat
- **Tarqatilgan Tizimlar:** Mikroservislarda vaqti-vaqti bilan nosozliklarni qayta ishlash

**Production Patternlari:**

**Exponential Backoff Strategiyasi:**
\`\`\`go
func ExponentialBackoff(baseDelay time.Duration, maxDelay time.Duration) func(int) time.Duration {
    return func(attempt int) time.Duration {
        delay := baseDelay * time.Duration(1<<uint(attempt)) // 2^attempt
        if delay > maxDelay {
            delay = maxDelay
        }
        return delay
    }
}

// Foydalanish: 100ms, 200ms, 400ms, 800ms, 5s da chegaralangan
interceptor := RetryInterceptor(5, ExponentialBackoff(100*time.Millisecond, 5*time.Second))
\`\`\`

**Thundering Herd dan Qochish Uchun Jitter:**
\`\`\`go
func JitteredBackoff(base time.Duration) func(int) time.Duration {
    return func(attempt int) time.Duration {
        delay := base * time.Duration(1<<uint(attempt))
        jitter := time.Duration(rand.Int63n(int64(delay / 4))) // ±25% jitter
        return delay + jitter
    }
}
\`\`\`

**Shartli Retry (Faqat Ma'lum Xatolar):**
\`\`\`go
func RetryOnTransientErrors(maxRetries int, backoff func(int) time.Duration) UnaryServerInterceptor {
    return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler Handler) (any, error) {
        var resp any
        var err error

        for i := 0; i <= maxRetries; i++ {
            if ctx.Err() != nil {
                return nil, ctx.Err()
            }

            resp, err = handler(ctx, req)
            if err == nil {
                return resp, nil
            }

            // Xatoni qayta urinish mumkinligini tekshiring
            if !isRetryableError(err) {
                return resp, err // Doimiy xatolarni qayta urinmang
            }

            if i == maxRetries {
                break
            }

            delay := backoff(i)
            time.Sleep(delay)
        }

        return resp, err
    }
}

func isRetryableError(err error) bool {
    status := status.Convert(err)
    code := status.Code()

    switch code {
    case codes.Unavailable,      // Xizmat mavjud emas
        codes.ResourceExhausted, // Rate limited
        codes.Aborted,           // Konflikt, qayta urinishda muvaffaqiyatli bo'lishi mumkin
        codes.DeadlineExceeded:  // Timeout
        return true
    default:
        return false
    }
}
\`\`\`

**Per-Method Retry Konfiguratsiyasi:**
\`\`\`go
func MethodRetryInterceptor() UnaryServerInterceptor {
    configs := map[string]struct {
        maxRetries int
        backoff    func(int) time.Duration
    }{
        "/api.UserService/GetUser": {
            maxRetries: 3,
            backoff:    ExponentialBackoff(100*time.Millisecond, 1*time.Second),
        },
        "/api.PaymentService/ProcessPayment": {
            maxRetries: 0, // To'lovlarni qayta urinmang (idempotentlik talab qilinadi)
            backoff:    nil,
        },
        "/api.ReportService/Generate": {
            maxRetries: 2,
            backoff:    ExponentialBackoff(500*time.Millisecond, 5*time.Second),
        },
    }

    return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler Handler) (any, error) {
        config, ok := configs[info.FullMethod]
        if !ok {
            // Standart retry konfiguratsiyasi
            config.maxRetries = 2
            config.backoff = ExponentialBackoff(100*time.Millisecond, 2*time.Second)
        }

        return RetryInterceptor(config.maxRetries, config.backoff)(ctx, req, handler)
    }
}
\`\`\`

**Metrikalar Bilan Retry:**
\`\`\`go
func RetryWithMetrics(maxRetries int, backoff func(int) time.Duration) UnaryServerInterceptor {
    return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler Handler) (any, error) {
        var resp any
        var err error
        attempts := 0

        for i := 0; i <= maxRetries; i++ {
            attempts++
            if ctx.Err() != nil {
                return nil, ctx.Err()
            }

            resp, err = handler(ctx, req)
            if err == nil {
                // Muvaffaqiyatli urinishni yozamiz
                metrics.RecordHistogram("grpc_retry_attempts", float64(attempts), map[string]string{
                    "method": info.FullMethod,
                    "status": "success",
                })
                return resp, nil
            }

            if i == maxRetries {
                break
            }

            delay := backoff(i)
            log.Printf("[Retry] method=%s attempt=%d/%d delay=%v error=%v",
                info.FullMethod, i+1, maxRetries+1, delay, err)

            timer := time.NewTimer(delay)
            select {
            case <-ctx.Done():
                timer.Stop()
                return nil, ctx.Err()
            case <-timer.C:
            }
        }

        // Muvaffaqiyatsiz urinishlarni yozamiz
        metrics.RecordHistogram("grpc_retry_attempts", float64(attempts), map[string]string{
            "method": info.FullMethod,
            "status": "failed",
        })
        metrics.IncrementCounter("grpc_retry_exhausted", map[string]string{
            "method": info.FullMethod,
        })

        return resp, err
    }
}
\`\`\`

**Circuit Breaker + Retry Patterni:**
\`\`\`go
type CircuitBreaker struct {
    maxFailures  int
    resetTimeout time.Duration
    failures     int
    lastFailure  time.Time
    state        string // "closed", "open", "half-open"
    mu           sync.Mutex
}

func NewCircuitBreaker(maxFailures int, resetTimeout time.Duration) *CircuitBreaker {
    return &CircuitBreaker{
        maxFailures:  maxFailures,
        resetTimeout: resetTimeout,
        state:        "closed",
    }
}

func (cb *CircuitBreaker) Call(ctx context.Context, req any, handler Handler) (any, error) {
    cb.mu.Lock()

    // Circuit qayta tiklanishi kerakligini tekshiramiz
    if cb.state == "open" && time.Since(cb.lastFailure) > cb.resetTimeout {
        cb.state = "half-open"
        cb.failures = 0
    }

    // Circuit ochiq bo'lsa rad etamiz
    if cb.state == "open" {
        cb.mu.Unlock()
        return nil, status.Error(codes.Unavailable, "circuit breaker open")
    }

    cb.mu.Unlock()

    // So'rovni bajaramiz
    resp, err := handler(ctx, req)

    cb.mu.Lock()
    defer cb.mu.Unlock()

    if err != nil {
        cb.failures++
        cb.lastFailure = time.Now()

        if cb.failures >= cb.maxFailures {
            cb.state = "open"
            log.Printf("[Circuit Breaker] %d muvaffaqiyatsizlikdan keyin ochildi", cb.failures)
        }
    } else {
        // Muvaffaqiyat - qayta tiklaymiz yoki half-open ni saqlaymiz
        if cb.state == "half-open" {
            cb.state = "closed"
            cb.failures = 0
            log.Printf("[Circuit Breaker] muvaffaqiyatli so'rovdan keyin yopildi")
        }
    }

    return resp, err
}
\`\`\`

**Backoff Strategiyalari:**
\`\`\`go
func ConstantBackoff(delay time.Duration) func(int) time.Duration {
    return func(attempt int) time.Duration {
        return delay
    }
}

func LinearBackoff(baseDelay time.Duration) func(int) time.Duration {
    return func(attempt int) time.Duration {
        return baseDelay * time.Duration(attempt+1)
    }
}

func FibonacciBackoff(baseDelay time.Duration) func(int) time.Duration {
    return func(attempt int) time.Duration {
        fib := fibonacci(attempt + 1)
        return baseDelay * time.Duration(fib)
    }
}

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}
\`\`\`

**Haqiqiy Foydalari:**
- **Ishonchlilik:** Vaqtinchalik nosozliklardan avtomatik tiklanish
- **Mavjudlik:** Xizmat mijozlar uchun barqarorroq ko'rinadi
- **Foydalanuvchi Tajribasi:** Vaqtinchalik muammolar uchun xato o'rniga muvaffaqiyat
- **Xarajatlarni Tejash:** Qo'lda qayta urinish va tekshirishlardan qochish

**Retry Eng Yaxshi Amaliyotlari:**
- **Idempotentlik:** Operatsiyalarning qayta urinish uchun xavfsiz ekanligiga ishonch hosil qiling
- **Backoff Strategiyasi:** Jitter bilan exponential backoff dan foydalaning
- **Maksimal Qayta Urinishlar:** 2-5 urinishga cheklang
- **Tanlab Qayta Urinish:** Faqat vaqtinchalik xatolarni qayta urining
- **Circuit Breaker:** Circuit breaker patterni bilan birlashtiring
- **Metrikalar:** Qayta urinish tezligi va muvaffaqiyatni kuzatib boring

**Odatiy Backoff Strategiyalari:**
- **Exponential:** 100ms, 200ms, 400ms, 800ms...
- **Linear:** 100ms, 200ms, 300ms, 400ms...
- **Constant:** 100ms, 100ms, 100ms, 100ms...
- **Jittered:** Thundering herd dan qochish uchun tasodifiylik qo'shing

**Qachon Qayta Urinmaslik Kerak:**
- **Idempotentlik Muammolari:** Operatsiya qayta urinish uchun xavfsiz emas
- **Doimiy Xatolar:** Noto'g'ri so'rov, auth muvaffaqiyatsizligi
- **Mijoz Xatolari:** 4xx status practixri
- **Vaqtga Bog'liq:** Tez tugashi kerak bo'lgan operatsiyalar

RetryInterceptor siz mijozlar retry mantiqini o'zlari amalga oshirishi kerak—kod dublikatlari va izchil bo'lmagan xatti-harakatlar.`,
			solutionCode: `package grpcx

import (
	"context"
	"time"
)

type Handler func(ctx context.Context, req any) (any, error)

type UnaryServerInterceptor func(ctx context.Context, req any, next Handler) (any, error)

func RetryInterceptor(maxRetries int, backoff func(int) time.Duration) UnaryServerInterceptor {
	if maxRetries < 0 {	// maxRetries ni tekshirish
		maxRetries = 0	// Standart 0 qayta urinish
	}
	return func(ctx context.Context, req any, handler Handler) (any, error) {
		if handler == nil {	// Handler nil ekanligini tekshirish
			handler = func(context.Context, any) (any, error) { return nil, nil }	// No-op handler ishlatamiz
		}
		var (
			resp any
			err  error
		)
		for i := 0; i <= maxRetries; i++ {	// maxRetries + 1 marta urinamiz
			if ctx.Err() != nil {	// Kontekst bekor qilinishini tekshirish
				return nil, ctx.Err()	// Kontekst xatosini qaytaramiz
			}
			resp, err = handler(ctx, req)	// Handlerni bajaramiz
			if err == nil {	// Muvaffaqiyat
				return resp, nil	// Muvaffaqiyatli javobni qaytaramiz
			}
			if i == maxRetries {	// Oxirgi urinish
				break	// Oxirgi urinishdan keyin uxlamaymiz
			}
			delay := time.Duration(0)	// Standart kechikish
			if backoff != nil {	// Backoff funksiyasi mavjudligini tekshirish
				delay = backoff(i)	// Ushbu urinish uchun kechikishni hisoblaymiz
			}
			if delay > 0 {	// Agar kechikish musbat bo'lsa
				timer := time.NewTimer(delay)	// Kechikish uchun timer yaratamiz
				select {
				case <-ctx.Done():	// Uxlash vaqtida kontekst bekor qilindi
					if !timer.Stop() {	// Timerni to'xtatishga harakat qilamiz
						<-timer.C	// Timer kanalini bo'shatamiz
					}
					return nil, ctx.Err()	// Kontekst xatosini qaytaramiz
				case <-timer.C:	// Kechikish tugadi
				}
			}
		}
		return resp, err	// Oxirgi javob va xatoni qaytaramiz
	}
}`
		}
	}
};

export default task;
