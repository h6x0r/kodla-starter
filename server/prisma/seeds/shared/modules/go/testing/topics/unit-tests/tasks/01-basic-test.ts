import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-basic-test',
	title: 'Basic Unit Test',
	difficulty: 'easy',	tags: ['go', 'testing', 'unit-test'],
	estimatedTime: '15m',	isPremium: false,
	youtubeUrl: '',
	description: `Write a basic unit test for an **Add** function using Go's testing package.

**Requirements:**
1. Implement \`Add(a, b int) int\` function
2. Write \`TestAdd\` with multiple assertions
3. Use \`t.Errorf\` for failures
4. Test positive, negative, and zero values

**Example:**
\`\`\`go
func TestAdd(t *testing.T) {
    result := Add(2, 3)
    if result != 5 {
        t.Errorf("Add(2, 3) = %d; want 5", result)
    }
}
\`\`\`

**Constraints:**
- Test file must be named \`*_test.go\`
- Test function must start with \`Test\`
- Use descriptive error messages`,
	initialCode: `package math_test
// TODO: Implement Add function
func Add(a, b int) int {
	return 0 // TODO: Implement
}

// TODO: Write TestAdd with multiple test cases
func TestAdd(t *T) {
	// TODO: Implement
}`,
	solutionCode: `package math_test
func Add(a, b int) int {
	return a + b  // Simple addition
}

func TestAdd(t *T) {
	// Test positive numbers
	result := Add(2, 3)
	if result != 5 {
		t.Errorf("Add(2, 3) = %d; want 5", result)
	}

	// Test negative numbers
	result = Add(-1, -1)
	if result != -2 {
		t.Errorf("Add(-1, -1) = %d; want -2", result)
	}

	// Test with zero
	result = Add(5, 0)
	if result != 5 {
		t.Errorf("Add(5, 0) = %d; want 5", result)
	}

	// Test mixed signs
	result = Add(10, -3)
	if result != 7 {
		t.Errorf("Add(10, -3) = %d; want 7", result)
	}
}`,
			hint1: `Go test functions must have signature: func TestXxx(t *testing.T).`,
			hint2: `Use t.Errorf to report failures without stopping the test. Include actual and expected values.`,
			testCode: `package math_test
// Test1: Basic addition
func Test1(t *T) {
	result := Add(2, 3)
	if result != 5 {
		t.Errorf("Add(2, 3) = %d; want 5", result)
	}
}

// Test2: Adding zero
func Test2(t *T) {
	result := Add(5, 0)
	if result != 5 {
		t.Errorf("Add(5, 0) = %d; want 5", result)
	}
	result = Add(0, 5)
	if result != 5 {
		t.Errorf("Add(0, 5) = %d; want 5", result)
	}
}

// Test3: Negative numbers
func Test3(t *T) {
	result := Add(-1, -1)
	if result != -2 {
		t.Errorf("Add(-1, -1) = %d; want -2", result)
	}
}

// Test4: Mixed positive and negative
func Test4(t *T) {
	result := Add(10, -3)
	if result != 7 {
		t.Errorf("Add(10, -3) = %d; want 7", result)
	}
	result = Add(-10, 3)
	if result != -7 {
		t.Errorf("Add(-10, 3) = %d; want -7", result)
	}
}

// Test5: Large numbers
func Test5(t *T) {
	result := Add(1000000, 2000000)
	if result != 3000000 {
		t.Errorf("Add(1000000, 2000000) = %d; want 3000000", result)
	}
}

// Test6: Adding same number to itself
func Test6(t *T) {
	result := Add(7, 7)
	if result != 14 {
		t.Errorf("Add(7, 7) = %d; want 14", result)
	}
}

// Test7: Zero plus zero
func Test7(t *T) {
	result := Add(0, 0)
	if result != 0 {
		t.Errorf("Add(0, 0) = %d; want 0", result)
	}
}

// Test8: Multiple assertions in sequence
func Test8(t *T) {
	cases := []struct {
		a, b, want int
	}{
		{1, 1, 2},
		{2, 2, 4},
		{3, 3, 6},
	}
	for _, c := range cases {
		if got := Add(c.a, c.b); got != c.want {
			t.Errorf("Add(%d, %d) = %d; want %d", c.a, c.b, got, c.want)
		}
	}
}

// Test9: Boundary values
func Test9(t *T) {
	result := Add(1, -1)
	if result != 0 {
		t.Errorf("Add(1, -1) = %d; want 0", result)
	}
}

// Test10: Function returns correct type
func Test10(t *T) {
	var result int = Add(5, 3)
	if result != 8 {
		t.Errorf("Add(5, 3) = %d; want 8", result)
	}
}
`,
			whyItMatters: `Unit tests are the foundation of reliable software, catching bugs early and enabling confident refactoring.

**Why Unit Testing Matters:**
- **Regression Prevention:** Tests catch bugs when you change code
- **Documentation:** Tests show how code should be used
- **Design Feedback:** Hard-to-test code is often poorly designed
- **Confidence:** Refactor without fear of breaking things

**Production Benefits:**
\`\`\`go
// Without tests: "Does my change break anything?" - Unknown
// With tests: "Does my change break anything?" - Run 'go test'
\`\`\`

**Go Testing Conventions:**
- Files: \`*_test.go\` (automatically excluded from builds)
- Functions: \`TestXxx(t *testing.T)\` where Xxx starts with capital letter
- Run: \`go test\` in package directory
- Verbose: \`go test -v\` shows all test names

**Real-World Example:**
When Google's Go team adds a feature, they write tests first (TDD). This ensures:
1. The feature works as designed
2. Future changes don't break it
3. Other developers understand the expected behavior

The Go standard library has 10,000+ tests ensuring stability across updates.`,	order: 0,
	translations: {
		ru: {
			title: 'Базовая структура теста',
			description: `Напишите базовый unit-тест для функции **Add** используя testing пакет Go.

**Требования:**
1. Реализуйте функцию \`Add(a, b int) int\`
2. Напишите \`TestAdd\` с несколькими проверками
3. Используйте \`t.Errorf\` для ошибок
4. Тестируйте положительные, отрицательные и нулевые значения

**Пример:**
\`\`\`go
func TestAdd(t *testing.T) {
    result := Add(2, 3)
    if result != 5 {
        t.Errorf("Add(2, 3) = %d; want 5", result)
    }
}
\`\`\`

**Ограничения:**
- Файл теста должен называться \`*_test.go\`
- Тестовая функция должна начинаться с \`Test\`
- Используйте описательные сообщения об ошибках`,
			hint1: `Тестовые функции Go должны иметь сигнатуру: func TestXxx(t *testing.T).`,
			hint2: `Используйте t.Errorf для сообщения об ошибках без остановки теста.`,
			whyItMatters: `Unit-тесты - основа надежного ПО, обнаруживающая баги на ранней стадии и позволяющая уверенно рефакторить.

**Почему важно тестирование:**
- **Предотвращение регрессии:** Тесты ловят баги при изменении кода
- **Документация:** Тесты показывают как использовать код
- **Обратная связь о дизайне:** Сложный для тестирования код часто плохо спроектирован
- **Уверенность:** Рефакторинг без страха что-то сломать

**Продакшен паттерн:**
\`\`\`go
// Без тестов: "Ломает ли мое изменение что-то?" - Неизвестно
// С тестами: "Ломает ли мое изменение что-то?" - Запустите 'go test'
\`\`\`

**Конвенции Go тестирования:**
- Файлы: \`*_test.go\` (автоматически исключаются из сборок)
- Функции: \`TestXxx(t *testing.T)\` где Xxx начинается с заглавной буквы
- Запуск: \`go test\` в директории пакета
- Подробный вывод: \`go test -v\` показывает все имена тестов

**Практические преимущества:**
Когда команда Go в Google добавляет функцию, они сначала пишут тесты (TDD). Это обеспечивает:
1. Функция работает как задумано
2. Будущие изменения не сломают ее
3. Другие разработчики понимают ожидаемое поведение

Стандартная библиотека Go имеет 10,000+ тестов, обеспечивающих стабильность между обновлениями.`,
			solutionCode: `package math_test
func Add(a, b int) int {
	return a + b  // Простое сложение
}

func TestAdd(t *T) {
	// Тестируем положительные числа
	result := Add(2, 3)
	if result != 5 {
		t.Errorf("Add(2, 3) = %d; want 5", result)
	}

	// Тестируем отрицательные числа
	result = Add(-1, -1)
	if result != -2 {
		t.Errorf("Add(-1, -1) = %d; want -2", result)
	}

	// Тестируем с нулем
	result = Add(5, 0)
	if result != 5 {
		t.Errorf("Add(5, 0) = %d; want 5", result)
	}

	// Тестируем смешанные знаки
	result = Add(10, -3)
	if result != 7 {
		t.Errorf("Add(10, -3) = %d; want 7", result)
	}
}`
		},
		uz: {
			title: `Asosiy test tuzilishi`,
			description: `Go testing paketidan foydalanib **Add** funksiyasi uchun asosiy unit test yozing.

**Talablar:**
1. \`Add(a, b int) int\` funksiyasini amalga oshiring
2. Bir nechta tekshiruvlar bilan 'TestAdd' yozing
3. Xatolar uchun 't.Errorf' dan foydalaning
4. Musbat, manfiy va nol qiymatlarni tekshiring

**Misol:**
\`\`\`go
func TestAdd(t *testing.T) {
    result := Add(2, 3)
    if result != 5 {
        t.Errorf("Add(2, 3) = %d; want 5", result)
    }
}
\`\`\`

**Cheklovlar:**
- Test fayli '*_test.go' nomi bilan bo'lishi kerak
- Test funksiyasi 'Test' bilan boshlanishi kerak
- Tavsiflovchi xato xabarlaridan foydalaning`,
			hint1: `Go test funksiyalari quyidagi signaturaga ega bo'lishi kerak: func TestXxx(t *testing.T).`,
			hint2: `Testni to'xtatmasdan xatolar haqida xabar berish uchun t.Errorf dan foydalaning.`,
			whyItMatters: `Unit testlar ishonchli dasturiy ta'minotning asosi bo'lib, buglarni erta aniqlaydi va ishonchli refaktoring imkonini beradi.

**Nima uchun test muhim:**
- **Regressiya oldini olish:** Testlar kod o'zgarganda buglarni ushlaydi
- **Hujjatlashtirish:** Testlar kodni qanday ishlatishni ko'rsatadi
- **Dizayn fikr-mulohazasi:** Test qilish qiyin bo'lgan kod ko'pincha yomon loyihalangan
- **Ishonch:** Biror narsani buzish qo'rquvida refaktoring qiling

**Ishlab chiqarish patterni:**
\`\`\`go
// Testlarsiz: "Mening o'zgarishim biror narsani buzadimi?" - Noma'lum
// Testlar bilan: "Mening o'zgarishim biror narsani buzadimi?" - 'go test' ni ishga tushiring
\`\`\`

**Go test konventsiyalari:**
- Fayllar: \`*_test.go\` (avtomatik ravishda build dan chiqariladi)
- Funksiyalar: \`TestXxx(t *testing.T)\` bu yerda Xxx bosh harf bilan boshlanadi
- Ishga tushirish: paket katalogida \`go test\`
- Batafsil: \`go test -v\` barcha test nomlarini ko'rsatadi

**Amaliy foydalari:**
Google'dagi Go jamoasi funksiya qo'shganda, ular avval testlarni yozadilar (TDD). Bu quyidagilarni ta'minlaydi:
1. Funksiya mo'ljallangandek ishlaydi
2. Kelajakdagi o'zgarishlar uni buzmaydi
3. Boshqa ishlab chiquvchilar kutilgan xatti-harakatni tushunadi

Go standart kutubxonasida yangilanishlar o'rtasida barqarorlikni ta'minlaydigan 10,000+ test mavjud.`,
			solutionCode: `package math_test
func Add(a, b int) int {
	return a + b  // Oddiy qo'shish
}

func TestAdd(t *T) {
	// Musbat sonlarni tekshirish
	result := Add(2, 3)
	if result != 5 {
		t.Errorf("Add(2, 3) = %d; want 5", result)
	}

	// Manfiy sonlarni tekshirish
	result = Add(-1, -1)
	if result != -2 {
		t.Errorf("Add(-1, -1) = %d; want -2", result)
	}

	// Nol bilan tekshirish
	result = Add(5, 0)
	if result != 5 {
		t.Errorf("Add(5, 0) = %d; want 5", result)
	}

	// Aralash belgilarni tekshirish
	result = Add(10, -3)
	if result != 7 {
		t.Errorf("Add(10, -3) = %d; want 7", result)
	}
}`
		}
	}
};

export default task;
