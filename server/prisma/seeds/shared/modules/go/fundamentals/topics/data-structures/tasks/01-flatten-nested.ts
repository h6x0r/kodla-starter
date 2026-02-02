import { Task } from "../../../../types";

export const task: Task = {
  slug: "go-fundamentals-flatten-nested",
  title: "Flatten Nested Slices",
  difficulty: "medium",
  tags: ["go", "recursion", "slices", "type-switch"],
  estimatedTime: "20m",
  isPremium: false,
  youtubeUrl: "",
  description: `Implement **FlattenUnknown** that flattens nested slices of unknown depth into a flat slice of integers.

**Requirements:**
1. Create function \`FlattenUnknown(input []any) []int\`
2. Handle input containing mix of:
   2.1. Direct \`int\` values
   2.2. Nested \`[]any\` slices of arbitrary depth
3. Preserve order of numbers as they appear in structure
4. Return nil for empty input
5. Use type switch to differentiate between int and []any

**Example:**
\`\`\`go
result := FlattenUnknown([]any{1, []any{2, 3}, []any{4, []any{5, 6}}})
// result = []int{1, 2, 3, 4, 5, 6}
\`\`\``,
  initialCode: `package main

// TODO: Implement FlattenUnknown
func FlattenUnknown(input []any) []int {
	// TODO: Implement
}`,
  solutionCode: `package main

func FlattenUnknown(input []any) []int {
	if len(input) == 0 {                                    // Handle empty input
		return nil                                      // Return nil for empty
	}
	out := make([]int, 0, len(input))                       // Result slice
	var flatten func(items []any)                           // Recursive helper
	flatten = func(items []any) {
		for _, item := range items {                    // Iterate items
			switch val := item.(type) {             // Type switch
			case int:                               // Direct integer
				out = append(out, val)          // Add to result
			case []any:                             // Nested slice
				flatten(val)                    // Recurse into nested
			}
		}
	}
	flatten(input)                                          // Start flattening
	return out                                              // Return result
}`,
  testCode: `package main

import (
	"reflect"
	"testing"
)

func Test1(t *testing.T) {
	// Basic mixed nested structure
	result := FlattenUnknown([]any{1, []any{2, 3}, []any{4, []any{5, 6}}})
	expected := []int{1, 2, 3, 4, 5, 6}
	if !reflect.DeepEqual(result, expected) {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test2(t *testing.T) {
	// Only integers, no nesting
	result := FlattenUnknown([]any{1, 2, 3, 4, 5})
	expected := []int{1, 2, 3, 4, 5}
	if !reflect.DeepEqual(result, expected) {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test3(t *testing.T) {
	// Empty input
	result := FlattenUnknown([]any{})
	if result != nil {
		t.Errorf("expected nil, got %v", result)
	}
}

func Test4(t *testing.T) {
	// Deep nesting
	result := FlattenUnknown([]any{[]any{[]any{[]any{1}}}})
	expected := []int{1}
	if !reflect.DeepEqual(result, expected) {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test5(t *testing.T) {
	// Single integer
	result := FlattenUnknown([]any{42})
	expected := []int{42}
	if !reflect.DeepEqual(result, expected) {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test6(t *testing.T) {
	// Two nested arrays
	result := FlattenUnknown([]any{[]any{1, 2}, []any{3, 4}})
	expected := []int{1, 2, 3, 4}
	if !reflect.DeepEqual(result, expected) {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test7(t *testing.T) {
	// Only nested arrays
	result := FlattenUnknown([]any{[]any{[]any{1, 2}}, []any{[]any{3, 4}}})
	expected := []int{1, 2, 3, 4}
	if !reflect.DeepEqual(result, expected) {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test8(t *testing.T) {
	// All elements in one nested array
	result := FlattenUnknown([]any{[]any{1, 2, 3, 4, 5}})
	expected := []int{1, 2, 3, 4, 5}
	if !reflect.DeepEqual(result, expected) {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test9(t *testing.T) {
	// Alternating ints and arrays
	result := FlattenUnknown([]any{1, []any{2}, 3, []any{4}, 5})
	expected := []int{1, 2, 3, 4, 5}
	if !reflect.DeepEqual(result, expected) {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test10(t *testing.T) {
	// Large numbers
	result := FlattenUnknown([]any{1000000, []any{2000000, []any{3000000}}})
	expected := []int{1000000, 2000000, 3000000}
	if !reflect.DeepEqual(result, expected) {
		t.Errorf("expected %v, got %v", expected, result)
	}
}`,
  hint1: `Use a type switch to check if element is int or []any, then handle each case appropriately.`,
  hint2: `Create a working queue: append nested slices to the queue and continue processing iteratively to handle arbitrary depth.`,
  whyItMatters: `FlattenUnknown demonstrates recursive data structure handling and type assertions, essential for processing unknown nested data.

**Why Flatten Nested:**
- **Dynamic Data:** Handle JSON/config with unknown nesting
- **Type Safety:** Use type switch instead of reflection
- **Iterative Approach:** More stack-safe than recursion for deep nesting
- **Generic Processing:** Process heterogeneous data structures

**Production Pattern:**
\`\`\`go
// Parse nested JSON configuration
func ParseNestedConfig(data map[string]any) []int {
    var values []any
    for _, v := range data {
        values = append(values, v)
    }
    return FlattenUnknown(values)
}

// Process nested API responses
func ExtractIDs(response any) []int {
    switch v := response.(type) {
    case map[string]any:
        if ids, ok := v["ids"]; ok {
            return FlattenUnknown([]any{ids})
        }
    case []any:
        return FlattenUnknown(v)
    }
    return nil
}

// Recursive alternative (less stack-safe)
func FlattenRecursive(input []any) []int {
    if len(input) == 0 {
        return nil
    }
    out := make([]int, 0, len(input))
    for _, v := range input {
        switch val := v.(type) {
        case int:
            out = append(out, val)
        case []any:
            out = append(out, FlattenRecursive(val)...)  // Recursive call
        }
    }
    return out
}

// Handle deeply nested structures
type NestedData struct {
    Values []any
}

func (n *NestedData) ExtractInts() []int {
    return FlattenUnknown(n.Values)
}
\`\`\`

**Real-World Benefits:**
- **Config Parsing:** Extract values from nested config files
- **API Processing:** Handle variable-depth API responses
- **Data Mining:** Extract specific types from complex structures
- **Stack Safety:** Iterative approach prevents stack overflow

**Common Use Cases:**
- **Configuration Files:** YAML/JSON with nested arrays
- **API Responses:** Variable depth response structures
- **Tree Flattening:** Convert tree structures to flat lists
- **Data Extraction:** Pull specific types from mixed structures

Without proper nested data handling, you'd need custom parsers for each nesting level or risk stack overflow with naive recursion.`,
  order: 0,
  translations: {
    ru: {
      title: "Развёртывание вложенных срезов",
      description: `Реализуйте **FlattenUnknown**, который разворачивает вложенные срезы неизвестной глубины в плоский срез целых чисел.

**Требования:**
1. Создайте функцию \`FlattenUnknown(input []any) []int\`
2. Обработайте входные данные, содержащие:
   2.1. Прямые значения \`int\`
   2.2. Вложенные срезы \`[]any\` произвольной глубины
3. Сохраните порядок чисел как они появляются в структуре
4. Верните nil для пустого ввода
5. Используйте type switch для различения int и []any

**Пример:**
\`\`\`go
result := FlattenUnknown([]any{1, []any{2, 3}, []any{4, []any{5, 6}}})
// result = []int{1, 2, 3, 4, 5, 6}
\`\`\``,
      hint1: `Используйте type switch для проверки является ли элемент int или []any, затем обработайте каждый случай соответственно.`,
      hint2: `Создайте рабочую очередь: добавляйте вложенные срезы в очередь и продолжайте обработку итеративно для обработки произвольной глубины.`,
      whyItMatters: `FlattenUnknown демонстрирует обработку рекурсивных структур данных и утверждения типов, необходимые для обработки неизвестных вложенных данных.

**Почему Flatten Nested:**
- **Динамические данные:** Обработка JSON/конфигураций с неизвестной вложенностью
- **Безопасность типов:** Использование type switch вместо reflection
- **Итеративный подход:** Более безопасен для стека чем рекурсия для глубокой вложенности
- **Обобщённая обработка:** Обработка гетерогенных структур данных

**Продакшен паттерн:**
\`\`\`go
// Парсинг вложенной JSON конфигурации
func ParseNestedConfig(data map[string]any) []int {
    var values []any
    for _, v := range data {
        values = append(values, v)
    }
    return FlattenUnknown(values)
}

// Обработка вложенных API ответов
func ExtractIDs(response any) []int {
    switch v := response.(type) {
    case map[string]any:
        if ids, ok := v["ids"]; ok {
            return FlattenUnknown([]any{ids})
        }
    case []any:
        return FlattenUnknown(v)
    }
    return nil
}

// Рекурсивная альтернатива (менее безопасна для стека)
func FlattenRecursive(input []any) []int {
    if len(input) == 0 {
        return nil
    }
    out := make([]int, 0, len(input))
    for _, v := range input {
        switch val := v.(type) {
        case int:
            out = append(out, val)
        case []any:
            out = append(out, FlattenRecursive(val)...)  // Рекурсивный вызов
        }
    }
    return out
}

// Обработка глубоко вложенных структур
type NestedData struct {
    Values []any
}

func (n *NestedData) ExtractInts() []int {
    return FlattenUnknown(n.Values)
}
\`\`\`

**Практические преимущества:**
- **Парсинг конфигураций:** Извлечение значений из вложенных конфигурационных файлов
- **Обработка API:** Обработка ответов API с переменной глубиной
- **Data Mining:** Извлечение специфических типов из сложных структур
- **Безопасность стека:** Итеративный подход предотвращает переполнение стека

**Обычные сценарии использования:**
- **Конфигурационные файлы:** YAML/JSON с вложенными массивами
- **API ответы:** Структуры ответов переменной глубины
- **Выпрямление деревьев:** Преобразование древовидных структур в плоские списки
- **Извлечение данных:** Выделение специфических типов из смешанных структур

Без правильной обработки вложенных данных вам потребовались бы пользовательские парсеры для каждого уровня вложенности или риск переполнения стека с наивной рекурсией.`,
      solutionCode: `package main

func FlattenUnknown(input []any) []int {
	if len(input) == 0 {                                    // Обработка пустого ввода
		return nil                                      // Вернуть nil для пустого
	}
	out := make([]int, 0, len(input))                       // Срез результата
	var flatten func(items []any)                           // Рекурсивный хелпер
	flatten = func(items []any) {
		for _, item := range items {                    // Итерация элементов
			switch val := item.(type) {             // Type switch
			case int:                               // Прямое целое число
				out = append(out, val)          // Добавить в результат
			case []any:                             // Вложенный срез
				flatten(val)                    // Рекурсия во вложенный
			}
		}
	}
	flatten(input)                                          // Начать развёртывание
	return out                                              // Вернуть результат
}`,
    },
    uz: {
      title: "Ichma-ich massivlarni tekislash",
      description: `Noma'lum chuqurlikdagi ichma-ich massivlarni tekis butun sonlar massiviga aylantiradigan **FlattenUnknown** ni amalga oshiring.

**Talablar:**
1. \`FlattenUnknown(input []any) []int\` funksiyasini yarating
2. Quyidagilarni o'z ichiga olgan kirishni ishlang:
   2.1. To'g'ridan-to'g'ri \`int\` qiymatlari
   2.2. Ixtiyoriy chuqurlikdagi ichma-ich \`[]any\` massivlar
3. Tuzilmada paydo bo'lishicha raqamlar tartibini saqlang
4. Bo'sh kirish uchun nil qaytaring
5. int va []any ni farqlash uchun type switch dan foydalaning

**Misol:**
\`\`\`go
result := FlattenUnknown([]any{1, []any{2, 3}, []any{4, []any{5, 6}}})
// result = []int{1, 2, 3, 4, 5, 6}
\`\`\``,
      hint1: `Element int yoki []any ekanligini tekshirish uchun type switch dan foydalaning, keyin har bir holatni tegishli tarzda ishlang.`,
      hint2: `Ish navbatini yarating: ichki massivlarni navbatga qo'shing va ixtiyoriy chuqurlikni qayta ishlash uchun iterativ ravishda davom eting.`,
      whyItMatters: `FlattenUnknown rekursiv ma'lumotlar strukturasini va turi tasdiqlarini qayta ishlashni ko'rsatadi, noma'lum ichki ma'lumotlarni qayta ishlash uchun zarur.

**Nima uchun Flatten Nested:**
- **Dinamik ma'lumotlar:** Noma'lum joylashish bilan JSON/config ni qayta ishlash
- **Turi xavfsizligi:** Reflection o'rniga type switch dan foydalanish
- **Iterativ yondashuv:** Chuqur joylashish uchun rekursiyadan ko'ra stek-xavfsizroq
- **Umumiy qayta ishlash:** Heterojen ma'lumotlar tuzilmalarini qayta ishlash

**Ishlab chiqarish patterni:**
\`\`\`go
// Ichma-ich JSON konfiguratsiyasini tahlil qilish
func ParseNestedConfig(data map[string]any) []int {
    var values []any
    for _, v := range data {
        values = append(values, v)
    }
    return FlattenUnknown(values)
}

// Ichma-ich API javoblarini qayta ishlash
func ExtractIDs(response any) []int {
    switch v := response.(type) {
    case map[string]any:
        if ids, ok := v["ids"]; ok {
            return FlattenUnknown([]any{ids})
        }
    case []any:
        return FlattenUnknown(v)
    }
    return nil
}

// Rekursiv alternativ (kamroq stek-xavfsiz)
func FlattenRecursive(input []any) []int {
    if len(input) == 0 {
        return nil
    }
    out := make([]int, 0, len(input))
    for _, v := range input {
        switch val := v.(type) {
        case int:
            out = append(out, val)
        case []any:
            out = append(out, FlattenRecursive(val)...)  // Rekursiv chaqiruv
        }
    }
    return out
}

// Chuqur joylashgan tuzilmalarni qayta ishlash
type NestedData struct {
    Values []any
}

func (n *NestedData) ExtractInts() []int {
    return FlattenUnknown(n.Values)
}
\`\`\`

**Amaliy foydalari:**
- **Config tahlili:** Ichma-ich config fayllaridan qiymatlarni ajratib olish
- **API qayta ishlash:** O'zgaruvchan chuqurlikdagi API javoblarini qayta ishlash
- **Ma'lumot qazib olish:** Murakkab tuzilmalardan aniq turlarni ajratib olish
- **Stek xavfsizligi:** Iterativ yondashuv stek to'lib ketishining oldini oladi

**Umumiy foydalanish holatlari:**
- **Konfiguratsiya fayllari:** Ichma-ich massivlar bilan YAML/JSON
- **API javoblari:** O'zgaruvchan chuqurlikdagi javob tuzilmalari
- **Daraxtni tekislash:** Daraxt tuzilmalarini tekis ro'yxatlarga aylantirish
- **Ma'lumot ajratib olish:** Aralash tuzilmalardan aniq turlarni olish

To'g'ri ichma-ich ma'lumotlarni qayta ishlashsiz, har bir joylashish darajasi uchun maxsus parserlar kerak bo'ladi yoki oddiy rekursiya bilan stek to'lib ketish xavfi bor.`,
      solutionCode: `package main

func FlattenUnknown(input []any) []int {
	if len(input) == 0 {                                    // Bo'sh kirishni ishlash
		return nil                                      // Bo'sh uchun nil qaytarish
	}
	out := make([]int, 0, len(input))                       // Natija slayi
	var flatten func(items []any)                           // Rekursiv yordamchi
	flatten = func(items []any) {
		for _, item := range items {                    // Elementlarni iteratsiya
			switch val := item.(type) {             // Type switch
			case int:                               // To'g'ridan-to'g'ri butun son
				out = append(out, val)          // Natijaga qo'shish
			case []any:                             // Ichki massiv
				flatten(val)                    // Ichki massivga rekursiya
			}
		}
	}
	flatten(input)                                          // Tekislashni boshlash
	return out                                              // Natijani qaytarish
}`,
    },
  },
};

export default task;
