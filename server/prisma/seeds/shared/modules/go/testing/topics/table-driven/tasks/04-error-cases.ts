import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-error-cases',
	title: 'Testing Error Cases',
	difficulty: 'medium',	tags: ['go', 'testing', 'errors', 'validation'],
	estimatedTime: '25m',	isPremium: false,
	youtubeUrl: '',
	description: `Test both success and error cases in table-driven tests with **wantErr** field.

**Requirements:**
1. Implement \`ParseEmail(s string) (string, error)\` that validates email format
2. Create test table with fields: \`input\`, \`want\`, \`wantErr\` (bool)
3. Test valid emails (return cleaned email, no error)
4. Test invalid emails (return "", error)
5. Use table-driven approach with t.Run

**Example:**
\`\`\`go
tests := []struct {
    name    string
    input   string
    want    string
    wantErr bool
}{
    {"valid", "user@example.com", "user@example.com", false},
    {"invalid", "not-an-email", "", true},
}
\`\`\`

**Constraints:**
- Email must contain @ and . after @
- Test at least 3 valid and 3 invalid cases
- Check both error presence and return value`,
	initialCode: `package email_test

import (
	"errors"
	"strings"
)

// TODO: Implement ParseEmail that validates email format
func ParseEmail(s string) (string, error) {
	var zero string
	return zero, nil // TODO: Implement
}

// TODO: Write table-driven test with error cases
func TestParseEmail(t *T) {
	// TODO: Implement
}`,
	solutionCode: `package email_test

import (
	"errors"
	"strings"
)

func ParseEmail(s string) (string, error) {
	s = strings.TrimSpace(s)  // Trim whitespace

	// Validate email format
	if !strings.Contains(s, "@") {
		return "", errors.New("email must contain @")
	}

	parts := strings.Split(s, "@")
	if len(parts) != 2 {
		return "", errors.New("email must have exactly one @")
	}

	if parts[0] == "" {
		return "", errors.New("email must have username before @")
	}

	if !strings.Contains(parts[1], ".") {
		return "", errors.New("email domain must contain .")
	}

	return s, nil  // Return cleaned email
}

func TestParseEmail(t *T) {
	tests := []struct {
		name    string
		input   string
		want    string
		wantErr bool
	}{
		// Valid cases
		{
			name:    "valid email",
			input:   "user@example.com",
			want:    "user@example.com",
			wantErr: false,
		},
		{
			name:    "email with subdomain",
			input:   "user@mail.example.com",
			want:    "user@mail.example.com",
			wantErr: false,
		},
		{
			name:    "email with whitespace",
			input:   "  user@example.com  ",
			want:    "user@example.com",
			wantErr: false,
		},

		// Invalid cases
		{
			name:    "missing @",
			input:   "userexample.com",
			want:    "",
			wantErr: true,
		},
		{
			name:    "missing domain",
			input:   "user@",
			want:    "",
			wantErr: true,
		},
		{
			name:    "missing username",
			input:   "@example.com",
			want:    "",
			wantErr: true,
		},
		{
			name:    "missing dot in domain",
			input:   "user@example",
			want:    "",
			wantErr: true,
		},
		{
			name:    "multiple @ signs",
			input:   "user@@example.com",
			want:    "",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *T) {
			got, err := ParseEmail(tt.input)

			// Check error expectation
			if (err != nil) != tt.wantErr {
				t.Errorf("ParseEmail(%q) error = %v, wantErr %v", tt.input, err, tt.wantErr)
				return
			}

			// Check return value
			if got != tt.want {
				t.Errorf("ParseEmail(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}`,
			hint1: `Use (err != nil) != tt.wantErr to check if error presence matches expectation.`,
			hint2: `Return early after error check to avoid checking result when error is expected.`,
			testCode: `package email_test

import (
	"errors"
	"strings"
)

// Test1: Valid email returns no error
func Test1(t *T) {
	got, err := ParseEmail("user@example.com")
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	if got != "user@example.com" {
		t.Errorf("got %q, want %q", got, "user@example.com")
	}
}

// Test2: Missing @ returns error
func Test2(t *T) {
	_, err := ParseEmail("userexample.com")
	if err == nil {
		t.Error("expected error for missing @")
	}
}

// Test3: Missing dot in domain returns error
func Test3(t *T) {
	_, err := ParseEmail("user@example")
	if err == nil {
		t.Error("expected error for missing dot in domain")
	}
}

// Test4: Empty username returns error
func Test4(t *T) {
	_, err := ParseEmail("@example.com")
	if err == nil {
		t.Error("expected error for empty username")
	}
}

// Test5: Multiple @ signs returns error
func Test5(t *T) {
	_, err := ParseEmail("user@@example.com")
	if err == nil {
		t.Error("expected error for multiple @ signs")
	}
}

// Test6: Whitespace trimming works
func Test6(t *T) {
	got, err := ParseEmail("  user@example.com  ")
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	if got != "user@example.com" {
		t.Errorf("got %q, want %q (whitespace should be trimmed)", got, "user@example.com")
	}
}

// Test7: Subdomain email is valid
func Test7(t *T) {
	got, err := ParseEmail("user@mail.example.com")
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	if got != "user@mail.example.com" {
		t.Errorf("got %q, want %q", got, "user@mail.example.com")
	}
}

// Test8: Table-driven with wantErr pattern
func Test8(t *T) {
	tests := []struct {
		name    string
		input   string
		want    string
		wantErr bool
	}{
		{"valid", "test@test.com", "test@test.com", false},
		{"no @", "testtest.com", "", true},
		{"no dot", "test@test", "", true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *T) {
			got, err := ParseEmail(tt.input)
			if (err != nil) != tt.wantErr {
				t.Errorf("ParseEmail(%q) error = %v, wantErr %v", tt.input, err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("ParseEmail(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}

// Test9: Empty input returns error
func Test9(t *T) {
	_, err := ParseEmail("")
	if err == nil {
		t.Error("expected error for empty input")
	}
}

// Test10: Complex valid emails
func Test10(t *T) {
	validEmails := []string{
		"user@example.com",
		"user.name@example.com",
		"user+tag@example.com",
		"user@sub.domain.com",
	}
	for _, email := range validEmails {
		got, err := ParseEmail(email)
		if err != nil {
			t.Errorf("ParseEmail(%q) unexpected error: %v", email, err)
			continue
		}
		if got != email {
			t.Errorf("ParseEmail(%q) = %q, want %q", email, got, email)
		}
	}
}
`,
			whyItMatters: `Testing error paths is critical - production systems must handle invalid input gracefully.

**Why Error Case Testing Matters:**
- **Security:** Invalid input shouldn't crash or expose internals
- **User Experience:** Clear error messages help users fix problems
- **Reliability:** Most production bugs are in error handling paths
- **Completeness:** Error cases outnumber happy path cases

**Error Testing Pattern:**
\`\`\`go
tests := []struct {
    name    string
    input   string
    want    string
    wantErr bool
}{
    // Happy path
    {"valid", "good", "good", false},

    // Error paths (usually more cases)
    {"empty", "", "", true},
    {"invalid format", "bad", "", true},
    {"too long", "x" * 1000, "", true},
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        got, err := Parse(tt.input)

        // Check error
        if (err != nil) != tt.wantErr {
            t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
            return  // Don't check result if error expectation wrong
        }

        // Check result (only if no error expected)
        if got != tt.want {
            t.Errorf("got %v, want %v", got, tt.want)
        }
    })
}
\`\`\`

**Production Benefits:**
- **Validation Testing:** Ensure all invalid inputs are rejected
- **API Contract:** Document what inputs are accepted/rejected
- **Regression:** Discovered bugs become test cases
- **Security:** Prevent injection attacks via input validation

**Real-World Example:**
Stripe API validates payment amounts:
\`\`\`go
func TestValidateAmount(t *testing.T) {
    tests := []struct {
        name    string
        amount  int
        wantErr bool
    }{
        {"valid", 1000, false},
        {"minimum", 50, false},
        {"too small", 49, true},      // Below minimum
        {"negative", -100, true},      // Invalid
        {"zero", 0, true},             // Invalid
        {"too large", 100000000, true}, // Above maximum
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateAmount(tt.amount)
            if (err != nil) != tt.wantErr {
                t.Errorf("ValidateAmount(%d) error = %v, wantErr %v",
                    tt.amount, err, tt.wantErr)
            }
        })
    }
}
\`\`\`

**Advanced Pattern - Error Message Testing:**
\`\`\`go
tests := []struct {
    name       string
    input      string
    want       string
    wantErr    bool
    errMessage string  // Expected error message
}{
    {
        name:       "missing @",
        input:      "invalid",
        want:       "",
        wantErr:    true,
        errMessage: "email must contain @",
    },
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        got, err := ParseEmail(tt.input)

        if tt.wantErr {
            if err == nil {
                t.Fatal("expected error, got nil")
            }
            if err.Error() != tt.errMessage {
                t.Errorf("error message = %q, want %q",
                    err.Error(), tt.errMessage)
            }
            return
        }

        if err != nil {
            t.Fatalf("unexpected error: %v", err)
        }

        if got != tt.want {
            t.Errorf("got %q, want %q", got, tt.want)
        }
    })
}
\`\`\`

**Statistics:**
- 80% of production bugs are in error handling code
- Testing only happy path gives false confidence
- Error cases often outnumber success cases 3:1

At Amazon, all API validators must test both valid and invalid inputs, preventing billions of dollars in errors from invalid data.`,	order: 3,
	translations: {
		ru: {
			title: 'Тесты ошибок',
			description: `Тестируйте успешные и ошибочные случаи в табличных тестах с полем **wantErr**.

**Требования:**
1. Реализуйте \`ParseEmail(s string) (string, error)\` валидирующий формат email
2. Создайте таблицу тестов с полями: \`input\`, \`want\`, \`wantErr\` (bool)
3. Тестируйте валидные email (возврат очищенного email, без ошибки)
4. Тестируйте невалидные email (возврат "", ошибка)
5. Используйте табличный подход с t.Run

**Пример:**
\`\`\`go
tests := []struct {
    name    string
    input   string
    want    string
    wantErr bool
}{
    {"valid", "user@example.com", "user@example.com", false},
    {"invalid", "not-an-email", "", true},
}
\`\`\`

**Ограничения:**
- Email должен содержать @ и . после @
- Тестируйте минимум 3 валидных и 3 невалидных случая`,
			hint1: `Используйте (err != nil) != tt.wantErr для проверки соответствия наличия ошибки ожиданию.`,
			hint2: `Возвращайтесь рано после проверки ошибки чтобы избежать проверки результата когда ожидается ошибка.`,
			whyItMatters: `Тестирование путей ошибок критично - production системы должны корректно обрабатывать невалидный ввод.

**Почему тестирование случаев ошибок важно:**
- **Безопасность:** Невалидный ввод не должен вызывать крах или раскрывать внутренности системы
- **Пользовательский опыт:** Четкие сообщения об ошибках помогают пользователям исправить проблемы
- **Надежность:** Большинство production багов находятся в путях обработки ошибок
- **Полнота:** Случаев ошибок обычно больше, чем happy path случаев

**Паттерн тестирования ошибок:**
\`\`\`go
tests := []struct {
    name    string
    input   string
    want    string
    wantErr bool
}{
    // Happy path
    {"valid", "good", "good", false},

    // Пути ошибок (обычно больше случаев)
    {"empty", "", "", true},
    {"invalid format", "bad", "", true},
    {"too long", "x" * 1000, "", true},
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        got, err := Parse(tt.input)

        // Проверить ошибку
        if (err != nil) != tt.wantErr {
            t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
            return  // Не проверять результат если ожидание ошибки неверно
        }

        // Проверить результат (только если ошибка не ожидалась)
        if got != tt.want {
            t.Errorf("got %v, want %v", got, tt.want)
        }
    })
}
\`\`\`

**Преимущества в production:**
- **Тестирование валидации:** Убедитесь что все невалидные входы отклоняются
- **Контракт API:** Документируйте какие входы принимаются/отклоняются
- **Регрессия:** Обнаруженные баги становятся тестовыми случаями
- **Безопасность:** Предотвращайте инъекционные атаки через валидацию входов

**Пример из реального мира:**
Stripe API валидирует суммы платежей:
\`\`\`go
func TestValidateAmount(t *testing.T) {
    tests := []struct {
        name    string
        amount  int
        wantErr bool
    }{
        {"valid", 1000, false},
        {"minimum", 50, false},
        {"too small", 49, true},      // Ниже минимума
        {"negative", -100, true},      // Невалидно
        {"zero", 0, true},             // Невалидно
        {"too large", 100000000, true}, // Выше максимума
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateAmount(tt.amount)
            if (err != nil) != tt.wantErr {
                t.Errorf("ValidateAmount(%d) error = %v, wantErr %v",
                    tt.amount, err, tt.wantErr)
            }
        })
    }
}
\`\`\`

**Продвинутый паттерн - Тестирование сообщений об ошибках:**
\`\`\`go
tests := []struct {
    name       string
    input      string
    want       string
    wantErr    bool
    errMessage string  // Ожидаемое сообщение об ошибке
}{
    {
        name:       "missing @",
        input:      "invalid",
        want:       "",
        wantErr:    true,
        errMessage: "email must contain @",
    },
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        got, err := ParseEmail(tt.input)

        if tt.wantErr {
            if err == nil {
                t.Fatal("expected error, got nil")
            }
            if err.Error() != tt.errMessage {
                t.Errorf("error message = %q, want %q",
                    err.Error(), tt.errMessage)
            }
            return
        }

        if err != nil {
            t.Fatalf("unexpected error: %v", err)
        }

        if got != tt.want {
            t.Errorf("got %q, want %q", got, tt.want)
        }
    })
}
\`\`\`

**Статистика:**
- 80% production багов находятся в коде обработки ошибок
- Тестирование только happy path дает ложную уверенность
- Случаи ошибок часто превосходят случаи успеха в соотношении 3:1

В Amazon все валидаторы API должны тестировать как валидные, так и невалидные входы, предотвращая миллиарды долларов ошибок от невалидных данных.`,
			solutionCode: `package email_test

import (
	"errors"
	"strings"
)

func ParseEmail(s string) (string, error) {
	s = strings.TrimSpace(s)  // Обрезать пробелы

	// Валидировать формат email
	if !strings.Contains(s, "@") {
		return "", errors.New("email must contain @")
	}

	parts := strings.Split(s, "@")
	if len(parts) != 2 {
		return "", errors.New("email must have exactly one @")
	}

	if parts[0] == "" {
		return "", errors.New("email must have username before @")
	}

	if !strings.Contains(parts[1], ".") {
		return "", errors.New("email domain must contain .")
	}

	return s, nil  // Вернуть очищенный email
}

func TestParseEmail(t *T) {
	tests := []struct {
		name    string
		input   string
		want    string
		wantErr bool
	}{
		// Валидные случаи
		{
			name:    "валидный email",
			input:   "user@example.com",
			want:    "user@example.com",
			wantErr: false,
		},
		{
			name:    "email с поддоменом",
			input:   "user@mail.example.com",
			want:    "user@mail.example.com",
			wantErr: false,
		},
		{
			name:    "email с пробелами",
			input:   "  user@example.com  ",
			want:    "user@example.com",
			wantErr: false,
		},

		// Невалидные случаи
		{
			name:    "отсутствует @",
			input:   "userexample.com",
			want:    "",
			wantErr: true,
		},
		{
			name:    "отсутствует домен",
			input:   "user@",
			want:    "",
			wantErr: true,
		},
		{
			name:    "отсутствует имя пользователя",
			input:   "@example.com",
			want:    "",
			wantErr: true,
		},
		{
			name:    "отсутствует точка в домене",
			input:   "user@example",
			want:    "",
			wantErr: true,
		},
		{
			name:    "несколько @ знаков",
			input:   "user@@example.com",
			want:    "",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *T) {
			got, err := ParseEmail(tt.input)

			// Проверить ожидание ошибки
			if (err != nil) != tt.wantErr {
				t.Errorf("ParseEmail(%q) error = %v, wantErr %v", tt.input, err, tt.wantErr)
				return
			}

			// Проверить возвращаемое значение
			if got != tt.want {
				t.Errorf("ParseEmail(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}`
		},
		uz: {
			title: `Xato holatlari testlari`,
			description: `**wantErr** fieldi bilan jadval asosidagi testlarda muvaffaqiyatli va xato holatlarni tekshiring.

**Talablar:**
1. Email formatini tekshiradigan 'ParseEmail(s string) (string, error)' ni amalga oshiring
2. 'input', 'want', 'wantErr' (bool) fieldlari bilan test jadvali yarating
3. To'g'ri emaillarni tekshiring (tozalangan email qaytaring, xato yo'q)
4. Noto'g'ri emaillarni tekshiring ("" qaytaring, xato)
5. t.Run bilan jadval asosidagi yondashuvdan foydalaning

**Misol:**
\`\`\`go
tests := []struct {
    name    string
    input   string
    want    string
    wantErr bool
}{
    {"valid", "user@example.com", "user@example.com", false},
    {"invalid", "not-an-email", "", true},
}
\`\`\`

**Cheklovlar:**
- Email @ va @ dan keyin . ni o'z ichiga olishi kerak
- Kamida 3 ta to'g'ri va 3 ta noto'g'ri holatni tekshiring`,
			hint1: `Xato mavjudligi kutishga mos kelishini tekshirish uchun (err != nil) != tt.wantErr dan foydalaning.`,
			hint2: `Xato kutilganda natijani tekshirishdan qochish uchun xatoni tekshirgandan keyin erta qaytaring.`,
			whyItMatters: `Xato yo'llarini tekshirish juda muhim - production tizimlari noto'g'ri kirishni to'g'ri boshqarishi kerak.

**Nima uchun xato holatlarini tekshirish muhim:**
- **Xavfsizlik:** Noto'g'ri kirish tizimni buzmasligi yoki ichki ma'lumotlarni oshkor qilmasligi kerak
- **Foydalanuvchi tajribasi:** Aniq xato xabarlari foydalanuvchilarga muammolarni tuzatishda yordam beradi
- **Ishonchlilik:** Ko'pgina production xatolar xatolarni boshqarish yo'llarida
- **To'liqlik:** Xato holatlari odatda happy path holatlaridan ko'proq

**Xatolarni testlash patterni:**
\`\`\`go
tests := []struct {
    name    string
    input   string
    want    string
    wantErr bool
}{
    // Happy path
    {"valid", "good", "good", false},

    // Xato yo'llari (odatda ko'proq holatlar)
    {"empty", "", "", true},
    {"invalid format", "bad", "", true},
    {"too long", "x" * 1000, "", true},
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        got, err := Parse(tt.input)

        // Xatoni tekshirish
        if (err != nil) != tt.wantErr {
            t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
            return  // Xato kutish noto'g'ri bo'lsa natijani tekshirmang
        }

        // Natijani tekshirish (faqat xato kutilmaganda)
        if got != tt.want {
            t.Errorf("got %v, want %v", got, tt.want)
        }
    })
}
\`\`\`

**Production afzalliklari:**
- **Tekshirish testlari:** Barcha noto'g'ri kirishlar rad etilganligiga ishonch hosil qiling
- **API shartnomasi:** Qaysi kirishlar qabul qilinadi/rad etiladi hujjatlang
- **Regressiya:** Topilgan xatolar test holatlariga aylanadi
- **Xavfsizlik:** Kirishni tekshirish orqali injection hujumlarini oldini oling

**Haqiqiy dunyo misoli:**
Stripe API to'lov miqdorlarini tekshiradi:
\`\`\`go
func TestValidateAmount(t *testing.T) {
    tests := []struct {
        name    string
        amount  int
        wantErr bool
    }{
        {"valid", 1000, false},
        {"minimum", 50, false},
        {"too small", 49, true},      // Minimumdan past
        {"negative", -100, true},      // Noto'g'ri
        {"zero", 0, true},             // Noto'g'ri
        {"too large", 100000000, true}, // Maksimumdan yuqori
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateAmount(tt.amount)
            if (err != nil) != tt.wantErr {
                t.Errorf("ValidateAmount(%d) error = %v, wantErr %v",
                    tt.amount, err, tt.wantErr)
            }
        })
    }
}
\`\`\`

**Ilg'or pattern - Xato xabarlarini testlash:**
\`\`\`go
tests := []struct {
    name       string
    input      string
    want       string
    wantErr    bool
    errMessage string  // Kutilgan xato xabari
}{
    {
        name:       "missing @",
        input:      "invalid",
        want:       "",
        wantErr:    true,
        errMessage: "email must contain @",
    },
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        got, err := ParseEmail(tt.input)

        if tt.wantErr {
            if err == nil {
                t.Fatal("expected error, got nil")
            }
            if err.Error() != tt.errMessage {
                t.Errorf("error message = %q, want %q",
                    err.Error(), tt.errMessage)
            }
            return
        }

        if err != nil {
            t.Fatalf("unexpected error: %v", err)
        }

        if got != tt.want {
            t.Errorf("got %q, want %q", got, tt.want)
        }
    })
}
\`\`\`

**Statistika:**
- Production xatolarining 80% xatolarni boshqarish kodida
- Faqat happy path testlash yolg'on ishonch beradi
- Xato holatlari ko'pincha muvaffaqiyat holatlaridan 3:1 nisbatda ko'proq

Amazon'da barcha API validatorlar to'g'ri va noto'g'ri kirishlarni testlashi kerak, bu noto'g'ri ma'lumotlardan milliardlab dollar xatolarning oldini oladi.`,
			solutionCode: `package email_test

import (
	"errors"
	"strings"
)

func ParseEmail(s string) (string, error) {
	s = strings.TrimSpace(s)  // Bo'sh joylarni kesish

	// Email formatini tekshirish
	if !strings.Contains(s, "@") {
		return "", errors.New("email must contain @")
	}

	parts := strings.Split(s, "@")
	if len(parts) != 2 {
		return "", errors.New("email must have exactly one @")
	}

	if parts[0] == "" {
		return "", errors.New("email must have username before @")
	}

	if !strings.Contains(parts[1], ".") {
		return "", errors.New("email domain must contain .")
	}

	return s, nil  // Tozalangan emailni qaytarish
}

func TestParseEmail(t *T) {
	tests := []struct {
		name    string
		input   string
		want    string
		wantErr bool
	}{
		// To'g'ri holatlar
		{
			name:    "to'g'ri email",
			input:   "user@example.com",
			want:    "user@example.com",
			wantErr: false,
		},
		{
			name:    "subdomen bilan email",
			input:   "user@mail.example.com",
			want:    "user@mail.example.com",
			wantErr: false,
		},
		{
			name:    "bo'sh joy bilan email",
			input:   "  user@example.com  ",
			want:    "user@example.com",
			wantErr: false,
		},

		// Noto'g'ri holatlar
		{
			name:    "@ yo'q",
			input:   "userexample.com",
			want:    "",
			wantErr: true,
		},
		{
			name:    "domen yo'q",
			input:   "user@",
			want:    "",
			wantErr: true,
		},
		{
			name:    "foydalanuvchi nomi yo'q",
			input:   "@example.com",
			want:    "",
			wantErr: true,
		},
		{
			name:    "domenda nuqta yo'q",
			input:   "user@example",
			want:    "",
			wantErr: true,
		},
		{
			name:    "bir nechta @ belgisi",
			input:   "user@@example.com",
			want:    "",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *T) {
			got, err := ParseEmail(tt.input)

			// Xato kutilishini tekshirish
			if (err != nil) != tt.wantErr {
				t.Errorf("ParseEmail(%q) error = %v, wantErr %v", tt.input, err, tt.wantErr)
				return
			}

			// Qaytariladigan qiymatni tekshirish
			if got != tt.want {
				t.Errorf("ParseEmail(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}`
		}
	}
};

export default task;
