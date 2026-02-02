import { Task } from '../../../../../../../types';

const task: Task = {
	slug: 'goml-inference-handler',
	title: 'Inference Handler',
	difficulty: 'medium',
	tags: ['go', 'ml', 'http', 'server'],
	estimatedTime: '25m',
	isPremium: true,
	order: 1,
	description: `# Inference Handler

Build an HTTP handler for ML inference requests.

## Task

Create an inference handler that:
- Accepts JSON inference requests
- Validates input format and size
- Runs model inference
- Returns structured JSON responses
- Handles errors gracefully

## Example

\`\`\`go
POST /predict
{"input": [1.0, 2.0, 3.0]}

Response:
{"prediction": [0.8, 0.2], "latency_ms": 15}
\`\`\``,

	initialCode: `package main

import (
	"fmt"
	"net/http"
)

// InferenceRequest represents the request payload
type InferenceRequest struct {
	Input []float32 \`json:"input"\`
}

// InferenceResponse represents the response payload
type InferenceResponse struct {
	Prediction []float32 \`json:"prediction"\`
	LatencyMs  int64     \`json:"latency_ms"\`
}

// InferenceHandler handles inference requests
type InferenceHandler struct {
	// Your fields here
}

// NewInferenceHandler creates an inference handler
func NewInferenceHandler(model Model) *InferenceHandler {
	// Your code here
	return nil
}

// ServeHTTP implements http.Handler
func (h *InferenceHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Your code here
}

// Model interface for inference
type Model interface {
	Predict(input []float32) []float32
}

func main() {
	fmt.Println("Inference Handler")
}`,

	solutionCode: `package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// InferenceRequest represents the request payload
type InferenceRequest struct {
	Input   []float32 \`json:"input"\`
	ModelID string    \`json:"model_id,omitempty"\`
}

// InferenceResponse represents the response payload
type InferenceResponse struct {
	Prediction []float32 \`json:"prediction"\`
	LatencyMs  int64     \`json:"latency_ms"\`
	ModelID    string    \`json:"model_id,omitempty"\`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error   string \`json:"error"\`
	Code    int    \`json:"code"\`
	Details string \`json:"details,omitempty"\`
}

// Model interface for inference
type Model interface {
	Predict(input []float32) []float32
	InputSize() int
}

// SimpleModel implements Model for testing
type SimpleModel struct {
	inputSize int
}

func NewSimpleModel(inputSize int) *SimpleModel {
	return &SimpleModel{inputSize: inputSize}
}

func (m *SimpleModel) Predict(input []float32) []float32 {
	// Simple mock: return softmax-like output
	output := make([]float32, 2)
	var sum float32
	for _, v := range input {
		sum += v
	}
	output[0] = 1.0 / (1.0 + sum/float32(len(input)))
	output[1] = 1.0 - output[0]
	return output
}

func (m *SimpleModel) InputSize() int {
	return m.inputSize
}

// InferenceHandler handles inference requests
type InferenceHandler struct {
	model        Model
	maxInputSize int
}

// NewInferenceHandler creates an inference handler
func NewInferenceHandler(model Model) *InferenceHandler {
	return &InferenceHandler{
		model:        model,
		maxInputSize: 10000,
	}
}

// SetMaxInputSize sets maximum allowed input size
func (h *InferenceHandler) SetMaxInputSize(size int) {
	h.maxInputSize = size
}

// ServeHTTP implements http.Handler
func (h *InferenceHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Only accept POST
	if r.Method != http.MethodPost {
		h.writeError(w, "Method not allowed", http.StatusMethodNotAllowed, "")
		return
	}

	// Parse request
	var req InferenceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, "Invalid JSON", http.StatusBadRequest, err.Error())
		return
	}

	// Validate input
	if err := h.validateRequest(&req); err != nil {
		h.writeError(w, "Validation failed", http.StatusBadRequest, err.Error())
		return
	}

	// Run inference
	start := time.Now()
	prediction := h.model.Predict(req.Input)
	latency := time.Since(start).Milliseconds()

	// Send response
	resp := InferenceResponse{
		Prediction: prediction,
		LatencyMs:  latency,
		ModelID:    req.ModelID,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// validateRequest validates the inference request
func (h *InferenceHandler) validateRequest(req *InferenceRequest) error {
	if len(req.Input) == 0 {
		return fmt.Errorf("input cannot be empty")
	}

	if len(req.Input) > h.maxInputSize {
		return fmt.Errorf("input size %d exceeds maximum %d", len(req.Input), h.maxInputSize)
	}

	expectedSize := h.model.InputSize()
	if expectedSize > 0 && len(req.Input) != expectedSize {
		return fmt.Errorf("expected input size %d, got %d", expectedSize, len(req.Input))
	}

	return nil
}

// writeError writes an error response
func (h *InferenceHandler) writeError(w http.ResponseWriter, msg string, code int, details string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(ErrorResponse{
		Error:   msg,
		Code:    code,
		Details: details,
	})
}

// BatchInferenceRequest for batch predictions
type BatchInferenceRequest struct {
	Inputs [][]float32 \`json:"inputs"\`
}

// BatchInferenceResponse for batch predictions
type BatchInferenceResponse struct {
	Predictions [][]float32 \`json:"predictions"\`
	LatencyMs   int64       \`json:"latency_ms"\`
}

// BatchInferenceHandler handles batch inference
type BatchInferenceHandler struct {
	model       Model
	maxBatchSize int
}

func NewBatchInferenceHandler(model Model, maxBatchSize int) *BatchInferenceHandler {
	return &BatchInferenceHandler{
		model:        model,
		maxBatchSize: maxBatchSize,
	}
}

func (h *BatchInferenceHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	var req BatchInferenceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid JSON", Code: 400})
		return
	}

	if len(req.Inputs) > h.maxBatchSize {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{
			Error: fmt.Sprintf("Batch size %d exceeds max %d", len(req.Inputs), h.maxBatchSize),
			Code:  400,
		})
		return
	}

	start := time.Now()
	predictions := make([][]float32, len(req.Inputs))
	for i, input := range req.Inputs {
		predictions[i] = h.model.Predict(input)
	}
	latency := time.Since(start).Milliseconds()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(BatchInferenceResponse{
		Predictions: predictions,
		LatencyMs:   latency,
	})
}

func main() {
	model := NewSimpleModel(3)
	handler := NewInferenceHandler(model)

	mux := http.NewServeMux()
	mux.Handle("/predict", handler)
	mux.Handle("/predict/batch", NewBatchInferenceHandler(model, 100))

	fmt.Println("Starting inference server on :8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}`,

	testCode: `package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestInferenceHandler(t *testing.T) {
	model := NewSimpleModel(3)
	handler := NewInferenceHandler(model)

	req := InferenceRequest{Input: []float32{1, 2, 3}}
	body, _ := json.Marshal(req)

	r := httptest.NewRequest(http.MethodPost, "/predict", bytes.NewReader(body))
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w.Code)
	}

	var resp InferenceResponse
	json.NewDecoder(w.Body).Decode(&resp)

	if len(resp.Prediction) != 2 {
		t.Errorf("Expected 2 predictions, got %d", len(resp.Prediction))
	}
}

func TestInferenceHandlerInvalidMethod(t *testing.T) {
	model := NewSimpleModel(3)
	handler := NewInferenceHandler(model)

	r := httptest.NewRequest(http.MethodGet, "/predict", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, r)

	if w.Code != http.StatusMethodNotAllowed {
		t.Errorf("Expected 405, got %d", w.Code)
	}
}

func TestInferenceHandlerEmptyInput(t *testing.T) {
	model := NewSimpleModel(0)
	handler := NewInferenceHandler(model)

	req := InferenceRequest{Input: []float32{}}
	body, _ := json.Marshal(req)

	r := httptest.NewRequest(http.MethodPost, "/predict", bytes.NewReader(body))
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected 400, got %d", w.Code)
	}
}

func TestInferenceHandlerInvalidJSON(t *testing.T) {
	model := NewSimpleModel(3)
	handler := NewInferenceHandler(model)

	r := httptest.NewRequest(http.MethodPost, "/predict", bytes.NewReader([]byte("invalid")))
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected 400, got %d", w.Code)
	}
}

func TestBatchInferenceHandler(t *testing.T) {
	model := NewSimpleModel(3)
	handler := NewBatchInferenceHandler(model, 100)

	req := BatchInferenceRequest{
		Inputs: [][]float32{{1, 2, 3}, {4, 5, 6}},
	}
	body, _ := json.Marshal(req)

	r := httptest.NewRequest(http.MethodPost, "/predict/batch", bytes.NewReader(body))
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w.Code)
	}

	var resp BatchInferenceResponse
	json.NewDecoder(w.Body).Decode(&resp)

	if len(resp.Predictions) != 2 {
		t.Errorf("Expected 2 predictions, got %d", len(resp.Predictions))
	}
}

func TestSimpleModelPredict(t *testing.T) {
	model := NewSimpleModel(3)
	input := []float32{1, 2, 3}

	output := model.Predict(input)

	if len(output) != 2 {
		t.Errorf("Expected 2 outputs, got %d", len(output))
	}
	sum := output[0] + output[1]
	if sum < 0.99 || sum > 1.01 {
		t.Error("Outputs should sum to ~1")
	}
}

func TestSimpleModelInputSize(t *testing.T) {
	model := NewSimpleModel(5)

	if model.InputSize() != 5 {
		t.Errorf("Expected input size 5, got %d", model.InputSize())
	}
}

func TestSetMaxInputSize(t *testing.T) {
	model := NewSimpleModel(0)
	handler := NewInferenceHandler(model)
	handler.SetMaxInputSize(100)

	if handler.maxInputSize != 100 {
		t.Error("MaxInputSize not set correctly")
	}
}

func TestBatchInferenceHandlerExceedsMax(t *testing.T) {
	model := NewSimpleModel(3)
	handler := NewBatchInferenceHandler(model, 2)

	req := BatchInferenceRequest{
		Inputs: [][]float32{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}},
	}
	body, _ := json.Marshal(req)

	r := httptest.NewRequest(http.MethodPost, "/predict/batch", bytes.NewReader(body))
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 for exceeding batch size, got %d", w.Code)
	}
}

func TestInferenceHandlerWrongInputSize(t *testing.T) {
	model := NewSimpleModel(3)
	handler := NewInferenceHandler(model)

	req := InferenceRequest{Input: []float32{1, 2}}  // Wrong size
	body, _ := json.Marshal(req)

	r := httptest.NewRequest(http.MethodPost, "/predict", bytes.NewReader(body))
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 for wrong input size, got %d", w.Code)
	}
}`,

	hint1: 'Use json.NewDecoder for streaming JSON parsing',
	hint2: 'Always validate input size before running inference',

	whyItMatters: `HTTP inference handlers are the foundation of ML services:

- **API contracts**: Clear request/response structures
- **Error handling**: Proper HTTP status codes and error messages
- **Validation**: Prevent invalid inputs from reaching the model
- **Observability**: Latency tracking built into responses

Well-designed handlers make ML services reliable and maintainable.`,

	translations: {
		ru: {
			title: 'Обработчик инференса',
			description: `# Обработчик инференса

Создайте HTTP обработчик для запросов ML инференса.

## Задача

Создайте обработчик инференса:
- Прием JSON запросов инференса
- Валидация формата и размера входа
- Запуск инференса модели
- Возврат структурированных JSON ответов
- Обработка ошибок

## Пример

\`\`\`go
POST /predict
{"input": [1.0, 2.0, 3.0]}

Response:
{"prediction": [0.8, 0.2], "latency_ms": 15}
\`\`\``,
			hint1: 'Используйте json.NewDecoder для потокового парсинга JSON',
			hint2: 'Всегда валидируйте размер входа перед запуском инференса',
			whyItMatters: `HTTP обработчики инференса - основа ML сервисов:

- **API контракты**: Четкие структуры запросов и ответов
- **Обработка ошибок**: Правильные HTTP статус коды и сообщения об ошибках
- **Валидация**: Предотвращение попадания невалидных входов к модели
- **Наблюдаемость**: Отслеживание латентности встроено в ответы`,
		},
		uz: {
			title: 'Inference handler',
			description: `# Inference handler

ML inference so'rovlari uchun HTTP handler yarating.

## Topshiriq

Inference handler yarating:
- JSON inference so'rovlarini qabul qilish
- Kirish formati va o'lchamini tekshirish
- Model inference ni ishga tushirish
- Strukturalangan JSON javoblarni qaytarish
- Xatolarni to'g'ri qayta ishlash

## Misol

\`\`\`go
POST /predict
{"input": [1.0, 2.0, 3.0]}

Response:
{"prediction": [0.8, 0.2], "latency_ms": 15}
\`\`\``,
			hint1: "Oqimli JSON tahlili uchun json.NewDecoder dan foydalaning",
			hint2: "Inference ni ishga tushirishdan oldin har doim kirish o'lchamini tekshiring",
			whyItMatters: `HTTP inference handlerlari ML xizmatlarining asosi:

- **API shartnomalar**: Aniq so'rov/javob strukturalari
- **Xatolarni qayta ishlash**: To'g'ri HTTP status practixri va xato xabarlari
- **Tekshirish**: Noto'g'ri kirishlarning modelga yetishini oldini olish
- **Kuzatuvchanlik**: Javoblarga latency kuzatish o'rnatilgan`,
		},
	},
};

export default task;
