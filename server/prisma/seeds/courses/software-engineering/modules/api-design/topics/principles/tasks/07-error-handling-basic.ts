import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'api-design-error-handling-basic',
	title: 'Error Handling - Basic Patterns',
	difficulty: 'medium',
	tags: ['api-design', 'error-handling', 'go'],
	estimatedTime: '30m',
	isPremium: false,
	youtubeUrl: '',
	description: `Implement structured error handling with consistent error responses.

**You will implement:**

1. **ErrorResponse** - Standard error response structure
2. **HandleError()** - Centralized error handling function
3. **Error types** - Validation, NotFound, Internal errors

**Error Response Structure:**

\`\`\`json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User not found",
    "details": "User with ID 123 does not exist"
  }
}
\`\`\`

**Error Codes:**
- VALIDATION_ERROR (400)
- RESOURCE_NOT_FOUND (404)
- INTERNAL_ERROR (500)`,
	initialCode: `package api

import (
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
	Error ErrorDetail \`json:"error"\`
}

type ErrorDetail struct {
	Code    string \`json:"code"\`
	Message string \`json:"message"\`
	Details string \`json:"details,omitempty"\`
}

type AppError struct {
	Code       string
	Message    string
	Details    string
	StatusCode int
}

// TODO: Implement HandleError
// Return structured error response with:
// 1. Set appropriate HTTP status code
// 2. Build ErrorResponse with code, message, details
// 3. Return as JSON
func HandleError(w http.ResponseWriter, err AppError) {
	panic("TODO: implement HandleError")
}

// TODO: Implement HandleGetUser
// Simulate user lookup with error handling:
// 1. If userID is empty -> validation error
// 2. If userID is "999" -> not found error
// 3. If userID is "error" -> internal error
// 4. Otherwise return success
func HandleGetUser(w http.ResponseWriter, r *http.Request, userID string) {
	panic("TODO: implement HandleGetUser")
}`,
	solutionCode: `package api

import (
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
	Error ErrorDetail \`json:"error"\`
}

type ErrorDetail struct {
	Code    string \`json:"code"\`
	Message string \`json:"message"\`
	Details string \`json:"details,omitempty"\`
}

type AppError struct {
	Code       string
	Message    string
	Details    string
	StatusCode int
}

func HandleError(w http.ResponseWriter, err AppError) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(err.StatusCode)

	response := ErrorResponse{
		Error: ErrorDetail{
			Code:    err.Code,
			Message: err.Message,
			Details: err.Details,
		},
	}

	json.NewEncoder(w).Encode(response)
}

func HandleGetUser(w http.ResponseWriter, r *http.Request, userID string) {
	// Validation error
	if userID == "" {
		HandleError(w, AppError{
			Code:       "VALIDATION_ERROR",
			Message:    "Invalid request",
			Details:    "User ID is required",
			StatusCode: http.StatusBadRequest,
		})
		return
	}

	// Not found error
	if userID == "999" {
		HandleError(w, AppError{
			Code:       "RESOURCE_NOT_FOUND",
			Message:    "User not found",
			Details:    "User with ID 999 does not exist",
			StatusCode: http.StatusNotFound,
		})
		return
	}

	// Internal error
	if userID == "error" {
		HandleError(w, AppError{
			Code:       "INTERNAL_ERROR",
			Message:    "Internal server error",
			Details:    "An unexpected error occurred while processing the request",
			StatusCode: http.StatusInternalServerError,
		})
		return
	}

	// Success
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":   userID,
		"name": "John Doe",
	})
}`,
	hint1: `In HandleError, set w.WriteHeader(err.StatusCode), build ErrorResponse with ErrorDetail containing code, message, details, then encode to JSON.`,
	hint2: `In HandleGetUser, check userID conditions and call HandleError with appropriate AppError for each case. For success, return 200 with user data.`,
	whyItMatters: `Structured error handling provides consistent, actionable error messages that help clients debug issues quickly.

**Why Error Handling Matters:**

**1. Client Debugging**
Good errors help developers fix issues:

\`\`\`go
// BAD: Generic error
{"error": "Error"}  // What error? How to fix?

// GOOD: Structured error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": "Email must be a valid email address"
  }
}
\`\`\`

**2. Error Codes**
Use consistent error codes for categorization:

\`\`\`go
const (
    ErrValidation    = "VALIDATION_ERROR"
    ErrNotFound      = "RESOURCE_NOT_FOUND"
    ErrUnauthorized  = "UNAUTHORIZED"
    ErrInternal      = "INTERNAL_ERROR"
)
\`\`\`

**Best Practices:**
- Use structured error responses
- Include error codes for categorization
- Provide actionable error messages
- Hide internal details in production`,
	order: 6,
	testCode: `package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

// Test1: HandleError sets correct status code
func Test1(t *testing.T) {
	w := httptest.NewRecorder()
	HandleError(w, AppError{Code: "TEST", Message: "Test", StatusCode: 404})
	if w.Code != 404 {
		t.Errorf("Expected 404, got %d", w.Code)
	}
}

// Test2: HandleError returns JSON
func Test2(t *testing.T) {
	w := httptest.NewRecorder()
	HandleError(w, AppError{Code: "TEST", Message: "Test", StatusCode: 400})
	var result ErrorResponse
	json.NewDecoder(w.Body).Decode(&result)
	if result.Error.Code != "TEST" {
		t.Error("Should return error code")
	}
}

// Test3: HandleGetUser returns 400 for empty userID
func Test3(t *testing.T) {
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/users", nil)
	HandleGetUser(w, r, "")
	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected 400, got %d", w.Code)
	}
}

// Test4: HandleGetUser returns 404 for user 999
func Test4(t *testing.T) {
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/users/999", nil)
	HandleGetUser(w, r, "999")
	if w.Code != http.StatusNotFound {
		t.Errorf("Expected 404, got %d", w.Code)
	}
}

// Test5: HandleGetUser returns 500 for "error"
func Test5(t *testing.T) {
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/users/error", nil)
	HandleGetUser(w, r, "error")
	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected 500, got %d", w.Code)
	}
}

// Test6: HandleGetUser returns 200 for valid user
func Test6(t *testing.T) {
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/users/1", nil)
	HandleGetUser(w, r, "1")
	if w.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w.Code)
	}
}

// Test7: ErrorResponse struct has correct fields
func Test7(t *testing.T) {
	err := ErrorResponse{Error: ErrorDetail{Code: "A", Message: "B", Details: "C"}}
	if err.Error.Code != "A" || err.Error.Message != "B" || err.Error.Details != "C" {
		t.Error("ErrorResponse fields not set correctly")
	}
}

// Test8: AppError struct has correct fields
func Test8(t *testing.T) {
	err := AppError{Code: "TEST", Message: "msg", Details: "det", StatusCode: 400}
	if err.Code != "TEST" || err.StatusCode != 400 {
		t.Error("AppError fields not set correctly")
	}
}

// Test9: HandleError includes details in response
func Test9(t *testing.T) {
	w := httptest.NewRecorder()
	HandleError(w, AppError{Code: "TEST", Message: "msg", Details: "detail info", StatusCode: 400})
	var result ErrorResponse
	json.NewDecoder(w.Body).Decode(&result)
	if result.Error.Details != "detail info" {
		t.Error("Should include details")
	}
}

// Test10: HandleGetUser returns user data on success
func Test10(t *testing.T) {
	w := httptest.NewRecorder()
	r := httptest.NewRequest("GET", "/api/users/123", nil)
	HandleGetUser(w, r, "123")
	var result map[string]interface{}
	json.NewDecoder(w.Body).Decode(&result)
	if result["id"] != "123" {
		t.Error("Should return user id")
	}
}
`,
	translations: {
		ru: {
			title: 'Обработка ошибок - Базовые паттерны',
			description: `Реализуйте структурированную обработку ошибок с согласованными ответами об ошибках.`,
			hint1: `В HandleError установите w.WriteHeader(err.StatusCode), постройте ErrorResponse с ErrorDetail содержащим code, message, details, затем закодируйте в JSON.`,
			hint2: `В HandleGetUser проверьте условия userID и вызовите HandleError с соответствующим AppError для каждого случая. При успехе верните 200 с данными пользователя.`,
			whyItMatters: `Структурированная обработка ошибок предоставляет согласованные, действенные сообщения об ошибках, которые помогают клиентам быстро отлаживать проблемы.`,
			solutionCode: `package api

import (
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
	Error ErrorDetail \`json:"error"\`
}

type ErrorDetail struct {
	Code    string \`json:"code"\`
	Message string \`json:"message"\`
	Details string \`json:"details,omitempty"\`
}

type AppError struct {
	Code       string
	Message    string
	Details    string
	StatusCode int
}

func HandleError(w http.ResponseWriter, err AppError) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(err.StatusCode)
	response := ErrorResponse{
		Error: ErrorDetail{Code: err.Code, Message: err.Message, Details: err.Details},
	}
	json.NewEncoder(w).Encode(response)
}

func HandleGetUser(w http.ResponseWriter, r *http.Request, userID string) {
	if userID == "" {
		HandleError(w, AppError{Code: "VALIDATION_ERROR", Message: "Invalid request", Details: "User ID is required", StatusCode: http.StatusBadRequest})
		return
	}
	if userID == "999" {
		HandleError(w, AppError{Code: "RESOURCE_NOT_FOUND", Message: "User not found", Details: "User with ID 999 does not exist", StatusCode: http.StatusNotFound})
		return
	}
	if userID == "error" {
		HandleError(w, AppError{Code: "INTERNAL_ERROR", Message: "Internal server error", Details: "An unexpected error occurred", StatusCode: http.StatusInternalServerError})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"id": userID, "name": "John Doe"})
}`
		},
		uz: {
			title: 'Xatolarni qayta ishlash - Asosiy patternlar',
			description: `Izchil xato javoblari bilan tuzilgan xatolarni qayta ishlashni amalga oshiring.`,
			hint1: `HandleError da w.WriteHeader(err.StatusCode) ni o\'rnating, code, message, details ni o\'z ichiga olgan ErrorDetail bilan ErrorResponse yarating, keyin JSON ga practixng.`,
			hint2: `HandleGetUser da userID shartlarini tekshiring va har bir holat uchun mos AppError bilan HandleError ni chaqiring. Muvaffaqiyatda foydalanuvchi ma\'lumotlari bilan 200 qaytaring.`,
			whyItMatters: `Tuzilgan xatolarni qayta ishlash mijozlarga muammolarni tez hal qilishda yordam beradigan izchil, amaliy xato xabarlarini taqdim etadi.`,
			solutionCode: `package api

import (
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
	Error ErrorDetail \`json:"error"\`
}

type ErrorDetail struct {
	Code    string \`json:"code"\`
	Message string \`json:"message"\`
	Details string \`json:"details,omitempty"\`
}

type AppError struct {
	Code       string
	Message    string
	Details    string
	StatusCode int
}

func HandleError(w http.ResponseWriter, err AppError) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(err.StatusCode)
	response := ErrorResponse{
		Error: ErrorDetail{Code: err.Code, Message: err.Message, Details: err.Details},
	}
	json.NewEncoder(w).Encode(response)
}

func HandleGetUser(w http.ResponseWriter, r *http.Request, userID string) {
	if userID == "" {
		HandleError(w, AppError{Code: "VALIDATION_ERROR", Message: "Invalid request", Details: "User ID is required", StatusCode: http.StatusBadRequest})
		return
	}
	if userID == "999" {
		HandleError(w, AppError{Code: "RESOURCE_NOT_FOUND", Message: "User not found", Details: "User with ID 999 does not exist", StatusCode: http.StatusNotFound})
		return
	}
	if userID == "error" {
		HandleError(w, AppError{Code: "INTERNAL_ERROR", Message: "Internal server error", Details: "An unexpected error occurred", StatusCode: http.StatusInternalServerError})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"id": userID, "name": "John Doe"})
}`
		}
	}
};

export default task;
