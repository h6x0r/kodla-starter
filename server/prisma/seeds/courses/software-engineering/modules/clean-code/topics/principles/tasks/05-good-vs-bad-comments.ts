import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'se-clean-code-good-vs-bad-comments',
	title: 'Good Comments vs Bad Comments',
	difficulty: 'easy',
	tags: ['go', 'clean-code', 'comments', 'documentation'],
	estimatedTime: '25m',
	isPremium: false,
	youtubeUrl: '',
	description: `Learn to distinguish between helpful comments and noise comments. Remove bad comments and improve code to make it self-explanatory.

**You will refactor:**

1. Remove redundant comments that just repeat the code
2. Remove commented-out code
3. Keep legal comments, TODOs, and warnings
4. Replace explanatory comments with better variable/function names

**Key Concepts:**
- **Good Comments**: Legal notices, TODOs, warnings, clarifications of obscure code
- **Bad Comments**: Redundant, misleading, commented-out code, noise
- **Best Comment**: No comment needed - code explains itself
- **Comment Why, Not What**: Explain reasoning, not implementation

**When comments are acceptable:**
- Legal/copyright notices
- Warning of consequences
- TODO markers
- Explaining non-obvious decisions
- API documentation

**Constraints:**
- Remove all redundant comments
- Improve variable names to eliminate need for comments
- Keep only meaningful comments`,
	initialCode: `package principles

import (
	"fmt"
	"strings"
	"time"
)

type User struct {
	ID int
	Name string
	Email string
	CreatedAt time.Time
}

func ProcessUser(u *User) error {
	if u == nil {
		return fmt.Errorf("user is nil") // Return error if nil
	}

	if len(u.Name) < 2 { // Name must be at least 2 chars
		return fmt.Errorf("name too short")
	}

		return fmt.Errorf("invalid email") // No @ symbol
	}

}

func CalculateDiscount(p float64) float64 {
}`,
	solutionCode: `package principles

import (
	"fmt"
	"strings"
	"time"
)

// User represents an application user with authentication details
type User struct {
	ID        int
	Name      string
	Email     string
	CreatedAt time.Time
}

// ProcessUser validates and normalizes user data
// Returns error if validation fails
func ProcessUser(user *User) error {
	if user == nil {
		return fmt.Errorf("user is nil")
	}

	user.Name = strings.TrimSpace(user.Name)

	// Minimum 2 characters required for internationalization support
	if len(user.Name) < 2 {
		return fmt.Errorf("name too short")
	}

	if !strings.Contains(user.Email, "@") {
		return fmt.Errorf("invalid email")
	}

	fmt.Printf("Processing user: %s\n", user.Name)

	return nil
}

// CalculateDiscount applies 10% discount to original price
// WARNING: Discount rate is hardcoded. TODO: Make configurable in v2.0
func CalculateDiscount(originalPrice float64) float64 {
	const discountRate = 0.9 // 10% off
	return originalPrice * discountRate
}`,
	hint1: `Remove comments that just repeat what code does: "// Return error if nil", "// Log the user", "// Success". The code already shows this.`,
	hint2: `Remove all commented-out code. Improve variable names: 'u' -> 'user', 'p' -> 'originalPrice', 'd' -> just return directly. Keep the TODO comment and add a warning about hardcoded discount.`,
	whyItMatters: `Bad comments clutter code and become outdated, while good comments provide valuable context.

**Why Comment Quality Matters:**

**1. Most Comments Are Noise**

\`\`\`go
// BAD: Redundant comments (say what code already shows)
// Get the user
user := getUser(id)

// Check if user is nil
if user == nil {
    return nil // Return nil
}

// GOOD: No comments needed - code is clear
user := getUser(id)
if user == nil {
    return nil
}
\`\`\`

**2. Comments Lie**

\`\`\`go
// BAD: Comment doesn't match code
// Validate password length (minimum 8 characters)
if len(password) < 6 {  // Actually checking for 6!
    return errors.New("password too short")
}

// GOOD: Code is self-explanatory
const minPasswordLength = 8
if len(password) < minPasswordLength {
    return errors.New("password too short")
}
\`\`\`

**3. Good Comments Explain WHY**

\`\`\`go
// GOOD: Explains non-obvious decision
// Using sleep instead of context to avoid cancellation
// during critical database transaction
time.Sleep(5 * time.Second)

// GOOD: Warning about consequences
// WARNING: This function is NOT thread-safe
// Use mutex if calling from multiple goroutines
func UpdateCache(key string, value interface{}) { ... }

// GOOD: Legal requirement
// Copyright 2024 Company Name. All rights reserved.
// Licensed under Apache 2.0
\`\`\`

**Comment Types:**

Good:
- Legal/copyright
- TODO markers
- Warnings
- Explanations of non-obvious decisions
- API documentation

Bad:
- Redundant (repeats code)
- Commented-out code
- Misleading
- Journal comments (who changed what when)`,
	order: 4,
	testCode: `package principles

import (
	"strings"
	"testing"
	"time"
)

// Test1: ProcessUser with valid user
func Test1(t *testing.T) {
	user := &User{ID: 1, Name: "John", Email: "john@example.com", CreatedAt: time.Now()}
	err := ProcessUser(user)
	if err != nil {
		t.Errorf("expected nil error, got: %v", err)
	}
}

// Test2: ProcessUser with nil user
func Test2(t *testing.T) {
	err := ProcessUser(nil)
	if err == nil {
		t.Error("expected error for nil user")
	}
}

// Test3: ProcessUser with short name
func Test3(t *testing.T) {
	user := &User{ID: 2, Name: "A", Email: "a@b.com", CreatedAt: time.Now()}
	err := ProcessUser(user)
	if err == nil || !strings.Contains(err.Error(), "short") {
		t.Error("expected short name error")
	}
}

// Test4: ProcessUser with invalid email
func Test4(t *testing.T) {
	user := &User{ID: 3, Name: "Bob", Email: "invalid", CreatedAt: time.Now()}
	err := ProcessUser(user)
	if err == nil || !strings.Contains(err.Error(), "email") {
		t.Error("expected invalid email error")
	}
}

// Test5: ProcessUser with whitespace name
func Test5(t *testing.T) {
	user := &User{ID: 4, Name: "  AB  ", Email: "ab@c.com", CreatedAt: time.Now()}
	err := ProcessUser(user)
	if err != nil {
		t.Errorf("expected nil error for trimmed valid name, got: %v", err)
	}
	if user.Name != "AB" {
		t.Errorf("expected trimmed name 'AB', got: %s", user.Name)
	}
}

// Test6: CalculateDiscount with positive price
func Test6(t *testing.T) {
	result := CalculateDiscount(100.0)
	if result != 90.0 {
		t.Errorf("expected 90.0, got: %f", result)
	}
}

// Test7: CalculateDiscount with zero price
func Test7(t *testing.T) {
	result := CalculateDiscount(0)
	if result != 0 {
		t.Errorf("expected 0, got: %f", result)
	}
}

// Test8: CalculateDiscount with large price
func Test8(t *testing.T) {
	result := CalculateDiscount(1000.0)
	if result != 900.0 {
		t.Errorf("expected 900.0, got: %f", result)
	}
}

// Test9: ProcessUser with exactly 2 character name
func Test9(t *testing.T) {
	user := &User{ID: 5, Name: "AB", Email: "ab@c.com", CreatedAt: time.Now()}
	err := ProcessUser(user)
	if err != nil {
		t.Errorf("expected nil error for 2 char name, got: %v", err)
	}
}

// Test10: CalculateDiscount preserves decimal precision
func Test10(t *testing.T) {
	result := CalculateDiscount(33.33)
	expected := 33.33 * 0.9
	if result != expected {
		t.Errorf("expected %f, got: %f", expected, result)
	}
}
`,
	translations: {
		ru: {
			title: 'Хорошие и плохие комментарии',
			description: `Научитесь различать полезные комментарии и шумовые комментарии. Удалите плохие комментарии и улучшите код чтобы он был самообъясняющимся.`,
			hint1: `Удалите комментарии которые просто повторяют то что делает код. Код уже это показывает.`,
			hint2: `Удалите весь закомментированный код. Улучшите имена переменных. Сохраните TODO комментарий и добавьте предупреждение о жёстко закодированной скидке.`,
			whyItMatters: `Плохие комментарии загромождают код и устаревают, а хорошие комментарии предоставляют ценный контекст.`,
			solutionCode: `package principles

import (
	"fmt"
	"strings"
	"time"
)

// User представляет пользователя приложения с аутентификационными данными
type User struct {
	ID        int
	Name      string
	Email     string
	CreatedAt time.Time
}

// ProcessUser валидирует и нормализует данные пользователя
// Возвращает ошибку если валидация не удалась
func ProcessUser(user *User) error {
	if user == nil {
		return fmt.Errorf("user is nil")
	}

	user.Name = strings.TrimSpace(user.Name)

	// Минимум 2 символа требуется для поддержки интернационализации
	if len(user.Name) < 2 {
		return fmt.Errorf("name too short")
	}

	if !strings.Contains(user.Email, "@") {
		return fmt.Errorf("invalid email")
	}

	fmt.Printf("Processing user: %s\n", user.Name)

	return nil
}

// CalculateDiscount применяет 10% скидку к оригинальной цене
// ПРЕДУПРЕЖДЕНИЕ: Ставка скидки жёстко закодирована. TODO: Сделать настраиваемой в v2.0
func CalculateDiscount(originalPrice float64) float64 {
	const discountRate = 0.9 // скидка 10%
	return originalPrice * discountRate
}`
		},
		uz: {
			title: 'Yaxshi va yomon izohlar',
			description: `Foydali izohlar va shovqin izohlarini farqlashni o'rganing. Yomon izohlarni o'chiring va kodni o'z-o'zini tushuntiradigan qiling.`,
			hint1: `Kod nima qilishini takrorlaydigan izohlarni o'chiring. Kod allaqachon buni ko'rsatyapti.`,
			hint2: `Barcha izohga olingan kodni o'chiring. O'zgaruvchi nomlarini yaxshilang. TODO izohni saqlang va qattiq practixngan chegirma haqida ogohlantirish qo'shing.`,
			whyItMatters: `Yomon izohlar kodni chalkashtirib yuboradi va eskiradi, yaxshi izohlar esa qimmatli kontekst beradi.`,
			solutionCode: `package principles

import (
	"fmt"
	"strings"
	"time"
)

// User autentifikatsiya tafsilotlari bilan ilova foydalanuvchisini ifodalaydi
type User struct {
	ID        int
	Name      string
	Email     string
	CreatedAt time.Time
}

// ProcessUser foydalanuvchi ma'lumotlarini tekshiradi va normalizatsiya qiladi
// Tekshiruv muvaffaqiyatsiz bo'lsa xato qaytaradi
func ProcessUser(user *User) error {
	if user == nil {
		return fmt.Errorf("user is nil")
	}

	user.Name = strings.TrimSpace(user.Name)

	// Xalqarolashtirishni qo'llab-quvvatlash uchun kamida 2 belgi talab qilinadi
	if len(user.Name) < 2 {
		return fmt.Errorf("name too short")
	}

	if !strings.Contains(user.Email, "@") {
		return fmt.Errorf("invalid email")
	}

	fmt.Printf("Processing user: %s\n", user.Name)

	return nil
}

// CalculateDiscount asl narxga 10% chegirma qo'llaydi
// OGOHLANTIRISH: Chegirma stavkasi qattiq practixngan. TODO: v2.0 da sozlanishi mumkin qiling
func CalculateDiscount(originalPrice float64) float64 {
	const discountRate = 0.9 // 10% chegirma
	return originalPrice * discountRate
}`
		}
	}
};

export default task;
