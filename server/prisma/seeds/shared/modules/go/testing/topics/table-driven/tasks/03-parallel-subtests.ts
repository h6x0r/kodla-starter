import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-parallel-subtests',
	title: 'Parallel Subtests',
	difficulty: 'medium',	tags: ['go', 'testing', 'parallel', 'performance'],
	estimatedTime: '25m',	isPremium: false,
	youtubeUrl: '',
	description: `Run subtests in parallel using **t.Parallel()** for faster test execution.

**Requirements:**
1. Implement \`IsPrime(n int) bool\` function
2. Create table-driven test with t.Run
3. Call \`t.Parallel()\` in each subtest
4. Test numbers from 1 to 20
5. Verify tests run concurrently

**Example:**
\`\`\`go
for _, tt := range tests {
    tt := tt  // Capture range variable
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()  // Run in parallel
        // test logic...
    })
}
\`\`\`

**Constraints:**
- Must capture loop variable: \`tt := tt\`
- Call t.Parallel() immediately after subtest creation
- Test at least 10 numbers`,
	initialCode: `package parallel_test
// TODO: Implement IsPrime function
func IsPrime(n int) bool {
	return false // TODO: Implement
}

// TODO: Write parallel subtests for IsPrime
func TestIsPrime(t *T) {
	// TODO: Implement
}`,
	solutionCode: `package parallel_test

import (
	"fmt"
)

func IsPrime(n int) bool {
	if n < 2 {  // Numbers less than 2 are not prime
		return false
	}
	for i := 2; i*i <= n; i++ {  // Check divisors up to sqrt(n)
		if n%i == 0 {
			return false
		}
	}
	return true
}

func TestIsPrime(t *T) {
	// Define test cases
	tests := []struct {
		input int
		want  bool
	}{
		{1, false},   // Not prime
		{2, true},    // Smallest prime
		{3, true},    // Prime
		{4, false},   // Composite
		{5, true},    // Prime
		{6, false},   // Composite
		{7, true},    // Prime
		{8, false},   // Composite
		{9, false},   // Composite
		{10, false},  // Composite
		{11, true},   // Prime
		{12, false},  // Composite
		{13, true},   // Prime
		{17, true},   // Prime
		{20, false},  // Composite
	}

	for _, tt := range tests {
		tt := tt  // Capture range variable for parallel execution
		t.Run(fmt.Sprintf("n=%d", tt.input), func(t *T) {
			t.Parallel()  // Run this subtest in parallel

			got := IsPrime(tt.input)
			if got != tt.want {
				t.Errorf("IsPrime(%d) = %v, want %v", tt.input, got, tt.want)
			}
		})
	}
}`,
			hint1: `Always capture loop variable before parallel subtests: tt := tt. Otherwise all tests use the last value.`,
			hint2: `Call t.Parallel() as first line in subtest func. This signals test framework to run concurrently.`,
			testCode: `package parallel_test

import (
	"fmt"
)

// Test1: Basic prime number detection
func Test1(t *T) {
	if !IsPrime(7) {
		t.Error("7 should be prime")
	}
	if IsPrime(4) {
		t.Error("4 should not be prime")
	}
}

// Test2: Edge case - numbers less than 2
func Test2(t *T) {
	tests := []struct {
		n    int
		want bool
	}{
		{0, false},
		{1, false},
		{-1, false},
		{-100, false},
	}
	for _, tt := range tests {
		if got := IsPrime(tt.n); got != tt.want {
			t.Errorf("IsPrime(%d) = %v, want %v", tt.n, got, tt.want)
		}
	}
}

// Test3: Small primes
func Test3(t *T) {
	primes := []int{2, 3, 5, 7, 11, 13, 17, 19, 23, 29}
	for _, p := range primes {
		if !IsPrime(p) {
			t.Errorf("IsPrime(%d) should be true", p)
		}
	}
}

// Test4: Small composites
func Test4(t *T) {
	composites := []int{4, 6, 8, 9, 10, 12, 14, 15, 16, 18}
	for _, c := range composites {
		if IsPrime(c) {
			t.Errorf("IsPrime(%d) should be false", c)
		}
	}
}

// Test5: Parallel subtests basic
func Test5(t *T) {
	tests := []struct {
		input int
		want  bool
	}{
		{2, true},
		{3, true},
		{4, false},
		{5, true},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(fmt.Sprintf("n=%d", tt.input), func(t *T) {
			t.Parallel()
			if got := IsPrime(tt.input); got != tt.want {
				t.Errorf("IsPrime(%d) = %v, want %v", tt.input, got, tt.want)
			}
		})
	}
}

// Test6: Parallel with larger primes
func Test6(t *T) {
	largePrimes := []int{97, 101, 103, 107, 109}
	for _, p := range largePrimes {
		p := p
		t.Run(fmt.Sprintf("prime-%d", p), func(t *T) {
			t.Parallel()
			if !IsPrime(p) {
				t.Errorf("IsPrime(%d) should be true", p)
			}
		})
	}
}

// Test7: Perfect squares are not prime
func Test7(t *T) {
	squares := []int{4, 9, 16, 25, 36, 49, 64, 81, 100}
	for _, s := range squares {
		s := s
		t.Run(fmt.Sprintf("square-%d", s), func(t *T) {
			t.Parallel()
			if IsPrime(s) {
				t.Errorf("IsPrime(%d) should be false (perfect square)", s)
			}
		})
	}
}

// Test8: Numbers around edge boundaries
func Test8(t *T) {
	tests := []struct {
		input int
		want  bool
	}{
		{1, false},
		{2, true},
		{3, true},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(fmt.Sprintf("boundary-%d", tt.input), func(t *T) {
			t.Parallel()
			if got := IsPrime(tt.input); got != tt.want {
				t.Errorf("IsPrime(%d) = %v, want %v", tt.input, got, tt.want)
			}
		})
	}
}

// Test9: Parallel subtests with range 1-20
func Test9(t *T) {
	expected := map[int]bool{
		1: false, 2: true, 3: true, 4: false, 5: true,
		6: false, 7: true, 8: false, 9: false, 10: false,
		11: true, 12: false, 13: true, 14: false, 15: false,
		16: false, 17: true, 18: false, 19: true, 20: false,
	}
	for n := 1; n <= 20; n++ {
		n := n
		t.Run(fmt.Sprintf("n=%d", n), func(t *T) {
			t.Parallel()
			if got := IsPrime(n); got != expected[n] {
				t.Errorf("IsPrime(%d) = %v, want %v", n, got, expected[n])
			}
		})
	}
}

// Test10: Verify function exists and returns bool
func Test10(t *T) {
	results := make([]bool, 0, 5)
	for _, n := range []int{2, 3, 4, 5, 6} {
		results = append(results, IsPrime(n))
	}
	expected := []bool{true, true, false, true, false}
	for i, got := range results {
		if got != expected[i] {
			t.Errorf("Index %d: got %v, want %v", i, got, expected[i])
		}
	}
}
`,
			whyItMatters: `Parallel tests dramatically reduce test suite execution time, crucial for large codebases.

**Why Parallel Tests Matter:**
- **Speed:** 10 tests × 1s = 10s sequential, 1s parallel
- **CI Time:** Faster tests = faster deployments
- **Resource Usage:** Utilize all CPU cores
- **Developer Productivity:** Quick feedback loops

**Sequential vs Parallel:**
\`\`\`go
// Sequential (slow)
func TestSlow(t *testing.T) {
    for _, tt := range tests {  // 10 tests × 1s = 10s
        t.Run(tt.name, func(t *testing.T) {
            time.Sleep(1 * time.Second)  // Simulate API call
        })
    }
}

// Parallel (fast)
func TestFast(t *testing.T) {
    for _, tt := range tests {
        tt := tt  // CRITICAL: Capture variable
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()  // All 10 tests run together = 1s
            time.Sleep(1 * time.Second)
        })
    }
}
\`\`\`

**Common Pitfall - Loop Variable Capture:**
\`\`\`go
// WRONG - Race condition
for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()
        IsPrime(tt.input)  // tt changes while test runs!
    })
}

// CORRECT - Capture variable
for _, tt := range tests {
    tt := tt  // Create new variable for each iteration
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()
        IsPrime(tt.input)  // Safe: each test has own tt
    })
}
\`\`\`

**Production Benefits:**
- **Large Test Suites:** 1000 tests in minutes, not hours
- **Integration Tests:** API calls, database queries run concurrently
- **CI Pipelines:** Reduce build time from 30min to 5min
- **Developer Experience:** Quick test feedback during development

**Real-World Example:**
At Google, parallel tests reduced Go standard library test time from 15 minutes to 3 minutes on multi-core machines.

**When NOT to Use Parallel:**
- Tests that modify shared global state
- Tests that use same database records
- Tests with race conditions
- Setup/teardown that must be sequential

**Safe Parallel Patterns:**
\`\`\`go
// HTTP tests (safe - httptest is stateless)
func TestAPI(t *testing.T) {
    for _, tt := range tests {
        tt := tt
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()
            req := httptest.NewRequest("GET", tt.url, nil)
            rec := httptest.NewRecorder()
            handler.ServeHTTP(rec, req)
            // assertions...
        })
    }
}

// Pure function tests (safe - no state)
func TestMath(t *testing.T) {
    for _, tt := range tests {
        tt := tt
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()
            got := Calculate(tt.input)
            // assertions...
        })
    }
}
\`\`\`

**Control Parallelism:**
\`\`\`bash
# Limit parallel tests (default: GOMAXPROCS)
go test -parallel 4

# No parallelism
go test -parallel 1
\`\`\`

**Note:** Go 1.22+ automatically captures loop variables, but \`tt := tt\` still works and is common in existing code.`,	order: 2,
	translations: {
		ru: {
			title: 'Параллельные подтесты',
			description: `Запускайте подтесты параллельно используя **t.Parallel()** для более быстрого выполнения тестов.

**Требования:**
1. Реализуйте функцию \`IsPrime(n int) bool\`
2. Создайте табличный тест с t.Run
3. Вызовите \`t.Parallel()\` в каждом подтесте
4. Тестируйте числа от 1 до 20
5. Проверьте что тесты выполняются параллельно

**Пример:**
\`\`\`go
for _, tt := range tests {
    tt := tt  // Захватить переменную
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()
        // логика теста...
    })
}
\`\`\`

**Ограничения:**
- Должны захватить переменную цикла: \`tt := tt\`
- Вызывать t.Parallel() сразу после создания подтеста`,
			hint1: `Всегда захватывайте переменную цикла перед параллельными подтестами: tt := tt.`,
			hint2: `Вызывайте t.Parallel() первой строкой в функции подтеста.`,
			whyItMatters: `Параллельные тесты драматически сокращают время выполнения тестового набора, что критично для больших кодовых баз.

**Почему параллельные тесты важны:**
- **Скорость:** 10 тестов × 1с = 10с последовательно, 1с параллельно
- **Время CI:** Быстрые тесты = быстрые развертывания
- **Использование ресурсов:** Используют все ядра процессора
- **Производительность разработчика:** Быстрые циклы обратной связи

**Последовательные vs Параллельные:**
\`\`\`go
// Последовательные (медленные)
func TestSlow(t *testing.T) {
    for _, tt := range tests {  // 10 тестов × 1с = 10с
        t.Run(tt.name, func(t *testing.T) {
            time.Sleep(1 * time.Second)  // Симуляция API вызова
        })
    }
}

// Параллельные (быстрые)
func TestFast(t *testing.T) {
    for _, tt := range tests {
        tt := tt  // КРИТИЧНО: Захватить переменную
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()  // Все 10 тестов выполняются вместе = 1с
            time.Sleep(1 * time.Second)
        })
    }
}
\`\`\`

**Распространенная ошибка - Захват переменной цикла:**
\`\`\`go
// НЕПРАВИЛЬНО - Состояние гонки
for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()
        IsPrime(tt.input)  // tt изменяется пока тест выполняется!
    })
}

// ПРАВИЛЬНО - Захват переменной
for _, tt := range tests {
    tt := tt  // Создать новую переменную для каждой итерации
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()
        IsPrime(tt.input)  // Безопасно: каждый тест имеет свой tt
    })
}
\`\`\`

**Преимущества в production:**
- **Большие наборы тестов:** 1000 тестов за минуты, а не часы
- **Интеграционные тесты:** API вызовы, запросы к БД выполняются одновременно
- **CI пайплайны:** Сократите время сборки с 30 минут до 5 минут
- **Опыт разработчика:** Быстрая обратная связь во время разработки

**Пример из реального мира:**
В Google параллельные тесты сократили время тестирования стандартной библиотеки Go с 15 минут до 3 минут на многоядерных машинах.

**Когда НЕ использовать параллельные тесты:**
- Тесты, модифицирующие общее глобальное состояние
- Тесты, использующие одни и те же записи БД
- Тесты с состояниями гонки
- Настройка/очистка, которая должна быть последовательной

**Безопасные паттерны параллелизма:**
\`\`\`go
// HTTP тесты (безопасно - httptest не имеет состояния)
func TestAPI(t *testing.T) {
    for _, tt := range tests {
        tt := tt
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()
            req := httptest.NewRequest("GET", tt.url, nil)
            rec := httptest.NewRecorder()
            handler.ServeHTTP(rec, req)
            // проверки...
        })
    }
}

// Тесты чистых функций (безопасно - нет состояния)
func TestMath(t *testing.T) {
    for _, tt := range tests {
        tt := tt
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()
            got := Calculate(tt.input)
            // проверки...
        })
    }
}
\`\`\`

**Управление параллелизмом:**
\`\`\`bash
# Ограничить параллельные тесты (по умолчанию: GOMAXPROCS)
go test -parallel 4

# Без параллелизма
go test -parallel 1
\`\`\`

**Примечание:** Go 1.22+ автоматически захватывает переменные цикла, но \`tt := tt\` все еще работает и распространено в существующем коде.`,
			solutionCode: `package parallel_test

import (
	"fmt"
)

func IsPrime(n int) bool {
	if n < 2 {  // Числа меньше 2 не простые
		return false
	}
	for i := 2; i*i <= n; i++ {  // Проверить делители до sqrt(n)
		if n%i == 0 {
			return false
		}
	}
	return true
}

func TestIsPrime(t *T) {
	// Определить тестовые случаи
	tests := []struct {
		input int
		want  bool
	}{
		{1, false},   // Не простое
		{2, true},    // Наименьшее простое
		{3, true},    // Простое
		{4, false},   // Составное
		{5, true},    // Простое
		{6, false},   // Составное
		{7, true},    // Простое
		{8, false},   // Составное
		{9, false},   // Составное
		{10, false},  // Составное
		{11, true},   // Простое
		{12, false},  // Составное
		{13, true},   // Простое
		{17, true},   // Простое
		{20, false},  // Составное
	}

	for _, tt := range tests {
		tt := tt  // Захватить переменную диапазона для параллельного выполнения
		t.Run(fmt.Sprintf("n=%d", tt.input), func(t *T) {
			t.Parallel()  // Запустить этот подтест параллельно

			got := IsPrime(tt.input)
			if got != tt.want {
				t.Errorf("IsPrime(%d) = %v, want %v", tt.input, got, tt.want)
			}
		})
	}
}`
		},
		uz: {
			title: `Parallel sub-testlar`,
			description: `Tezroq test bajarish uchun **t.Parallel()** dan foydalanib subtestlarni parallel ravishda ishga tushiring.

**Talablar:**
1. \`IsPrime(n int) bool\` funksiyasini amalga oshiring
2. t.Run bilan jadval asosidagi test yarating
3. Har bir subtestda 't.Parallel()' ni chaqiring
4. 1 dan 20 gacha sonlarni tekshiring
5. Testlar bir vaqtning o'zida ishlashini tekshiring

**Misol:**
\`\`\`go
for _, tt := range tests {
    tt := tt  // O'zgaruvchini ushlash
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()
        // test mantiq...
    })
}
\`\`\`

**Cheklovlar:**
- Tsikl o'zgaruvchisini ushlash kerak: 'tt := tt'
- Subtest yaratilgandan keyin darhol t.Parallel() ni chaqiring`,
			hint1: `Parallel subtestlardan oldin har doim tsikl o'zgaruvchisini ushlang: tt := tt.`,
			hint2: `Subtest funksiyada birinchi qator sifatida t.Parallel() ni chaqiring.`,
			whyItMatters: `Parallel testlar test to'plamini bajarish vaqtini keskin qisqartiradi, bu katta kod bazalari uchun juda muhim.

**Nima uchun parallel testlar muhim:**
- **Tezlik:** 10 test × 1s = 10s ketma-ket, 1s parallel
- **CI vaqti:** Tez testlar = tez deploymentlar
- **Resurs foydalanish:** Barcha CPU yadrolaridan foydalanish
- **Ishlab chiquvchi unumdorligi:** Tez fikr-mulohaza davrlari

**Ketma-ket vs Parallel:**
\`\`\`go
// Ketma-ket (sekin)
func TestSlow(t *testing.T) {
    for _, tt := range tests {  // 10 test × 1s = 10s
        t.Run(tt.name, func(t *testing.T) {
            time.Sleep(1 * time.Second)  // API chaqiruvini simulyatsiya qilish
        })
    }
}

// Parallel (tez)
func TestFast(t *testing.T) {
    for _, tt := range tests {
        tt := tt  // MUHIM: O'zgaruvchini ushlash
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()  // Barcha 10 test birga ishlaydi = 1s
            time.Sleep(1 * time.Second)
        })
    }
}
\`\`\`

**Keng tarqalgan xato - Tsikl o'zgaruvchisini ushlash:**
\`\`\`go
// NOTO'G'RI - Poyga holati
for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()
        IsPrime(tt.input)  // tt test ishlayotganda o'zgaradi!
    })
}

// TO'G'RI - O'zgaruvchini ushlash
for _, tt := range tests {
    tt := tt  // Har bir iteratsiya uchun yangi o'zgaruvchi yaratish
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()
        IsPrime(tt.input)  // Xavfsiz: har bir test o'z tt ga ega
    })
}
\`\`\`

**Production afzalliklari:**
- **Katta test to'plamlari:** 1000 testni soatlarda emas, daqiqalarda
- **Integratsiya testlari:** API chaqiruvlari, ma'lumotlar bazasi so'rovlari bir vaqtning o'zida ishlaydi
- **CI pipelinelar:** Build vaqtini 30 daqiqadan 5 daqiqagacha qisqartiring
- **Ishlab chiquvchi tajribasi:** Rivojlantirish davomida tez fikr-mulohaza

**Haqiqiy dunyo misoli:**
Google'da parallel testlar ko'p yadroli mashinalarda Go standart kutubxonasi test vaqtini 15 daqiqadan 3 daqiqagacha qisqartirdi.

**Qachon parallel testlardan foydalanMASLIK kerak:**
- Umumiy global holatni o'zgartiruvchi testlar
- Bir xil ma'lumotlar bazasi yozuvlaridan foydalanadigan testlar
- Poyga holatlari bo'lgan testlar
- Ketma-ket bo'lishi kerak bo'lgan sozlash/tozalash

**Xavfsiz parallel patternlar:**
\`\`\`go
// HTTP testlari (xavfsiz - httptest holatga ega emas)
func TestAPI(t *testing.T) {
    for _, tt := range tests {
        tt := tt
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()
            req := httptest.NewRequest("GET", tt.url, nil)
            rec := httptest.NewRecorder()
            handler.ServeHTTP(rec, req)
            // tekshiruvlar...
        })
    }
}

// Toza funksiya testlari (xavfsiz - holat yo'q)
func TestMath(t *testing.T) {
    for _, tt := range tests {
        tt := tt
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()
            got := Calculate(tt.input)
            // tekshiruvlar...
        })
    }
}
\`\`\`

**Parallellikni boshqarish:**
\`\`\`bash
# Parallel testlarni cheklash (default: GOMAXPROCS)
go test -parallel 4

# Parallellik yo'q
go test -parallel 1
\`\`\`

**Eslatma:** Go 1.22+ tsikl o'zgaruvchilarini avtomatik ushlaydi, lekin \`tt := tt\` hali ham ishlaydi va mavjud kodda keng tarqalgan.`,
			solutionCode: `package parallel_test

import (
	"fmt"
)

func IsPrime(n int) bool {
	if n < 2 {  // 2 dan kichik sonlar tub emas
		return false
	}
	for i := 2; i*i <= n; i++ {  // sqrt(n) gacha bo'luvchilarni tekshirish
		if n%i == 0 {
			return false
		}
	}
	return true
}

func TestIsPrime(t *T) {
	// Test holatlarini aniqlash
	tests := []struct {
		input int
		want  bool
	}{
		{1, false},   // Tub emas
		{2, true},    // Eng kichik tub
		{3, true},    // Tub
		{4, false},   // Murakkab
		{5, true},    // Tub
		{6, false},   // Murakkab
		{7, true},    // Tub
		{8, false},   // Murakkab
		{9, false},   // Murakkab
		{10, false},  // Murakkab
		{11, true},   // Tub
		{12, false},  // Murakkab
		{13, true},   // Tub
		{17, true},   // Tub
		{20, false},  // Murakkab
	}

	for _, tt := range tests {
		tt := tt  // Parallel bajarish uchun diapazon o'zgaruvchisini ushlash
		t.Run(fmt.Sprintf("n=%d", tt.input), func(t *T) {
			t.Parallel()  // Ushbu subtestni parallel ravishda ishga tushirish

			got := IsPrime(tt.input)
			if got != tt.want {
				t.Errorf("IsPrime(%d) = %v, want %v", tt.input, got, tt.want)
			}
		})
	}
}`
		}
	}
};

export default task;
