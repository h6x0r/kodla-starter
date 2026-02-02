import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-http-require-query-param',
	title: 'Require Query Parameter Middleware',
	difficulty: 'medium',	tags: ['go', 'http', 'middleware', 'validation'],
	estimatedTime: '20m',	isPremium: false,
	youtubeUrl: '',
	description: `Implement **RequireQueryParam** middleware that validates a required query parameter is present and non-empty.

**Requirements:**
1. Create function \`RequireQueryParam(name string, next http.Handler) http.Handler\`
2. Trim whitespace from parameter name
3. Skip middleware if name is empty
4. Check if query parameter exists and is non-empty
5. Return 400 Bad Request if missing or empty
6. Handle nil next handler

**Example:**
\`\`\`go
handler := RequireQueryParam("id", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    id := r.URL.Query().Get("id")
    fmt.Fprintf(w, "ID: %s", id)
}))

// Request: GET /api/users → 400 Bad Request, "missing required query parameter"
// Request: GET /api/users?id=123 → 200 OK, ID: 123
\`\`\`

**Constraints:**
- Must use r.URL.Query().Get() for parameter retrieval
- Must trim whitespace from parameter value`,
	initialCode: `package httpx

import (
	"net/http"
	"strings"
)

// TODO: Implement RequireQueryParam middleware
func RequireQueryParam(name string, next http.Handler) http.Handler {
	// TODO: Implement
}`,
	solutionCode: `package httpx

import (
	"net/http"
	"strings"
)

func RequireQueryParam(name string, next http.Handler) http.Handler {
	if next == nil {	// Handle nil next handler
		return http.HandlerFunc(func(http.ResponseWriter, *http.Request) {})
	}
	paramName := strings.TrimSpace(name)	// Remove leading/trailing whitespace
	if paramName == "" {	// Empty name check
		return next	// Skip middleware if no param name
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		queryParam := strings.TrimSpace(r.URL.Query().Get(paramName))	// Get and trim parameter value
		if queryParam == "" {	// Check param exists and non-empty
			http.Error(w, "missing required query parameter", http.StatusBadRequest)	// 400 response
			return
		}
		next.ServeHTTP(w, r)	// Parameter present, continue
	})
}`,
	testCode: `package httpx

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func Test1RequireQueryParamWithValidParam(t *testing.T) {
	handler := RequireQueryParam("id", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("success"))
	}))
	req := httptest.NewRequest("GET", "/test?id=123", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}
}

func Test2RequireQueryParamMissingParam(t *testing.T) {
	handler := RequireQueryParam("id", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	req := httptest.NewRequest("GET", "/test", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected status 400, got %d", rec.Code)
	}
}

func Test3RequireQueryParamEmptyParam(t *testing.T) {
	handler := RequireQueryParam("id", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	req := httptest.NewRequest("GET", "/test?id=", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected status 400, got %d", rec.Code)
	}
}

func Test4RequireQueryParamWhitespaceParam(t *testing.T) {
	handler := RequireQueryParam("id", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	req := httptest.NewRequest("GET", "/test?id=%20%20%20", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected status 400, got %d", rec.Code)
	}
}

func Test5RequireQueryParamNilHandler(t *testing.T) {
	handler := RequireQueryParam("id", nil)
	req := httptest.NewRequest("GET", "/test?id=123", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}
}

func Test6RequireQueryParamEmptyName(t *testing.T) {
	nextCalled := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
		w.WriteHeader(http.StatusOK)
	})
	handler := RequireQueryParam("", next)
	req := httptest.NewRequest("GET", "/test", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if !nextCalled {
		t.Error("expected next handler to be called when name is empty")
	}
}

func Test7RequireQueryParamWhitespaceName(t *testing.T) {
	nextCalled := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
		w.WriteHeader(http.StatusOK)
	})
	handler := RequireQueryParam("   ", next)
	req := httptest.NewRequest("GET", "/test", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if !nextCalled {
		t.Error("expected next handler to be called when name is whitespace")
	}
}

func Test8RequireQueryParamWithLeadingWhitespace(t *testing.T) {
	handler := RequireQueryParam("  id  ", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	req := httptest.NewRequest("GET", "/test?id=123", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}
}

func Test9RequireQueryParamMultipleParams(t *testing.T) {
	handler := RequireQueryParam("id", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	req := httptest.NewRequest("GET", "/test?id=123&name=test", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}
}

func Test10RequireQueryParamValueWithSpaces(t *testing.T) {
	handler := RequireQueryParam("id", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	req := httptest.NewRequest("GET", "/test?id=%20%20123%20%20", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}
}`,
			hint1: `Use r.URL.Query().Get(paramName) to retrieve the query parameter value.`,
			hint2: `Trim the parameter value and check if it\`s empty. Return 400 if missing.`,
			whyItMatters: `RequireQueryParam enforces API contracts by validating required parameters, preventing incomplete requests from reaching handlers.

**Common Use Cases:**
- **Resource Filtering:** Require \`?filter=active\` for filtered lists
- **Pagination:** Require \`?page=1&limit=10\` for paginated endpoints
- **Search:** Require \`?q=search+term\` for search endpoints
- **Resource Access:** Require \`?id=123\` for ID-based operations

**Production Pattern:**
\`\`\`go
// Paginated list endpoint
listHandler := Chain(
    RequireQueryParam("page"),
    RequireQueryParam("limit"),
)(func(w http.ResponseWriter, r *http.Request) {
    page, _ := strconv.Atoi(r.URL.Query().Get("page"))
    limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
    users := listUsers(page, limit)
    json.NewEncoder(w).Encode(users)
})

// Search endpoint
searchHandler := RequireQueryParam("q", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    query := r.URL.Query().Get("q")
    results := search(query)
    json.NewEncoder(w).Encode(results)
}))

// Multiple required params
reportHandler := Chain(
    RequireQueryParam("start_date"),
    RequireQueryParam("end_date"),
    RequireQueryParam("format"),
)(generateReportHandler)

// Optional vs Required params
func FlexibleHandler(w http.ResponseWriter, r *http.Request) {
	// Required param (validated by middleware)
    userID := r.URL.Query().Get("user_id")

	// Optional params (with defaults)
    sort := r.URL.Query().Get("sort")
    if sort == "" {
        sort = "created_at"
    }

    order := r.URL.Query().Get("order")
    if order == "" {
        order = "desc"
    }

    data := fetchData(userID, sort, order)
    json.NewEncoder(w).Encode(data)
}
\`\`\`

**Real-World Benefits:**
- **Early Validation:** Fail fast before expensive operations
- **Clear Errors:** Client knows exactly what's missing
- **API Documentation:** Required params are enforced, not just documented
- **Security:** Prevent malformed requests from reaching business logic

**Query Parameter Best Practices:**
- **Naming:** Use lowercase with underscores (user_id, not userId)
- **Validation:** Validate presence first, then format/range
- **Defaults:** Optional params should have sensible defaults
- **Arrays:** Support ?tag=go&tag=http for multiple values

Without query parameter validation, handlers must manually check every parameter, leading to inconsistent error responses and duplicate validation code.`,	order: 6,
	translations: {
		ru: {
			title: 'Проверка наличия query параметра',
			description: `Реализуйте middleware **RequireQueryParam**, который проверяет наличие обязательного query параметра.

**Требования:**
1. Создайте функцию \`RequireQueryParam(name string, next http.Handler) http.Handler\`
2. Удалите пробелы из имени параметра
3. Пропустите middleware если имя пустое
4. Проверьте что query параметр существует и не пустой
5. Верните 400 Bad Request если отсутствует или пустой
6. Обработайте nil handler

**Пример:**
\`\`\`go
handler := RequireQueryParam("id", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    id := r.URL.Query().Get("id")
    fmt.Fprintf(w, "ID: %s", id)
}))

// Запрос: GET /api/users → 400 Bad Request
// Запрос: GET /api/users?id=123 → 200 OK, ID: 123
\`\`\`

**Ограничения:**
- Должен использовать r.URL.Query().Get() для получения параметра
- Должен удалять пробелы из значения параметра`,
			hint1: `Используйте r.URL.Query().Get(paramName) для получения значения query параметра.`,
			hint2: `Удалите пробелы из значения параметра и проверьте на пустоту. Верните 400 если отсутствует.`,
			whyItMatters: `RequireQueryParam обеспечивает выполнение API контрактов через валидацию обязательных параметров, предотвращая неполные запросы.

**Частые use cases:**
- **Фильтрация:** Требование \`?filter=active\` для отфильтрованных списков
- **Пагинация:** Требование \`?page=1&limit=10\` для пагинированных endpoints
- **Поиск:** Требование \`?q=search+term\` для поисковых endpoints
- **Доступ к ресурсам:** Требование \`?id=123\` для операций по ID

**Продакшен паттерн:**
\`\`\`go
// Пагинированный список
listHandler := Chain(
    RequireQueryParam("page"),
    RequireQueryParam("limit"),
)(func(w http.ResponseWriter, r *http.Request) {
    page, _ := strconv.Atoi(r.URL.Query().Get("page"))
    limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
    users := listUsers(page, limit)
    json.NewEncoder(w).Encode(users)
})

// Endpoint поиска
searchHandler := RequireQueryParam("q", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    query := r.URL.Query().Get("q")
    results := search(query)
    json.NewEncoder(w).Encode(results)
}))

// Несколько обязательных параметров
reportHandler := Chain(
    RequireQueryParam("start_date"),
    RequireQueryParam("end_date"),
    RequireQueryParam("format"),
)(generateReportHandler)
\`\`\`

**Практические преимущества:**
- **Ранняя валидация:** Быстрый отказ до дорогих операций
- **Ясные ошибки:** Клиент точно знает, чего не хватает
- **Документация API:** Обязательные параметры принудительны, не только задокументированы
- **Безопасность:** Предотвращение некорректных запросов до бизнес-логики

**Best practices для query параметров:**
- **Именование:** Lowercase с underscore (user_id, не userId)
- **Валидация:** Сначала проверка наличия, потом формат/диапазон
- **Defaults:** Опциональные параметры должны иметь разумные значения по умолчанию

Без валидации query параметров handlers должны вручную проверять каждый параметр.`,
			solutionCode: `package httpx

import (
	"net/http"
	"strings"
)

func RequireQueryParam(name string, next http.Handler) http.Handler {
	if next == nil {	// Обработка nil next handler
		return http.HandlerFunc(func(http.ResponseWriter, *http.Request) {})
	}
	paramName := strings.TrimSpace(name)	// Удаление начальных/конечных пробелов
	if paramName == "" {	// Проверка на пустое имя
		return next	// Пропуск middleware если нет имени параметра
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		queryParam := strings.TrimSpace(r.URL.Query().Get(paramName))	// Получение и trim значения параметра
		if queryParam == "" {	// Проверка что параметр существует и не пустой
			http.Error(w, "missing required query parameter", http.StatusBadRequest)	// 400 ответ
			return
		}
		next.ServeHTTP(w, r)	// Параметр присутствует, продолжение
	})
}`
		},
		uz: {
			title: 'Query parametr mavjudligini tekshirish',
			description: `Majburiy query parametri mavjudligini tekshiradigan **RequireQueryParam** middleware ni amalga oshiring.

**Talablar:**
1. \`RequireQueryParam(name string, next http.Handler) http.Handler\` funksiyasini yarating
2. Parametr nomidan bo'sh joylarni olib tashlang
3. Agar nom bo'sh bo'lsa middleware ni o'tkazing
4. Query parametr mavjud va bo'sh emasligini tekshiring
5. Agar yo'q yoki bo'sh bo'lsa 400 Bad Request qaytaring
6. nil handlerni ishlang

**Misol:**
\`\`\`go
handler := RequireQueryParam("id", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    id := r.URL.Query().Get("id")
    fmt.Fprintf(w, "ID: %s", id)
}))

// Request: GET /api/users → 400 Bad Request
// Request: GET /api/users?id=123 → 200 OK, ID: 123
\`\`\`

**Cheklovlar:**
- Parametrni olish uchun r.URL.Query().Get() dan foydalanishi kerak
- Parametr qiymatidan bo'sh joylarni olib tashlashi kerak`,
			hint1: `Query parametr qiymatini olish uchun r.URL.Query().Get(paramName) dan foydalaning.`,
			hint2: `Parametr qiymatini trim qiling va bo'shligini tekshiring. Agar yo'q bo'lsa 400 qaytaring.`,
			whyItMatters: `RequireQueryParam majburiy parametrlarni validatsiya qilish orqali API shartnomalarini ta'minlaydi, to'liq bo'lmagan requestlarning oldini oladi.

**Keng tarqalgan foydalanish:**
- **Filtrlash:** Filtrlangan ro'yxatlar uchun \`?filter=active\` ni talab qilish
- **Pagination:** Pagination endpointlari uchun \`?page=1&limit=10\` ni talab qilish
- **Qidiruv:** Qidiruv endpointlari uchun \`?q=search+term\` ni talab qilish
- **Resursga kirish:** ID-ga asoslangan operatsiyalar uchun \`?id=123\` ni talab qilish

**Ishlab chiqarish patterni:**
\`\`\`go
// Pagination bilan ro'yxat
listHandler := Chain(
    RequireQueryParam("page"),
    RequireQueryParam("limit"),
)(func(w http.ResponseWriter, r *http.Request) {
    page, _ := strconv.Atoi(r.URL.Query().Get("page"))
    limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
    users := listUsers(page, limit)
    json.NewEncoder(w).Encode(users)
})

// Qidiruv endpointi
searchHandler := RequireQueryParam("q", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    query := r.URL.Query().Get("q")
    results := search(query)
    json.NewEncoder(w).Encode(results)
}))

// Bir nechta majburiy parametrlar
reportHandler := Chain(
    RequireQueryParam("start_date"),
    RequireQueryParam("end_date"),
    RequireQueryParam("format"),
)(generateReportHandler)
\`\`\`

**Amaliy foydalari:**
- **Erta validatsiya:** Qimmat operatsiyalardan oldin tez rad etish
- **Aniq xatolar:** Mijoz aniq nimaning etishmasligini biladi
- **API hujjatlari:** Majburiy parametrlar hujjatlashtirilgan emas, majburiylashtirilgan
- **Xavfsizlik:** Biznes-mantiqqa yetmasdan noto'g'ri requestlarning oldini olish

**Query parametrlar uchun best practices:**
- **Nomlash:** Underscore bilan kichik harflar (user_id, userId emas)
- **Validatsiya:** Avval mavjudlikni tekshirish, keyin format/diapazon
- **Defaults:** Ixtiyoriy parametrlar oqilona standart qiymatlarga ega bo'lishi kerak

Query parametr validatsiyasisiz handlerlar har bir parametrni qo'lda tekshirishi kerak.`,
			solutionCode: `package httpx

import (
	"net/http"
	"strings"
)

func RequireQueryParam(name string, next http.Handler) http.Handler {
	if next == nil {	// nil next handlerni ishlash
		return http.HandlerFunc(func(http.ResponseWriter, *http.Request) {})
	}
	paramName := strings.TrimSpace(name)	// Bosh/oxiridagi bo'sh joylarni olib tashlash
	if paramName == "" {	// Bo'sh nom tekshiruvi
		return next	// Parametr nomi bo'lmasa middleware ni o'tkazish
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		queryParam := strings.TrimSpace(r.URL.Query().Get(paramName))	// Parametr qiymatini olish va trim qilish
		if queryParam == "" {	// Parametr mavjud va bo'sh emasligini tekshirish
			http.Error(w, "missing required query parameter", http.StatusBadRequest)	// 400 response
			return
		}
		next.ServeHTTP(w, r)	// Parametr mavjud, davom etish
	})
}`
		}
	}
};

export default task;
