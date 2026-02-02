import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-http-strip-prefix',
	title: 'Strip Prefix Middleware',
	difficulty: 'medium',	tags: ['go', 'http', 'middleware', 'routing'],
	estimatedTime: '25m',	isPremium: false,
	youtubeUrl: '',
	description: `Implement **StripPrefix** middleware that removes a path prefix or returns 404 if path doesn't match.

**Requirements:**
1. Create function \`StripPrefix(prefix string, next http.Handler) http.Handler\`
2. Check if request path starts with prefix
3. Return 404 if prefix doesn't match
4. Remove prefix from both \`Path\` and \`RawPath\`
5. Clone request with modified URL
6. Handle empty prefix and nil handler

**Example:**
\`\`\`go
handler := StripPrefix("/api/v1", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Path: %s", r.URL.Path)
}))

// Request: GET /api/v1/users → Response: Path: /users
// Request: GET /users → 404 Not Found
\`\`\`

**Constraints:**
- Must handle both Path and RawPath
- Must return 404 for non-matching paths
- Must clone request to avoid mutation`,
	initialCode: `package httpx

import (
	"net/http"
	"strings"
)

// TODO: Implement StripPrefix middleware
func StripPrefix(prefix string, next http.Handler) http.Handler {
	// TODO: Implement
}`,
	solutionCode: `package httpx

import (
	"net/http"
	"strings"
)

func StripPrefix(prefix string, next http.Handler) http.Handler {
	if next == nil {	// Handle nil next handler
		return http.HandlerFunc(func(http.ResponseWriter, *http.Request) {})
	}
	if prefix == "" {	// Empty prefix check
		return next	// Skip middleware if no prefix
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, prefix)	// Remove prefix from Path
		rawPath := strings.TrimPrefix(r.URL.RawPath, prefix)	// Remove prefix from RawPath

		// Check if prefix was actually removed (path changed)
		if len(path) >= len(r.URL.Path) || (len(rawPath) >= len(r.URL.RawPath) && r.URL.RawPath != "") {
			http.NotFound(w, r)	// Path doesn't start with prefix, 404
			return
		}

		clone := r.Clone(r.Context())	// Clone request to avoid mutation
		clone.URL.Path = path	// Update Path in clone
		if clone.URL.RawPath != "" {	// Update RawPath if present
			clone.URL.RawPath = rawPath
		}
		next.ServeHTTP(w, clone)	// Pass modified request
	})
}`,
			hint1: `Use strings.TrimPrefix() on both Path and RawPath, then check if the length changed.`,
			hint2: `Clone the request with r.Clone() before modifying the URL to avoid side effects.`,
			testCode: `package httpx

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func Test1(t *testing.T) {
	// Test prefix is stripped from path
	var path string
	h := StripPrefix("/api/v1", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path = r.URL.Path
	}))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("GET", "/api/v1/users", nil))
	if path != "/users" {
		t.Errorf("path = %q, want /users", path)
	}
}

func Test2(t *testing.T) {
	// Test non-matching path returns 404
	h := StripPrefix("/api/v1", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest("GET", "/other/path", nil))
	if rec.Code != http.StatusNotFound {
		t.Errorf("status = %d, want 404", rec.Code)
	}
}

func Test3(t *testing.T) {
	// Test nil handler returns non-nil
	h := StripPrefix("/api", nil)
	if h == nil {
		t.Error("nil handler should return non-nil")
	}
}

func Test4(t *testing.T) {
	// Test empty prefix skips stripping
	var path string
	h := StripPrefix("", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path = r.URL.Path
	}))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("GET", "/users", nil))
	if path != "/users" {
		t.Errorf("path = %q, want /users (unchanged)", path)
	}
}

func Test5(t *testing.T) {
	// Test exact prefix match works
	var path string
	h := StripPrefix("/api", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path = r.URL.Path
	}))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("GET", "/api", nil))
	if path != "" {
		t.Errorf("path = %q, want empty string", path)
	}
}

func Test6(t *testing.T) {
	// Test next handler is called with matching prefix
	called := false
	h := StripPrefix("/api", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
	}))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("GET", "/api/test", nil))
	if !called {
		t.Error("next handler should be called")
	}
}

func Test7(t *testing.T) {
	// Test next not called on 404
	called := false
	h := StripPrefix("/api", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
	}))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("GET", "/other", nil))
	if called {
		t.Error("next should not be called on 404")
	}
}

func Test8(t *testing.T) {
	// Test method is preserved
	var method string
	h := StripPrefix("/api", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		method = r.Method
	}))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("POST", "/api/data", nil))
	if method != "POST" {
		t.Errorf("method = %q, want POST", method)
	}
}

func Test9(t *testing.T) {
	// Test headers are preserved
	var header string
	h := StripPrefix("/api", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header = r.Header.Get("X-Custom")
	}))
	req := httptest.NewRequest("GET", "/api/test", nil)
	req.Header.Set("X-Custom", "value")
	h.ServeHTTP(httptest.NewRecorder(), req)
	if header != "value" {
		t.Errorf("header = %q, want 'value'", header)
	}
}

func Test10(t *testing.T) {
	// Test response body passes through
	h := StripPrefix("/api", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("response"))
	}))
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest("GET", "/api/test", nil))
	if rec.Body.String() != "response" {
		t.Errorf("body = %q, want 'response'", rec.Body.String())
	}
}`,
			whyItMatters: `StripPrefix enables mounting handlers at different path locations, essential for API versioning and modular routing.

**Why Strip Prefix:**
- **API Versioning:** Mount v1 and v2 handlers at different prefixes
- **Modular Apps:** Mount sub-applications at different paths
- **Reverse Proxy:** Strip proxy paths before forwarding
- **Multi-Tenant:** Route by tenant prefix

**Production Pattern:**
\`\`\`go
// API versioning
mux.Handle("/api/v1/", StripPrefix("/api/v1", v1Handler))
mux.Handle("/api/v2/", StripPrefix("/api/v2", v2Handler))

// Each handler sees clean paths
func v1Handler(w http.ResponseWriter, r *http.Request) {
	// r.URL.Path = "/users" (not "/api/v1/users")
    switch r.URL.Path {
    case "/users":
        listUsers(w, r)
    case "/posts":
        listPosts(w, r)
    }
}

// Microservice routing
func Router() *http.ServeMux {
    mux := http.NewServeMux()

	// Mount services at prefixes
    mux.Handle("/auth/", StripPrefix("/auth", authService))
    mux.Handle("/users/", StripPrefix("/users", userService))
    mux.Handle("/orders/", StripPrefix("/orders", orderService))

    return mux
}

// Multi-tenant routing
func TenantRouter(tenants map[string]http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        parts := strings.SplitN(r.URL.Path, "/", 3)
        if len(parts) < 2 {
            http.NotFound(w, r)
            return
        }

        tenantID := parts[1]
        handler, ok := tenants[tenantID]
        if !ok {
            http.NotFound(w, r)
            return
        }

	// Strip /tenant-id prefix
        StripPrefix("/"+tenantID, handler).ServeHTTP(w, r)
    })
}

// Reverse proxy with path rewriting
func ProxyHandler(target string) http.Handler {
    proxy := httputil.NewSingleHostReverseProxy(mustParseURL(target))

    return StripPrefix("/proxy", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	// Request: /proxy/api/data
	// Forwarded to target: /api/data
        proxy.ServeHTTP(w, r)
    }))
}
\`\`\`

**Real-World Benefits:**
- **Clean Code:** Handlers work with clean paths, no prefix parsing
- **Flexibility:** Move handlers to different paths without code changes
- **Backward Compatibility:** Support old and new API paths simultaneously
- **Microservices:** Each service sees only its local paths

**Path Handling:**
- **Path vs RawPath:** RawPath preserves encoded characters (%20, etc.)
- **TrimPrefix Safety:** Check length to detect actual prefix removal
- **Clone Request:** Avoid mutating original request

Without StripPrefix, every handler must manually parse and validate path prefixes, leading to duplicate code and errors.`,	order: 5,
	translations: {
		ru: {
			title: 'Удаление префикса из URL пути',
			description: `Реализуйте middleware **StripPrefix**, который удаляет префикс пути или возвращает 404 если путь не совпадает.

**Требования:**
1. Создайте функцию \`StripPrefix(prefix string, next http.Handler) http.Handler\`
2. Проверьте что путь запроса начинается с префикса
3. Верните 404 если префикс не совпадает
4. Удалите префикс из \`Path\` и \`RawPath\`
5. Клонируйте запрос с измененным URL
6. Обработайте пустой префикс и nil handler

**Пример:**
\`\`\`go
handler := StripPrefix("/api/v1", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Path: %s", r.URL.Path)
}))

// Запрос: GET /api/v1/users → Ответ: Path: /users
// Запрос: GET /users → 404 Not Found
\`\`\`

**Ограничения:**
- Должен обрабатывать Path и RawPath
- Должен возвращать 404 для несовпадающих путей
- Должен клонировать запрос`,
			hint1: `Используйте strings.TrimPrefix() для Path и RawPath, затем проверьте изменилась ли длина.`,
			hint2: `Клонируйте запрос через r.Clone() перед изменением URL.`,
			whyItMatters: `StripPrefix позволяет монтировать обработчики по разным путям, необходим для версионирования API и модульного роутинга.

**Почему Strip Prefix:**
- **Версионирование API:** Монтирование v1 и v2 handlers по разным префиксам
- **Модульные приложения:** Монтирование под-приложений по разным путям
- **Reverse Proxy:** Удаление proxy путей перед проксированием
- **Multi-Tenant:** Роутинг по префиксу тенанта

**Продакшен паттерн:**
\`\`\`go
// API версионирование
mux.Handle("/api/v1/", StripPrefix("/api/v1", v1Handler))
mux.Handle("/api/v2/", StripPrefix("/api/v2", v2Handler))

// Каждый handler видит чистые пути
func v1Handler(w http.ResponseWriter, r *http.Request) {
	// r.URL.Path = "/users" (не "/api/v1/users")
    switch r.URL.Path {
    case "/users":
        listUsers(w, r)
    case "/posts":
        listPosts(w, r)
    }
}

// Роутинг микросервисов
func Router() *http.ServeMux {
    mux := http.NewServeMux()

	// Монтирование сервисов по префиксам
    mux.Handle("/auth/", StripPrefix("/auth", authService))
    mux.Handle("/users/", StripPrefix("/users", userService))
    mux.Handle("/orders/", StripPrefix("/orders", orderService))

    return mux
}

// Multi-tenant роутинг
func TenantRouter(tenants map[string]http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        parts := strings.SplitN(r.URL.Path, "/", 3)
        if len(parts) < 2 {
            http.NotFound(w, r)
            return
        }

        tenantID := parts[1]
        handler, ok := tenants[tenantID]
        if !ok {
            http.NotFound(w, r)
            return
        }

	// Удаление /tenant-id префикса
        StripPrefix("/"+tenantID, handler).ServeHTTP(w, r)
    })
}

// Reverse proxy с перезаписью путей
func ProxyHandler(target string) http.Handler {
    proxy := httputil.NewSingleHostReverseProxy(mustParseURL(target))

    return StripPrefix("/proxy", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	// Запрос: /proxy/api/data
	// Проксируется на target: /api/data
        proxy.ServeHTTP(w, r)
    }))
}
\`\`\`

**Практические преимущества:**
- **Чистый код:** Handlers работают с чистыми путями, без парсинга префикса
- **Гибкость:** Перемещение handlers на другие пути без изменения кода
- **Обратная совместимость:** Поддержка старых и новых API путей одновременно
- **Микросервисы:** Каждый сервис видит только свои локальные пути

**Обработка путей:**
- **Path vs RawPath:** RawPath сохраняет закодированные символы (%20, etc.)
- **TrimPrefix Safety:** Проверка длины для определения реального удаления префикса
- **Clone Request:** Избегание мутации оригинального запроса

Без StripPrefix каждый handler должен вручную парсить и валидировать префиксы путей.`,
			solutionCode: `package httpx

import (
	"net/http"
	"strings"
)

func StripPrefix(prefix string, next http.Handler) http.Handler {
	if next == nil {	// Обработка nil next handler
		return http.HandlerFunc(func(http.ResponseWriter, *http.Request) {})
	}
	if prefix == "" {	// Проверка на пустой префикс
		return next	// Пропуск middleware если нет префикса
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, prefix)	// Удаление префикса из Path
		rawPath := strings.TrimPrefix(r.URL.RawPath, prefix)	// Удаление префикса из RawPath

		// Проверка что префикс действительно был удален (путь изменился)
		if len(path) >= len(r.URL.Path) || (len(rawPath) >= len(r.URL.RawPath) && r.URL.RawPath != "") {
			http.NotFound(w, r)	// Путь не начинается с префикса, 404
			return
		}

		clone := r.Clone(r.Context())	// Клонирование запроса во избежание мутации
		clone.URL.Path = path	// Обновление Path в клоне
		if clone.URL.RawPath != "" {	// Обновление RawPath если присутствует
			clone.URL.RawPath = rawPath
		}
		next.ServeHTTP(w, clone)	// Передача модифицированного запроса
	})
}`
		},
		uz: {
			title: 'URL yo\'lidan prefiksni olib tashlash',
			description: `Yo'l prefiksini olib tashlaydigan yoki yo'l mos kelmasa 404 qaytaradigan **StripPrefix** middleware ni amalga oshiring.

**Talablar:**
1. \`StripPrefix(prefix string, next http.Handler) http.Handler\` funksiyasini yarating
2. Request yo'li prefiks bilan boshlanishini tekshiring
3. Agar prefiks mos kelmasa 404 qaytaring
4. \`Path\` va 'RawPath' dan prefiksni olib tashlang
5. O'zgartirilgan URL bilan requestni klonlang
6. Bo'sh prefiks va nil handlerni ishlang

**Misol:**
\`\`\`go
handler := StripPrefix("/api/v1", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Path: %s", r.URL.Path)
}))

// Request: GET /api/v1/users → Response: Path: /users
// Request: GET /users → 404 Not Found
\`\`\`

**Cheklovlar:**
- Path va RawPath ni ishlashi kerak
- Mos kelmaydigan yo'llar uchun 404 qaytarishi kerak
- Requestni klonlashi kerak`,
			hint1: `Path va RawPath uchun strings.TrimPrefix() dan foydalaning, keyin uzunlik o'zgarganini tekshiring.`,
			hint2: `URL ni o'zgartirishdan oldin r.Clone() orqali requestni klonlang.`,
			whyItMatters: `StripPrefix turli yo'llarda handlerlarni joylashtirish imkonini beradi, API versiyalash va modulli routing uchun zarur.

**Nima uchun Strip Prefix:**
- **API versiyalash:** v1 va v2 handlerlarni turli prefikslarda joylashtirish
- **Modulli ilovalar:** Kichik ilovalarni turli yo'llarda joylashtirish
- **Reverse Proxy:** Proxylashdan oldin proxy yo'llarini olib tashlash
- **Multi-Tenant:** Tenant prefiksi bo'yicha routing

**Ishlab chiqarish patterni:**
\`\`\`go
// API versiyalash
mux.Handle("/api/v1/", StripPrefix("/api/v1", v1Handler))
mux.Handle("/api/v2/", StripPrefix("/api/v2", v2Handler))

// Har bir handler toza yo'llarni ko'radi
func v1Handler(w http.ResponseWriter, r *http.Request) {
	// r.URL.Path = "/users" (emas "/api/v1/users")
    switch r.URL.Path {
    case "/users":
        listUsers(w, r)
    case "/posts":
        listPosts(w, r)
    }
}

// Mikroservislar routingi
func Router() *http.ServeMux {
    mux := http.NewServeMux()

	// Servislarni prefikslarda joylashtirish
    mux.Handle("/auth/", StripPrefix("/auth", authService))
    mux.Handle("/users/", StripPrefix("/users", userService))
    mux.Handle("/orders/", StripPrefix("/orders", orderService))

    return mux
}

// Multi-tenant routing
func TenantRouter(tenants map[string]http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        parts := strings.SplitN(r.URL.Path, "/", 3)
        if len(parts) < 2 {
            http.NotFound(w, r)
            return
        }

        tenantID := parts[1]
        handler, ok := tenants[tenantID]
        if !ok {
            http.NotFound(w, r)
            return
        }

	// /tenant-id prefiksini olib tashlash
        StripPrefix("/"+tenantID, handler).ServeHTTP(w, r)
    })
}

// Reverse proxy yo'lni qayta yozish bilan
func ProxyHandler(target string) http.Handler {
    proxy := httputil.NewSingleHostReverseProxy(mustParseURL(target))

    return StripPrefix("/proxy", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	// Request: /proxy/api/data
	// Targetga yo'naltiriladi: /api/data
        proxy.ServeHTTP(w, r)
    }))
}
\`\`\`

**Amaliy foydalari:**
- **Toza kod:** Handlerlar toza yo'llar bilan ishlaydi, prefiks parse qilishsiz
- **Moslashuvchanlik:** Handlerlarni kod o'zgartirmasdan boshqa yo'llarga ko'chirish
- **Orqaga muvofiqlik:** Eski va yangi API yo'llarini bir vaqtda qo'llab-quvvatlash
- **Mikroservislar:** Har bir servis faqat o'zining lokal yo'llarini ko'radi

**Yo'llarni ishlash:**
- **Path vs RawPath:** RawPath practixngan belgilarni saqlaydi (%20, etc.)
- **TrimPrefix Safety:** Haqiqiy prefiks olib tashlanganini aniqlash uchun uzunlikni tekshirish
- **Clone Request:** Asl requestning mutatsiyasidan qochish

StripPrefix bo'lmasa, har bir handler yo'l prefikslarini qo'lda parse va validatsiya qilishi kerak, bu kod dublikatsiyasiga va xatolarga olib keladi.`,
			solutionCode: `package httpx

import (
	"net/http"
	"strings"
)

func StripPrefix(prefix string, next http.Handler) http.Handler {
	if next == nil {	// nil next handlerni ishlash
		return http.HandlerFunc(func(http.ResponseWriter, *http.Request) {})
	}
	if prefix == "" {	// Bo'sh prefiks tekshiruvi
		return next	// Prefiks bo'lmasa middleware ni o'tkazish
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, prefix)	// Path dan prefiksni olib tashlash
		rawPath := strings.TrimPrefix(r.URL.RawPath, prefix)	// RawPath dan prefiksni olib tashlash

		// Prefiks haqiqatan olib tashlangani tekshirish (yo'l o'zgardi)
		if len(path) >= len(r.URL.Path) || (len(rawPath) >= len(r.URL.RawPath) && r.URL.RawPath != "") {
			http.NotFound(w, r)	// Yo'l prefiks bilan boshlanmaydi, 404
			return
		}

		clone := r.Clone(r.Context())	// Mutatsiyadan qochish uchun requestni klonlash
		clone.URL.Path = path	// Klondagi Path ni yangilash
		if clone.URL.RawPath != "" {	// Agar mavjud bo'lsa RawPath ni yangilash
			clone.URL.RawPath = rawPath
		}
		next.ServeHTTP(w, clone)	// O'zgartirilgan requestni o'tkazish
	})
}`
		}
	}
};

export default task;
