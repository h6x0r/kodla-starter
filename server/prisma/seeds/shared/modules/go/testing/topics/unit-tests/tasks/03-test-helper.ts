import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-test-helper',
	title: 'Test Helper Functions',
	difficulty: 'easy',	tags: ['go', 'testing', 'helpers'],
	estimatedTime: '20m',	isPremium: false,
	youtubeUrl: '',
	description: `Create reusable test helper functions using **t.Helper()** for cleaner test code.

**Requirements:**
1. Implement \`assertEqual\` helper that compares two values
2. Call \`t.Helper()\` at the start of the helper
3. Report failures with correct line numbers
4. Use helper in multiple test cases

**Example:**
\`\`\`go
func assertEqual(t *testing.T, got, want int) {
    t.Helper()
    if got != want {
        t.Errorf("got %d, want %d", got, want)
    }
}

func TestSomething(t *testing.T) {
    assertEqual(t, Add(2, 3), 5)
}
\`\`\`

**Constraints:**
- Helper must call t.Helper() first
- Error messages should include both actual and expected values
- Helper should be reusable across tests`,
	initialCode: `package testhelper_test
// TODO: Implement assertEqual helper with t.Helper()
func assertEqual(t *T, got, want int) {
	// TODO: Implement
}

func Add(a, b int) int {
	return a + b
}

func Multiply(a, b int) int {
	return a * b
}

// TODO: Use assertEqual helper in tests
func TestMath(t *T) {
	// TODO: Implement
}`,
	solutionCode: `package testhelper_test
func assertEqual(t *T, got, want int) {
	t.Helper()  // Mark as helper: errors report caller's line number
	if got != want {
		t.Errorf("got %d, want %d", got, want)  // Report failure
	}
}

func Add(a, b int) int {
	return a + b
}

func Multiply(a, b int) int {
	return a * b
}

func TestMath(t *T) {
	// Test addition with helper
	assertEqual(t, Add(2, 3), 5)
	assertEqual(t, Add(-1, 1), 0)
	assertEqual(t, Add(10, -5), 5)

	// Test multiplication with helper
	assertEqual(t, Multiply(3, 4), 12)
	assertEqual(t, Multiply(2, 0), 0)
	assertEqual(t, Multiply(-2, 3), -6)
}`,
			hint1: `Call t.Helper() as the first line in your helper function to get correct error line numbers.`,
			hint2: `Helper functions reduce duplication and make tests more readable. Extract common assertion logic.`,
			testCode: `package testhelper_test
// Test1: assertEqual works for equal values
func Test1(t *T) {
	// Should not fail
	assertEqual(t, 5, 5)
}

// Test2: Add function basic test
func Test2(t *T) {
	result := Add(2, 3)
	if result != 5 {
		t.Errorf("Add(2, 3) = %d; want 5", result)
	}
}

// Test3: Multiply function basic test
func Test3(t *T) {
	result := Multiply(3, 4)
	if result != 12 {
		t.Errorf("Multiply(3, 4) = %d; want 12", result)
	}
}

// Test4: Add with zero
func Test4(t *T) {
	assertEqual(t, Add(5, 0), 5)
	assertEqual(t, Add(0, 5), 5)
}

// Test5: Multiply with zero
func Test5(t *T) {
	assertEqual(t, Multiply(5, 0), 0)
	assertEqual(t, Multiply(0, 5), 0)
}

// Test6: Add negative numbers
func Test6(t *T) {
	assertEqual(t, Add(-1, 1), 0)
	assertEqual(t, Add(-5, -5), -10)
}

// Test7: Multiply negative numbers
func Test7(t *T) {
	assertEqual(t, Multiply(-2, 3), -6)
	assertEqual(t, Multiply(-2, -3), 6)
}

// Test8: Multiple assertions with helper
func Test8(t *T) {
	assertEqual(t, Add(1, 1), 2)
	assertEqual(t, Add(2, 2), 4)
	assertEqual(t, Add(3, 3), 6)
}

// Test9: Multiple multiply assertions
func Test9(t *T) {
	assertEqual(t, Multiply(1, 1), 1)
	assertEqual(t, Multiply(2, 2), 4)
	assertEqual(t, Multiply(3, 3), 9)
}

// Test10: Combined operations
func Test10(t *T) {
	sum := Add(3, 4)
	product := Multiply(3, 4)
	assertEqual(t, sum, 7)
	assertEqual(t, product, 12)
}
`,
			whyItMatters: `Test helpers reduce duplication, improve readability, and report errors at the correct line numbers.

**Why t.Helper() Matters:**

Without t.Helper():
\`\`\`go
func assertEqual(t *testing.T, got, want int) {
    if got != want {
        t.Errorf("got %d, want %d", got, want)
    }
}

func TestAdd(t *testing.T) {
    assertEqual(t, Add(2, 3), 5)  // Line 10
}
// Error: "testhelper_test.go:3: got 6, want 5"  (wrong line!)
\`\`\`

With t.Helper():
\`\`\`go
func assertEqual(t *testing.T, got, want int) {
    t.Helper()  // Mark as helper
    if got != want {
        t.Errorf("got %d, want %d", got, want)
    }
}

func TestAdd(t *testing.T) {
    assertEqual(t, Add(2, 3), 5)  // Line 10
}
// Error: "testhelper_test.go:10: got 6, want 5"  (correct!)
\`\`\`

**Production Benefits:**
- **DRY:** Write assertion logic once, use everywhere
- **Debugging:** Errors point to test case, not helper function
- **Consistency:** All tests use same assertion style
- **Maintainability:** Update assertion logic in one place

**Real-World Example:**
The testify library uses helpers extensively:
\`\`\`go
assert.Equal(t, expected, actual)     // Helper
assert.NoError(t, err)                // Helper
assert.Contains(t, list, item)        // Helper
\`\`\`

**Common Test Helpers:**
\`\`\`go
func assertNoError(t *testing.T, err error) {
    t.Helper()
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
}

func assertError(t *testing.T, err error, want string) {
    t.Helper()
    if err == nil {
        t.Fatal("expected error, got nil")
    }
    if err.Error() != want {
        t.Errorf("error = %q, want %q", err, want)
    }
}
\`\`\`

At Google, test helpers are essential: their testing libraries have hundreds of helpers for common patterns, making tests more maintainable across teams.`,	order: 2,
	translations: {
		ru: {
			title: 'Вспомогательные функции тестов',
			description: `Создайте переиспользуемые вспомогательные функции используя **t.Helper()** для чистого тестового кода.

**Требования:**
1. Реализуйте хелпер \`assertEqual\` сравнивающий два значения
2. Вызовите \`t.Helper()\` в начале хелпера
3. Сообщайте об ошибках с правильными номерами строк
4. Используйте хелпер в нескольких тестовых случаях

**Пример:**
\`\`\`go
func assertEqual(t *testing.T, got, want int) {
    t.Helper()
    if got != want {
        t.Errorf("got %d, want %d", got, want)
    }
}
\`\`\`

**Ограничения:**
- Хелпер должен вызывать t.Helper() первым
- Сообщения должны включать фактические и ожидаемые значения`,
			hint1: `Вызовите t.Helper() первой строкой в хелпере для правильных номеров строк ошибок.`,
			hint2: `Хелперы уменьшают дублирование и делают тесты более читаемыми.`,
			whyItMatters: `Тестовые хелперы уменьшают дублирование, улучшают читаемость и сообщают об ошибках на правильных строках.

**Почему t.Helper() важен:**

Без t.Helper():
\`\`\`go
func assertEqual(t *testing.T, got, want int) {
    if got != want {
        t.Errorf("got %d, want %d", got, want)
    }
}

func TestAdd(t *testing.T) {
    assertEqual(t, Add(2, 3), 5)  // Строка 10
}
// Ошибка: "testhelper_test.go:3: got 6, want 5"  (неправильная строка!)
\`\`\`

С t.Helper():
\`\`\`go
func assertEqual(t *testing.T, got, want int) {
    t.Helper()  // Отметить как хелпер
    if got != want {
        t.Errorf("got %d, want %d", got, want)
    }
}

func TestAdd(t *testing.T) {
    assertEqual(t, Add(2, 3), 5)  // Строка 10
}
// Ошибка: "testhelper_test.go:10: got 6, want 5"  (правильно!)
\`\`\`

**Продакшен паттерн:**
- **DRY:** Напишите логику assertions один раз, используйте везде
- **Отладка:** Ошибки указывают на тестовый случай, не на хелпер функцию
- **Консистентность:** Все тесты используют один стиль assertions
- **Поддерживаемость:** Обновляйте логику assertions в одном месте

**Практический пример:**
Библиотека testify использует хелперы extensively:
\`\`\`go
assert.Equal(t, expected, actual)     // Хелпер
assert.NoError(t, err)                // Хелпер
assert.Contains(t, list, item)        // Хелпер
\`\`\`

**Общие тестовые хелперы:**
\`\`\`go
func assertNoError(t *testing.T, err error) {
    t.Helper()
    if err != nil {
        t.Fatalf("неожиданная ошибка: %v", err)
    }
}

func assertError(t *testing.T, err error, want string) {
    t.Helper()
    if err == nil {
        t.Fatal("ожидается ошибка, получено nil")
    }
    if err.Error() != want {
        t.Errorf("error = %q, want %q", err, want)
    }
}
\`\`\`

В Google тестовые хелперы необходимы: их библиотеки тестирования имеют сотни хелперов для общих паттернов, делая тесты более поддерживаемыми между командами.`,
			solutionCode: `package testhelper_test
func assertEqual(t *T, got, want int) {
	t.Helper()  // Отметить как хелпер: ошибки указывают на номер строки вызывающего кода
	if got != want {
		t.Errorf("got %d, want %d", got, want)  // Сообщить о сбое
	}
}

func Add(a, b int) int {
	return a + b
}

func Multiply(a, b int) int {
	return a * b
}

func TestMath(t *T) {
	// Тестируем сложение с хелпером
	assertEqual(t, Add(2, 3), 5)
	assertEqual(t, Add(-1, 1), 0)
	assertEqual(t, Add(10, -5), 5)

	// Тестируем умножение с хелпером
	assertEqual(t, Multiply(3, 4), 12)
	assertEqual(t, Multiply(2, 0), 0)
	assertEqual(t, Multiply(-2, 3), -6)
}`
		},
		uz: {
			title: `Test yordamchi funksiyalari`,
			description: `Toza test kodi uchun **t.Helper()** dan foydalanib qayta ishlatiladigan test helper funksiyalarini yarating.

**Talablar:**
1. Ikki qiymatni solishtiradigan 'assertEqual' helperni amalga oshiring
2. Helper boshida 't.Helper()' ni chaqiring
3. To'g'ri qator raqamlari bilan xatolarni xabar qiling
4. Helperni bir nechta test holatlarida ishlating

**Misol:**
\`\`\`go
func assertEqual(t *testing.T, got, want int) {
    t.Helper()
    if got != want {
        t.Errorf("got %d, want %d", got, want)
    }
}
\`\`\`

**Cheklovlar:**
- Helper birinchi t.Helper() ni chaqirishi kerak
- Xato xabarlari haqiqiy va kutilgan qiymatlarni o'z ichiga olishi kerak`,
			hint1: `To'g'ri xato qator raqamlarini olish uchun helper funksiyada birinchi qator sifatida t.Helper() ni chaqiring.`,
			hint2: `Helper funksiyalar takrorlanishni kamaytiradi va testlarni o'qishni osonlashtiradi.`,
			whyItMatters: `Test helperlari takrorlanishni kamaytiradi, o'qishni yaxshilaydi va to'g'ri qator raqamlarida xatolarni xabar qiladi.

**Nima uchun t.Helper() muhim:**

t.Helper() siz:
\`\`\`go
func assertEqual(t *testing.T, got, want int) {
    if got != want {
        t.Errorf("got %d, want %d", got, want)
    }
}

func TestAdd(t *testing.T) {
    assertEqual(t, Add(2, 3), 5)  // Qator 10
}
// Xato: "testhelper_test.go:3: got 6, want 5"  (noto'g'ri qator!)
\`\`\`

t.Helper() bilan:
\`\`\`go
func assertEqual(t *testing.T, got, want int) {
    t.Helper()  // Helper sifatida belgilash
    if got != want {
        t.Errorf("got %d, want %d", got, want)
    }
}

func TestAdd(t *testing.T) {
    assertEqual(t, Add(2, 3), 5)  // Qator 10
}
// Xato: "testhelper_test.go:10: got 6, want 5"  (to'g'ri!)
\`\`\`

**Ishlab chiqarish patterni:**
- **DRY:** Assertions mantiqini bir marta yozing, hamma joyda ishlating
- **Debug:** Xatolar test holatiga ishora qiladi, helper funksiyaga emas
- **Izchillik:** Barcha testlar bir xil assertion uslubidan foydalanadi
- **Qo'llab-quvvatlash:** Assertion mantiqini bir joyda yangilang

**Amaliy misol:**
testify kutubxonasi helperlarni keng foydalanadi:
\`\`\`go
assert.Equal(t, expected, actual)     // Helper
assert.NoError(t, err)                // Helper
assert.Contains(t, list, item)        // Helper
\`\`\`

**Keng tarqalgan test helperlari:**
\`\`\`go
func assertNoError(t *testing.T, err error) {
    t.Helper()
    if err != nil {
        t.Fatalf("kutilmagan xato: %v", err)
    }
}

func assertError(t *testing.T, err error, want string) {
    t.Helper()
    if err == nil {
        t.Fatal("xato kutilgan, nil olindi")
    }
    if err.Error() != want {
        t.Errorf("error = %q, want %q", err, want)
    }
}
\`\`\`

Google da test helperlari zarur: ularning test kutubxonalari umumiy patternlar uchun yuzlab helperlarni o'z ichiga oladi, bu jamoalar o'rtasida testlarni yanada qo'llab-quvvatlanishini osonlashtiradi.`,
			solutionCode: `package testhelper_test
func assertEqual(t *T, got, want int) {
	t.Helper()  // Helper sifatida belgilash: xatolar chaqiruvchining qator raqamini xabar qiladi
	if got != want {
		t.Errorf("got %d, want %d", got, want)  // Xato haqida xabar berish
	}
}

func Add(a, b int) int {
	return a + b
}

func Multiply(a, b int) int {
	return a * b
}

func TestMath(t *T) {
	// Helper bilan qo'shishni tekshirish
	assertEqual(t, Add(2, 3), 5)
	assertEqual(t, Add(-1, 1), 0)
	assertEqual(t, Add(10, -5), 5)

	// Helper bilan ko'paytirishni tekshirish
	assertEqual(t, Multiply(3, 4), 12)
	assertEqual(t, Multiply(2, 0), 0)
	assertEqual(t, Multiply(-2, 3), -6)
}`
		}
	}
};

export default task;
