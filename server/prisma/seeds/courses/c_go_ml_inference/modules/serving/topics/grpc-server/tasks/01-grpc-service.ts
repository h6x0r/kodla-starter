import { Task } from '../../../../../../../types';

const task: Task = {
	slug: 'goml-grpc-service',
	title: 'gRPC Inference Service',
	difficulty: 'medium',
	tags: ['go', 'ml', 'grpc', 'protobuf'],
	estimatedTime: '35m',
	isPremium: true,
	order: 1,
	description: `# gRPC Inference Service

Implement a gRPC service for ML inference.

## Task

Build a gRPC inference service that:
- Defines protobuf messages for requests/responses
- Implements unary and streaming inference
- Handles errors with proper gRPC status codes
- Supports request metadata

## Example

\`\`\`protobuf
service InferenceService {
  rpc Predict(PredictRequest) returns (PredictResponse);
  rpc StreamPredict(stream PredictRequest) returns (stream PredictResponse);
}
\`\`\``,

	initialCode: `package main

import (
	"context"
	"fmt"
)

// PredictRequest represents the gRPC request
type PredictRequest struct {
	Input   []float32
	ModelID string
}

// PredictResponse represents the gRPC response
type PredictResponse struct {
	Prediction []float32
	LatencyMs  int64
}

// InferenceServer implements the gRPC service
type InferenceServer struct {
	// Your fields here
}

// NewInferenceServer creates an inference server
func NewInferenceServer(model Model) *InferenceServer {
	// Your code here
	return nil
}

// Predict implements unary inference
func (s *InferenceServer) Predict(ctx context.Context, req *PredictRequest) (*PredictResponse, error) {
	// Your code here
	return nil, nil
}

// Model interface
type Model interface {
	Predict(input []float32) []float32
}

func main() {
	fmt.Println("gRPC Inference Service")
}`,

	solutionCode: `package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"sync"
	"time"
)

// Simulating gRPC types (in real code, these come from protobuf generation)

// PredictRequest represents the gRPC request
type PredictRequest struct {
	Input   []float32
	ModelID string
}

// PredictResponse represents the gRPC response
type PredictResponse struct {
	Prediction []float32
	LatencyMs  int64
	ModelID    string
}

// StatusCode represents gRPC status codes
type StatusCode int

const (
	OK StatusCode = iota
	InvalidArgument
	NotFound
	Internal
	DeadlineExceeded
	ResourceExhausted
)

// Status represents gRPC status
type Status struct {
	Code    StatusCode
	Message string
}

func (s Status) Error() string {
	return s.Message
}

// Model interface for inference
type Model interface {
	Predict(input []float32) []float32
	InputSize() int
}

// SimpleModel for testing
type SimpleModel struct {
	inputSize int
}

func NewSimpleModel(inputSize int) *SimpleModel {
	return &SimpleModel{inputSize: inputSize}
}

func (m *SimpleModel) Predict(input []float32) []float32 {
	output := make([]float32, 2)
	var sum float32
	for _, v := range input {
		sum += v
	}
	output[0] = 1.0 / (1.0 + sum/float32(len(input)+1))
	output[1] = 1.0 - output[0]
	return output
}

func (m *SimpleModel) InputSize() int {
	return m.inputSize
}

// InferenceServer implements the gRPC service
type InferenceServer struct {
	model       Model
	maxRequests int
	activeReqs  int
	mu          sync.Mutex
}

// NewInferenceServer creates an inference server
func NewInferenceServer(model Model) *InferenceServer {
	return &InferenceServer{
		model:       model,
		maxRequests: 100,
	}
}

// SetMaxRequests sets maximum concurrent requests
func (s *InferenceServer) SetMaxRequests(max int) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.maxRequests = max
}

// Predict implements unary inference
func (s *InferenceServer) Predict(ctx context.Context, req *PredictRequest) (*PredictResponse, error) {
	// Check context deadline
	if deadline, ok := ctx.Deadline(); ok {
		if time.Until(deadline) < 0 {
			return nil, Status{Code: DeadlineExceeded, Message: "deadline exceeded"}
		}
	}

	// Check concurrency limit
	s.mu.Lock()
	if s.activeReqs >= s.maxRequests {
		s.mu.Unlock()
		return nil, Status{Code: ResourceExhausted, Message: "too many requests"}
	}
	s.activeReqs++
	s.mu.Unlock()

	defer func() {
		s.mu.Lock()
		s.activeReqs--
		s.mu.Unlock()
	}()

	// Validate request
	if err := s.validateRequest(req); err != nil {
		return nil, err
	}

	// Run inference
	start := time.Now()
	prediction := s.model.Predict(req.Input)
	latency := time.Since(start).Milliseconds()

	return &PredictResponse{
		Prediction: prediction,
		LatencyMs:  latency,
		ModelID:    req.ModelID,
	}, nil
}

// validateRequest validates the request
func (s *InferenceServer) validateRequest(req *PredictRequest) error {
	if req == nil {
		return Status{Code: InvalidArgument, Message: "request is nil"}
	}

	if len(req.Input) == 0 {
		return Status{Code: InvalidArgument, Message: "input cannot be empty"}
	}

	expectedSize := s.model.InputSize()
	if expectedSize > 0 && len(req.Input) != expectedSize {
		return Status{Code: InvalidArgument, Message: fmt.Sprintf("expected input size %d, got %d", expectedSize, len(req.Input))}
	}

	return nil
}

// PredictStream simulates streaming interface
type PredictStream interface {
	Recv() (*PredictRequest, error)
	Send(*PredictResponse) error
}

// StreamPredict implements bidirectional streaming
func (s *InferenceServer) StreamPredict(stream PredictStream) error {
	for {
		req, err := stream.Recv()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}

		resp, err := s.Predict(context.Background(), req)
		if err != nil {
			return err
		}

		if err := stream.Send(resp); err != nil {
			return err
		}
	}
}

// BatchPredict handles batch requests
func (s *InferenceServer) BatchPredict(ctx context.Context, requests []*PredictRequest) ([]*PredictResponse, error) {
	responses := make([]*PredictResponse, len(requests))
	var wg sync.WaitGroup
	var mu sync.Mutex
	var firstErr error

	for i, req := range requests {
		wg.Add(1)
		go func(idx int, r *PredictRequest) {
			defer wg.Done()

			resp, err := s.Predict(ctx, r)
			mu.Lock()
			if err != nil && firstErr == nil {
				firstErr = err
			}
			responses[idx] = resp
			mu.Unlock()
		}(i, req)
	}

	wg.Wait()

	if firstErr != nil {
		return nil, firstErr
	}

	return responses, nil
}

// MockListener simulates a network listener
type MockListener struct {
	connections chan net.Conn
	closed      bool
	mu          sync.Mutex
}

func NewMockListener() *MockListener {
	return &MockListener{
		connections: make(chan net.Conn, 10),
	}
}

func (l *MockListener) Accept() (net.Conn, error) {
	conn, ok := <-l.connections
	if !ok {
		return nil, errors.New("listener closed")
	}
	return conn, nil
}

func (l *MockListener) Close() error {
	l.mu.Lock()
	defer l.mu.Unlock()
	if !l.closed {
		l.closed = true
		close(l.connections)
	}
	return nil
}

func (l *MockListener) Addr() net.Addr {
	return &net.TCPAddr{IP: net.ParseIP("127.0.0.1"), Port: 50051}
}

// GRPCServer wraps the inference server
type GRPCServer struct {
	inferenceServer *InferenceServer
	listener        net.Listener
}

func NewGRPCServer(model Model, addr string) (*GRPCServer, error) {
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		return nil, err
	}

	return &GRPCServer{
		inferenceServer: NewInferenceServer(model),
		listener:        lis,
	}, nil
}

func (s *GRPCServer) Serve() error {
	// In real code, this would register with grpc.Server and serve
	log.Printf("gRPC server listening on %s", s.listener.Addr())
	for {
		conn, err := s.listener.Accept()
		if err != nil {
			return err
		}
		go s.handleConnection(conn)
	}
}

func (s *GRPCServer) handleConnection(conn net.Conn) {
	defer conn.Close()
	// In real code, this would handle gRPC protocol
	log.Printf("Handling connection from %s", conn.RemoteAddr())
}

func (s *GRPCServer) Stop() {
	s.listener.Close()
}

func main() {
	model := NewSimpleModel(3)
	server := NewInferenceServer(model)

	// Test unary prediction
	req := &PredictRequest{
		Input:   []float32{1.0, 2.0, 3.0},
		ModelID: "test-model",
	}

	resp, err := server.Predict(context.Background(), req)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Prediction: %v, Latency: %dms\\n", resp.Prediction, resp.LatencyMs)

	// Test batch prediction
	batchReqs := []*PredictRequest{
		{Input: []float32{1, 2, 3}},
		{Input: []float32{4, 5, 6}},
		{Input: []float32{7, 8, 9}},
	}

	responses, err := server.BatchPredict(context.Background(), batchReqs)
	if err != nil {
		log.Fatal(err)
	}

	for i, r := range responses {
		fmt.Printf("Batch %d: %v\\n", i, r.Prediction)
	}
}`,

	testCode: `package main

import (
	"context"
	"testing"
	"time"
)

func TestInferenceServer(t *testing.T) {
	model := NewSimpleModel(3)
	server := NewInferenceServer(model)

	req := &PredictRequest{
		Input:   []float32{1, 2, 3},
		ModelID: "test",
	}

	resp, err := server.Predict(context.Background(), req)
	if err != nil {
		t.Fatalf("Predict failed: %v", err)
	}

	if len(resp.Prediction) != 2 {
		t.Errorf("Expected 2 predictions, got %d", len(resp.Prediction))
	}
}

func TestInferenceServerEmptyInput(t *testing.T) {
	model := NewSimpleModel(0)
	server := NewInferenceServer(model)

	req := &PredictRequest{
		Input: []float32{},
	}

	_, err := server.Predict(context.Background(), req)
	if err == nil {
		t.Error("Expected error for empty input")
	}
}

func TestInferenceServerNilRequest(t *testing.T) {
	model := NewSimpleModel(3)
	server := NewInferenceServer(model)

	_, err := server.Predict(context.Background(), nil)
	if err == nil {
		t.Error("Expected error for nil request")
	}
}

func TestInferenceServerConcurrencyLimit(t *testing.T) {
	model := NewSimpleModel(3)
	server := NewInferenceServer(model)
	server.SetMaxRequests(1)

	// Simulate reaching max requests
	server.mu.Lock()
	server.activeReqs = 1
	server.mu.Unlock()

	req := &PredictRequest{Input: []float32{1, 2, 3}}
	_, err := server.Predict(context.Background(), req)

	if err == nil {
		t.Error("Expected resource exhausted error")
	}
}

func TestInferenceServerDeadline(t *testing.T) {
	model := NewSimpleModel(3)
	server := NewInferenceServer(model)

	// Create context with already-expired deadline
	ctx, cancel := context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
	defer cancel()

	req := &PredictRequest{Input: []float32{1, 2, 3}}
	_, err := server.Predict(ctx, req)

	if err == nil {
		t.Error("Expected deadline exceeded error")
	}
}

func TestBatchPredict(t *testing.T) {
	model := NewSimpleModel(3)
	server := NewInferenceServer(model)

	requests := []*PredictRequest{
		{Input: []float32{1, 2, 3}},
		{Input: []float32{4, 5, 6}},
	}

	responses, err := server.BatchPredict(context.Background(), requests)
	if err != nil {
		t.Fatalf("BatchPredict failed: %v", err)
	}

	if len(responses) != 2 {
		t.Errorf("Expected 2 responses, got %d", len(responses))
	}
}

func TestValidateRequest(t *testing.T) {
	model := NewSimpleModel(3)
	server := NewInferenceServer(model)

	tests := []struct {
		name    string
		req     *PredictRequest
		wantErr bool
	}{
		{"valid", &PredictRequest{Input: []float32{1, 2, 3}}, false},
		{"nil", nil, true},
		{"empty", &PredictRequest{Input: []float32{}}, true},
		{"wrong size", &PredictRequest{Input: []float32{1, 2}}, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := server.validateRequest(tt.req)
			if (err != nil) != tt.wantErr {
				t.Errorf("validateRequest() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestStatusError(t *testing.T) {
	status := Status{Code: InvalidArgument, Message: "test error"}
	errStr := status.Error()
	if errStr != "test error" {
		t.Errorf("Expected 'test error', got '%s'", errStr)
	}
}

func TestSimpleModel(t *testing.T) {
	model := NewSimpleModel(4)

	if model.InputSize() != 4 {
		t.Errorf("Expected input size 4, got %d", model.InputSize())
	}

	output := model.Predict([]float32{1, 2, 3, 4})
	if len(output) != 2 {
		t.Errorf("Expected 2 outputs, got %d", len(output))
	}

	// Check outputs sum to ~1 (sigmoid-like)
	sum := output[0] + output[1]
	if sum < 0.99 || sum > 1.01 {
		t.Errorf("Output should sum to ~1, got %f", sum)
	}
}

func TestMockListener(t *testing.T) {
	listener := NewMockListener()

	addr := listener.Addr()
	if addr == nil {
		t.Fatal("Addr should not be nil")
	}

	err := listener.Close()
	if err != nil {
		t.Errorf("Close failed: %v", err)
	}

	// Second close should not panic
	err = listener.Close()
	if err != nil {
		t.Errorf("Second close failed: %v", err)
	}
}`,

	hint1: 'Use gRPC status codes for proper error handling',
	hint2: 'Implement concurrency limits to prevent resource exhaustion',

	whyItMatters: `gRPC provides high-performance ML serving:

- **Binary protocol**: More efficient than JSON
- **Streaming**: Support for real-time inference
- **Strong typing**: Protobuf ensures type safety
- **Cross-language**: Works with any gRPC client

gRPC is the preferred protocol for high-throughput ML services.`,

	translations: {
		ru: {
			title: 'gRPC сервис инференса',
			description: `# gRPC сервис инференса

Реализуйте gRPC сервис для ML инференса.

## Задача

Создайте gRPC сервис инференса:
- Определение protobuf сообщений для запросов/ответов
- Реализация унарного и потокового инференса
- Обработка ошибок с правильными gRPC статус кодами
- Поддержка метаданных запроса

## Пример

\`\`\`protobuf
service InferenceService {
  rpc Predict(PredictRequest) returns (PredictResponse);
  rpc StreamPredict(stream PredictRequest) returns (stream PredictResponse);
}
\`\`\``,
			hint1: 'Используйте gRPC статус коды для правильной обработки ошибок',
			hint2: 'Реализуйте лимиты конкурентности для предотвращения исчерпания ресурсов',
			whyItMatters: `gRPC обеспечивает высокопроизводительный ML сервинг:

- **Бинарный протокол**: Более эффективный чем JSON
- **Стриминг**: Поддержка real-time инференса
- **Строгая типизация**: Protobuf обеспечивает типобезопасность
- **Кроссъязычность**: Работает с любым gRPC клиентом`,
		},
		uz: {
			title: 'gRPC inference xizmati',
			description: `# gRPC inference xizmati

ML inference uchun gRPC xizmatini amalga oshiring.

## Topshiriq

gRPC inference xizmatini yarating:
- So'rov/javob uchun protobuf xabarlarini aniqlash
- Unary va streaming inference ni amalga oshirish
- To'g'ri gRPC status practixri bilan xatolarni qayta ishlash
- So'rov metama'lumotlarini qo'llab-quvvatlash

## Misol

\`\`\`protobuf
service InferenceService {
  rpc Predict(PredictRequest) returns (PredictResponse);
  rpc StreamPredict(stream PredictRequest) returns (stream PredictResponse);
}
\`\`\``,
			hint1: "To'g'ri xatolarni qayta ishlash uchun gRPC status practixridan foydalaning",
			hint2: "Resurslarning tugashini oldini olish uchun concurrency limitlarini amalga oshiring",
			whyItMatters: `gRPC yuqori unumdor ML serving ni ta'minlaydi:

- **Binary protokol**: JSON dan ko'ra samaraliroq
- **Streaming**: Real-time inference ni qo'llab-quvvatlash
- **Qat'iy tiplash**: Protobuf tip xavfsizligini ta'minlaydi
- **Cross-language**: Har qanday gRPC mijoz bilan ishlaydi`,
		},
	},
};

export default task;
