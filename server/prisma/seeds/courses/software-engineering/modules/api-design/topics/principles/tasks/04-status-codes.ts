import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'api-design-status-codes',
	title: 'HTTP Status Codes',
	difficulty: 'medium',
	tags: ['api-design', 'http', 'go', 'status-codes'],
	estimatedTime: '30m',
	isPremium: false,
	youtubeUrl: '',
	description: `Implement proper HTTP status codes for different API scenarios.

**You will implement:**

1. **HandleRequest()** - Process requests and return appropriate status codes
2. **Status code categories** - 2xx Success, 4xx Client Error, 5xx Server Error
3. **Specific codes** - 200, 201, 204, 400, 401, 403, 404, 409, 500

**Key Concepts:**
- **2xx Success**: Request succeeded (200 OK, 201 Created, 204 No Content)
- **4xx Client Error**: Client sent invalid request (400, 401, 403, 404, 409)
- **5xx Server Error**: Server failed to process valid request (500, 503)
- **Semantic meaning**: Each code has specific meaning

**Status Code Guide:**

\`\`\`go
// 2xx Success
200 OK              // Request succeeded, response has body
201 Created         // Resource created, include Location header
204 No Content      // Success, no response body (DELETE, PUT sometimes)

// 4xx Client Errors (client's fault)
400 Bad Request     // Invalid JSON, missing required fields
401 Unauthorized    // Authentication required or failed
403 Forbidden       // Authenticated but not authorized
404 Not Found       // Resource doesn't exist
409 Conflict        // Resource state conflict (duplicate email, etc)

// 5xx Server Errors (server's fault)
500 Internal Error  // Unexpected server error
503 Service Unavailable // Server temporarily down
\`\`\`

**When to use each:**
- Use 400 for validation errors
- Use 401 when authentication is missing/invalid
- Use 403 when user lacks permission
- Use 404 when resource doesn't exist
- Use 409 for business logic conflicts
- Use 500 only for unexpected errors`,
	initialCode: `package api

import (
	"encoding/json"
	"net/http"
)

type CreateUserRequest struct {
	Email    string \`json:"email"\`
	Password string \`json:"password"\`
}

var existingUsers = map[string]bool{
	"existing@example.com": true,
}

// TODO: Implement HandleCreateUser
// Return appropriate status codes for each scenario:
// 1. If JSON is malformed -> 400 Bad Request
// 2. If email is empty -> 400 Bad Request
// 3. If email already exists -> 409 Conflict
// 4. If creation succeeds -> 201 Created
func HandleCreateUser(w http.ResponseWriter, r *http.Request) {
	panic("TODO: implement HandleCreateUser")
}

// TODO: Implement HandleGetProtectedResource
// Check authentication and authorization:
// 1. If no auth token in header -> 401 Unauthorized
// 2. If token is invalid -> 401 Unauthorized
// 3. If user not admin -> 403 Forbidden
// 4. If resource not found -> 404 Not Found
// 5. If success -> 200 OK
func HandleGetProtectedResource(w http.ResponseWriter, r *http.Request, resourceID string) {
	panic("TODO: implement HandleGetProtectedResource")
}

// TODO: Implement HandleDatabaseOperation
// Simulate database operation with error handling:
// 1. If database connection fails -> 503 Service Unavailable
// 2. If unexpected error -> 500 Internal Server Error
// 3. If success -> 200 OK
func HandleDatabaseOperation(w http.ResponseWriter, r *http.Request, simulateError string) {
	panic("TODO: implement HandleDatabaseOperation")
}`,
	solutionCode: `package api

import (
	"encoding/json"
	"net/http"
	"strings"
)

type CreateUserRequest struct {
	Email    string \`json:"email"\`
	Password string \`json:"password"\`
}

var existingUsers = map[string]bool{
	"existing@example.com": true,
}

func HandleCreateUser(w http.ResponseWriter, r *http.Request) {
	var req CreateUserRequest

	// 400 Bad Request - malformed JSON
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)  // 400
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid JSON format",
		})
		return
	}

	// 400 Bad Request - validation error
	if req.Email == "" {
		w.WriteHeader(http.StatusBadRequest)  // 400
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Email is required",
		})
		return
	}

	// 409 Conflict - resource already exists
	if existingUsers[req.Email] {
		w.WriteHeader(http.StatusConflict)  // 409
		json.NewEncoder(w).Encode(map[string]string{
			"error": "User with this email already exists",
		})
		return
	}

	// 201 Created - resource successfully created
	existingUsers[req.Email] = true
	w.WriteHeader(http.StatusCreated)  // 201
	w.Header().Set("Location", "/api/users/"+req.Email)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "User created successfully",
		"email":   req.Email,
	})
}

func HandleGetProtectedResource(w http.ResponseWriter, r *http.Request, resourceID string) {
	// 401 Unauthorized - no authentication
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		w.WriteHeader(http.StatusUnauthorized)  // 401
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Authentication required",
		})
		return
	}

	// 401 Unauthorized - invalid token
	if !strings.HasPrefix(authHeader, "Bearer ") {
		w.WriteHeader(http.StatusUnauthorized)  // 401
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid authentication token",
		})
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	isAdmin := token == "admin-token"

	// 403 Forbidden - authenticated but not authorized
	if !isAdmin {
		w.WriteHeader(http.StatusForbidden)  // 403
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Access denied. Admin privileges required",
		})
		return
	}

	// 404 Not Found - resource doesn't exist
	if resourceID == "nonexistent" {
		w.WriteHeader(http.StatusNotFound)  // 404
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Resource not found",
		})
		return
	}

	// 200 OK - success
	w.WriteHeader(http.StatusOK)  // 200
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":   resourceID,
		"data": "Protected resource data",
	})
}

func HandleDatabaseOperation(w http.ResponseWriter, r *http.Request, simulateError string) {
	// 503 Service Unavailable - database/service temporarily down
	if simulateError == "connection" {
		w.WriteHeader(http.StatusServiceUnavailable)  // 503
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Database temporarily unavailable. Please retry later",
		})
		return
	}

	// 500 Internal Server Error - unexpected server error
	if simulateError == "unexpected" {
		w.WriteHeader(http.StatusInternalServerError)  // 500
		json.NewEncoder(w).Encode(map[string]string{
			"error": "An unexpected error occurred",
		})
		return
	}

	// 200 OK - operation successful
	w.WriteHeader(http.StatusOK)  // 200
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Operation completed successfully",
	})
}`,
	hint1: `For HandleCreateUser: check json.Decode error (400), validate email is not empty (400), check existingUsers map (409), success returns 201.`,
	hint2: `For HandleGetProtectedResource: check r.Header.Get("Authorization") is empty (401), check token format (401), check if admin (403), check resource exists (404). For HandleDatabaseOperation: check error type and return 503 for connection errors, 500 for unexpected errors.`,
	whyItMatters: `Proper HTTP status codes make your API self-documenting and enable clients to handle errors correctly.

**Why Status Codes Matter:**

**1. Client Error Handling**
Different status codes require different client behavior:

\`\`\`go
// Client can handle each status code appropriately
response, err := http.Get("/api/resource")

switch response.StatusCode {
case 200:
    // Success - process response data
case 401:
    // Redirect to login page
case 403:
    // Show "access denied" message
case 404:
    // Show "not found" page
case 409:
    // Show "already exists" error
case 500:
    // Show generic error, maybe retry
case 503:
    // Service down, retry with backoff
}
\`\`\`

**2. Automatic Retry Logic**
Status codes indicate if retry makes sense:

\`\`\`go
func CallAPI(url string) error {
    resp, err := http.Get(url)

    // 4xx errors: Don't retry (client's fault)
    if resp.StatusCode >= 400 && resp.StatusCode < 500 {
        return fmt.Errorf("client error: %d", resp.StatusCode)
    }

    // 5xx errors: Retry makes sense (server's fault)
    if resp.StatusCode >= 500 {
        return RetryWithBackoff(url)  // Server might recover
    }

    return nil
}
\`\`\`

**3. Semantic Correctness**

\`\`\`go
// ❌ WRONG: Using 200 for all responses
func CreateUser(w http.ResponseWriter, r *http.Request) {
    if userExists {
        json.NewEncoder(w).Encode(map[string]string{
            "error": "user exists",  // Still returns 200!
        })
        return
    }
}
// Client sees 200 and thinks it succeeded!

// ✅ CORRECT: Use appropriate status codes
func CreateUser(w http.ResponseWriter, r *http.Request) {
    if userExists {
        w.WriteHeader(http.StatusConflict)  // 409
        json.NewEncoder(w).Encode(map[string]string{
            "error": "user exists",
        })
        return
    }
    w.WriteHeader(http.StatusCreated)  // 201
}
\`\`\`

**Best Practices:**
- Use 2xx for success
- Use 4xx for client errors (don't retry)
- Use 5xx for server errors (safe to retry)
- Include error details in response body
- Be consistent across your API`,
	order: 3,
	testCode: `package api

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"
)

// Test1: HandleCreateUser returns 201 for valid request
func Test1(t *testing.T) {
	body := bytes.NewBufferString(\`{"email": "new@test.com", "password": "pass123"}\`)
	w := httptest.NewRecorder()
	r := httptest.NewRequest("POST", "/api/users", body)
	HandleCreateUser(w, r)
	if w.Code != http.StatusCreated {
		t.Errorf("Expected 201 Created, got %d", w.Code)
	}
}

// Test2: HandleCreateUser returns 400 for invalid JSON
func Test2(t *testing.T) {
	body := bytes.NewBufferString(\`invalid\`)
	w := httptest.NewRecorder()
	r := httptest.NewRequest("POST", "/api/users", body)
	HandleCreateUser(w, r)
	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request, got %d", w.Code)
	}
}

// Test3: HandleCreateUser returns 400 for empty email (validation error)
func Test3(t *testing.T) {
	body := bytes.NewBufferString(\`{"email": "", "password": "pass"}\`)
	w := httptest.NewRecorder()
	r := httptest.NewRequest("POST", "/api/users", body)
	HandleCreateUser(w, r)
	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request, got %d", w.Code)
	}
}

// Test4: HandleCreateUser returns 409 Conflict for existing email
func Test4(t *testing.T) {
	body := bytes.NewBufferString(\`{"email": "existing@example.com", "password": "pass"}\`)
	w := httptest.NewRecorder()
	r := httptest.NewRequest("POST", "/api/users", body)
	HandleCreateUser(w, r)
	if w.Code != http.StatusConflict {
		t.Errorf("Expected 409 Conflict, got %d", w.Code)
	}
}

// Test5: HandleGetProtectedResource returns 401 Unauthorized without auth token
func Test5(t *testing.T) {
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/resource/1", nil)
	HandleGetProtectedResource(w, r, "1")
	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized, got %d", w.Code)
	}
}

// Test6: HandleGetProtectedResource returns 401 for invalid token format
func Test6(t *testing.T) {
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/resource/1", nil)
	r.Header.Set("Authorization", "InvalidFormat")
	HandleGetProtectedResource(w, r, "1")
	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized, got %d", w.Code)
	}
}

// Test7: HandleGetProtectedResource returns 403 Forbidden for non-admin user
func Test7(t *testing.T) {
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/resource/1", nil)
	r.Header.Set("Authorization", "Bearer user-token")
	HandleGetProtectedResource(w, r, "1")
	if w.Code != http.StatusForbidden {
		t.Errorf("Expected 403 Forbidden, got %d", w.Code)
	}
}

// Test8: HandleGetProtectedResource returns 404 Not Found for nonexistent resource
func Test8(t *testing.T) {
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/resource/nonexistent", nil)
	r.Header.Set("Authorization", "Bearer admin-token")
	HandleGetProtectedResource(w, r, "nonexistent")
	if w.Code != http.StatusNotFound {
		t.Errorf("Expected 404 Not Found, got %d", w.Code)
	}
}

// Test9: HandleDatabaseOperation returns 503 Service Unavailable for connection error
func Test9(t *testing.T) {
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/db", nil)
	HandleDatabaseOperation(w, r, "connection")
	if w.Code != http.StatusServiceUnavailable {
		t.Errorf("Expected 503 Service Unavailable, got %d", w.Code)
	}
}

// Test10: HandleDatabaseOperation returns 500 Internal Server Error for unexpected error
func Test10(t *testing.T) {
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/db", nil)
	HandleDatabaseOperation(w, r, "unexpected")
	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected 500 Internal Server Error, got %d", w.Code)
	}
}
`,
	translations: {
		ru: {
			title: 'HTTP коды состояния',
			description: `Реализуйте правильные HTTP коды состояния для различных сценариев API.`,
			hint1: `Для HandleCreateUser: проверьте ошибку json.Decode (400), валидируйте что email не пустой (400), проверьте map existingUsers (409), успех возвращает 201.`,
			hint2: `Для HandleGetProtectedResource: проверьте что r.Header.Get("Authorization") пустой (401), проверьте формат токена (401), проверьте если admin (403), проверьте что ресурс существует (404).`,
			whyItMatters: `Правильные HTTP коды состояния делают ваш API самодокументируемым и позволяют клиентам корректно обрабатывать ошибки.`,
			solutionCode: `package api

import (
	"encoding/json"
	"net/http"
	"strings"
)

type CreateUserRequest struct {
	Email    string \`json:"email"\`
	Password string \`json:"password"\`
}

var existingUsers = map[string]bool{
	"existing@example.com": true,
}

func HandleCreateUser(w http.ResponseWriter, r *http.Request) {
	var req CreateUserRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid JSON format"})
		return
	}

	if req.Email == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Email is required"})
		return
	}

	if existingUsers[req.Email] {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "User with this email already exists"})
		return
	}

	existingUsers[req.Email] = true
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Location", "/api/users/"+req.Email)
	json.NewEncoder(w).Encode(map[string]string{"message": "User created successfully", "email": req.Email})
}

func HandleGetProtectedResource(w http.ResponseWriter, r *http.Request, resourceID string) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Authentication required"})
		return
	}

	if !strings.HasPrefix(authHeader, "Bearer ") {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid authentication token"})
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	if token != "admin-token" {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "Access denied"})
		return
	}

	if resourceID == "nonexistent" {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Resource not found"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"id": resourceID, "data": "Protected resource data"})
}

func HandleDatabaseOperation(w http.ResponseWriter, r *http.Request, simulateError string) {
	if simulateError == "connection" {
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database temporarily unavailable"})
		return
	}

	if simulateError == "unexpected" {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "An unexpected error occurred"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Operation completed successfully"})
}`
		},
		uz: {
			title: 'HTTP holat practixri',
			description: `Turli API stsenariylari uchun to\'g\'ri HTTP holat practixrini amalga oshiring.`,
			hint1: `HandleCreateUser uchun: json.Decode xatosini tekshiring (400), email bo\'sh emasligini tekshiring (400), existingUsers map ni tekshiring (409), muvaffaqiyat 201 qaytaradi.`,
			hint2: `HandleGetProtectedResource uchun: r.Header.Get("Authorization") bo\'sh ekanligini tekshiring (401), token formatini tekshiring (401), admin ekanligini tekshiring (403), resurs mavjudligini tekshiring (404).`,
			whyItMatters: `To\'g\'ri HTTP holat practixri API ni o\'z-o\'zidan hujjatlashtiradi va mijozlarga xatolarni to\'g\'ri qayta ishlash imkonini beradi.`,
			solutionCode: `package api

import (
	"encoding/json"
	"net/http"
	"strings"
)

type CreateUserRequest struct {
	Email    string \`json:"email"\`
	Password string \`json:"password"\`
}

var existingUsers = map[string]bool{
	"existing@example.com": true,
}

func HandleCreateUser(w http.ResponseWriter, r *http.Request) {
	var req CreateUserRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid JSON format"})
		return
	}

	if req.Email == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Email is required"})
		return
	}

	if existingUsers[req.Email] {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "User with this email already exists"})
		return
	}

	existingUsers[req.Email] = true
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Location", "/api/users/"+req.Email)
	json.NewEncoder(w).Encode(map[string]string{"message": "User created successfully", "email": req.Email})
}

func HandleGetProtectedResource(w http.ResponseWriter, r *http.Request, resourceID string) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Authentication required"})
		return
	}

	if !strings.HasPrefix(authHeader, "Bearer ") {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid authentication token"})
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	if token != "admin-token" {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "Access denied"})
		return
	}

	if resourceID == "nonexistent" {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Resource not found"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"id": resourceID, "data": "Protected resource data"})
}

func HandleDatabaseOperation(w http.ResponseWriter, r *http.Request, simulateError string) {
	if simulateError == "connection" {
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database temporarily unavailable"})
		return
	}

	if simulateError == "unexpected" {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "An unexpected error occurred"})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Operation completed successfully"})
}`
		}
	}
};

export default task;
