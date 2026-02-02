import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-http-handler',
	title: 'HTTP Handler Testing',
	difficulty: 'medium',	tags: ['go', 'testing', 'http', 'httptest'],
	estimatedTime: '25m',	isPremium: false,
	youtubeUrl: '',
	description: `Test HTTP handlers using **httptest.NewRecorder** and **httptest.NewRequest**.

**Requirements:**
1. Implement \`HealthHandler\` that returns JSON: \`{"status": "ok"}\`
2. Write \`TestHealthHandler\` using httptest package
3. Assert status code is 200
4. Assert Content-Type is "application/json"
5. Assert response body matches expected JSON

**Example:**
\`\`\`go
req := httptest.NewRequest("GET", "/health", nil)
rec := httptest.NewRecorder()
handler.ServeHTTP(rec, req)

if rec.Code != http.StatusOK {
    t.Errorf("status = %d; want 200", rec.Code)
}
\`\`\`

**Constraints:**
- Must use httptest package, not real HTTP server
- Test both status code and response body
- Set correct Content-Type header`,
	initialCode: `package httphandler_test

import (
	"net/http"
	"net/http/httptest"
)

// TODO: Implement HealthHandler that returns {"status": "ok"}
func HealthHandler(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement
}

// TODO: Test HealthHandler using httptest
func TestHealthHandler(t *T) {
	// TODO: Implement
}`,
	solutionCode: `package httphandler_test

import (
	"net/http"
	"net/http/httptest"
)

func HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")  // Set content type
	w.WriteHeader(http.StatusOK)                        // Set status code
	w.Write([]byte("{\"status\": \"ok\"}"))             // Write JSON response
}

func TestHealthHandler(t *T) {
	// Create test request
	req := httptest.NewRequest("GET", "/health", nil)

	// Create response recorder
	rec := httptest.NewRecorder()

	// Call handler
	HealthHandler(rec, req)

	// Assert status code
	if rec.Code != http.StatusOK {
		t.Errorf("status code = %d; want %d", rec.Code, http.StatusOK)
	}

	// Assert Content-Type header
	contentType := rec.Header().Get("Content-Type")
	if contentType != "application/json" {
		t.Errorf("Content-Type = %q; want %q", contentType, "application/json")
	}

	// Assert response body
	expected := "{\"status\": \"ok\"}"
	if rec.Body.String() != expected {
		t.Errorf("body = %q; want %q", rec.Body.String(), expected)
	}
}`,
			hint1: `Use httptest.NewRequest to create a fake HTTP request without starting a server.`,
			hint2: `httptest.NewRecorder captures the response for assertions. Access rec.Code, rec.Header(), rec.Body.`,
			testCode: `package httphandler_test

import (
	"net/http"
	"net/http/httptest"
)

// Test1: Handler returns 200 OK
func Test1(t *T) {
	req := httptest.NewRequest("GET", "/health", nil)
	rec := httptest.NewRecorder()
	HealthHandler(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("status code = %d; want %d", rec.Code, http.StatusOK)
	}
}

// Test2: Handler returns JSON content type
func Test2(t *T) {
	req := httptest.NewRequest("GET", "/health", nil)
	rec := httptest.NewRecorder()
	HealthHandler(rec, req)
	contentType := rec.Header().Get("Content-Type")
	if contentType != "application/json" {
		t.Errorf("Content-Type = %q; want %q", contentType, "application/json")
	}
}

// Test3: Handler returns correct body
func Test3(t *T) {
	req := httptest.NewRequest("GET", "/health", nil)
	rec := httptest.NewRecorder()
	HealthHandler(rec, req)
	expected := "{\"status\": \"ok\"}"
	if rec.Body.String() != expected {
		t.Errorf("body = %q; want %q", rec.Body.String(), expected)
	}
}

// Test4: Handler works with POST method
func Test4(t *T) {
	req := httptest.NewRequest("POST", "/health", nil)
	rec := httptest.NewRecorder()
	HealthHandler(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("POST request: status code = %d; want %d", rec.Code, http.StatusOK)
	}
}

// Test5: Body is not empty
func Test5(t *T) {
	req := httptest.NewRequest("GET", "/health", nil)
	rec := httptest.NewRecorder()
	HealthHandler(rec, req)
	if rec.Body.Len() == 0 {
		t.Error("response body should not be empty")
	}
}

// Test6: Response contains status field
func Test6(t *T) {
	req := httptest.NewRequest("GET", "/health", nil)
	rec := httptest.NewRecorder()
	HealthHandler(rec, req)
	body := rec.Body.String()
	if body == "" {
		t.Error("body should not be empty")
	}
}

// Test7: Multiple requests work correctly
func Test7(t *T) {
	for i := 0; i < 3; i++ {
		req := httptest.NewRequest("GET", "/health", nil)
		rec := httptest.NewRecorder()
		HealthHandler(rec, req)
		if rec.Code != http.StatusOK {
			t.Errorf("request %d: status code = %d; want %d", i, rec.Code, http.StatusOK)
		}
	}
}

// Test8: Handler with query parameters
func Test8(t *T) {
	req := httptest.NewRequest("GET", "/health?debug=true", nil)
	rec := httptest.NewRecorder()
	HealthHandler(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("status code = %d; want %d", rec.Code, http.StatusOK)
	}
}

// Test9: Response headers set correctly
func Test9(t *T) {
	req := httptest.NewRequest("GET", "/health", nil)
	rec := httptest.NewRecorder()
	HealthHandler(rec, req)
	if rec.Header().Get("Content-Type") == "" {
		t.Error("Content-Type header should be set")
	}
}

// Test10: Complete health check validation
func Test10(t *T) {
	req := httptest.NewRequest("GET", "/health", nil)
	rec := httptest.NewRecorder()
	HealthHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("status = %d; want 200", rec.Code)
	}
	if rec.Header().Get("Content-Type") != "application/json" {
		t.Error("wrong content type")
	}
	if rec.Body.String() != "{\"status\": \"ok\"}" {
		t.Error("wrong body")
	}
}
`,
			whyItMatters: `HTTP handler testing ensures your API endpoints work correctly without the overhead of real servers.

**Why httptest Matters:**
- **Fast:** No network calls, tests run in milliseconds
- **Isolated:** No ports, no conflicts, fully deterministic
- **Debuggable:** Full access to request/response for assertions
- **CI-Friendly:** Works in any environment, no setup needed

**Real Server vs httptest:**
\`\`\`go
// Without httptest (slow, brittle)
server := httptest.NewServer(handler)
defer server.Close()
resp, err := http.Get(server.URL + "/health")
// Parsing response is messy...

// With httptest (fast, clean)
req := httptest.NewRequest("GET", "/health", nil)
rec := httptest.NewRecorder()
handler.ServeHTTP(rec, req)
// Direct access to rec.Code, rec.Body
\`\`\`

**Production Benefits:**
Testing handlers catches:
- **Status Codes:** Return 404 instead of 200 for missing resources
- **Headers:** Missing CORS, wrong Content-Type
- **JSON Schema:** Field typos, wrong types
- **Error Cases:** Panics on invalid input

**Real-World Example:**
Stripe tests every API endpoint with httptest:
\`\`\`go
func TestCreateCharge(t *testing.T) {
    req := httptest.NewRequest("POST", "/charges", body)
    req.Header.Set("Authorization", "Bearer sk_test_...")

    rec := httptest.NewRecorder()
    handler.ServeHTTP(rec, req)

    // Assert response
    if rec.Code != 201 {
        t.Errorf("expected 201 Created, got %d", rec.Code)
    }

    // Parse JSON
    var charge Charge
    json.Unmarshal(rec.Body.Bytes(), &charge)

    // Assert fields
    if charge.Amount != 1000 {
        t.Errorf("amount = %d, want 1000", charge.Amount)
    }
}
\`\`\`

**Common Patterns:**
\`\`\`go
// Test error responses
req := httptest.NewRequest("GET", "/user/invalid", nil)
rec := httptest.NewRecorder()
handler.ServeHTTP(rec, req)
if rec.Code != 404 {
    t.Error("expected 404 for invalid user")
}

// Test authentication
req = httptest.NewRequest("GET", "/admin", nil)
req.Header.Set("Authorization", "Bearer invalid")
rec = httptest.NewRecorder()
handler.ServeHTTP(rec, req)
if rec.Code != 401 {
    t.Error("expected 401 for invalid token")
}
\`\`\`

At Google, services have thousands of httptest-based tests, enabling confident deployment of API changes.`,	order: 3,
	translations: {
		ru: {
			title: 'Тестирование HTTP handler',
			description: `Тестируйте HTTP обработчики используя **httptest.NewRecorder** и **httptest.NewRequest**.

**Требования:**
1. Реализуйте \`HealthHandler\` возвращающий JSON: \`{"status": "ok"}\`
2. Напишите \`TestHealthHandler\` используя httptest
3. Проверьте что код статуса 200
4. Проверьте что Content-Type "application/json"
5. Проверьте что тело ответа соответствует JSON

**Пример:**
\`\`\`go
req := httptest.NewRequest("GET", "/health", nil)
rec := httptest.NewRecorder()
handler.ServeHTTP(rec, req)
\`\`\`

**Ограничения:**
- Используйте httptest, не реальный HTTP сервер
- Тестируйте и код статуса и тело ответа`,
			hint1: `Используйте httptest.NewRequest для создания фейкового HTTP запроса без запуска сервера.`,
			hint2: `httptest.NewRecorder захватывает ответ для проверок. Используйте rec.Code, rec.Header(), rec.Body.`,
			whyItMatters: `Тестирование HTTP обработчиков гарантирует корректную работу API endpoints без накладных расходов реальных серверов.

**Почему httptest важен:**
- **Быстро:** Нет сетевых вызовов, тесты выполняются за миллисекунды
- **Изолировано:** Нет портов, нет конфликтов, полностью детерминировано
- **Отладка:** Полный доступ к request/response для assertions
- **CI-Friendly:** Работает в любом окружении, настройка не нужна

**Реальный сервер vs httptest:**
\`\`\`go
// Без httptest (медленно, хрупко)
server := httptest.NewServer(handler)
defer server.Close()
resp, err := http.Get(server.URL + "/health")
// Парсинг ответа запутанный...

// С httptest (быстро, чисто)
req := httptest.NewRequest("GET", "/health", nil)
rec := httptest.NewRecorder()
handler.ServeHTTP(rec, req)
// Прямой доступ к rec.Code, rec.Body
\`\`\`

**Продакшен паттерн:**
Тестирование handlers ловит:
- **Коды статусов:** Возврат 404 вместо 200 для отсутствующих ресурсов
- **Заголовки:** Отсутствующие CORS, неправильный Content-Type
- **JSON схема:** Опечатки в полях, неправильные типы
- **Случаи ошибок:** Паники на невалидном вводе

**Практический пример:**
Stripe тестирует каждый API endpoint с httptest:
\`\`\`go
func TestCreateCharge(t *testing.T) {
    req := httptest.NewRequest("POST", "/charges", body)
    req.Header.Set("Authorization", "Bearer sk_test_...")

    rec := httptest.NewRecorder()
    handler.ServeHTTP(rec, req)

    // Assert response
    if rec.Code != 201 {
        t.Errorf("expected 201 Created, got %d", rec.Code)
    }

    // Parse JSON
    var charge Charge
    json.Unmarshal(rec.Body.Bytes(), &charge)

    // Assert fields
    if charge.Amount != 1000 {
        t.Errorf("amount = %d, want 1000", charge.Amount)
    }
}
\`\`\`

В Google сервисы имеют тысячи тестов на основе httptest, позволяя уверенно деплоить изменения API.`,
			solutionCode: `package httphandler_test

import (
	"net/http"
	"net/http/httptest"
)

func HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")  // Установить тип контента
	w.WriteHeader(http.StatusOK)                        // Установить код статуса
	w.Write([]byte("{\"status\": \"ok\"}"))             // Записать JSON ответ
}

func TestHealthHandler(t *T) {
	// Создать тестовый запрос
	req := httptest.NewRequest("GET", "/health", nil)

	// Создать рекордер ответа
	rec := httptest.NewRecorder()

	// Вызвать обработчик
	HealthHandler(rec, req)

	// Проверить код статуса
	if rec.Code != http.StatusOK {
		t.Errorf("код статуса = %d; ожидается %d", rec.Code, http.StatusOK)
	}

	// Проверить заголовок Content-Type
	contentType := rec.Header().Get("Content-Type")
	if contentType != "application/json" {
		t.Errorf("Content-Type = %q; ожидается %q", contentType, "application/json")
	}

	// Проверить тело ответа
	expected := "{\"status\": \"ok\"}"
	if rec.Body.String() != expected {
		t.Errorf("body = %q; ожидается %q", rec.Body.String(), expected)
	}
}`
		},
		uz: {
			title: `HTTP handler testlash`,
			description: `**httptest.NewRecorder** va **httptest.NewRequest** dan foydalanib HTTP handlerlarni test qiling.

**Talablar:**
1. JSON qaytaradigan 'HealthHandler' ni amalga oshiring: '{"status": "ok"}'
2. httptest paketidan foydalanib 'TestHealthHandler' yozing
3. Status kod 200 ekanligini tekshiring
4. Content-Type "application/json" ekanligini tekshiring
5. Javob tanasi kutilgan JSON ga mos kelishini tekshiring

**Misol:**
\`\`\`go
req := httptest.NewRequest("GET", "/health", nil)
rec := httptest.NewRecorder()
handler.ServeHTTP(rec, req)
\`\`\`

**Cheklovlar:**
- Haqiqiy HTTP server emas, httptest paketidan foydalaning
- Ham status kod, ham javob tanasini tekshiring`,
			hint1: `Server ishga tushirmasdan soxta HTTP so'rov yaratish uchun httptest.NewRequest dan foydalaning.`,
			hint2: `httptest.NewRecorder javobni tekshirish uchun yozib oladi. rec.Code, rec.Header(), rec.Body dan foydalaning.`,
			whyItMatters: `HTTP handler testlari haqiqiy serverlar yuklanishisiz API endpointlar to'g'ri ishlashini ta'minlaydi.

**Nima uchun httptest muhim:**
- **Tez:** Tarmoq chaqiruvlari yo'q, testlar millisekundlarda ishlaydi
- **Izolyatsiya:** Portlar yo'q, konfliktlar yo'q, to'liq deterministik
- **Debug:** Assertions uchun request/response ga to'liq kirish
- **CI-Friendly:** Har qanday muhitda ishlaydi, sozlash kerak emas

**Haqiqiy server vs httptest:**
\`\`\`go
// httptest siz (sekin, mo'rt)
server := httptest.NewServer(handler)
defer server.Close()
resp, err := http.Get(server.URL + "/health")
// Javobni parse qilish chalkash...

// httptest bilan (tez, tozalangan)
req := httptest.NewRequest("GET", "/health", nil)
rec := httptest.NewRecorder()
handler.ServeHTTP(rec, req)
// rec.Code, rec.Body ga to'g'ridan-to'g'ri kirish
\`\`\`

**Ishlab chiqarish patterni:**
Handler testlari quyidagilarni ushlaydi:
- **Status practixr:** Mavjud bo'lmagan resurslar uchun 200 o'rniga 404 qaytarish
- **Headerlar:** CORS yo'q, noto'g'ri Content-Type
- **JSON sxema:** Fieldlarda xatolar, noto'g'ri turlar
- **Xato holatlari:** Noto'g'ri kirishda panic

**Amaliy misol:**
Stripe har bir API endpointni httptest bilan test qiladi:
\`\`\`go
func TestCreateCharge(t *testing.T) {
    req := httptest.NewRequest("POST", "/charges", body)
    req.Header.Set("Authorization", "Bearer sk_test_...")

    rec := httptest.NewRecorder()
    handler.ServeHTTP(rec, req)

    // Javobni tekshirish
    if rec.Code != 201 {
        t.Errorf("201 Created kutilgan, %d olindi", rec.Code)
    }

    // JSON parse qilish
    var charge Charge
    json.Unmarshal(rec.Body.Bytes(), &charge)

    // Fieldlarni tekshirish
    if charge.Amount != 1000 {
        t.Errorf("amount = %d, want 1000", charge.Amount)
    }
}
\`\`\`

Google da xizmatlar httptest asosida minglab testlarga ega, bu API o'zgarishlarini ishonch bilan deploy qilish imkonini beradi.`,
			solutionCode: `package httphandler_test

import (
	"net/http"
	"net/http/httptest"
)

func HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")  // Kontent turini o'rnatish
	w.WriteHeader(http.StatusOK)                        // Status kodini o'rnatish
	w.Write([]byte("{\"status\": \"ok\"}"))             // JSON javobini yozish
}

func TestHealthHandler(t *T) {
	// Test so'rovini yaratish
	req := httptest.NewRequest("GET", "/health", nil)

	// Javob yozuvchisini yaratish
	rec := httptest.NewRecorder()

	// Handlerni chaqirish
	HealthHandler(rec, req)

	// Status kodini tekshirish
	if rec.Code != http.StatusOK {
		t.Errorf("status kod = %d; kutilgan %d", rec.Code, http.StatusOK)
	}

	// Content-Type headerini tekshirish
	contentType := rec.Header().Get("Content-Type")
	if contentType != "application/json" {
		t.Errorf("Content-Type = %q; kutilgan %q", contentType, "application/json")
	}

	// Javob tanasini tekshirish
	expected := "{\"status\": \"ok\"}"
	if rec.Body.String() != expected {
		t.Errorf("body = %q; kutilgan %q", rec.Body.String(), expected)
	}
}`
		}
	}
};

export default task;
