import { Task } from '../../../../../../../types';

const task: Task = {
  slug: 'goml-feature-pipeline',
  title: 'Feature Processing Pipeline',
  difficulty: 'hard',
  tags: ['go', 'ml', 'pipeline', 'features', 'transformation'],
  estimatedTime: '35m',
  isPremium: true,
  order: 5,

  description: `
## Feature Processing Pipeline

Build a composable feature processing pipeline that chains multiple transformations for ML inference.

### Requirements

1. **Pipeline** - Main pipeline component:
   - \`NewPipeline()\` - Create empty pipeline
   - \`AddStage(name string, stage Stage)\` - Add transformation stage
   - \`Process(input map[string]interface{}) (map[string]float32, error)\` - Run pipeline
   - \`ProcessBatch(inputs []map[string]interface{}) ([]map[string]float32, error)\` - Batch processing

2. **Stage** - Transformation interface:
   - \`Transform(input map[string]interface{}) (map[string]interface{}, error)\`
   - \`Name() string\`

3. **Built-in Stages**:
   - \`NumericScaler\` - Min-max or standard scaling
   - \`OneHotEncoder\` - Categorical to one-hot encoding
   - \`TextTokenizer\` - Text to token IDs
   - \`FeatureSelector\` - Select specific features
   - \`MissingValueHandler\` - Handle missing values

4. **Pipeline Features**:
   - Parallel stage execution where possible
   - Stage timing metrics
   - Error handling with stage context

### Example

\`\`\`go
pipeline := NewPipeline()
pipeline.AddStage("scaler", NewNumericScaler(map[string]ScaleParams{
    "age": {Min: 0, Max: 100},
    "income": {Min: 0, Max: 1000000},
}))
pipeline.AddStage("encoder", NewOneHotEncoder(map[string][]string{
    "city": {"NYC", "LA", "Chicago"},
}))

input := map[string]interface{}{
    "age": 25,
    "income": 50000,
    "city": "NYC",
}
output, err := pipeline.Process(input)
// output: {"age": 0.25, "income": 0.05, "city_NYC": 1.0, "city_LA": 0.0, "city_Chicago": 0.0}
\`\`\`
`,

  initialCode: `package featurepipeline

import (
	"sync"
)

type Stage interface {
}

type Pipeline struct {
}

func NewPipeline() *Pipeline {
	return nil
}

func (p *Pipeline) AddStage(name string, stage Stage) {
}

func (p *Pipeline) Process(input map[string]interface{}) (map[string]float32, error) {
	return nil, nil
}

func (p *Pipeline) ProcessBatch(inputs []map[string]interface{}) ([]map[string]float32, error) {
	return nil, nil
}

type ScaleParams struct {
	Min float64
	Max float64
}

type NumericScaler struct {
}

func NewNumericScaler(params map[string]ScaleParams) *NumericScaler {
	return nil
}

type OneHotEncoder struct {
}

func NewOneHotEncoder(categories map[string][]string) *OneHotEncoder {
	return nil
}`,

  solutionCode: `package featurepipeline

import (
	"errors"
	"fmt"
	"sync"
)

// Stage represents a feature transformation stage
type Stage interface {
	Transform(input map[string]interface{}) (map[string]interface{}, error)
	Name() string
}

// Pipeline chains multiple feature transformation stages
type Pipeline struct {
	stages []namedStage
	mu     sync.RWMutex
}

type namedStage struct {
	name  string
	stage Stage
}

// NewPipeline creates a new feature processing pipeline
func NewPipeline() *Pipeline {
	return &Pipeline{
		stages: make([]namedStage, 0),
	}
}

// AddStage adds a transformation stage to the pipeline
func (p *Pipeline) AddStage(name string, stage Stage) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.stages = append(p.stages, namedStage{name: name, stage: stage})
}

// Process runs all pipeline stages on the input
func (p *Pipeline) Process(input map[string]interface{}) (map[string]float32, error) {
	p.mu.RLock()
	stages := make([]namedStage, len(p.stages))
	copy(stages, p.stages)
	p.mu.RUnlock()

	current := copyMap(input)

	for _, ns := range stages {
		result, err := ns.stage.Transform(current)
		if err != nil {
			return nil, fmt.Errorf("stage %s failed: %w", ns.name, err)
		}
		current = result
	}

	// Convert to float32 output
	output := make(map[string]float32)
	for k, v := range current {
		switch val := v.(type) {
		case float64:
			output[k] = float32(val)
		case float32:
			output[k] = val
		case int:
			output[k] = float32(val)
		case int64:
			output[k] = float32(val)
		default:
			return nil, fmt.Errorf("cannot convert %s to float32: %T", k, v)
		}
	}

	return output, nil
}

// ProcessBatch processes multiple inputs in parallel
func (p *Pipeline) ProcessBatch(inputs []map[string]interface{}) ([]map[string]float32, error) {
	results := make([]map[string]float32, len(inputs))
	errs := make([]error, len(inputs))
	var wg sync.WaitGroup

	for i, input := range inputs {
		wg.Add(1)
		go func(idx int, inp map[string]interface{}) {
			defer wg.Done()
			result, err := p.Process(inp)
			results[idx] = result
			errs[idx] = err
		}(i, input)
	}

	wg.Wait()

	for _, err := range errs {
		if err != nil {
			return nil, err
		}
	}

	return results, nil
}

func copyMap(m map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{}, len(m))
	for k, v := range m {
		result[k] = v
	}
	return result
}

// ScaleParams defines scaling parameters
type ScaleParams struct {
	Min float64
	Max float64
}

// NumericScaler scales numeric features to [0, 1]
type NumericScaler struct {
	params map[string]ScaleParams
}

// NewNumericScaler creates a numeric scaler
func NewNumericScaler(params map[string]ScaleParams) *NumericScaler {
	return &NumericScaler{params: params}
}

func (s *NumericScaler) Name() string {
	return "NumericScaler"
}

func (s *NumericScaler) Transform(input map[string]interface{}) (map[string]interface{}, error) {
	output := copyMap(input)

	for key, params := range s.params {
		val, ok := input[key]
		if !ok {
			continue
		}

		var numVal float64
		switch v := val.(type) {
		case float64:
			numVal = v
		case float32:
			numVal = float64(v)
		case int:
			numVal = float64(v)
		case int64:
			numVal = float64(v)
		default:
			return nil, fmt.Errorf("cannot scale non-numeric value for %s", key)
		}

		if params.Max == params.Min {
			output[key] = float64(0)
		} else {
			scaled := (numVal - params.Min) / (params.Max - params.Min)
			output[key] = scaled
		}
	}

	return output, nil
}

// OneHotEncoder encodes categorical features
type OneHotEncoder struct {
	categories map[string][]string
}

// NewOneHotEncoder creates a one-hot encoder
func NewOneHotEncoder(categories map[string][]string) *OneHotEncoder {
	return &OneHotEncoder{categories: categories}
}

func (e *OneHotEncoder) Name() string {
	return "OneHotEncoder"
}

func (e *OneHotEncoder) Transform(input map[string]interface{}) (map[string]interface{}, error) {
	output := make(map[string]interface{})

	// Copy non-categorical features
	for k, v := range input {
		if _, isCategorical := e.categories[k]; !isCategorical {
			output[k] = v
		}
	}

	// One-hot encode categorical features
	for key, cats := range e.categories {
		val, ok := input[key]
		if !ok {
			// Set all to 0 if missing
			for _, cat := range cats {
				output[key+"_"+cat] = float64(0)
			}
			continue
		}

		strVal, ok := val.(string)
		if !ok {
			return nil, fmt.Errorf("categorical feature %s must be string", key)
		}

		for _, cat := range cats {
			if cat == strVal {
				output[key+"_"+cat] = float64(1)
			} else {
				output[key+"_"+cat] = float64(0)
			}
		}
	}

	return output, nil
}

// MissingValueHandler handles missing values
type MissingValueHandler struct {
	defaults map[string]interface{}
}

// NewMissingValueHandler creates a missing value handler
func NewMissingValueHandler(defaults map[string]interface{}) *MissingValueHandler {
	return &MissingValueHandler{defaults: defaults}
}

func (h *MissingValueHandler) Name() string {
	return "MissingValueHandler"
}

func (h *MissingValueHandler) Transform(input map[string]interface{}) (map[string]interface{}, error) {
	output := copyMap(input)

	for key, defaultVal := range h.defaults {
		if _, ok := output[key]; !ok {
			output[key] = defaultVal
		}
	}

	return output, nil
}

// FeatureSelector selects specific features
type FeatureSelector struct {
	features []string
}

// NewFeatureSelector creates a feature selector
func NewFeatureSelector(features []string) *FeatureSelector {
	return &FeatureSelector{features: features}
}

func (s *FeatureSelector) Name() string {
	return "FeatureSelector"
}

func (s *FeatureSelector) Transform(input map[string]interface{}) (map[string]interface{}, error) {
	output := make(map[string]interface{})

	for _, feature := range s.features {
		if val, ok := input[feature]; ok {
			output[feature] = val
		} else {
			return nil, errors.New("missing required feature: " + feature)
		}
	}

	return output, nil
}
`,

  testCode: `package featurepipeline

import (
	"math"
	"testing"
)

func TestPipelineBasic(t *testing.T) {
	pipeline := NewPipeline()

	scaler := NewNumericScaler(map[string]ScaleParams{
		"age": {Min: 0, Max: 100},
	})
	pipeline.AddStage("scaler", scaler)

	input := map[string]interface{}{
		"age": 50,
	}

	output, err := pipeline.Process(input)
	if err != nil {
		t.Fatalf("Process failed: %v", err)
	}

	if math.Abs(float64(output["age"])-0.5) > 0.001 {
		t.Errorf("Expected age=0.5, got %f", output["age"])
	}
}

func TestNumericScaler(t *testing.T) {
	scaler := NewNumericScaler(map[string]ScaleParams{
		"value": {Min: 0, Max: 100},
	})

	input := map[string]interface{}{
		"value": 25,
		"other": "text",
	}

	output, err := scaler.Transform(input)
	if err != nil {
		t.Fatalf("Transform failed: %v", err)
	}

	val, ok := output["value"].(float64)
	if !ok {
		t.Fatal("Expected float64 output")
	}

	if math.Abs(val-0.25) > 0.001 {
		t.Errorf("Expected 0.25, got %f", val)
	}

	if output["other"] != "text" {
		t.Error("Non-scaled field should be preserved")
	}
}

func TestOneHotEncoder(t *testing.T) {
	encoder := NewOneHotEncoder(map[string][]string{
		"city": {"NYC", "LA", "Chicago"},
	})

	input := map[string]interface{}{
		"city":  "NYC",
		"value": 100,
	}

	output, err := encoder.Transform(input)
	if err != nil {
		t.Fatalf("Transform failed: %v", err)
	}

	if output["city_NYC"] != float64(1) {
		t.Errorf("Expected city_NYC=1, got %v", output["city_NYC"])
	}
	if output["city_LA"] != float64(0) {
		t.Errorf("Expected city_LA=0, got %v", output["city_LA"])
	}
	if output["city_Chicago"] != float64(0) {
		t.Errorf("Expected city_Chicago=0, got %v", output["city_Chicago"])
	}
	if output["value"] != 100 {
		t.Error("Non-categorical field should be preserved")
	}
}

func TestPipelineChained(t *testing.T) {
	pipeline := NewPipeline()

	pipeline.AddStage("scaler", NewNumericScaler(map[string]ScaleParams{
		"age":    {Min: 0, Max: 100},
		"income": {Min: 0, Max: 100000},
	}))

	pipeline.AddStage("encoder", NewOneHotEncoder(map[string][]string{
		"city": {"NYC", "LA"},
	}))

	input := map[string]interface{}{
		"age":    50,
		"income": 50000,
		"city":   "LA",
	}

	output, err := pipeline.Process(input)
	if err != nil {
		t.Fatalf("Process failed: %v", err)
	}

	if math.Abs(float64(output["age"])-0.5) > 0.001 {
		t.Errorf("Expected age=0.5, got %f", output["age"])
	}
	if math.Abs(float64(output["income"])-0.5) > 0.001 {
		t.Errorf("Expected income=0.5, got %f", output["income"])
	}
	if output["city_LA"] != 1.0 {
		t.Errorf("Expected city_LA=1, got %f", output["city_LA"])
	}
	if output["city_NYC"] != 0.0 {
		t.Errorf("Expected city_NYC=0, got %f", output["city_NYC"])
	}
}

func TestProcessBatch(t *testing.T) {
	pipeline := NewPipeline()
	pipeline.AddStage("scaler", NewNumericScaler(map[string]ScaleParams{
		"value": {Min: 0, Max: 100},
	}))

	inputs := []map[string]interface{}{
		{"value": 0},
		{"value": 50},
		{"value": 100},
	}

	outputs, err := pipeline.ProcessBatch(inputs)
	if err != nil {
		t.Fatalf("ProcessBatch failed: %v", err)
	}

	if len(outputs) != 3 {
		t.Fatalf("Expected 3 outputs, got %d", len(outputs))
	}

	expected := []float32{0.0, 0.5, 1.0}
	for i, out := range outputs {
		if math.Abs(float64(out["value"]-expected[i])) > 0.001 {
			t.Errorf("Output[%d]: expected %f, got %f", i, expected[i], out["value"])
		}
	}
}

func TestMissingValueHandler(t *testing.T) {
	handler := NewMissingValueHandler(map[string]interface{}{
		"age":    float64(30),
		"income": float64(50000),
	})

	input := map[string]interface{}{
		"age": 25,
	}

	output, err := handler.Transform(input)
	if err != nil {
		t.Fatalf("Transform failed: %v", err)
	}

	if output["age"] != 25 {
		t.Error("Existing value should not be overwritten")
	}
	if output["income"] != float64(50000) {
		t.Errorf("Missing value should get default, got %v", output["income"])
	}
}

func TestFeatureSelector(t *testing.T) {
	selector := NewFeatureSelector([]string{"age", "income"})

	input := map[string]interface{}{
		"age":    25,
		"income": 50000,
		"extra":  "ignore",
	}

	output, err := selector.Transform(input)
	if err != nil {
		t.Fatalf("Transform failed: %v", err)
	}

	if len(output) != 2 {
		t.Errorf("Expected 2 features, got %d", len(output))
	}
	if _, ok := output["extra"]; ok {
		t.Error("Extra feature should not be included")
	}
}

func TestFeatureSelectorMissingFeature(t *testing.T) {
	selector := NewFeatureSelector([]string{"age", "income", "missing"})

	input := map[string]interface{}{
		"age":    25,
		"income": 50000,
	}

	_, err := selector.Transform(input)
	if err == nil {
		t.Error("Expected error for missing required feature")
	}
}

func TestEmptyPipeline(t *testing.T) {
	pipeline := NewPipeline()

	input := map[string]interface{}{
		"value": 100,
	}

	output, err := pipeline.Process(input)
	if err != nil {
		t.Fatalf("Empty pipeline should process: %v", err)
	}

	if output["value"] != float32(100) {
		t.Errorf("Expected value=100, got %v", output["value"])
	}
}

func TestStageNames(t *testing.T) {
	scaler := NewNumericScaler(map[string]ScaleParams{})
	encoder := NewOneHotEncoder(map[string][]string{})
	handler := NewMissingValueHandler(map[string]interface{}{})
	selector := NewFeatureSelector([]string{})

	if scaler.Name() != "NumericScaler" {
		t.Errorf("Expected NumericScaler, got %s", scaler.Name())
	}
	if encoder.Name() != "OneHotEncoder" {
		t.Errorf("Expected OneHotEncoder, got %s", encoder.Name())
	}
	if handler.Name() != "MissingValueHandler" {
		t.Errorf("Expected MissingValueHandler, got %s", handler.Name())
	}
	if selector.Name() != "FeatureSelector" {
		t.Errorf("Expected FeatureSelector, got %s", selector.Name())
	}
}
`,

  hint1: `Chain stages by passing the output of one stage as input to the next. Use a slice to maintain stage order.`,

  hint2: `For batch processing, use goroutines with sync.WaitGroup. Each input can be processed independently in parallel.`,

  whyItMatters: `Feature pipelines ensure consistent data transformation between training and inference. Composable stages make pipelines maintainable and testable. Production ML systems often have complex preprocessing that must match exactly what was used during training.`,

  translations: {
    ru: {
      title: 'Пайплайн Обработки Признаков',
      description: `
## Пайплайн Обработки Признаков

Создайте компонуемый пайплайн обработки признаков, который объединяет множественные преобразования для ML-инференса.

### Требования

1. **Pipeline** - Основной компонент пайплайна:
   - \`NewPipeline()\` - Создание пустого пайплайна
   - \`AddStage(name string, stage Stage)\` - Добавление этапа преобразования
   - \`Process(input map[string]interface{}) (map[string]float32, error)\` - Запуск пайплайна
   - \`ProcessBatch(inputs []map[string]interface{}) ([]map[string]float32, error)\` - Пакетная обработка

2. **Stage** - Интерфейс преобразования:
   - \`Transform(input map[string]interface{}) (map[string]interface{}, error)\`
   - \`Name() string\`

3. **Встроенные этапы**:
   - \`NumericScaler\` - Min-max или стандартное масштабирование
   - \`OneHotEncoder\` - Категориальные признаки в one-hot кодирование
   - \`TextTokenizer\` - Текст в ID токенов
   - \`FeatureSelector\` - Выбор конкретных признаков
   - \`MissingValueHandler\` - Обработка пропущенных значений

4. **Возможности пайплайна**:
   - Параллельное выполнение этапов где возможно
   - Метрики времени выполнения этапов
   - Обработка ошибок с контекстом этапа

### Пример

\`\`\`go
pipeline := NewPipeline()
pipeline.AddStage("scaler", NewNumericScaler(map[string]ScaleParams{
    "age": {Min: 0, Max: 100},
    "income": {Min: 0, Max: 1000000},
}))
pipeline.AddStage("encoder", NewOneHotEncoder(map[string][]string{
    "city": {"NYC", "LA", "Chicago"},
}))

input := map[string]interface{}{
    "age": 25,
    "income": 50000,
    "city": "NYC",
}
output, err := pipeline.Process(input)
// output: {"age": 0.25, "income": 0.05, "city_NYC": 1.0, "city_LA": 0.0, "city_Chicago": 0.0}
\`\`\`
`,
      hint1: 'Цепочка этапов: передача выхода одного этапа на вход следующего. Используйте слайс для сохранения порядка.',
      hint2: 'Для пакетной обработки используйте горутины с sync.WaitGroup. Каждый вход можно обрабатывать независимо параллельно.',
      whyItMatters: 'Пайплайны признаков обеспечивают согласованное преобразование данных между обучением и инференсом. Компонуемые этапы делают пайплайны поддерживаемыми и тестируемыми. Продакшн ML-системы часто имеют сложную предобработку, которая должна точно соответствовать той, что использовалась при обучении.',
    },
    uz: {
      title: 'Feature Qayta Ishlash Pipeline',
      description: `
## Feature Qayta Ishlash Pipeline

ML inference uchun bir nechta transformatsiyalarni birlashtiruvchi composable feature qayta ishlash pipeline yarating.

### Talablar

1. **Pipeline** - Asosiy pipeline komponenti:
   - \`NewPipeline()\` - Bo'sh pipeline yaratish
   - \`AddStage(name string, stage Stage)\` - Transformatsiya bosqichini qo'shish
   - \`Process(input map[string]interface{}) (map[string]float32, error)\` - Pipelineni ishga tushirish
   - \`ProcessBatch(inputs []map[string]interface{}) ([]map[string]float32, error)\` - Batch qayta ishlash

2. **Stage** - Transformatsiya interfeysi:
   - \`Transform(input map[string]interface{}) (map[string]interface{}, error)\`
   - \`Name() string\`

3. **O'rnatilgan bosqichlar**:
   - \`NumericScaler\` - Min-max yoki standart masshtablash
   - \`OneHotEncoder\` - Kategorik featurelarni one-hot practixsh
   - \`TextTokenizer\` - Matnni token IDlariga aylantirish
   - \`FeatureSelector\` - Ma'lum featurelarni tanlash
   - \`MissingValueHandler\` - Yo'qolgan qiymatlarni boshqarish

4. **Pipeline xususiyatlari**:
   - Mumkin bo'lgan joyda parallel bosqichlarni bajarish
   - Bosqich vaqti metrikalari
   - Bosqich konteksti bilan xatolarni boshqarish

### Misol

\`\`\`go
pipeline := NewPipeline()
pipeline.AddStage("scaler", NewNumericScaler(map[string]ScaleParams{
    "age": {Min: 0, Max: 100},
    "income": {Min: 0, Max: 1000000},
}))
pipeline.AddStage("encoder", NewOneHotEncoder(map[string][]string{
    "city": {"NYC", "LA", "Chicago"},
}))

input := map[string]interface{}{
    "age": 25,
    "income": 50000,
    "city": "NYC",
}
output, err := pipeline.Process(input)
// output: {"age": 0.25, "income": 0.05, "city_NYC": 1.0, "city_LA": 0.0, "city_Chicago": 0.0}
\`\`\`
`,
      hint1: "Bosqichlarni zanjirlab oling: bir bosqich chiqishini keyingisiga kirish sifatida uzating. Tartibni saqlash uchun slice ishlating.",
      hint2: "Batch qayta ishlash uchun sync.WaitGroup bilan goroutinelardan foydalaning. Har bir kirishni mustaqil parallel qayta ishlash mumkin.",
      whyItMatters: "Feature pipelinelari o'qitish va inference o'rtasida izchil ma'lumotlar transformatsiyasini ta'minlaydi. Composable bosqichlar pipelinelarni qo'llab-quvvatlanadigan va test qilinadigan qiladi. Production ML tizimlari ko'pincha o'qitishda ishlatilgani bilan aniq mos kelishi kerak bo'lgan murakkab oldindan qayta ishlashga ega.",
    },
  },
};

export default task;
