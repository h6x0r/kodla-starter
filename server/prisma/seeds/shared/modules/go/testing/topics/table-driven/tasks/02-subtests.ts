import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-subtests',
	title: 'Subtests with t.Run',
	difficulty: 'medium',	tags: ['go', 'testing', 'subtests'],
	estimatedTime: '25m',	isPremium: false,
	youtubeUrl: '',
	description: `Use **t.Run** to create named subtests for better test organization and output.

**Requirements:**
1. Implement \`Calculator\` functions: Add, Subtract, Multiply, Divide
2. Define test table with \`name\` field for each case
3. Use \`t.Run(tt.name, func(t *testing.T) { ... })\` for each case
4. Run tests with \`go test -v\` to see subtest names

**Example:**
\`\`\`go
tests := []struct {
    name string
    a, b int
    want int
}{
    {"positive", 2, 3, 5},
    {"negative", -1, -1, -2},
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        got := Add(tt.a, tt.b)
        if got != tt.want {
            t.Errorf("got %d, want %d", got, tt.want)
        }
    })
}
\`\`\`

**Constraints:**
- Each test case must have descriptive name
- Use t.Run for all cases
- Test all four operations`,
	initialCode: `package calc_test
// TODO: Implement calculator functions
func Add(a, b int) int {
	return 0 // TODO: Implement
}
func Subtract(a, b int) int {
	return 0 // TODO: Implement
}
func Multiply(a, b int) int {
	return 0 // TODO: Implement
}
func Divide(a, b int) int {
	return 0 // TODO: Implement
}

// TODO: Write subtests for calculator operations
func TestCalculator(t *T) {
	// TODO: Implement
}`,
	solutionCode: `package calc_test
func Add(a, b int) int      { return a + b }
func Subtract(a, b int) int { return a - b }
func Multiply(a, b int) int { return a * b }
func Divide(a, b int) int   { return a / b }

func TestCalculator(t *T) {
	// Test Addition
	t.Run("Addition", func(t *T) {
		tests := []struct {
			name string
			a, b int
			want int
		}{
			{"positive numbers", 2, 3, 5},
			{"negative numbers", -2, -3, -5},
			{"with zero", 5, 0, 5},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *T) {
				got := Add(tt.a, tt.b)
				if got != tt.want {
					t.Errorf("Add(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
				}
			})
		}
	})

	// Test Subtraction
	t.Run("Subtraction", func(t *T) {
		tests := []struct {
			name string
			a, b int
			want int
		}{
			{"positive result", 5, 3, 2},
			{"negative result", 3, 5, -2},
			{"zero result", 5, 5, 0},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *T) {
				got := Subtract(tt.a, tt.b)
				if got != tt.want {
					t.Errorf("Subtract(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
				}
			})
		}
	})

	// Test Multiplication
	t.Run("Multiplication", func(t *T) {
		tests := []struct {
			name string
			a, b int
			want int
		}{
			{"positive numbers", 3, 4, 12},
			{"with zero", 5, 0, 0},
			{"negative numbers", -2, 3, -6},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *T) {
				got := Multiply(tt.a, tt.b)
				if got != tt.want {
					t.Errorf("Multiply(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
				}
			})
		}
	})

	// Test Division
	t.Run("Division", func(t *T) {
		tests := []struct {
			name string
			a, b int
			want int
		}{
			{"exact division", 10, 2, 5},
			{"truncated division", 10, 3, 3},
			{"negative result", -10, 2, -5},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *T) {
				got := Divide(tt.a, tt.b)
				if got != tt.want {
					t.Errorf("Divide(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
				}
			})
		}
	})
}`,
			hint1: `Use t.Run(name, func(t *testing.T) { ... }) to create a subtest. Each subtest gets its own t.`,
			hint2: `Subtest names appear in test output: TestCalculator/Addition/positive_numbers`,
			testCode: `package calc_test
func Test1(t *T) {
	if Add(2, 3) != 5 {
		t.Error("Add(2, 3) should be 5")
	}
}

func Test2(t *T) {
	if Add(-1, -1) != -2 {
		t.Error("Add(-1, -1) should be -2")
	}
}

func Test3(t *T) {
	if Subtract(5, 3) != 2 {
		t.Error("Subtract(5, 3) should be 2")
	}
}

func Test4(t *T) {
	if Subtract(3, 5) != -2 {
		t.Error("Subtract(3, 5) should be -2")
	}
}

func Test5(t *T) {
	if Multiply(3, 4) != 12 {
		t.Error("Multiply(3, 4) should be 12")
	}
}

func Test6(t *T) {
	if Multiply(5, 0) != 0 {
		t.Error("Multiply(5, 0) should be 0")
	}
}

func Test7(t *T) {
	if Divide(10, 2) != 5 {
		t.Error("Divide(10, 2) should be 5")
	}
}

func Test8(t *T) {
	if Divide(10, 3) != 3 {
		t.Error("Divide(10, 3) should be 3 (truncated)")
	}
}

func Test9(t *T) {
	if Add(0, 0) != 0 {
		t.Error("Add(0, 0) should be 0")
	}
}

func Test10(t *T) {
	if Multiply(-2, 3) != -6 {
		t.Error("Multiply(-2, 3) should be -6")
	}
}
`,
			whyItMatters: `Subtests provide better test organization, isolated failures, and selective test running.

**Why Subtests Matter:**
- **Organization:** Group related tests hierarchically
- **Isolation:** One subtest failure doesn't stop others
- **Selective Running:** Run specific subtests with -run flag
- **Output:** Clear test names in CI logs

**Without Subtests (messy output):**
\`\`\`bash
$ go test -v
=== RUN   TestAdd
--- PASS: TestAdd (0.00s)
=== RUN   TestSubtract
--- FAIL: TestSubtract (0.00s)  # Which case failed?
\`\`\`

**With Subtests (clear output):**
\`\`\`bash
$ go test -v
=== RUN   TestCalculator
=== RUN   TestCalculator/Addition
=== RUN   TestCalculator/Addition/positive_numbers
=== RUN   TestCalculator/Addition/negative_numbers
--- PASS: TestCalculator/Addition (0.00s)
=== RUN   TestCalculator/Subtraction
=== RUN   TestCalculator/Subtraction/positive_result
=== RUN   TestCalculator/Subtraction/negative_result
--- FAIL: TestCalculator/Subtraction/negative_result (0.00s)  # Exact failure!
\`\`\`

**Production Benefits:**
1. **CI Logs:** Exactly which scenario failed
2. **Selective Testing:** \`go test -run TestCalculator/Addition\`
3. **Debugging:** Focus on failing subtest only
4. **Coverage:** See which scenarios are tested

**Real-World Example:**
\`\`\`go
// From Go standard library net/http tests
func TestServer(t *testing.T) {
    t.Run("GET", func(t *testing.T) {
        t.Run("200 OK", func(t *testing.T) { /* ... */ })
        t.Run("404 Not Found", func(t *testing.T) { /* ... */ })
    })

    t.Run("POST", func(t *testing.T) {
        t.Run("201 Created", func(t *testing.T) { /* ... */ })
        t.Run("400 Bad Request", func(t *testing.T) { /* ... */ })
    })
}
\`\`\`

**Selective Running:**
\`\`\`bash
# Run all tests
go test -v

# Run only Addition tests
go test -v -run TestCalculator/Addition

# Run specific subtest
go test -v -run TestCalculator/Addition/positive_numbers

# Run all "positive" subtests
go test -v -run positive
\`\`\`

**Pattern for Complex Tests:**
\`\`\`go
func TestUserAPI(t *testing.T) {
    t.Run("Create", func(t *testing.T) {
        t.Run("valid data", func(t *testing.T) { /* ... */ })
        t.Run("invalid email", func(t *testing.T) { /* ... */ })
        t.Run("duplicate email", func(t *testing.T) { /* ... */ })
    })

    t.Run("Update", func(t *testing.T) {
        t.Run("own profile", func(t *testing.T) { /* ... */ })
        t.Run("other profile", func(t *testing.T) { /* ... */ })
    })

    t.Run("Delete", func(t *testing.T) {
        t.Run("soft delete", func(t *testing.T) { /* ... */ })
        t.Run("cascade delete", func(t *testing.T) { /* ... */ })
    })
}
\`\`\`

This organization makes tests self-documenting and easy to navigate.`,	order: 1,
	translations: {
		ru: {
			title: 'Подтесты',
			description: `Используйте **t.Run** для создания именованных подтестов для лучшей организации и вывода.

**Требования:**
1. Реализуйте функции \`Calculator\`: Add, Subtract, Multiply, Divide
2. Определите таблицу тестов с полем \`name\` для каждого случая
3. Используйте \`t.Run(tt.name, func(t *testing.T) { ... })\` для каждого случая
4. Запустите тесты с \`go test -v\` чтобы увидеть имена подтестов

**Пример:**
\`\`\`go
for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        // test logic
    })
}
\`\`\`

**Ограничения:**
- Каждый тестовый случай должен иметь описательное имя
- Используйте t.Run для всех случаев`,
			hint1: `Используйте t.Run(name, func(t *testing.T) { ... }) для создания подтеста.`,
			hint2: `Имена подтестов появляются в выводе: TestCalculator/Addition/positive_numbers`,
			whyItMatters: `Подтесты обеспечивают лучшую организацию, изолированные сбои и выборочный запуск тестов.

**Почему подтесты важны:**
- **Организация:** Группируйте связанные тесты иерархически
- **Изоляция:** Сбой одного подтеста не останавливает другие
- **Выборочный запуск:** Запускайте конкретные подтесты с флагом -run
- **Вывод:** Четкие имена тестов в CI логах

**Без подтестов (неясный вывод):**
\`\`\`bash
$ go test -v
=== RUN   TestAdd
--- PASS: TestAdd (0.00s)
=== RUN   TestSubtract
--- FAIL: TestSubtract (0.00s)  # Какой случай упал?
\`\`\`

**С подтестами (четкий вывод):**
\`\`\`bash
$ go test -v
=== RUN   TestCalculator
=== RUN   TestCalculator/Addition
=== RUN   TestCalculator/Addition/positive_numbers
=== RUN   TestCalculator/Addition/negative_numbers
--- PASS: TestCalculator/Addition (0.00s)
=== RUN   TestCalculator/Subtraction
=== RUN   TestCalculator/Subtraction/positive_result
=== RUN   TestCalculator/Subtraction/negative_result
--- FAIL: TestCalculator/Subtraction/negative_result (0.00s)  # Точный сбой!
\`\`\`

**Production преимущества:**
1. **CI Логи:** Точно видно какой сценарий упал
2. **Выборочное тестирование:** \`go test -run TestCalculator/Addition\`
3. **Отладка:** Фокус только на упавшем подтесте
4. **Покрытие:** Видно какие сценарии протестированы

**Реальный пример:**
\`\`\`go
// Из Go стандартной библиотеки net/http tests
func TestServer(t *testing.T) {
    t.Run("GET", func(t *testing.T) {
        t.Run("200 OK", func(t *testing.T) { /* ... */ })
        t.Run("404 Not Found", func(t *testing.T) { /* ... */ })
    })

    t.Run("POST", func(t *testing.T) {
        t.Run("201 Created", func(t *testing.T) { /* ... */ })
        t.Run("400 Bad Request", func(t *testing.T) { /* ... */ })
    })
}
\`\`\`

**Выборочный запуск:**
\`\`\`bash
# Запустить все тесты
go test -v

# Запустить только Addition тесты
go test -v -run TestCalculator/Addition

# Запустить конкретный подтест
go test -v -run TestCalculator/Addition/positive_numbers

# Запустить все "positive" подтесты
go test -v -run positive
\`\`\`

**Паттерн для сложных тестов:**
\`\`\`go
func TestUserAPI(t *testing.T) {
    t.Run("Create", func(t *testing.T) {
        t.Run("valid data", func(t *testing.T) { /* ... */ })
        t.Run("invalid email", func(t *testing.T) { /* ... */ })
        t.Run("duplicate email", func(t *testing.T) { /* ... */ })
    })

    t.Run("Update", func(t *testing.T) {
        t.Run("own profile", func(t *testing.T) { /* ... */ })
        t.Run("other profile", func(t *testing.T) { /* ... */ })
    })

    t.Run("Delete", func(t *testing.T) {
        t.Run("soft delete", func(t *testing.T) { /* ... */ })
        t.Run("cascade delete", func(t *testing.T) { /* ... */ })
    })
}
\`\`\`

Такая организация делает тесты самодокументирующимися и легкими для навигации.`,
			solutionCode: `package calc_test
func Add(a, b int) int      { return a + b }
func Subtract(a, b int) int { return a - b }
func Multiply(a, b int) int { return a * b }
func Divide(a, b int) int   { return a / b }

func TestCalculator(t *T) {
	// Тестирование сложения
	t.Run("Addition", func(t *T) {
		tests := []struct {
			name string
			a, b int
			want int
		}{
			{"положительные числа", 2, 3, 5},
			{"отрицательные числа", -2, -3, -5},
			{"с нулем", 5, 0, 5},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *T) {
				got := Add(tt.a, tt.b)
				if got != tt.want {
					t.Errorf("Add(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
				}
			})
		}
	})

	// Тестирование вычитания
	t.Run("Subtraction", func(t *T) {
		tests := []struct {
			name string
			a, b int
			want int
		}{
			{"положительный результат", 5, 3, 2},
			{"отрицательный результат", 3, 5, -2},
			{"нулевой результат", 5, 5, 0},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *T) {
				got := Subtract(tt.a, tt.b)
				if got != tt.want {
					t.Errorf("Subtract(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
				}
			})
		}
	})

	// Тестирование умножения
	t.Run("Multiplication", func(t *T) {
		tests := []struct {
			name string
			a, b int
			want int
		}{
			{"положительные числа", 3, 4, 12},
			{"с нулем", 5, 0, 0},
			{"отрицательные числа", -2, 3, -6},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *T) {
				got := Multiply(tt.a, tt.b)
				if got != tt.want {
					t.Errorf("Multiply(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
				}
			})
		}
	})

	// Тестирование деления
	t.Run("Division", func(t *T) {
		tests := []struct {
			name string
			a, b int
			want int
		}{
			{"точное деление", 10, 2, 5},
			{"усеченное деление", 10, 3, 3},
			{"отрицательный результат", -10, 2, -5},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *T) {
				got := Divide(tt.a, tt.b)
				if got != tt.want {
					t.Errorf("Divide(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
				}
			})
		}
	})
}`
		},
		uz: {
			title: `Sub-testlar`,
			description: `Yaxshi tashkilot va chiqish uchun nomlangan subtestlarni yaratish uchun **t.Run** dan foydalaning.

**Talablar:**
1. \`Calculator\` funksiyalarini amalga oshiring: Add, Subtract, Multiply, Divide
2. Har bir holat uchun 'name' fieldi bilan test jadvalini aniqlang
3. Har bir holat uchun 't.Run(tt.name, func(t *testing.T) { ... })' dan foydalaning
4. Subtest nomlarini ko'rish uchun 'go test -v' bilan testlarni ishga tushiring

**Misol:**
\`\`\`go
for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        // test logic
    })
}
\`\`\`

**Cheklovlar:**
- Har bir test holati tavsiflovchi nomga ega bo'lishi kerak
- Barcha holatlar uchun t.Run dan foydalaning`,
			hint1: `Subtest yaratish uchun t.Run(name, func(t *testing.T) { ... }) dan foydalaning.`,
			hint2: `Subtest nomlari chiqishda paydo bo'ladi: TestCalculator/Addition/positive_numbers`,
			whyItMatters: `Subtestlar yaxshiroq tashkilot, izolyatsiya qilingan xatolar va tanlab test ishga tushirishni ta'minlaydi.

**Nima uchun subtestlar muhim:**
- **Tashkilot:** Bog'liq testlarni ierarxik guruhlash
- **Izolyatsiya:** Bitta subtest xatosi boshqalarini to'xtatmaydi
- **Tanlab ishga tushirish:** -run flagi bilan muayyan subtestlarni ishga tushiring
- **Chiqish:** CI loglarida aniq test nomlari

**Subtestlarsiz (noaniq chiqish):**
\`\`\`bash
$ go test -v
=== RUN   TestAdd
--- PASS: TestAdd (0.00s)
=== RUN   TestSubtract
--- FAIL: TestSubtract (0.00s)  # Qaysi holat ishlamadi?
\`\`\`

**Subtestlar bilan (aniq chiqish):**
\`\`\`bash
$ go test -v
=== RUN   TestCalculator
=== RUN   TestCalculator/Addition
=== RUN   TestCalculator/Addition/positive_numbers
=== RUN   TestCalculator/Addition/negative_numbers
--- PASS: TestCalculator/Addition (0.00s)
=== RUN   TestCalculator/Subtraction
=== RUN   TestCalculator/Subtraction/positive_result
=== RUN   TestCalculator/Subtraction/negative_result
--- FAIL: TestCalculator/Subtraction/negative_result (0.00s)  # Aniq xato!
\`\`\`

**Production foydalari:**
1. **CI Loglar:** Qaysi stsenariy ishlamay qolganligi aniq ko'rinadi
2. **Tanlab testlash:** \`go test -run TestCalculator/Addition\`
3. **Debug:** Faqat ishlamagan subtestga e'tibor
4. **Qamrov:** Qaysi stsenariylar test qilinganini ko'rish

**Haqiqiy misol:**
\`\`\`go
// Go standart kutubxonasi net/http testlaridan
func TestServer(t *testing.T) {
    t.Run("GET", func(t *testing.T) {
        t.Run("200 OK", func(t *testing.T) { /* ... */ })
        t.Run("404 Not Found", func(t *testing.T) { /* ... */ })
    })

    t.Run("POST", func(t *testing.T) {
        t.Run("201 Created", func(t *testing.T) { /* ... */ })
        t.Run("400 Bad Request", func(t *testing.T) { /* ... */ })
    })
}
\`\`\`

**Tanlab ishga tushirish:**
\`\`\`bash
# Barcha testlarni ishga tushirish
go test -v

# Faqat Addition testlarini ishga tushirish
go test -v -run TestCalculator/Addition

# Muayyan subtestni ishga tushirish
go test -v -run TestCalculator/Addition/positive_numbers

# Barcha "positive" subtestlarni ishga tushirish
go test -v -run positive
\`\`\`

**Murakkab testlar uchun pattern:**
\`\`\`go
func TestUserAPI(t *testing.T) {
    t.Run("Create", func(t *testing.T) {
        t.Run("valid data", func(t *testing.T) { /* ... */ })
        t.Run("invalid email", func(t *testing.T) { /* ... */ })
        t.Run("duplicate email", func(t *testing.T) { /* ... */ })
    })

    t.Run("Update", func(t *testing.T) {
        t.Run("own profile", func(t *testing.T) { /* ... */ })
        t.Run("other profile", func(t *testing.T) { /* ... */ })
    })

    t.Run("Delete", func(t *testing.T) {
        t.Run("soft delete", func(t *testing.T) { /* ... */ })
        t.Run("cascade delete", func(t *testing.T) { /* ... */ })
    })
}
\`\`\`

Bu tashkilot testlarni o'z-o'zini hujjatlashtiradigan va navigatsiya qilish uchun oson qiladi.`,
			solutionCode: `package calc_test
func Add(a, b int) int      { return a + b }
func Subtract(a, b int) int { return a - b }
func Multiply(a, b int) int { return a * b }
func Divide(a, b int) int   { return a / b }

func TestCalculator(t *T) {
	// Qo'shishni tekshirish
	t.Run("Addition", func(t *T) {
		tests := []struct {
			name string
			a, b int
			want int
		}{
			{"musbat sonlar", 2, 3, 5},
			{"manfiy sonlar", -2, -3, -5},
			{"nol bilan", 5, 0, 5},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *T) {
				got := Add(tt.a, tt.b)
				if got != tt.want {
					t.Errorf("Add(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
				}
			})
		}
	})

	// Ayirishni tekshirish
	t.Run("Subtraction", func(t *T) {
		tests := []struct {
			name string
			a, b int
			want int
		}{
			{"musbat natija", 5, 3, 2},
			{"manfiy natija", 3, 5, -2},
			{"nol natija", 5, 5, 0},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *T) {
				got := Subtract(tt.a, tt.b)
				if got != tt.want {
					t.Errorf("Subtract(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
				}
			})
		}
	})

	// Ko'paytirishni tekshirish
	t.Run("Multiplication", func(t *T) {
		tests := []struct {
			name string
			a, b int
			want int
		}{
			{"musbat sonlar", 3, 4, 12},
			{"nol bilan", 5, 0, 0},
			{"manfiy sonlar", -2, 3, -6},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *T) {
				got := Multiply(tt.a, tt.b)
				if got != tt.want {
					t.Errorf("Multiply(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
				}
			})
		}
	})

	// Bo'lishni tekshirish
	t.Run("Division", func(t *T) {
		tests := []struct {
			name string
			a, b int
			want int
		}{
			{"aniq bo'linish", 10, 2, 5},
			{"qirqilgan bo'linish", 10, 3, 3},
			{"manfiy natija", -10, 2, -5},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *T) {
				got := Divide(tt.a, tt.b)
				if got != tt.want {
					t.Errorf("Divide(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
				}
			})
		}
	})
}`
		}
	}
};

export default task;
