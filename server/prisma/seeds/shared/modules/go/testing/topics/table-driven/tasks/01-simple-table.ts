import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-simple-table',
	title: 'Simple Table-Driven Test',
	difficulty: 'easy',	tags: ['go', 'testing', 'table-driven'],
	estimatedTime: '20m',	isPremium: false,
	youtubeUrl: '',
	description: `Write a table-driven test using the **[]struct** pattern.

**Requirements:**
1. Implement \`IsEven(n int) bool\` function
2. Define test cases as slice of structs with \`input\` and \`want\` fields
3. Loop through test cases
4. Assert each case using t.Errorf

**Example:**
\`\`\`go
tests := []struct {
    input int
    want  bool
}{
    {2, true},
    {3, false},
}

for _, tt := range tests {
    got := IsEven(tt.input)
    if got != tt.want {
        t.Errorf("IsEven(%d) = %v, want %v", tt.input, got, tt.want)
    }
}
\`\`\`

**Constraints:**
- Use anonymous struct for test table
- Test at least 5 different cases
- Include edge cases (0, negative numbers)`,
	initialCode: `package tabletest_test
// TODO: Implement IsEven function
func IsEven(n int) bool {
	return false // TODO: Implement
}

// TODO: Write table-driven test for IsEven
func TestIsEven(t *T) {
	// TODO: Implement
}`,
	solutionCode: `package tabletest_test
func IsEven(n int) bool {
	return n%2 == 0  // Check if divisible by 2
}

func TestIsEven(t *T) {
	// Define test table
	tests := []struct {
		input int
		want  bool
	}{
		{2, true},       // Positive even
		{3, false},      // Positive odd
		{0, true},       // Zero is even
		{-4, true},      // Negative even
		{-5, false},     // Negative odd
		{100, true},     // Large even
		{999, false},    // Large odd
	}

	// Run all test cases
	for _, tt := range tests {
		got := IsEven(tt.input)
		if got != tt.want {
			t.Errorf("IsEven(%d) = %v, want %v", tt.input, got, tt.want)
		}
	}
}`,
			hint1: `Define a slice of anonymous structs: []struct{ input int; want bool }{ ... }`,
			hint2: `Use range to iterate: for _, tt := range tests { ... }. The convention is to name the variable 'tt'.`,
			testCode: `package tabletest_test
func Test1(t *T) {
	if !IsEven(0) {
		t.Error("0 should be even")
	}
}

func Test2(t *T) {
	if !IsEven(2) {
		t.Error("2 should be even")
	}
}

func Test3(t *T) {
	if IsEven(3) {
		t.Error("3 should be odd")
	}
}

func Test4(t *T) {
	if !IsEven(-4) {
		t.Error("-4 should be even")
	}
}

func Test5(t *T) {
	if IsEven(-5) {
		t.Error("-5 should be odd")
	}
}

func Test6(t *T) {
	if !IsEven(100) {
		t.Error("100 should be even")
	}
}

func Test7(t *T) {
	if IsEven(999) {
		t.Error("999 should be odd")
	}
}

func Test8(t *T) {
	if IsEven(1) {
		t.Error("1 should be odd")
	}
}

func Test9(t *T) {
	if !IsEven(-2) {
		t.Error("-2 should be even")
	}
}

func Test10(t *T) {
	if !IsEven(1000000) {
		t.Error("1000000 should be even")
	}
}
`,
			whyItMatters: `Table-driven tests reduce duplication and make it easy to add test cases.

**Why Table-Driven Tests Matter:**
- **DRY:** Write test logic once, data many times
- **Readability:** Test cases are data, easy to understand
- **Maintainability:** Add cases without changing test logic
- **Coverage:** Encourages testing more scenarios

**Without Table-Driven (repetitive):**
\`\`\`go
func TestIsEven(t *testing.T) {
    if !IsEven(2) {
        t.Error("2 should be even")
    }
    if IsEven(3) {
        t.Error("3 should be odd")
    }
    if !IsEven(0) {
        t.Error("0 should be even")
    }
    // 20 more lines of copy-paste...
}
\`\`\`

**With Table-Driven (clean):**
\`\`\`go
func TestIsEven(t *testing.T) {
    tests := []struct {
        input int
        want  bool
    }{
        {2, true},
        {3, false},
        {0, true},
        // Easy to add more cases
    }

    for _, tt := range tests {
        if got := IsEven(tt.input); got != tt.want {
            t.Errorf("IsEven(%d) = %v, want %v", tt.input, got, tt.want)
        }
    }
}
\`\`\`

**Production Benefits:**
- **Bug Reports:** Found edge case? Add one line to test table
- **Regression:** Test table grows with discovered bugs
- **Documentation:** Test table shows all supported scenarios
- **Code Review:** Easy to verify test coverage

**Real-World Example:**
The Go standard library uses table-driven tests everywhere:
\`\`\`go
// From strconv/atoi_test.go
func TestAtoi(t *testing.T) {
    tests := []struct {
        in  string
        out int
        err error
    }{
        {"", 0, ErrSyntax},
        {"0", 0, nil},
        {"-0", 0, nil},
        {"1", 1, nil},
        {"-1", -1, nil},
        {"12345", 12345, nil},
        // 50+ more cases...
    }

    for _, tt := range tests {
        got, err := Atoi(tt.in)
        if got != tt.out || err != tt.err {
            t.Errorf("Atoi(%q) = %d, %v, want %d, %v",
                tt.in, got, err, tt.out, tt.err)
        }
    }
}
\`\`\`

**When to Use:**
- Testing pure functions with various inputs
- Validation logic (parsers, validators)
- Business logic with multiple scenarios
- Any function where you want to test 3+ cases

**Pattern Recognition:**
If you find yourself copy-pasting test code and changing values, use table-driven tests instead.`,	order: 0,
	translations: {
		ru: {
			title: 'Табличные тесты с несколькими случаями',
			description: `Напишите табличный тест используя паттерн **[]struct**.

**Требования:**
1. Реализуйте функцию \`IsEven(n int) bool\`
2. Определите тестовые случаи как слайс структур с полями \`input\` и \`want\`
3. Переберите тестовые случаи в цикле
4. Проверьте каждый случай используя t.Errorf

**Пример:**
\`\`\`go
tests := []struct {
    input int
    want  bool
}{
    {2, true},
    {3, false},
}
\`\`\`

**Ограничения:**
- Используйте анонимную структуру для таблицы тестов
- Тестируйте минимум 5 разных случаев`,
			hint1: `Определите слайс анонимных структур: []struct{ input int; want bool }{ ... }`,
			hint2: `Используйте range для итерации: for _, tt := range tests { ... }`,
			whyItMatters: `Табличные тесты уменьшают дублирование и упрощают добавление тестовых случаев.

**Почему табличные тесты важны:**
- **DRY:** Напишите логику теста один раз, данные много раз
- **Читаемость:** Тестовые случаи - это данные, их легко понять
- **Поддерживаемость:** Добавляйте случаи без изменения логики тестов
- **Покрытие:** Поощряет тестирование большего количества сценариев

**Без табличных тестов (повторяющийся код):**
\`\`\`go
func TestIsEven(t *testing.T) {
    if !IsEven(2) {
        t.Error("2 должно быть четным")
    }
    if IsEven(3) {
        t.Error("3 должно быть нечетным")
    }
    if !IsEven(0) {
        t.Error("0 должен быть четным")
    }
    // Еще 20 строк копи-паста...
}
\`\`\`

**С табличными тестами (чистый код):**
\`\`\`go
func TestIsEven(t *testing.T) {
    tests := []struct {
        input int
        want  bool
    }{
        {2, true},
        {3, false},
        {0, true},
        // Легко добавить больше случаев
    }

    for _, tt := range tests {
        if got := IsEven(tt.input); got != tt.want {
            t.Errorf("IsEven(%d) = %v, want %v", tt.input, got, tt.want)
        }
    }
}
\`\`\`

**Преимущества в production:**
- **Отчеты об ошибках:** Нашли граничный случай? Добавьте одну строку в таблицу тестов
- **Регрессия:** Таблица тестов растет вместе с обнаруженными багами
- **Документация:** Таблица тестов показывает все поддерживаемые сценарии
- **Code Review:** Легко проверить покрытие тестами

**Пример из реального мира:**
Стандартная библиотека Go использует табличные тесты везде:
\`\`\`go
// Из strconv/atoi_test.go
func TestAtoi(t *testing.T) {
    tests := []struct {
        in  string
        out int
        err error
    }{
        {"", 0, ErrSyntax},
        {"0", 0, nil},
        {"-0", 0, nil},
        {"1", 1, nil},
        {"-1", -1, nil},
        {"12345", 12345, nil},
        // Еще 50+ случаев...
    }

    for _, tt := range tests {
        got, err := Atoi(tt.in)
        if got != tt.out || err != tt.err {
            t.Errorf("Atoi(%q) = %d, %v, want %d, %v",
                tt.in, got, err, tt.out, tt.err)
        }
    }
}
\`\`\`

**Когда использовать:**
- Тестирование чистых функций с различными входами
- Логика валидации (парсеры, валидаторы)
- Бизнес-логика с множественными сценариями
- Любая функция, где вы хотите протестировать 3+ случаев

**Распознавание паттерна:**
Если вы обнаруживаете, что копируете-вставляете тестовый код и меняете значения, используйте табличные тесты вместо этого.`,
			solutionCode: `package tabletest_test
func IsEven(n int) bool {
	return n%2 == 0  // Проверить делимость на 2
}

func TestIsEven(t *T) {
	// Определить таблицу тестов
	tests := []struct {
		input int
		want  bool
	}{
		{2, true},       // Положительное четное
		{3, false},      // Положительное нечетное
		{0, true},       // Ноль четный
		{-4, true},      // Отрицательное четное
		{-5, false},     // Отрицательное нечетное
		{100, true},     // Большое четное
		{999, false},    // Большое нечетное
	}

	// Выполнить все тестовые случаи
	for _, tt := range tests {
		got := IsEven(tt.input)
		if got != tt.want {
			t.Errorf("IsEven(%d) = %v, want %v", tt.input, got, tt.want)
		}
	}
}`
		},
		uz: {
			title: `Bir nechta holat bilan jadval testlari`,
			description: `**[]struct** patternidan foydalanib jadval asosidagi test yozing.

**Talablar:**
1. \`IsEven(n int) bool\` funksiyasini amalga oshiring
2. \`input\` va 'want' fieldlari bilan strukturalar slice sifatida test holatlarini aniqlang
3. Test holatlarini tsiklda aylanib o'ting
4. t.Errorf dan foydalanib har bir holatni tekshiring

**Misol:**
\`\`\`go
tests := []struct {
    input int
    want  bool
}{
    {2, true},
    {3, false},
}
\`\`\`

**Cheklovlar:**
- Test jadvali uchun anonim strukturadan foydalaning
- Kamida 5 xil holatni test qiling`,
			hint1: `Anonim strukturalar slice sini aniqlang: []struct{ input int; want bool }{ ... }`,
			hint2: `Iteratsiya qilish uchun range dan foydalaning: for _, tt := range tests { ... }`,
			whyItMatters: `Jadval asosidagi testlar takrorlanishni kamaytiradi va test holatlarini qo'shishni osonlashtiradi.

**Nima uchun jadval asosidagi testlar muhim:**
- **DRY:** Test mantiqini bir marta yozing, ma'lumotlarni ko'p marta
- **O'qilishi:** Test holatlari ma'lumotlar, tushunish oson
- **Qo'llab-quvvatlash:** Mantiqni o'zgartirmasdan holatlar qo'shing
- **Qamrov:** Ko'proq stsenariylarni testlashga undaydi

**Jadval testlarisiz (takrorlanuvchi kod):**
\`\`\`go
func TestIsEven(t *testing.T) {
    if !IsEven(2) {
        t.Error("2 juft bo'lishi kerak")
    }
    if IsEven(3) {
        t.Error("3 toq bo'lishi kerak")
    }
    if !IsEven(0) {
        t.Error("0 juft bo'lishi kerak")
    }
    // Yana 20 qator copy-paste...
}
\`\`\`

**Jadval testlari bilan (toza kod):**
\`\`\`go
func TestIsEven(t *testing.T) {
    tests := []struct {
        input int
        want  bool
    }{
        {2, true},
        {3, false},
        {0, true},
        // Ko'proq holatlar qo'shish oson
    }

    for _, tt := range tests {
        if got := IsEven(tt.input); got != tt.want {
            t.Errorf("IsEven(%d) = %v, want %v", tt.input, got, tt.want)
        }
    }
}
\`\`\`

**Production afzalliklari:**
- **Xato hisobotlari:** Chegara holatini topdingizmi? Test jadvaliga bitta qator qo'shing
- **Regressiya:** Test jadvali topilgan xatolar bilan o'sadi
- **Hujjatlashtirish:** Test jadvali barcha qo'llab-quvvatlanadigan stsenariylarni ko'rsatadi
- **Code Review:** Test qamrovini tekshirish oson

**Haqiqiy dunyo misoli:**
Go standart kutubxonasi hamma joyda jadval testlaridan foydalanadi:
\`\`\`go
// strconv/atoi_test.go dan
func TestAtoi(t *testing.T) {
    tests := []struct {
        in  string
        out int
        err error
    }{
        {"", 0, ErrSyntax},
        {"0", 0, nil},
        {"-0", 0, nil},
        {"1", 1, nil},
        {"-1", -1, nil},
        {"12345", 12345, nil},
        // Yana 50+ holat...
    }

    for _, tt := range tests {
        got, err := Atoi(tt.in)
        if got != tt.out || err != tt.err {
            t.Errorf("Atoi(%q) = %d, %v, want %d, %v",
                tt.in, got, err, tt.out, tt.err)
        }
    }
}
\`\`\`

**Qachon ishlatish kerak:**
- Turli xil kiritishlar bilan toza funksiyalarni testlash
- Tekshirish mantiqi (parserlar, validatorlar)
- Ko'plab stsenariylar bilan biznes mantiqi
- 3+ holatni test qilmoqchi bo'lgan har qanday funksiya

**Pattern tanib olish:**
Agar o'zingizni test kodini nusxalayotgan va qiymatlarni o'zgartirganingizni topsangiz, uning o'rniga jadval testlaridan foydalaning.`,
			solutionCode: `package tabletest_test
func IsEven(n int) bool {
	return n%2 == 0  // 2 ga bo'linishni tekshirish
}

func TestIsEven(t *T) {
	// Test jadvalini aniqlash
	tests := []struct {
		input int
		want  bool
	}{
		{2, true},       // Musbat juft
		{3, false},      // Musbat toq
		{0, true},       // Nol juft
		{-4, true},      // Manfiy juft
		{-5, false},     // Manfiy toq
		{100, true},     // Katta juft
		{999, false},    // Katta toq
	}

	// Barcha test holatlarini ishga tushirish
	for _, tt := range tests {
		got := IsEven(tt.input)
		if got != tt.want {
			t.Errorf("IsEven(%d) = %v, want %v", tt.input, got, tt.want)
		}
	}
}`
		}
	}
};

export default task;
