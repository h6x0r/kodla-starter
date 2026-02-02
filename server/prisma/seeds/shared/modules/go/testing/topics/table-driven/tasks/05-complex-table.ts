import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-complex-table',
	title: 'Complex Table-Driven Test',
	difficulty: 'hard',	tags: ['go', 'testing', 'table-driven', 'advanced'],
	estimatedTime: '30m',	isPremium: false,
	youtubeUrl: '',
	description: `Create a complex table-driven test with **multiple outputs**, **setup/teardown**, and **helper functions**.

**Requirements:**
1. Implement \`UserValidator\` that validates user data (name, email, age)
2. Return multiple errors: name required, email format, age range
3. Test table with multiple output fields
4. Use setup function to create test data
5. Use helper function for common assertions

**Example:**
\`\`\`go
tests := []struct {
    name      string
    user      User
    wantValid bool
    wantErrs  []string
}{
    {
        name: "valid user",
        user: User{Name: "John", Email: "john@example.com", Age: 25},
        wantValid: true,
        wantErrs: nil,
    },
}
\`\`\`

**Constraints:**
- Name must not be empty
- Email must contain @ and .
- Age must be between 0 and 150
- Return all validation errors, not just first one`,
	initialCode: `package validator_test

import (
	"strings"
)

type User struct {
	Name  string
	Email string
	Age   int
}

type ValidationResult struct {
	Valid  bool
	Errors []string
}

// TODO: Implement ValidateUser function
func ValidateUser(u User) ValidationResult {
	// TODO: Implement
}

// TODO: Write complex table-driven test
func TestValidateUser(t *T) {
	// TODO: Implement
}`,
	solutionCode: `package validator_test

import (
	"strings"
)

type User struct {
	Name  string
	Email string
	Age   int
}

type ValidationResult struct {
	Valid  bool
	Errors []string
}

func ValidateUser(u User) ValidationResult {
	var errs []string

	// Validate name
	if strings.TrimSpace(u.Name) == "" {
		errs = append(errs, "name is required")
	}

	// Validate email
	if !strings.Contains(u.Email, "@") || !strings.Contains(u.Email, ".") {
		errs = append(errs, "invalid email format")
	}

	// Validate age
	if u.Age < 0 || u.Age > 150 {
		errs = append(errs, "age must be between 0 and 150")
	}

	return ValidationResult{
		Valid:  len(errs) == 0,
		Errors: errs,
	}
}

// Helper function to check if slice contains string
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// Helper function to assert validation result
func assertValidation(t *T, got ValidationResult, wantValid bool, wantErrs []string) {
	t.Helper()

	// Check validity
	if got.Valid != wantValid {
		t.Errorf("Valid = %v, want %v", got.Valid, wantValid)
	}

	// Check error count
	if len(got.Errors) != len(wantErrs) {
		t.Errorf("got %d errors, want %d: %v", len(got.Errors), len(wantErrs), got.Errors)
		return
	}

	// Check each expected error is present
	for _, wantErr := range wantErrs {
		if !contains(got.Errors, wantErr) {
			t.Errorf("expected error %q not found in %v", wantErr, got.Errors)
		}
	}
}

func TestValidateUser(t *T) {
	tests := []struct {
		name      string
		user      User
		wantValid bool
		wantErrs  []string
	}{
		{
			name: "valid user",
			user: User{
				Name:  "John Doe",
				Email: "john@example.com",
				Age:   25,
			},
			wantValid: true,
			wantErrs:  nil,
		},
		{
			name: "empty name",
			user: User{
				Name:  "",
				Email: "john@example.com",
				Age:   25,
			},
			wantValid: false,
			wantErrs:  []string{"name is required"},
		},
		{
			name: "invalid email - no @",
			user: User{
				Name:  "John Doe",
				Email: "johnexample.com",
				Age:   25,
			},
			wantValid: false,
			wantErrs:  []string{"invalid email format"},
		},
		{
			name: "invalid email - no dot",
			user: User{
				Name:  "John Doe",
				Email: "john@example",
				Age:   25,
			},
			wantValid: false,
			wantErrs:  []string{"invalid email format"},
		},
		{
			name: "negative age",
			user: User{
				Name:  "John Doe",
				Email: "john@example.com",
				Age:   -1,
			},
			wantValid: false,
			wantErrs:  []string{"age must be between 0 and 150"},
		},
		{
			name: "age too high",
			user: User{
				Name:  "John Doe",
				Email: "john@example.com",
				Age:   200,
			},
			wantValid: false,
			wantErrs:  []string{"age must be between 0 and 150"},
		},
		{
			name: "multiple errors",
			user: User{
				Name:  "",
				Email: "invalid",
				Age:   -5,
			},
			wantValid: false,
			wantErrs: []string{
				"name is required",
				"invalid email format",
				"age must be between 0 and 150",
			},
		},
		{
			name: "edge case - age 0",
			user: User{
				Name:  "Baby",
				Email: "baby@example.com",
				Age:   0,
			},
			wantValid: true,
			wantErrs:  nil,
		},
		{
			name: "edge case - age 150",
			user: User{
				Name:  "Elder",
				Email: "elder@example.com",
				Age:   150,
			},
			wantValid: true,
			wantErrs:  nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *T) {
			got := ValidateUser(tt.user)
			assertValidation(t, got, tt.wantValid, tt.wantErrs)
		})
	}
}`,
			hint1: `Collect all validation errors instead of returning on first error. This gives users complete feedback.`,
			hint2: `Create helper functions for repeated assertions. Use t.Helper() to get correct error line numbers.`,
			testCode: `package validator_test

import (
	"strings"
)

// Test1: Valid user passes all validations
func Test1(t *T) {
	user := User{Name: "John Doe", Email: "john@example.com", Age: 25}
	result := ValidateUser(user)
	if !result.Valid {
		t.Errorf("expected valid user, got errors: %v", result.Errors)
	}
	if len(result.Errors) != 0 {
		t.Errorf("expected no errors, got %d", len(result.Errors))
	}
}

// Test2: Empty name fails validation
func Test2(t *T) {
	user := User{Name: "", Email: "john@example.com", Age: 25}
	result := ValidateUser(user)
	if result.Valid {
		t.Error("expected invalid result for empty name")
	}
	found := false
	for _, err := range result.Errors {
		if strings.Contains(err, "name") {
			found = true
			break
		}
	}
	if !found {
		t.Error("expected name error in result")
	}
}

// Test3: Invalid email format fails
func Test3(t *T) {
	user := User{Name: "John", Email: "invalid", Age: 25}
	result := ValidateUser(user)
	if result.Valid {
		t.Error("expected invalid result for bad email")
	}
	found := false
	for _, err := range result.Errors {
		if strings.Contains(err, "email") {
			found = true
			break
		}
	}
	if !found {
		t.Error("expected email error in result")
	}
}

// Test4: Negative age fails validation
func Test4(t *T) {
	user := User{Name: "John", Email: "john@example.com", Age: -1}
	result := ValidateUser(user)
	if result.Valid {
		t.Error("expected invalid result for negative age")
	}
	found := false
	for _, err := range result.Errors {
		if strings.Contains(err, "age") {
			found = true
			break
		}
	}
	if !found {
		t.Error("expected age error in result")
	}
}

// Test5: Age over 150 fails validation
func Test5(t *T) {
	user := User{Name: "John", Email: "john@example.com", Age: 200}
	result := ValidateUser(user)
	if result.Valid {
		t.Error("expected invalid result for age over 150")
	}
}

// Test6: Multiple validation errors collected
func Test6(t *T) {
	user := User{Name: "", Email: "invalid", Age: -5}
	result := ValidateUser(user)
	if result.Valid {
		t.Error("expected invalid result")
	}
	if len(result.Errors) < 3 {
		t.Errorf("expected at least 3 errors, got %d: %v", len(result.Errors), result.Errors)
	}
}

// Test7: Edge case - age 0 is valid
func Test7(t *T) {
	user := User{Name: "Baby", Email: "baby@example.com", Age: 0}
	result := ValidateUser(user)
	if !result.Valid {
		t.Errorf("age 0 should be valid, got errors: %v", result.Errors)
	}
}

// Test8: Edge case - age 150 is valid
func Test8(t *T) {
	user := User{Name: "Elder", Email: "elder@example.com", Age: 150}
	result := ValidateUser(user)
	if !result.Valid {
		t.Errorf("age 150 should be valid, got errors: %v", result.Errors)
	}
}

// Test9: Table-driven with complex assertions
func Test9(t *T) {
	tests := []struct {
		name      string
		user      User
		wantValid bool
		wantCount int
	}{
		{"valid", User{"John", "john@example.com", 25}, true, 0},
		{"empty name", User{"", "john@example.com", 25}, false, 1},
		{"all invalid", User{"", "bad", -1}, false, 3},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *T) {
			result := ValidateUser(tt.user)
			if result.Valid != tt.wantValid {
				t.Errorf("Valid = %v, want %v", result.Valid, tt.wantValid)
			}
			if len(result.Errors) != tt.wantCount {
				t.Errorf("got %d errors, want %d", len(result.Errors), tt.wantCount)
			}
		})
	}
}

// Test10: ValidationResult struct correctness
func Test10(t *T) {
	validUser := User{Name: "Test", Email: "test@test.com", Age: 30}
	result := ValidateUser(validUser)

	if result.Valid != (len(result.Errors) == 0) {
		t.Error("Valid field should be true when Errors is empty")
	}

	invalidUser := User{Name: "", Email: "", Age: -1}
	result2 := ValidateUser(invalidUser)

	if result2.Valid != (len(result2.Errors) == 0) {
		t.Error("Valid field should be false when Errors is not empty")
	}
}
`,
			whyItMatters: `Complex table-driven tests handle real-world scenarios with multiple inputs/outputs and comprehensive validation.

**Why Complex Table Tests Matter:**
- **Real-World Validation:** Production code rarely has single error paths
- **Complete Feedback:** Users need all errors, not just first one
- **Edge Cases:** Table format makes it easy to add boundary tests
- **Maintainability:** Complex logic tested systematically

**Simple vs Complex Validation:**
\`\`\`go
// Simple (stops at first error)
func ValidateSimple(u User) error {
    if u.Name == "" {
        return errors.New("name required")
    }
    if u.Age < 0 {
        return errors.New("invalid age")
    }
    return nil
}

// Complex (collects all errors)
func ValidateComplex(u User) ValidationResult {
    var errs []string

    if u.Name == "" {
        errs = append(errs, "name required")
    }
    if u.Age < 0 {
        errs = append(errs, "invalid age")
    }
    // ... more validations

    return ValidationResult{
        Valid: len(errs) == 0,
        Errors: errs,
    }
}
\`\`\`

**Production Benefits:**
- **User Experience:** Show all form errors at once
- **API Design:** Return comprehensive validation results
- **Testing:** Verify all validation rules in one test
- **Documentation:** Test table documents all validation rules

**Real-World Example:**
Stripe's payment validation returns multiple errors:
\`\`\`go
func TestValidatePayment(t *testing.T) {
    tests := []struct {
        name     string
        payment  Payment
        wantErrs []string
    }{
        {
            name: "missing everything",
            payment: Payment{},
            wantErrs: []string{
                "card number required",
                "expiry date required",
                "cvv required",
                "amount must be positive",
            },
        },
        {
            name: "invalid card number",
            payment: Payment{
                CardNumber: "1234",
                Expiry:     "12/25",
                CVV:        "123",
                Amount:     1000,
            },
            wantErrs: []string{
                "invalid card number",
            },
        },
        // 50+ more test cases...
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := ValidatePayment(tt.payment)
            if !equalErrors(result.Errors, tt.wantErrs) {
                t.Errorf("errors = %v, want %v", result.Errors, tt.wantErrs)
            }
        })
    }
}
\`\`\`

**Helper Function Pattern:**
\`\`\`go
// Without helper (repetitive)
func TestValidateUser(t *testing.T) {
    got := ValidateUser(user)
    if got.Valid != wantValid {
        t.Error("...")
    }
    if len(got.Errors) != len(wantErrs) {
        t.Error("...")
    }
    for _, err := range wantErrs {
        if !contains(got.Errors, err) {
            t.Error("...")
        }
    }
    // Repeat 20 times...
}

// With helper (DRY)
func assertValidation(t *testing.T, got ValidationResult, want ...) {
    t.Helper()
    // All assertion logic here
}

func TestValidateUser(t *testing.T) {
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := ValidateUser(tt.user)
            assertValidation(t, got, tt.wantValid, tt.wantErrs)
        })
    }
}
\`\`\`

**Testing Multiple Outputs:**
\`\`\`go
type Result struct {
    Value  int
    Error  error
    Status string
}

tests := []struct {
    name       string
    input      string
    wantValue  int
    wantError  bool
    wantStatus string
}{
    {
        name:       "success",
        input:      "42",
        wantValue:  42,
        wantError:  false,
        wantStatus: "OK",
    },
}
\`\`\`

**When to Use Complex Tables:**
- Form validation (multiple fields, multiple rules)
- API request validation
- Business logic with many branches
- Integration points with multiple failure modes

At Google, complex table-driven tests are the standard for validation logic, ensuring comprehensive error handling across all services.`,	order: 4,
	translations: {
		ru: {
			title: 'Комплексные табличные тесты',
			description: `Создайте сложный табличный тест с **несколькими выходами**, **настройкой/очисткой** и **вспомогательными функциями**.

**Требования:**
1. Реализуйте \`UserValidator\` валидирующий данные пользователя (имя, email, возраст)
2. Возвращайте несколько ошибок: требуется имя, формат email, диапазон возраста
3. Таблица тестов с несколькими полями вывода
4. Используйте функцию настройки для создания тестовых данных
5. Используйте вспомогательную функцию для общих проверок

**Пример:**
\`\`\`go
tests := []struct {
    name      string
    user      User
    wantValid bool
    wantErrs  []string
}{...}
\`\`\`

**Ограничения:**
- Имя не должно быть пустым
- Email должен содержать @ и .
- Возраст должен быть между 0 и 150`,
			hint1: `Собирайте все ошибки валидации вместо возврата при первой ошибке.`,
			hint2: `Создайте вспомогательные функции для повторяющихся проверок.`,
			whyItMatters: `Сложные табличные тесты обрабатывают реальные сценарии с несколькими входами/выходами и полной валидацией.

**Почему сложные табличные тесты важны:**
- **Реальная валидация:** Production код редко имеет одиночные пути ошибок
- **Полная обратная связь:** Пользователям нужны все ошибки, не только первая
- **Граничные случаи:** Табличный формат упрощает добавление граничных тестов
- **Поддерживаемость:** Сложная логика тестируется систематически

**Простая vs Сложная валидация:**
\`\`\`go
// Простая (останавливается на первой ошибке)
func ValidateSimple(u User) error {
    if u.Name == "" {
        return errors.New("name required")
    }
    if u.Age < 0 {
        return errors.New("invalid age")
    }
    return nil
}

// Сложная (собирает все ошибки)
func ValidateComplex(u User) ValidationResult {
    var errs []string

    if u.Name == "" {
        errs = append(errs, "name required")
    }
    if u.Age < 0 {
        errs = append(errs, "invalid age")
    }
    // ... больше валидаций

    return ValidationResult{
        Valid: len(errs) == 0,
        Errors: errs,
    }
}
\`\`\`

**Преимущества в production:**
- **Пользовательский опыт:** Показать все ошибки формы сразу
- **Дизайн API:** Возвращать полные результаты валидации
- **Тестирование:** Проверить все правила валидации в одном тесте
- **Документация:** Таблица тестов документирует все правила валидации

**Пример из реального мира:**
Валидация платежей Stripe возвращает несколько ошибок:
\`\`\`go
func TestValidatePayment(t *testing.T) {
    tests := []struct {
        name     string
        payment  Payment
        wantErrs []string
    }{
        {
            name: "missing everything",
            payment: Payment{},
            wantErrs: []string{
                "card number required",
                "expiry date required",
                "cvv required",
                "amount must be positive",
            },
        },
        {
            name: "invalid card number",
            payment: Payment{
                CardNumber: "1234",
                Expiry:     "12/25",
                CVV:        "123",
                Amount:     1000,
            },
            wantErrs: []string{
                "invalid card number",
            },
        },
        // 50+ больше тестовых случаев...
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := ValidatePayment(tt.payment)
            if !equalErrors(result.Errors, tt.wantErrs) {
                t.Errorf("errors = %v, want %v", result.Errors, tt.wantErrs)
            }
        })
    }
}
\`\`\`

**Паттерн вспомогательных функций:**
\`\`\`go
// Без вспомогательной функции (повторяющийся код)
func TestValidateUser(t *testing.T) {
    got := ValidateUser(user)
    if got.Valid != wantValid {
        t.Error("...")
    }
    if len(got.Errors) != len(wantErrs) {
        t.Error("...")
    }
    for _, err := range wantErrs {
        if !contains(got.Errors, err) {
            t.Error("...")
        }
    }
    // Повторить 20 раз...
}

// С вспомогательной функцией (DRY)
func assertValidation(t *testing.T, got ValidationResult, want ...) {
    t.Helper()
    // Вся логика проверок здесь
}

func TestValidateUser(t *testing.T) {
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := ValidateUser(tt.user)
            assertValidation(t, got, tt.wantValid, tt.wantErrs)
        })
    }
}
\`\`\`

**Тестирование нескольких выходов:**
\`\`\`go
type Result struct {
    Value  int
    Error  error
    Status string
}

tests := []struct {
    name       string
    input      string
    wantValue  int
    wantError  bool
    wantStatus string
}{
    {
        name:       "success",
        input:      "42",
        wantValue:  42,
        wantError:  false,
        wantStatus: "OK",
    },
}
\`\`\`

**Когда использовать сложные таблицы:**
- Валидация форм (множественные поля, множественные правила)
- Валидация API запросов
- Бизнес-логика с множественными ветвлениями
- Точки интеграции с множественными режимами отказа

В Google сложные табличные тесты являются стандартом для логики валидации, обеспечивая комплексную обработку ошибок во всех сервисах.`,
			solutionCode: `package validator_test

import (
	"strings"
)

type User struct {
	Name  string
	Email string
	Age   int
}

type ValidationResult struct {
	Valid  bool
	Errors []string
}

func ValidateUser(u User) ValidationResult {
	var errs []string

	// Валидировать имя
	if strings.TrimSpace(u.Name) == "" {
		errs = append(errs, "name is required")
	}

	// Валидировать email
	if !strings.Contains(u.Email, "@") || !strings.Contains(u.Email, ".") {
		errs = append(errs, "invalid email format")
	}

	// Валидировать возраст
	if u.Age < 0 || u.Age > 150 {
		errs = append(errs, "age must be between 0 and 150")
	}

	return ValidationResult{
		Valid:  len(errs) == 0,
		Errors: errs,
	}
}

// Вспомогательная функция для проверки содержит ли slice строку
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// Вспомогательная функция для проверки результата валидации
func assertValidation(t *T, got ValidationResult, wantValid bool, wantErrs []string) {
	t.Helper()

	// Проверить валидность
	if got.Valid != wantValid {
		t.Errorf("Valid = %v, want %v", got.Valid, wantValid)
	}

	// Проверить количество ошибок
	if len(got.Errors) != len(wantErrs) {
		t.Errorf("получено %d ошибок, ожидается %d: %v", len(got.Errors), len(wantErrs), got.Errors)
		return
	}

	// Проверить что каждая ожидаемая ошибка присутствует
	for _, wantErr := range wantErrs {
		if !contains(got.Errors, wantErr) {
			t.Errorf("ожидаемая ошибка %q не найдена в %v", wantErr, got.Errors)
		}
	}
}

func TestValidateUser(t *T) {
	tests := []struct {
		name      string
		user      User
		wantValid bool
		wantErrs  []string
	}{
		{
			name: "валидный пользователь",
			user: User{
				Name:  "John Doe",
				Email: "john@example.com",
				Age:   25,
			},
			wantValid: true,
			wantErrs:  nil,
		},
		{
			name: "пустое имя",
			user: User{
				Name:  "",
				Email: "john@example.com",
				Age:   25,
			},
			wantValid: false,
			wantErrs:  []string{"name is required"},
		},
		{
			name: "невалидный email - нет @",
			user: User{
				Name:  "John Doe",
				Email: "johnexample.com",
				Age:   25,
			},
			wantValid: false,
			wantErrs:  []string{"invalid email format"},
		},
		{
			name: "невалидный email - нет точки",
			user: User{
				Name:  "John Doe",
				Email: "john@example",
				Age:   25,
			},
			wantValid: false,
			wantErrs:  []string{"invalid email format"},
		},
		{
			name: "отрицательный возраст",
			user: User{
				Name:  "John Doe",
				Email: "john@example.com",
				Age:   -1,
			},
			wantValid: false,
			wantErrs:  []string{"age must be between 0 and 150"},
		},
		{
			name: "возраст слишком высокий",
			user: User{
				Name:  "John Doe",
				Email: "john@example.com",
				Age:   200,
			},
			wantValid: false,
			wantErrs:  []string{"age must be between 0 and 150"},
		},
		{
			name: "несколько ошибок",
			user: User{
				Name:  "",
				Email: "invalid",
				Age:   -5,
			},
			wantValid: false,
			wantErrs: []string{
				"name is required",
				"invalid email format",
				"age must be between 0 and 150",
			},
		},
		{
			name: "граничный случай - возраст 0",
			user: User{
				Name:  "Baby",
				Email: "baby@example.com",
				Age:   0,
			},
			wantValid: true,
			wantErrs:  nil,
		},
		{
			name: "граничный случай - возраст 150",
			user: User{
				Name:  "Elder",
				Email: "elder@example.com",
				Age:   150,
			},
			wantValid: true,
			wantErrs:  nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *T) {
			got := ValidateUser(tt.user)
			assertValidation(t, got, tt.wantValid, tt.wantErrs)
		})
	}
}`
		},
		uz: {
			title: `Murakkab jadval testlari`,
			description: `**Ko'p chiqishlar**, **sozlash/tozalash** va **helper funksiyalari** bilan murakkab jadval asosidagi test yarating.

**Talablar:**
1. Foydalanuvchi ma'lumotlarini (ism, email, yosh) tekshiradigan 'UserValidator' ni amalga oshiring
2. Bir nechta xatolarni qaytaring: ism talab qilinadi, email formati, yosh diapazoni
3. Ko'p chiqish fieldlari bilan test jadvali
4. Test ma'lumotlarini yaratish uchun sozlash funksiyasidan foydalaning
5. Umumiy tekshiruvlar uchun helper funksiyadan foydalaning

**Misol:**
\`\`\`go
tests := []struct {
    name      string
    user      User
    wantValid bool
    wantErrs  []string
}{...}
\`\`\`

**Cheklovlar:**
- Ism bo'sh bo'lmasligi kerak
- Email @ va . ni o'z ichiga olishi kerak
- Yosh 0 va 150 orasida bo'lishi kerak`,
			hint1: `Birinchi xatoda qaytarish o'rniga barcha tekshirish xatolarini to'plang.`,
			hint2: `Takrorlanadigan tekshiruvlar uchun helper funksiyalar yarating.`,
			whyItMatters: `Murakkab jadval testlari ko'p kirish/chiqishlar va to'liq tekshirish bilan real stsenariylarni boshqaradi.

**Nima uchun murakkab jadval testlari muhim:**
- **Real tekshirish:** Production kod kamdan-kam holda yagona xato yo'llariga ega
- **To'liq fikr-mulohaza:** Foydalanuvchilarga barcha xatolar kerak, faqat birinchisi emas
- **Chegara holatlari:** Jadval formati chegara testlarini qo'shishni osonlashtiradi
- **Qo'llab-quvvatlash:** Murakkab mantiq tizimli ravishda tekshiriladi

**Oddiy vs Murakkab tekshirish:**
\`\`\`go
// Oddiy (birinchi xatoda to'xtaydi)
func ValidateSimple(u User) error {
    if u.Name == "" {
        return errors.New("name required")
    }
    if u.Age < 0 {
        return errors.New("invalid age")
    }
    return nil
}

// Murakkab (barcha xatolarni to'playdi)
func ValidateComplex(u User) ValidationResult {
    var errs []string

    if u.Name == "" {
        errs = append(errs, "name required")
    }
    if u.Age < 0 {
        errs = append(errs, "invalid age")
    }
    // ... ko'proq tekshiruvlar

    return ValidationResult{
        Valid: len(errs) == 0,
        Errors: errs,
    }
}
\`\`\`

**Production afzalliklari:**
- **Foydalanuvchi tajribasi:** Barcha forma xatolarini bir vaqtning o'zida ko'rsatish
- **API dizayni:** To'liq tekshirish natijalarini qaytarish
- **Testlash:** Barcha tekshirish qoidalarini bitta testda tekshirish
- **Hujjatlashtirish:** Test jadvali barcha tekshirish qoidalarini hujjatlaydi

**Haqiqiy dunyo misoli:**
Stripe to'lov tekshiruvi bir nechta xatolarni qaytaradi:
\`\`\`go
func TestValidatePayment(t *testing.T) {
    tests := []struct {
        name     string
        payment  Payment
        wantErrs []string
    }{
        {
            name: "missing everything",
            payment: Payment{},
            wantErrs: []string{
                "card number required",
                "expiry date required",
                "cvv required",
                "amount must be positive",
            },
        },
        {
            name: "invalid card number",
            payment: Payment{
                CardNumber: "1234",
                Expiry:     "12/25",
                CVV:        "123",
                Amount:     1000,
            },
            wantErrs: []string{
                "invalid card number",
            },
        },
        // 50+ ko'proq test holatlari...
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := ValidatePayment(tt.payment)
            if !equalErrors(result.Errors, tt.wantErrs) {
                t.Errorf("errors = %v, want %v", result.Errors, tt.wantErrs)
            }
        })
    }
}
\`\`\`

**Helper funksiya patterni:**
\`\`\`go
// Helper funksiyasiz (takrorlanuvchi kod)
func TestValidateUser(t *testing.T) {
    got := ValidateUser(user)
    if got.Valid != wantValid {
        t.Error("...")
    }
    if len(got.Errors) != len(wantErrs) {
        t.Error("...")
    }
    for _, err := range wantErrs {
        if !contains(got.Errors, err) {
            t.Error("...")
        }
    }
    // 20 marta takrorlang...
}

// Helper funksiya bilan (DRY)
func assertValidation(t *testing.T, got ValidationResult, want ...) {
    t.Helper()
    // Barcha tekshirish mantiqi shu yerda
}

func TestValidateUser(t *testing.T) {
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := ValidateUser(tt.user)
            assertValidation(t, got, tt.wantValid, tt.wantErrs)
        })
    }
}
\`\`\`

**Ko'p chiqishlarni testlash:**
\`\`\`go
type Result struct {
    Value  int
    Error  error
    Status string
}

tests := []struct {
    name       string
    input      string
    wantValue  int
    wantError  bool
    wantStatus string
}{
    {
        name:       "success",
        input:      "42",
        wantValue:  42,
        wantError:  false,
        wantStatus: "OK",
    },
}
\`\`\`

**Qachon murakkab jadvallardan foydalanish kerak:**
- Forma tekshiruvi (ko'p maydonlar, ko'p qoidalar)
- API so'rovlarini tekshirish
- Ko'p tarmoqlar bilan biznes mantiqi
- Ko'p nosozlik rejimlari bilan integratsiya nuqtalari

Google'da murakkab jadval testlari tekshirish mantiqi uchun standart bo'lib, barcha servislarda to'liq xatolarni boshqarishni ta'minlaydi.`,
			solutionCode: `package validator_test

import (
	"strings"
)

type User struct {
	Name  string
	Email string
	Age   int
}

type ValidationResult struct {
	Valid  bool
	Errors []string
}

func ValidateUser(u User) ValidationResult {
	var errs []string

	// Ismni tekshirish
	if strings.TrimSpace(u.Name) == "" {
		errs = append(errs, "name is required")
	}

	// Emailni tekshirish
	if !strings.Contains(u.Email, "@") || !strings.Contains(u.Email, ".") {
		errs = append(errs, "invalid email format")
	}

	// Yoshni tekshirish
	if u.Age < 0 || u.Age > 150 {
		errs = append(errs, "age must be between 0 and 150")
	}

	return ValidationResult{
		Valid:  len(errs) == 0,
		Errors: errs,
	}
}

// Slice satrni o'z ichiga oladimi tekshirish uchun helper funksiya
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// Tekshirish natijasini tekshirish uchun helper funksiya
func assertValidation(t *T, got ValidationResult, wantValid bool, wantErrs []string) {
	t.Helper()

	// To'g'riligini tekshirish
	if got.Valid != wantValid {
		t.Errorf("Valid = %v, want %v", got.Valid, wantValid)
	}

	// Xatolar sonini tekshirish
	if len(got.Errors) != len(wantErrs) {
		t.Errorf("%d xato olindi, %d kutilgan: %v", len(got.Errors), len(wantErrs), got.Errors)
		return
	}

	// Har bir kutilgan xato mavjudligini tekshirish
	for _, wantErr := range wantErrs {
		if !contains(got.Errors, wantErr) {
			t.Errorf("kutilgan xato %q %v da topilmadi", wantErr, got.Errors)
		}
	}
}

func TestValidateUser(t *T) {
	tests := []struct {
		name      string
		user      User
		wantValid bool
		wantErrs  []string
	}{
		{
			name: "to'g'ri foydalanuvchi",
			user: User{
				Name:  "John Doe",
				Email: "john@example.com",
				Age:   25,
			},
			wantValid: true,
			wantErrs:  nil,
		},
		{
			name: "bo'sh ism",
			user: User{
				Name:  "",
				Email: "john@example.com",
				Age:   25,
			},
			wantValid: false,
			wantErrs:  []string{"name is required"},
		},
		{
			name: "noto'g'ri email - @ yo'q",
			user: User{
				Name:  "John Doe",
				Email: "johnexample.com",
				Age:   25,
			},
			wantValid: false,
			wantErrs:  []string{"invalid email format"},
		},
		{
			name: "noto'g'ri email - nuqta yo'q",
			user: User{
				Name:  "John Doe",
				Email: "john@example",
				Age:   25,
			},
			wantValid: false,
			wantErrs:  []string{"invalid email format"},
		},
		{
			name: "manfiy yosh",
			user: User{
				Name:  "John Doe",
				Email: "john@example.com",
				Age:   -1,
			},
			wantValid: false,
			wantErrs:  []string{"age must be between 0 and 150"},
		},
		{
			name: "juda katta yosh",
			user: User{
				Name:  "John Doe",
				Email: "john@example.com",
				Age:   200,
			},
			wantValid: false,
			wantErrs:  []string{"age must be between 0 and 150"},
		},
		{
			name: "bir nechta xato",
			user: User{
				Name:  "",
				Email: "invalid",
				Age:   -5,
			},
			wantValid: false,
			wantErrs: []string{
				"name is required",
				"invalid email format",
				"age must be between 0 and 150",
			},
		},
		{
			name: "chegara holati - yosh 0",
			user: User{
				Name:  "Baby",
				Email: "baby@example.com",
				Age:   0,
			},
			wantValid: true,
			wantErrs:  nil,
		},
		{
			name: "chegara holati - yosh 150",
			user: User{
				Name:  "Elder",
				Email: "elder@example.com",
				Age:   150,
			},
			wantValid: true,
			wantErrs:  nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *T) {
			got := ValidateUser(tt.user)
			assertValidation(t, got, tt.wantValid, tt.wantErrs)
		})
	}
}`
		}
	}
};

export default task;
