import { Task } from '../../../../../../../types';

const task: Task = {
	slug: 'goml-encoding',
	title: 'Categorical Encoding',
	difficulty: 'medium',
	tags: ['go', 'ml', 'encoding', 'categorical'],
	estimatedTime: '25m',
	isPremium: false,
	order: 2,
	description: `# Categorical Encoding

Implement categorical encoding for ML inference in Go.

## Task

Build encoders that:
- Implement one-hot encoding
- Implement label encoding
- Handle unknown categories
- Support inverse transforms

## Example

\`\`\`go
encoder := NewOneHotEncoder()
encoder.Fit(categories)
encoded := encoder.Transform("cat")
// Returns: [1, 0, 0] for categories ["cat", "dog", "bird"]
\`\`\``,

	initialCode: `package main

import (
	"fmt"
)

type OneHotEncoder struct {
	// Your fields here
}

type LabelEncoder struct {
	// Your fields here
}

func NewOneHotEncoder() *OneHotEncoder {
	return nil
}

func (e *OneHotEncoder) Fit(categories []string) {
}

func (e *OneHotEncoder) Transform(category string) []float32 {
	return nil
}

func (e *OneHotEncoder) InverseTransform(encoded []float32) string {
	return ""
}

func main() {
}`,

	solutionCode: `package main

import (
	"fmt"
)

// OneHotEncoder encodes categories as binary vectors
type OneHotEncoder struct {
	categories   []string
	categoryMap  map[string]int
	handleUnknown string // "error" or "ignore"
}

// NewOneHotEncoder creates a one-hot encoder
func NewOneHotEncoder() *OneHotEncoder {
	return &OneHotEncoder{
		categories:    make([]string, 0),
		categoryMap:   make(map[string]int),
		handleUnknown: "ignore",
	}
}

// SetHandleUnknown sets behavior for unknown categories
func (e *OneHotEncoder) SetHandleUnknown(mode string) {
	e.handleUnknown = mode
}

// Fit learns categories from data
func (e *OneHotEncoder) Fit(categories []string) {
	e.categories = make([]string, 0)
	e.categoryMap = make(map[string]int)

	for _, cat := range categories {
		if _, exists := e.categoryMap[cat]; !exists {
			e.categoryMap[cat] = len(e.categories)
			e.categories = append(e.categories, cat)
		}
	}
}

// Transform encodes a single category to one-hot vector
func (e *OneHotEncoder) Transform(category string) []float32 {
	result := make([]float32, len(e.categories))

	if idx, exists := e.categoryMap[category]; exists {
		result[idx] = 1.0
	}
	// If unknown and mode is "ignore", returns all zeros

	return result
}

// TransformBatch encodes multiple categories
func (e *OneHotEncoder) TransformBatch(categories []string) [][]float32 {
	result := make([][]float32, len(categories))
	for i, cat := range categories {
		result[i] = e.Transform(cat)
	}
	return result
}

// InverseTransform decodes one-hot vector back to category
func (e *OneHotEncoder) InverseTransform(encoded []float32) string {
	for i, v := range encoded {
		if v == 1.0 && i < len(e.categories) {
			return e.categories[i]
		}
	}
	return ""
}

// GetCategories returns all known categories
func (e *OneHotEncoder) GetCategories() []string {
	return e.categories
}

// NumCategories returns number of categories
func (e *OneHotEncoder) NumCategories() int {
	return len(e.categories)
}

// LabelEncoder encodes categories as integers
type LabelEncoder struct {
	categories  []string
	labelMap    map[string]int
	inverseMap  map[int]string
}

// NewLabelEncoder creates a label encoder
func NewLabelEncoder() *LabelEncoder {
	return &LabelEncoder{
		categories: make([]string, 0),
		labelMap:   make(map[string]int),
		inverseMap: make(map[int]string),
	}
}

// Fit learns categories from data
func (e *LabelEncoder) Fit(categories []string) {
	e.categories = make([]string, 0)
	e.labelMap = make(map[string]int)
	e.inverseMap = make(map[int]string)

	for _, cat := range categories {
		if _, exists := e.labelMap[cat]; !exists {
			label := len(e.categories)
			e.labelMap[cat] = label
			e.inverseMap[label] = cat
			e.categories = append(e.categories, cat)
		}
	}
}

// Transform encodes a category to integer
func (e *LabelEncoder) Transform(category string) int {
	if label, exists := e.labelMap[category]; exists {
		return label
	}
	return -1 // Unknown category
}

// TransformBatch encodes multiple categories
func (e *LabelEncoder) TransformBatch(categories []string) []int {
	result := make([]int, len(categories))
	for i, cat := range categories {
		result[i] = e.Transform(cat)
	}
	return result
}

// InverseTransform decodes integer back to category
func (e *LabelEncoder) InverseTransform(label int) string {
	if cat, exists := e.inverseMap[label]; exists {
		return cat
	}
	return ""
}

// GetClasses returns all classes
func (e *LabelEncoder) GetClasses() []string {
	return e.categories
}

// TargetEncoder encodes categories based on target statistics
type TargetEncoder struct {
	categoryMeans map[string]float64
	globalMean    float64
	smoothing     float64
}

// NewTargetEncoder creates a target encoder
func NewTargetEncoder(smoothing float64) *TargetEncoder {
	return &TargetEncoder{
		categoryMeans: make(map[string]float64),
		smoothing:     smoothing,
	}
}

// Fit learns category means from data
func (e *TargetEncoder) Fit(categories []string, targets []float64) {
	if len(categories) != len(targets) {
		return
	}

	// Calculate global mean
	var sum float64
	for _, t := range targets {
		sum += t
	}
	e.globalMean = sum / float64(len(targets))

	// Calculate per-category means
	catSums := make(map[string]float64)
	catCounts := make(map[string]int)

	for i, cat := range categories {
		catSums[cat] += targets[i]
		catCounts[cat]++
	}

	for cat, catSum := range catSums {
		count := float64(catCounts[cat])
		// Smoothed mean
		e.categoryMeans[cat] = (catSum + e.smoothing*e.globalMean) / (count + e.smoothing)
	}
}

// Transform encodes a category to its target mean
func (e *TargetEncoder) Transform(category string) float64 {
	if mean, exists := e.categoryMeans[category]; exists {
		return mean
	}
	return e.globalMean
}

// TransformBatch encodes multiple categories
func (e *TargetEncoder) TransformBatch(categories []string) []float64 {
	result := make([]float64, len(categories))
	for i, cat := range categories {
		result[i] = e.Transform(cat)
	}
	return result
}

func main() {
	// One-hot encoding
	ohe := NewOneHotEncoder()
	ohe.Fit([]string{"cat", "dog", "bird"})

	fmt.Println("Categories:", ohe.GetCategories())
	fmt.Println("Encoded 'cat':", ohe.Transform("cat"))
	fmt.Println("Encoded 'dog':", ohe.Transform("dog"))
	fmt.Println("Inverse [0,1,0]:", ohe.InverseTransform([]float32{0, 1, 0}))

	// Label encoding
	le := NewLabelEncoder()
	le.Fit([]string{"red", "green", "blue"})

	fmt.Println("\\nLabel 'red':", le.Transform("red"))
	fmt.Println("Label 'green':", le.Transform("green"))
	fmt.Println("Inverse 2:", le.InverseTransform(2))
}`,

	testCode: `package main

import (
	"testing"
)

func TestOneHotEncoder(t *testing.T) {
	encoder := NewOneHotEncoder()
	encoder.Fit([]string{"cat", "dog", "bird"})

	encoded := encoder.Transform("cat")

	if len(encoded) != 3 {
		t.Fatalf("Expected 3 elements, got %d", len(encoded))
	}
	if encoded[0] != 1.0 {
		t.Error("First element should be 1")
	}
}

func TestOneHotInverse(t *testing.T) {
	encoder := NewOneHotEncoder()
	encoder.Fit([]string{"cat", "dog", "bird"})

	decoded := encoder.InverseTransform([]float32{0, 1, 0})

	if decoded != "dog" {
		t.Errorf("Expected 'dog', got '%s'", decoded)
	}
}

func TestOneHotUnknown(t *testing.T) {
	encoder := NewOneHotEncoder()
	encoder.Fit([]string{"cat", "dog"})

	encoded := encoder.Transform("fish")

	// All zeros for unknown
	for _, v := range encoded {
		if v != 0 {
			t.Error("Unknown category should be all zeros")
		}
	}
}

func TestLabelEncoder(t *testing.T) {
	encoder := NewLabelEncoder()
	encoder.Fit([]string{"red", "green", "blue"})

	if encoder.Transform("red") != 0 {
		t.Error("First category should be 0")
	}
	if encoder.Transform("green") != 1 {
		t.Error("Second category should be 1")
	}
}

func TestLabelInverse(t *testing.T) {
	encoder := NewLabelEncoder()
	encoder.Fit([]string{"red", "green", "blue"})

	decoded := encoder.InverseTransform(1)
	if decoded != "green" {
		t.Errorf("Expected 'green', got '%s'", decoded)
	}
}

func TestTargetEncoder(t *testing.T) {
	encoder := NewTargetEncoder(1.0)
	categories := []string{"a", "a", "b", "b"}
	targets := []float64{1, 2, 3, 4}

	encoder.Fit(categories, targets)

	valA := encoder.Transform("a")
	valB := encoder.Transform("b")

	if valA >= valB {
		t.Errorf("Expected a < b, got a=%f, b=%f", valA, valB)
	}
}

func TestOneHotBatch(t *testing.T) {
	encoder := NewOneHotEncoder()
	encoder.Fit([]string{"cat", "dog", "bird"})

	batch := encoder.TransformBatch([]string{"cat", "dog"})
	if len(batch) != 2 {
		t.Fatalf("Expected 2 results, got %d", len(batch))
	}
	if batch[0][0] != 1.0 {
		t.Error("First item should be cat")
	}
	if batch[1][1] != 1.0 {
		t.Error("Second item should be dog")
	}
}

func TestLabelBatch(t *testing.T) {
	encoder := NewLabelEncoder()
	encoder.Fit([]string{"a", "b", "c"})

	batch := encoder.TransformBatch([]string{"a", "b", "c"})
	if len(batch) != 3 {
		t.Fatalf("Expected 3 results, got %d", len(batch))
	}
	if batch[0] != 0 || batch[1] != 1 || batch[2] != 2 {
		t.Errorf("Expected [0,1,2], got %v", batch)
	}
}

func TestNumCategories(t *testing.T) {
	encoder := NewOneHotEncoder()
	encoder.Fit([]string{"cat", "dog", "bird", "bird"})

	if encoder.NumCategories() != 3 {
		t.Errorf("Expected 3 unique categories, got %d", encoder.NumCategories())
	}
}

func TestLabelUnknown(t *testing.T) {
	encoder := NewLabelEncoder()
	encoder.Fit([]string{"a", "b"})

	label := encoder.Transform("unknown")
	if label != -1 {
		t.Errorf("Expected -1 for unknown, got %d", label)
	}
}`,

	hint1: 'One-hot encoding creates a binary vector with 1 at the category index',
	hint2: 'Label encoding assigns sequential integers to categories',

	whyItMatters: `Categorical encoding bridges data and models:

- **Model compatibility**: ML models require numerical inputs
- **Information preservation**: Encoding captures category semantics
- **Unknown handling**: Production must handle new categories
- **Consistency**: Same encoding at training and inference

Proper encoding ensures correct model predictions.`,

	translations: {
		ru: {
			title: 'Кодирование категориальных признаков',
			description: `# Кодирование категориальных признаков

Реализуйте кодирование категориальных признаков для ML инференса в Go.

## Задача

Создайте энкодеры:
- Реализация one-hot кодирования
- Реализация label кодирования
- Обработка неизвестных категорий
- Поддержка обратных преобразований

## Пример

\`\`\`go
encoder := NewOneHotEncoder()
encoder.Fit(categories)
encoded := encoder.Transform("cat")
// Returns: [1, 0, 0] for categories ["cat", "dog", "bird"]
\`\`\``,
			hint1: 'One-hot кодирование создает бинарный вектор с 1 на индексе категории',
			hint2: 'Label кодирование присваивает последовательные целые числа категориям',
			whyItMatters: `Категориальное кодирование связывает данные и модели:

- **Совместимость модели**: ML модели требуют численных входов
- **Сохранение информации**: Кодирование захватывает семантику категорий
- **Обработка неизвестного**: Продакшен должен обрабатывать новые категории
- **Консистентность**: Одинаковое кодирование при обучении и инференсе`,
		},
		uz: {
			title: 'Kategorik practixsh',
			description: `# Kategorik practixsh

Go da ML inference uchun kategorik practixshni amalga oshiring.

## Topshiriq

Enkoderlarni yarating:
- One-hot practixshni amalga oshirish
- Label practixshni amalga oshirish
- Noma'lum kategoriyalarni qayta ishlash
- Teskari o'zgartirishlarni qo'llab-quvvatlash

## Misol

\`\`\`go
encoder := NewOneHotEncoder()
encoder.Fit(categories)
encoded := encoder.Transform("cat")
// Returns: [1, 0, 0] for categories ["cat", "dog", "bird"]
\`\`\``,
			hint1: "One-hot practixsh kategoriya indeksida 1 bilan binary vektor yaratadi",
			hint2: "Label practixsh kategoriyalarga ketma-ket butun sonlar tayinlaydi",
			whyItMatters: `Kategorik practixsh ma'lumotlar va modellarni bog'laydi:

- **Model muvofiqligi**: ML modellar raqamli kirishlarni talab qiladi
- **Ma'lumotni saqlash**: Practixsh kategoriya semantikasini ushlaydi
- **Noma'lumni qayta ishlash**: Ishlab chiqarish yangi kategoriyalarni qayta ishlashi kerak
- **Izchillik**: O'qitish va inference da bir xil practixsh`,
		},
	},
};

export default task;
