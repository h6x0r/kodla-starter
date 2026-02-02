import { Task } from '../../../../types';

export const task: Task = {
    slug: 'go-generics-custom-constraint',
    title: 'Custom Constraints',
    difficulty: 'medium',
    tags: ['go', 'generics', 'constraints', 'interfaces'],
    estimatedTime: '20m',
    isPremium: false,
    youtubeUrl: '',
    description: `Define custom constraint interfaces to express complex type requirements.

Custom constraints allow you to specify exactly what operations a type must support. You can combine multiple constraints, require specific methods, or limit to certain types.

**Task:** Create a custom constraint for numeric types that support ordering, and implement a generic \`Clamp\` function that restricts a value to be within a min-max range.

**Requirements:**
- Define a \`Numeric\` constraint that includes integer and float types
- The constraint should support comparison with < and > operators
- Implement \`Clamp[T Numeric](value, min, max T) T\` function
- If value < min, return min; if value > max, return max; otherwise return value

**Example Usage:**
\`\`\`go
fmt.Println(Clamp(5, 0, 10))     // Output: 5
fmt.Println(Clamp(-5, 0, 10))    // Output: 0
fmt.Println(Clamp(15, 0, 10))    // Output: 10
fmt.Println(Clamp(7.5, 0.0, 5.0)) // Output: 5.0
\`\`\``,
    initialCode: `package generics

// TODO: Define a custom Numeric constraint
// It should include integer and float types, and support ordering
type Numeric interface {
    // Add type constraints here using type union syntax
    // Example: ~int | ~float64
}

// TODO: Implement Clamp function to restrict a value within min and max bounds
func Clamp[T Numeric](value, min, max T) T {
    panic("TODO: implement Clamp function")
}`,
    solutionCode: `package generics

// Numeric constraint includes all numeric types that can be ordered
type Numeric interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64 |
	~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uintptr |
	~float32 | ~float64
}

// Clamp restricts a value to be within the specified min and max bounds
func Clamp[T Numeric](value, min, max T) T {
    if value < min {
        return min
    }
    if value > max {
        return max
    }
    return value
}`,
    testCode: `package generics

import (
	"testing"
)

func Test1(t *testing.T) {
	// Test value within range
	result := Clamp(5, 0, 10)
	expected := 5
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test2(t *testing.T) {
	// Test value below min
	result := Clamp(-5, 0, 10)
	expected := 0
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test3(t *testing.T) {
	// Test value above max
	result := Clamp(15, 0, 10)
	expected := 10
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test4(t *testing.T) {
	// Test with floats
	result := Clamp(7.5, 0.0, 5.0)
	expected := 5.0
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test5(t *testing.T) {
	// Test value equals min
	result := Clamp(0, 0, 10)
	expected := 0
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test6(t *testing.T) {
	// Test value equals max
	result := Clamp(10, 0, 10)
	expected := 10
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test7(t *testing.T) {
	// Test negative range
	result := Clamp(-15, -10, -5)
	expected := -10
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test8(t *testing.T) {
	// Test float within range
	result := Clamp(3.14, 0.0, 10.0)
	expected := 3.14
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test9(t *testing.T) {
	// Test negative float below min
	result := Clamp(-7.5, -5.0, 5.0)
	expected := -5.0
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test10(t *testing.T) {
	// Test with same min and max
	result := Clamp(5, 3, 3)
	expected := 3
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}`,
    hint1: `Use the \`constraints.Integer\` and \`constraints.Float\` from the constraints package and combine them with \`|\`.`,
    hint2: `Compare the value with min and max using if statements. Return the appropriate bound if the value is out of range.`,
    whyItMatters: `Custom constraints give you precise control over generic type requirements. This allows you to write functions that work with specific type families while maintaining type safety and preventing invalid operations.

**Production Pattern:**

\`\`\`go
// Custom constraint for numeric types
type Numeric interface {
    constraints.Integer | constraints.Float
}

func Clamp[T Numeric](value, min, max T) T {
    if value < min { return min }
    if value > max { return max }
    return value
}

// Usage
Clamp(15, 0, 10)      // 10 (clamped to max)
Clamp(-5, 0, 10)      // 0 (clamped to min)
Clamp(5, 0, 10)       // 5 (within range)
Clamp(7.5, 0.0, 5.0)  // 5.0
\`\`\`

**Practical Benefits:**

1. **Precise control**: Constraint only to needed types
2. **Combining constraints**: Combining Integer and Float
3. **Readability**: Clear name Numeric instead of long enumeration
4. **Reusability**: Constraint can be used in multiple functions`,
    order: 4,
    translations: {
        ru: {
            title: 'Пользовательские ограничения',
            solutionCode: `package generics

// Numeric ограничение включает все числовые типы, которые можно упорядочить
type Numeric interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64 |
	~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uintptr |
	~float32 | ~float64
}

// Clamp ограничивает значение в пределах указанных минимальных и максимальных границ
func Clamp[T Numeric](value, min, max T) T {
    if value < min {
        return min
    }
    if value > max {
        return max
    }
    return value
}`,
            description: `Определите пользовательские интерфейсы ограничений для выражения сложных требований к типам.

Пользовательские ограничения позволяют точно указать, какие операции должен поддерживать тип. Вы можете объединять несколько ограничений, требовать конкретные методы или ограничивать определенными типами.

**Задача:** Создайте пользовательское ограничение для числовых типов, поддерживающих упорядочение, и реализуйте обобщенную функцию \`Clamp\`, которая ограничивает значение в диапазоне min-max.

**Требования:**
- Определите ограничение \`Numeric\`, которое включает общие числовые типы
- Ограничение также должно включать интерфейс \`constraints.Ordered\`
- Реализуйте функцию \`Clamp[T Numeric](value, min, max T) T\`
- Если value < min, верните min; если value > max, верните max; иначе верните value

**Пример использования:**
\`\`\`go
fmt.Println(Clamp(5, 0, 10))     // Вывод: 5
fmt.Println(Clamp(-5, 0, 10))    // Вывод: 0
fmt.Println(Clamp(15, 0, 10))    // Вывод: 10
fmt.Println(Clamp(7.5, 0.0, 5.0)) // Вывод: 5.0
\`\`\``,
            hint1: `Используйте \`constraints.Integer\` и \`constraints.Float\` из пакета constraints и объедините их с помощью \`|\`.`,
            hint2: `Сравните значение с min и max с помощью операторов if. Верните соответствующую границу, если значение выходит за пределы диапазона.`,
            whyItMatters: `Пользовательские ограничения дают вам точный контроль над требованиями к обобщенным типам. Это позволяет писать функции, которые работают с определенными семействами типов, сохраняя безопасность типов и предотвращая недопустимые операции.

**Продакшен паттерн:**

\`\`\`go
// Пользовательское ограничение для числовых типов
type Numeric interface {
    constraints.Integer | constraints.Float
}

func Clamp[T Numeric](value, min, max T) T {
    if value < min { return min }
    if value > max { return max }
    return value
}

// Использование
Clamp(15, 0, 10)      // 10 (ограничено max)
Clamp(-5, 0, 10)      // 0 (ограничено min)
Clamp(5, 0, 10)       // 5 (в пределах диапазона)
Clamp(7.5, 0.0, 5.0)  // 5.0
\`\`\`

**Практические преимущества:**

1. **Точный контроль**: Ограничение только нужными типами
2. **Комбинирование ограничений**: Объединение Integer и Float
3. **Читаемость**: Понятное имя Numeric вместо длинного перечисления
4. **Переиспользуемость**: Ограничение можно использовать в нескольких функциях`
        },
        uz: {
            title: 'Maxsus cheklovlar',
            solutionCode: `package generics

// Numeric cheklovi tartiblanishi mumkin bo'lgan barcha raqamli tiplarni o'z ichiga oladi
type Numeric interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64 |
	~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uintptr |
	~float32 | ~float64
}

// Clamp qiymatni belgilangan minimal va maksimal chegaralar ichida cheklaydi
func Clamp[T Numeric](value, min, max T) T {
    if value < min {
        return min
    }
    if value > max {
        return max
    }
    return value
}`,
            description: `Murakkab tip talablarini ifodalash uchun maxsus cheklov interfeyslarini aniqlang.

Maxsus cheklovlar tip qaysi operatsiyalarni qo'llab-quvvatlashi kerakligini aniq ko'rsatish imkonini beradi. Siz bir nechta cheklovlarni birlashtirishingiz, ma'lum metodlarni talab qilishingiz yoki ma'lum tiplariga cheklashingiz mumkin.

**Vazifa:** Tartibni qo'llab-quvvatlaydigan raqamli tiplar uchun maxsus cheklov yarating va qiymatni min-max diapazoni ichida cheklaydigan umumiy \`Clamp\` funksiyasini amalga oshiring.

**Talablar:**
- Umumiy raqamli tiplarni o'z ichiga olgan \`Numeric\` cheklovini aniqlang
- Cheklov \`constraints.Ordered\` interfeysini ham o'z ichiga olishi kerak
- \`Clamp[T Numeric](value, min, max T) T\` funksiyasini amalga oshiring
- Agar value < min bo'lsa, min qaytaring; agar value > max bo'lsa, max qaytaring; aks holda value qaytaring

**Foydalanish misoli:**
\`\`\`go
fmt.Println(Clamp(5, 0, 10))     // Natija: 5
fmt.Println(Clamp(-5, 0, 10))    // Natija: 0
fmt.Println(Clamp(15, 0, 10))    // Natija: 10
fmt.Println(Clamp(7.5, 0.0, 5.0)) // Natija: 5.0
\`\`\``,
            hint1: `Constraints paketidan \`constraints.Integer\` va \`constraints.Float\` dan foydalaning va ularni \`|\` bilan birlashtiring.`,
            hint2: `If operatorlari yordamida qiymatni min va max bilan taqqoslang. Agar qiymat diapazondan chiqib ketsa, tegishli chegarani qaytaring.`,
            whyItMatters: `Maxsus cheklovlar umumiy tip talablari ustidan aniq nazoratni beradi. Bu tip xavfsizligini saqlab qolish va noto'g'ri operatsiyalarning oldini olish bilan birga ma'lum tip oilalari bilan ishlaydigan funksiyalar yozish imkonini beradi.

**Ishlab chiqarish patterni:**

\`\`\`go
// Raqamli tiplar uchun maxsus cheklov
type Numeric interface {
    constraints.Integer | constraints.Float
}

func Clamp[T Numeric](value, min, max T) T {
    if value < min { return min }
    if value > max { return max }
    return value
}

// Foydalanish
Clamp(15, 0, 10)      // 10 (max bilan cheklangan)
Clamp(-5, 0, 10)      // 0 (min bilan cheklangan)
Clamp(5, 0, 10)       // 5 (diapazon ichida)
Clamp(7.5, 0.0, 5.0)  // 5.0
\`\`\`

**Amaliy foydalari:**

1. **Aniq nazorat**: Faqat kerakli tiplar bilan cheklash
2. **Cheklovlarni birlashtirish**: Integer va Float ni birlashtirish
3. **O'qilishi**: Uzun sanash o'rniga tushunarli Numeric nomi
4. **Qayta foydalanish**: Cheklovni bir nechta funksiyalarda ishlatish mumkin`
        }
    }
};

export default task;
