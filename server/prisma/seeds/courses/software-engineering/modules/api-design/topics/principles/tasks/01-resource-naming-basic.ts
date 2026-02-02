import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'api-design-resource-naming-basic',
	title: 'RESTful Resource Naming - Basics',
	difficulty: 'easy',
	tags: ['api-design', 'rest', 'go', 'resource-naming'],
	estimatedTime: '25m',
	isPremium: false,
	youtubeUrl: '',
	description: `Implement proper RESTful resource naming conventions for a user management API.

**You will implement:**

1. **User struct** - Represents a user resource
2. **Router setup** - Configure HTTP routes following REST conventions
3. **GetUsers()** - List all users endpoint
4. **GetUser()** - Get single user by ID endpoint

**Key Concepts:**
- **Plural Nouns**: Use plural nouns for collections (/users, not /user)
- **Resource Hierarchy**: Organize routes by resources, not actions
- **No Verbs**: Avoid verbs in URLs (GET /users/1, not /getUser/1)

**Example Usage:**

\`\`\`go
// Correct RESTful naming
GET    /api/users          // List all users
GET    /api/users/123      // Get user with ID 123

// WRONG - Don't do this
GET    /api/getUsers       // Verb in URL
GET    /api/user           // Singular for collection
GET    /api/getUserById/123 // Action-based naming
\`\`\`

**REST Resource Naming Best Practices:**
- Use lowercase letters
- Use hyphens for multi-word resources (/api/user-profiles)
- Keep URLs simple and predictable
- Use nouns, not verbs
- Collections should be plural

**Constraints:**
- Routes must follow RESTful conventions
- Use Chi router for routing
- Return proper JSON responses`,
	initialCode: `package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

// User represents a user resource
type User struct {
	ID    int    \`json:"id"\`
	Name  string \`json:"name"\`
	Email string \`json:"email"\`
}

// Mock database
var users = []User{
	{ID: 1, Name: "Alice", Email: "alice@example.com"},
	{ID: 2, Name: "Bob", Email: "bob@example.com"},
	{ID: 3, Name: "Charlie", Email: "charlie@example.com"},
}

// TODO: Implement SetupRoutes
// Configure RESTful routes following naming conventions:
// GET /api/users - list all users (handler: GetUsers)
// GET /api/users/{id} - get user by ID (handler: GetUser)
// Use Chi router methods: r.Get(pattern, handler)
func SetupRoutes(r chi.Router) {
	panic("TODO: implement SetupRoutes")
}

// TODO: Implement GetUsers
// Returns all users as JSON array
// Use json.NewEncoder(w).Encode(users)
// Set Content-Type: application/json
func GetUsers(w http.ResponseWriter, r *http.Request) {
	panic("TODO: implement GetUsers")
}

// TODO: Implement GetUser
// Gets user by ID from URL parameter
// Use chi.URLParam(r, "id") to extract ID
// Return 404 if user not found
// Return user as JSON if found
func GetUser(w http.ResponseWriter, r *http.Request) {
	panic("TODO: implement GetUser")
}`,
	solutionCode: `package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type User struct {
	ID    int    \`json:"id"\`	// JSON tag for lowercase field names
	Name  string \`json:"name"\`
	Email string \`json:"email"\`
}

var users = []User{
	{ID: 1, Name: "Alice", Email: "alice@example.com"},
	{ID: 2, Name: "Bob", Email: "bob@example.com"},
	{ID: 3, Name: "Charlie", Email: "charlie@example.com"},
}

func SetupRoutes(r chi.Router) {
	// RESTful routes: use plural nouns for collections
	r.Get("/api/users", GetUsers)      // Collection endpoint - plural "users"
	r.Get("/api/users/{id}", GetUser)  // Single resource endpoint with ID parameter
}

func GetUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")  // Always set content type first
	json.NewEncoder(w).Encode(users)  // Encode slice directly to response
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	// Extract ID from URL path parameter
	idStr := chi.URLParam(r, "id")  // Gets value from /api/users/{id}
	id, err := strconv.Atoi(idStr)  // Convert string to integer
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)  // 400 for invalid ID format
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid user ID"})
		return
	}

	// Find user in mock database
	for _, user := range users {
		if user.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(user)  // Return found user
			return
		}
	}

	// User not found
	w.WriteHeader(http.StatusNotFound)  // 404 when resource doesn't exist
	json.NewEncoder(w).Encode(map[string]string{"error": "User not found"})
}`,
	hint1: `For SetupRoutes, use r.Get("/api/users", GetUsers) for the collection and r.Get("/api/users/{id}", GetUser) for single resource. Always use plural nouns!`,
	hint2: `In GetUser, extract the ID with chi.URLParam(r, "id"), convert to int with strconv.Atoi, then loop through users to find matching ID. Return 404 if not found.`,
	whyItMatters: `RESTful resource naming is the foundation of intuitive, predictable APIs that developers love to use.

**Why Resource Naming Matters:**

**1. Predictability and Developer Experience**
Good resource naming makes your API self-documenting:

\`\`\`go
// GOOD: Predictable RESTful naming
GET    /api/users              // Obviously gets all users
GET    /api/users/123          // Obviously gets user 123
GET    /api/users/123/orders   // Obviously gets orders for user 123

// BAD: Action-based naming (RPC-style)
GET    /api/getAllUsers        // Is it get ALL or with pagination?
GET    /api/getUserById?id=123 // Mixing patterns (path vs query)
GET    /api/user/123/getOrders // Redundant verb in URL
\`\`\`

**2. Consistency Across Teams**
RESTful conventions enable multiple teams to work independently:

\`\`\`go
// Team A builds user service
GET    /api/users
POST   /api/users
GET    /api/users/{id}

// Team B builds product service - same pattern!
GET    /api/products
POST   /api/products
GET    /api/products/{id}

// Developers instantly understand both APIs without documentation
\`\`\`

**3. HTTP Method Mapping**
Resource-based URLs work naturally with HTTP methods:

\`\`\`go
// Same URL, different methods = different operations
GET    /api/users/123    // Read user
PUT    /api/users/123    // Update user
DELETE /api/users/123    // Delete user
POST   /api/users        // Create user

// BAD: Verbs force you into GET-only APIs
GET /api/getUser/123
GET /api/updateUser/123  // Update via GET? Wrong HTTP method!
GET /api/deleteUser/123  // Deleting with GET? Dangerous!
\`\`\`

**4. Real-World Examples**

**GitHub API** - Perfect RESTful naming:
\`\`\`
GET  /repos/:owner/:repo
GET  /repos/:owner/:repo/issues
POST /repos/:owner/:repo/issues
GET  /repos/:owner/:repo/issues/:number
\`\`\`

**Stripe API** - Resource hierarchy:
\`\`\`
GET  /customers
GET  /customers/:id
GET  /customers/:id/subscriptions
GET  /customers/:id/subscriptions/:sub_id
\`\`\`

**5. Common Naming Mistakes**

\`\`\`go
// ❌ MISTAKE 1: Verbs in URLs
GET /api/getUsers
POST /api/createUser
// ✅ CORRECT: Resources with HTTP methods
GET /api/users
POST /api/users

// ❌ MISTAKE 2: Singular for collections
GET /api/user        // Is this one user or all users?
// ✅ CORRECT: Plural for collections
GET /api/users       // Clearly a collection

// ❌ MISTAKE 3: Mixing query params with path
GET /api/users?action=get&id=123
// ✅ CORRECT: ID in path
GET /api/users/123

// ❌ MISTAKE 4: Inconsistent nesting
GET /api/users/123/getOrders
GET /api/getUserOrders/123
// ✅ CORRECT: Consistent resource hierarchy
GET /api/users/123/orders
\`\`\`

**6. Multi-Word Resources**
Use hyphens for readability:

\`\`\`go
// ✅ GOOD: Kebab-case (hyphens)
/api/user-profiles
/api/billing-addresses
/api/payment-methods

// ❌ BAD: camelCase or snake_case in URLs
/api/userProfiles      // Hard to read
/api/user_profiles     // Encoded as %5F in some clients
\`\`\`

**7. Production Benefits**

\`\`\`go
// Easy to implement caching rules
cache.Set("/api/users/*", 5*time.Minute)  // Cache all user endpoints

// Simple API gateway routing
if strings.HasPrefix(path, "/api/users") {
    proxy.Forward(userService)
} else if strings.HasPrefix(path, "/api/products") {
    proxy.Forward(productService)
}

// Clear monitoring and analytics
metrics.Track("GET /api/users")      // Group by resource
metrics.Track("GET /api/users/:id")  // Group by endpoint pattern
\`\`\`

**Best Practices Summary:**
- Use nouns, not verbs
- Use plural for collections
- Use lowercase and hyphens
- Keep URLs under 2000 characters
- Avoid file extensions (.json, .xml)
- Use proper HTTP methods for actions`,
	order: 0,
	testCode: `package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
)

// Test1: GetUsers returns all users
func Test1(t *testing.T) {
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/users", nil)
	GetUsers(w, r)
	if w.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w.Code)
	}
}

// Test2: GetUsers returns JSON array
func Test2(t *testing.T) {
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/users", nil)
	GetUsers(w, r)
	var result []User
	json.NewDecoder(w.Body).Decode(&result)
	if len(result) != 3 {
		t.Errorf("Expected 3 users, got %d", len(result))
	}
}

// Test3: GetUser returns specific user
func Test3(t *testing.T) {
	router := chi.NewRouter()
	router.Get("/api/users/{id}", GetUser)
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/users/1", nil)
	router.ServeHTTP(w, r)
	if w.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w.Code)
	}
}

// Test4: GetUser returns 404 for non-existent user
func Test4(t *testing.T) {
	router := chi.NewRouter()
	router.Get("/api/users/{id}", GetUser)
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/users/999", nil)
	router.ServeHTTP(w, r)
	if w.Code != http.StatusNotFound {
		t.Errorf("Expected 404, got %d", w.Code)
	}
}

// Test5: SetupRoutes creates routes
func Test5(t *testing.T) {
	router := chi.NewRouter()
	SetupRoutes(router)
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/users", nil)
	router.ServeHTTP(w, r)
	if w.Code != http.StatusOK {
		t.Error("Route /api/users should be registered")
	}
}

// Test6: User struct has correct fields
func Test6(t *testing.T) {
	u := User{ID: 1, Name: "Test", Email: "test@test.com"}
	if u.ID != 1 || u.Name != "Test" || u.Email != "test@test.com" {
		t.Error("User fields not set correctly")
	}
}

// Test7: GetUser returns user with correct ID
func Test7(t *testing.T) {
	router := chi.NewRouter()
	router.Get("/api/users/{id}", GetUser)
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/users/2", nil)
	router.ServeHTTP(w, r)
	var user User
	json.NewDecoder(w.Body).Decode(&user)
	if user.ID != 2 {
		t.Errorf("Expected user ID 2, got %d", user.ID)
	}
}

// Test8: GetUsers sets Content-Type header
func Test8(t *testing.T) {
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/users", nil)
	GetUsers(w, r)
	ct := w.Header().Get("Content-Type")
	if ct != "application/json" {
		t.Errorf("Expected application/json, got %s", ct)
	}
}

// Test9: GetUser with invalid ID returns 400
func Test9(t *testing.T) {
	router := chi.NewRouter()
	router.Get("/api/users/{id}", GetUser)
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/users/abc", nil)
	router.ServeHTTP(w, r)
	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected 400, got %d", w.Code)
	}
}

// Test10: SetupRoutes registers both routes
func Test10(t *testing.T) {
	router := chi.NewRouter()
	SetupRoutes(router)
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/users/1", nil)
	router.ServeHTTP(w, r)
	if w.Code != http.StatusOK {
		t.Error("Route /api/users/{id} should be registered")
	}
}
`,
	translations: {
		ru: {
			title: 'RESTful именование ресурсов - Основы',
			description: `Реализуйте правильные соглашения об именовании RESTful ресурсов для API управления пользователями.

**Вы реализуете:**

1. **User struct** - Представляет ресурс пользователя
2. **Router setup** - Настройте HTTP маршруты следуя REST соглашениям
3. **GetUsers()** - Эндпоинт для получения всех пользователей
4. **GetUser()** - Эндпоинт для получения пользователя по ID

**Ключевые концепции:**
- **Существительные во множественном числе**: Используйте множественное число для коллекций (/users, не /user)
- **Иерархия ресурсов**: Организуйте маршруты по ресурсам, а не действиям
- **Без глаголов**: Избегайте глаголов в URL (GET /users/1, не /getUser/1)

**Пример использования:**

\`\`\`go
// Правильное RESTful именование
GET    /api/users          // Список всех пользователей
GET    /api/users/123      // Получить пользователя с ID 123

// НЕПРАВИЛЬНО - Не делайте так
GET    /api/getUsers       // Глагол в URL
GET    /api/user           // Единственное число для коллекции
GET    /api/getUserById/123 // Именование основанное на действиях
\`\`\`

**Лучшие практики именования REST ресурсов:**
- Используйте строчные буквы
- Используйте дефисы для многословных ресурсов (/api/user-profiles)
- Делайте URL простыми и предсказуемыми
- Используйте существительные, не глаголы
- Коллекции должны быть во множественном числе

**Ограничения:**
- Маршруты должны следовать RESTful соглашениям
- Используйте Chi роутер для маршрутизации
- Возвращайте правильные JSON ответы`,
			hint1: `Для SetupRoutes используйте r.Get("/api/users", GetUsers) для коллекции и r.Get("/api/users/{id}", GetUser) для одного ресурса. Всегда используйте множественное число!`,
			hint2: `В GetUser извлеките ID с помощью chi.URLParam(r, "id"), конвертируйте в int через strconv.Atoi, затем переберите users чтобы найти совпадающий ID. Верните 404 если не найден.`,
			whyItMatters: `RESTful именование ресурсов — это основа интуитивных, предсказуемых API, которые разработчики любят использовать.

**Почему именование ресурсов важно:**

**1. Предсказуемость и опыт разработчика**
Хорошее именование ресурсов делает ваш API самодокументируемым:

\`\`\`go
// ХОРОШО: Предсказуемое RESTful именование
GET    /api/users              // Очевидно получает всех пользователей
GET    /api/users/123          // Очевидно получает пользователя 123
GET    /api/users/123/orders   // Очевидно получает заказы пользователя 123

// ПЛОХО: Именование основанное на действиях (RPC-стиль)
GET    /api/getAllUsers        // Это получить ВСЕХ или с пагинацией?
GET    /api/getUserById?id=123 // Смешивание паттернов (path vs query)
GET    /api/user/123/getOrders // Избыточный глагол в URL
\`\`\`

**2. Согласованность между командами**
RESTful соглашения позволяют нескольким командам работать независимо:

\`\`\`go
// Команда A создаёт пользовательский сервис
GET    /api/users
POST   /api/users
GET    /api/users/{id}

// Команда B создаёт продуктовый сервис - тот же паттерн!
GET    /api/products
POST   /api/products
GET    /api/products/{id}

// Разработчики мгновенно понимают оба API без документации
\`\`\`

**3. Сопоставление HTTP методов**
URL основанные на ресурсах естественно работают с HTTP методами:

\`\`\`go
// Один URL, разные методы = разные операции
GET    /api/users/123    // Читать пользователя
PUT    /api/users/123    // Обновить пользователя
DELETE /api/users/123    // Удалить пользователя
POST   /api/users        // Создать пользователя

// ПЛОХО: Глаголы заставляют использовать только GET
GET /api/getUser/123
GET /api/updateUser/123  // Обновление через GET? Неправильный HTTP метод!
GET /api/deleteUser/123  // Удаление через GET? Опасно!
\`\`\`

**4. Реальные примеры**

**GitHub API** - Идеальное RESTful именование:
\`\`\`
GET  /repos/:owner/:repo
GET  /repos/:owner/:repo/issues
POST /repos/:owner/:repo/issues
GET  /repos/:owner/:repo/issues/:number
\`\`\`

**Stripe API** - Иерархия ресурсов:
\`\`\`
GET  /customers
GET  /customers/:id
GET  /customers/:id/subscriptions
GET  /customers/:id/subscriptions/:sub_id
\`\`\`

**Лучшие практики:**
- Используйте существительные, не глаголы
- Используйте множественное число для коллекций
- Используйте строчные буквы и дефисы
- Держите URL короткими (меньше 2000 символов)
- Избегайте расширений файлов (.json, .xml)
- Используйте правильные HTTP методы для действий`,
			solutionCode: `package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type User struct {
	ID    int    \`json:"id"\`	// JSON тег для полей в нижнем регистре
	Name  string \`json:"name"\`
	Email string \`json:"email"\`
}

var users = []User{
	{ID: 1, Name: "Alice", Email: "alice@example.com"},
	{ID: 2, Name: "Bob", Email: "bob@example.com"},
	{ID: 3, Name: "Charlie", Email: "charlie@example.com"},
}

func SetupRoutes(r chi.Router) {
	// RESTful маршруты: используйте существительные во множественном числе для коллекций
	r.Get("/api/users", GetUsers)      // Эндпоинт коллекции - множественное число "users"
	r.Get("/api/users/{id}", GetUser)  // Эндпоинт одного ресурса с параметром ID
}

func GetUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")  // Всегда устанавливайте content type первым
	json.NewEncoder(w).Encode(users)  // Кодируем срез напрямую в ответ
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	// Извлекаем ID из параметра пути URL
	idStr := chi.URLParam(r, "id")  // Получаем значение из /api/users/{id}
	id, err := strconv.Atoi(idStr)  // Конвертируем строку в целое число
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)  // 400 для неверного формата ID
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid user ID"})
		return
	}

	// Находим пользователя в тестовой БД
	for _, user := range users {
		if user.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(user)  // Возвращаем найденного пользователя
			return
		}
	}

	// Пользователь не найден
	w.WriteHeader(http.StatusNotFound)  // 404 когда ресурс не существует
	json.NewEncoder(w).Encode(map[string]string{"error": "User not found"})
}`
		},
		uz: {
			title: 'RESTful resurs nomlash - Asoslar',
			description: `Foydalanuvchilarni boshqarish API uchun to\'g\'ri RESTful resurs nomlash konventsiyalarini amalga oshiring.

**Siz amalga oshirasiz:**

1. **User struct** - Foydalanuvchi resursini ifodalaydi
2. **Router setup** - REST konventsiyalariga rioya qilgan holda HTTP yo\'llarini sozlang
3. **GetUsers()** - Barcha foydalanuvchilarni olish endpointi
4. **GetUser()** - ID bo\'yicha bitta foydalanuvchini olish endpointi

**Asosiy tushunchalar:**
- **Ko\'plik otlar**: Kolleksiyalar uchun ko\'plik otlardan foydalaning (/users, /user emas)
- **Resurs ierarxiyasi**: Yo\'llarni harakatlarga emas, resurslarga qarab tashkil eting
- **Fe\'lsiz**: URL larda fe\'llardan qoching (GET /users/1, /getUser/1 emas)

**Foydalanish misoli:**

\`\`\`go
// To\'g\'ri RESTful nomlash
GET    /api/users          // Barcha foydalanuvchilar ro\'yxati
GET    /api/users/123      // ID 123 bo\'lgan foydalanuvchini olish

// NOTO\'G\'RI - Buni qilmang
GET    /api/getUsers       // URL da fe\'l
GET    /api/user           // Kolleksiya uchun birlik
GET    /api/getUserById/123 // Harakatga asoslangan nomlash
\`\`\`

**REST resurs nomlash eng yaxshi amaliyotlari:**
- Kichik harflardan foydalaning
- Ko\'p so\'zli resurslar uchun defis ishlating (/api/user-profiles)
- URL larni oddiy va bashorat qilinadigan qiling
- Otlardan foydalaning, fe\'llardan emas
- Kolleksiyalar ko\'plik shaklida bo\'lishi kerak

**Cheklovlar:**
- Yo\'llar RESTful konventsiyalarga rioya qilishi kerak
- Marshrutlash uchun Chi routerdan foydalaning
- To\'g\'ri JSON javoblarini qaytaring`,
			hint1: `SetupRoutes uchun kolleksiya uchun r.Get("/api/users", GetUsers) va bitta resurs uchun r.Get("/api/users/{id}", GetUser) ishlating. Har doim ko\'plik shaklini ishlating!`,
			hint2: `GetUser da chi.URLParam(r, "id") bilan ID ni ajratib oling, strconv.Atoi bilan int ga o\'zgartiring, keyin mos ID ni topish uchun users ni aylanib chiqing. Topilmasa 404 qaytaring.`,
			whyItMatters: `RESTful resurs nomlash dasturchilarga yoqadigan intuitiv, bashorat qilinadigan API larning asosidir.

**Resurs nomlash nima uchun muhim:**

**1. Bashorat qilish va dasturchi tajribasi**
Yaxshi resurs nomlash API ni o\'z-o\'zidan hujjatlashtiradi:

\`\`\`go
// YAXSHI: Bashorat qilinadigan RESTful nomlash
GET    /api/users              // Aniq barcha foydalanuvchilarni oladi
GET    /api/users/123          // Aniq 123 foydalanuvchini oladi
GET    /api/users/123/orders   // Aniq 123 foydalanuvchining buyurtmalarini oladi

// YOMON: Harakatga asoslangan nomlash (RPC-uslub)
GET    /api/getAllUsers        // Bu BARCHA ni olish yoki sahifalash bilan?
GET    /api/getUserById?id=123 // Patternlarni aralashtirish (path vs query)
GET    /api/user/123/getOrders // URL da ortiqcha fe\'l
\`\`\`

**2. Jamoalar o\'rtasida izchillik**
RESTful konventsiyalar bir nechta jamoalarga mustaqil ishlash imkonini beradi:

\`\`\`go
// A jamoasi foydalanuvchi servisini quradi
GET    /api/users
POST   /api/users
GET    /api/users/{id}

// B jamoasi mahsulot servisini quradi - bir xil pattern!
GET    /api/products
POST   /api/products
GET    /api/products/{id}

// Dasturchilar hujjatlarsiz ham ikkala API ni tushunadi
\`\`\`

**3. HTTP metod mapping**
Resursga asoslangan URL lar HTTP metodlari bilan tabiiy ishlaydi:

\`\`\`go
// Bir xil URL, turli metodlar = turli operatsiyalar
GET    /api/users/123    // Foydalanuvchini o\'qish
PUT    /api/users/123    // Foydalanuvchini yangilash
DELETE /api/users/123    // Foydalanuvchini o\'chirish
POST   /api/users        // Foydalanuvchi yaratish

// YOMON: Fe\'llar sizni faqat GET API ga majbur qiladi
GET /api/getUser/123
GET /api/updateUser/123  // GET orqali yangilash? Noto\'g\'ri HTTP metod!
GET /api/deleteUser/123  // GET orqali o\'chirish? Xavfli!
\`\`\`

**Eng yaxshi amaliyotlar:**
- Otlardan foydalaning, fe\'llardan emas
- Kolleksiyalar uchun ko\'plik shaklini ishlating
- Kichik harflar va defislardan foydalaning
- URL larni qisqa tuting (2000 belgidan kam)
- Fayl kengaytmalaridan qoching (.json, .xml)
- Harakatlar uchun to\'g\'ri HTTP metodlaridan foydalaning`,
			solutionCode: `package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type User struct {
	ID    int    \`json:"id"\`	// Kichik harf maydonlari uchun JSON teg
	Name  string \`json:"name"\`
	Email string \`json:"email"\`
}

var users = []User{
	{ID: 1, Name: "Alice", Email: "alice@example.com"},
	{ID: 2, Name: "Bob", Email: "bob@example.com"},
	{ID: 3, Name: "Charlie", Email: "charlie@example.com"},
}

func SetupRoutes(r chi.Router) {
	// RESTful yo\'llar: kolleksiyalar uchun ko\'plik otlardan foydalaning
	r.Get("/api/users", GetUsers)      // Kolleksiya endpointi - ko\'plik "users"
	r.Get("/api/users/{id}", GetUser)  // ID parametri bilan bitta resurs endpointi
}

func GetUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")  // Har doim birinchi content type ni o\'rnating
	json.NewEncoder(w).Encode(users)  // Slice ni to\'g\'ridan-to\'g\'ri javobga practixng
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	// URL yo\'l parametridan ID ni ajratib olish
	idStr := chi.URLParam(r, "id")  // /api/users/{id} dan qiymat oladi
	id, err := strconv.Atoi(idStr)  // Stringni integerga o\'zgartirish
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)  // Noto\'g\'ri ID formati uchun 400
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid user ID"})
		return
	}

	// Mock ma\'lumotlar bazasida foydalanuvchini topish
	for _, user := range users {
		if user.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(user)  // Topilgan foydalanuvchini qaytarish
			return
		}
	}

	// Foydalanuvchi topilmadi
	w.WriteHeader(http.StatusNotFound)  // Resurs mavjud bo\'lmaganda 404
	json.NewEncoder(w).Encode(map[string]string{"error": "User not found"})
}`
		}
	}
};

export default task;
