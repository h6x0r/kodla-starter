import { Task } from '../../../../types';

export const task: Task = {
    slug: 'go-generics-generic-function',
    title: 'Generic Function Basics',
    difficulty: 'easy',
    tags: ['go', 'generics', 'type-parameters', 'functions'],
    estimatedTime: '15m',
    isPremium: false,
    youtubeUrl: '',
    description: `Learn to write your first generic function in Go using type parameters.

Generic functions allow you to write a single function that works with multiple types. This is especially useful for utility functions that perform the same logic regardless of the data type.

**Task:** Implement a generic \`Min\` function that takes two values of the same type and returns the smaller one. The type must be comparable using the \`<\` operator.

**Requirements:**
- Use type parameter \`T\` with \`Ordered\` constraint (defined below)
- Compare the two values and return the smaller one
- The function should work with int, float64, string, etc.

**Example Usage:**
\`\`\`go
fmt.Println(Min(5, 3))       // Output: 3
fmt.Println(Min(2.5, 7.8))   // Output: 2.5
fmt.Println(Min("b", "a"))   // Output: "a"
\`\`\``,
    initialCode: `package generics

// Ordered is a constraint that permits any ordered type
type Ordered interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64 |
	~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uintptr |
	~float32 | ~float64 |
	~string
}

// TODO: Implement a generic Min function that returns the smaller of two values
func Min[T Ordered](a, b T) T {
    panic("TODO: implement Min function")
}`,
    solutionCode: `package generics

// Ordered is a constraint that permits any ordered type
type Ordered interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64 |
	~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uintptr |
	~float32 | ~float64 |
	~string
}

// Min returns the smaller of two values
func Min[T Ordered](a, b T) T {
    if a < b {
        return a
    }
    return b
}`,
    testCode: `package generics

import (
	"testing"
)

func Test1(t *testing.T) {
	// Test with integers where first is smaller
	result := Min(3, 5)
	expected := 3
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test2(t *testing.T) {
	// Test with integers where second is smaller
	result := Min(10, 2)
	expected := 2
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test3(t *testing.T) {
	// Test with equal integers
	result := Min(7, 7)
	expected := 7
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test4(t *testing.T) {
	// Test with floats
	result := Min(2.5, 7.8)
	expected := 2.5
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test5(t *testing.T) {
	// Test with negative floats
	result := Min(-3.14, -2.71)
	expected := -3.14
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test6(t *testing.T) {
	// Test with strings
	result := Min("b", "a")
	expected := "a"
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test7(t *testing.T) {
	// Test with longer strings
	result := Min("zebra", "apple")
	expected := "apple"
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test8(t *testing.T) {
	// Test with zero values
	result := Min(0, 5)
	expected := 0
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test9(t *testing.T) {
	// Test with negative integers
	result := Min(-5, -10)
	expected := -10
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func Test10(t *testing.T) {
	// Test with large numbers
	result := Min(1000000, 999999)
	expected := 999999
	if result != expected {
		t.Errorf("expected %v, got %v", expected, result)
	}
}`,
    hint1: `Use an if statement to compare the two values with the \`<\` operator.`,
    hint2: `Return \`a\` if it's less than \`b\`, otherwise return \`b\`.`,
    whyItMatters: `Generic functions eliminate code duplication by allowing a single function to work with multiple types. This is the foundation of reusable, type-safe code in modern Go.

**Production Pattern:**

\`\`\`go
// WITHOUT generics: Code duplication for each type
func MaxInt(a, b int) int {
    if a > b { return a }
    return b
}

func MaxFloat64(a, b float64) float64 {
    if a > b { return a }
    return b
}

func MaxString(a, b string) string {
    if a > b { return a }
    return b
}

// WITH generics: One function for all types
func Max[T constraints.Ordered](a, b T) T {
    if a > b { return a }
    return b
}

// Usage
maxInt := Max(10, 20)        // T = int
maxFloat := Max(3.14, 2.71)  // T = float64
maxStr := Max("abc", "xyz")  // T = string
\`\`\`

**Practical Benefits:**

1. **Reduced Code Duplication**: One function instead of multiple type-specific versions
2. **Type Safety**: Type errors are caught at compile time, not at runtime
3. **Performance**: No runtime overhead from reflection or type assertions
4. **Readability**: Less code to maintain, cleaner codebase`,
    order: 0,
    translations: {
        ru: {
            title: 'Основы обобщённых функций',
            solutionCode: `package generics

// Ordered is a constraint that permits any ordered type
type Ordered interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64 |
	~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uintptr |
	~float32 | ~float64 |
	~string
}

// Min возвращает меньшее из двух значений
func Min[T Ordered](a, b T) T {
    if a < b {
        return a
    }
    return b
}`,
            description: `Научитесь писать свою первую обобщенную функцию в Go, используя параметры типа.

Обобщенные функции позволяют написать одну функцию, которая работает с несколькими типами. Это особенно полезно для утилитарных функций, которые выполняют одну и ту же логику независимо от типа данных.

**Задача:** Реализуйте обобщенную функцию \`Min\`, которая принимает два значения одного типа и возвращает меньшее. Тип должен быть сравнимым с помощью оператора \`<\`.

**Требования:**
- Используйте параметр типа \`T\` с ограничением \`constraints.Ordered\`
- Импортируйте пакет \`"golang.org/x/exp/constraints"\`
- Сравните два значения и верните меньшее
- Функция должна работать с int, float64, string и т.д.

**Пример использования:**
\`\`\`go
fmt.Println(Min(5, 3))       // Вывод: 3
fmt.Println(Min(2.5, 7.8))   // Вывод: 2.5
fmt.Println(Min("b", "a"))   // Вывод: "a"
\`\`\``,
            hint1: `Используйте оператор if для сравнения двух значений с помощью оператора \`<\`.`,
            hint2: `Верните \`a\`, если оно меньше \`b\`, иначе верните \`b\`.`,
            whyItMatters: `Обобщенные функции устраняют дублирование кода, позволяя одной функции работать с несколькими типами. Это основа переиспользуемого, типобезопасного кода в современном Go.

**Продакшен паттерн:**

\`\`\`go
// БЕЗ generics: Дублирование кода для каждого типа
func MaxInt(a, b int) int {
    if a > b { return a }
    return b
}

func MaxFloat64(a, b float64) float64 {
    if a > b { return a }
    return b
}

func MaxString(a, b string) string {
    if a > b { return a }
    return b
}

// С generics: Одна функция для всех типов
func Max[T constraints.Ordered](a, b T) T {
    if a > b { return a }
    return b
}

// Использование
maxInt := Max(10, 20)        // T = int
maxFloat := Max(3.14, 2.71)  // T = float64
maxStr := Max("abc", "xyz")  // T = string
\`\`\`

**Практические преимущества:**

1. **Сокращение дублирования кода**: Одна функция вместо множества типоспецифичных версий
2. **Типобезопасность**: Ошибки типов обнаруживаются на этапе компиляции, не во время выполнения
3. **Производительность**: Нет накладных расходов на runtime reflection или type assertions
4. **Читаемость**: Меньше кода для поддержки, более чистая кодовая база`
        },
        uz: {
            title: 'Generic funksiya asoslari',
            solutionCode: `package generics

// Ordered is a constraint that permits any ordered type
type Ordered interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64 |
	~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uintptr |
	~float32 | ~float64 |
	~string
}

// Min ikkita qiymatdan kichigini qaytaradi
func Min[T Ordered](a, b T) T {
    if a < b {
        return a
    }
    return b
}`,
            description: `Go-da tip parametrlaridan foydalanib birinchi umumiy funktsiyangizni yozishni o'rganing.

Umumiy funksiyalar bir nechta tiplar bilan ishlaydigan bitta funksiya yozish imkonini beradi. Bu ma'lumot turidan qat'iy nazar bir xil mantiqni bajaradigan utility funksiyalar uchun juda foydali.

**Vazifa:** Bir xil turdagi ikkita qiymatni qabul qilib, kichigini qaytaradigan umumiy \`Min\` funksiyasini yarating. Tip \`<\` operatori bilan taqqoslanishi kerak.

**Talablar:**
- \`T\` tip parametrini \`constraints.Ordered\` cheklovi bilan ishlating
- \`"golang.org/x/exp/constraints"\` paketini import qiling
- Ikkita qiymatni taqqoslang va kichigini qaytaring
- Funksiya int, float64, string va boshqalar bilan ishlashi kerak

**Foydalanish misoli:**
\`\`\`go
fmt.Println(Min(5, 3))       // Natija: 3
fmt.Println(Min(2.5, 7.8))   // Natija: 2.5
fmt.Println(Min("b", "a"))   // Natija: "a"
\`\`\``,
            hint1: `Ikkita qiymatni \`<\` operatori bilan taqqoslash uchun if operatoridan foydalaning.`,
            hint2: `Agar \`a\` \`b\` dan kichik bo'lsa, \`a\` ni qaytaring, aks holda \`b\` ni qaytaring.`,
            whyItMatters: `Umumiy funksiyalar bitta funksiyaga bir nechta tip bilan ishlash imkonini berib, kod dublikatsiyasini yo'q qiladi. Bu zamonaviy Go-da qayta foydalaniladigan, tip-xavfsiz kodning asosidir.

**Ishlab chiqarish patterni:**

\`\`\`go
// Genericlarsiz: Har bir tip uchun kod dublikatsiyasi
func MaxInt(a, b int) int {
    if a > b { return a }
    return b
}

func MaxFloat64(a, b float64) float64 {
    if a > b { return a }
    return b
}

func MaxString(a, b string) string {
    if a > b { return a }
    return b
}

// Genericlar bilan: Barcha tiplar uchun bitta funksiya
func Max[T constraints.Ordered](a, b T) T {
    if a > b { return a }
    return b
}

// Foydalanish
maxInt := Max(10, 20)        // T = int
maxFloat := Max(3.14, 2.71)  // T = float64
maxStr := Max("abc", "xyz")  // T = string
\`\`\`

**Amaliy foydalari:**

1. **Kod dublikatsiyasini kamaytirish**: Ko'p tip-maxsus versiyalar o'rniga bitta funksiya
2. **Tip xavfsizligi**: Tip xatolari runtime emas, kompilyatsiya vaqtida aniqlanadi
3. **Ishlash samaradorligi**: Runtime reflection yoki type assertions uchun qo'shimcha xarajatlar yo'q
4. **O'qilishi**: Qo'llab-quvvatlash uchun kamroq kod, toza kod bazasi`
        }
    }
};

export default task;
