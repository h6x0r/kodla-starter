import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'se-refactoring-extract-variable-magic',
	title: 'Extract Variable - Magic Numbers',
	difficulty: 'easy',
	tags: ['refactoring', 'extract-variable', 'clean-code', 'go'],
	estimatedTime: '15m',
	isPremium: false,
	youtubeUrl: '',
	description: `Replace magic numbers with named constants that reveal their meaning and purpose.

**You will refactor:**

1. **ValidatePassword()** - Contains magic numbers for password rules
2. Extract **minPasswordLength** - Minimum password length constant
3. Extract **minUppercaseChars** - Minimum uppercase letters required
4. Extract **minDigits** - Minimum digits required

**Key Concepts:**
- **Self-Documenting Code**: Named constants explain themselves
- **Maintainability**: Change rules in one place
- **Type Safety**: Use typed constants
- **Readability**: Code reads like documentation

**Before Refactoring:**

\`\`\`go
if len(password) < 8 { return false }  // What is 8?
\`\`\`

**After Refactoring:**

\`\`\`go
const minPasswordLength = 8
if len(password) < minPasswordLength { return false }
\`\`\`

**When to Extract Variables:**
- Hard-coded numbers without context
- Repeated literal values
- Complex calculations
- Configuration values
- Business rule constants

**Constraints:**
- Keep original ValidatePassword signature
- Extract exactly 3 constants at package level
- Use const keyword for constants
- Maintain exact same validation logic`,
	initialCode: `package refactoring

import (
	"unicode"
)

func ValidatePassword(password string) bool {
	if len(password) < 8 {
		return false
	}

	for _, char := range password {
		if unicode.IsUpper(char) {
		}
	}
	if uppercaseCount < 1 {
		return false
	}

	for _, char := range password {
		if unicode.IsDigit(char) {
		}
	}
	if digitCount < 2 {
		return false
	}

	return true
}`,
	solutionCode: `package refactoring

import (
	"unicode"
)

const (
	minPasswordLength   = 8	// minimum characters required for secure password
	minUppercaseChars   = 1	// at least one uppercase letter for complexity
	minDigits           = 2	// minimum two digits for added security
)

func ValidatePassword(password string) bool {
	// Check minimum length against security requirement
	if len(password) < minPasswordLength {
		return false
	}

	// Count uppercase letters
	uppercaseCount := 0
	for _, char := range password {
		if unicode.IsUpper(char) {
			uppercaseCount++
		}
	}
	// Verify meets minimum uppercase requirement
	if uppercaseCount < minUppercaseChars {
		return false
	}

	// Count digits
	digitCount := 0
	for _, char := range password {
		if unicode.IsDigit(char) {
			digitCount++
		}
	}
	// Verify meets minimum digit requirement
	if digitCount < minDigits {
		return false
	}

	return true
}`,
	hint1: `Declare three constants at the package level (above the function) using const: minPasswordLength = 8, minUppercaseChars = 1, and minDigits = 2.`,
	hint2: `Replace the magic numbers 8, 1, and 2 in the if statements with the corresponding constant names.`,
	whyItMatters: `Replacing magic numbers with named constants is essential for code maintainability and understanding.

**Why Extract Variable (Magic Numbers) Matters:**

**1. Code Becomes Self-Documenting**
Named constants explain what numbers mean:

\`\`\`go
// Before: What do these numbers represent?
func ProcessPayment(amount float64) error {
    if amount < 5 {
        return errors.New("minimum not met")
    }
    if amount > 10000 {
        return errors.New("limit exceeded")
    }
    fee := amount * 0.029 + 0.30
    return nil
}

// After: Crystal clear business rules
const (
    minimumPaymentAmount = 5.00      // USD minimum transaction
    maximumPaymentAmount = 10000.00  // USD fraud prevention limit
    paymentProcessingRate = 0.029    // 2.9% processing fee
    paymentFixedFee = 0.30           // $0.30 fixed fee per transaction
)

func ProcessPayment(amount float64) error {
    if amount < minimumPaymentAmount {
        return errors.New("minimum not met")
    }
    if amount > maximumPaymentAmount {
        return errors.New("limit exceeded")
    }
    fee := amount*paymentProcessingRate + paymentFixedFee
    return nil
}
\`\`\`

**2. Single Point of Change**
Modify values in one place, not scattered throughout code:

\`\`\`go
// Before: Same value repeated everywhere - nightmare to update
func CheckInventory(stock int) bool { return stock > 10 }
func ReorderAlert(stock int) bool { return stock <= 10 }
func DisplayWarning(stock int) bool { return stock == 10 }
// If minimum stock changes to 15, must update 3+ places

// After: Update once, applies everywhere
const minimumStockLevel = 10

func CheckInventory(stock int) bool { return stock > minimumStockLevel }
func ReorderAlert(stock int) bool { return stock <= minimumStockLevel }
func DisplayWarning(stock int) bool { return stock == minimumStockLevel }
// Change minimumStockLevel = 15, done!
\`\`\`

**3. Type Safety and Compile-Time Checking**
Typed constants prevent errors:

\`\`\`go
// Before: Easy to make mistakes with raw numbers
type Status int
func UpdateStatus(s Status) {
    if s == 1 { /* pending */ }
    if s == 2 { /* approved */ }
    if s == 5 { /* rejected */ }  // Typo! Should be 3
}

// After: Compiler catches mistakes
const (
    StatusPending Status = iota + 1  // 1
    StatusApproved                    // 2
    StatusRejected                    // 3
)

func UpdateStatus(s Status) {
    if s == StatusPending { /* pending */ }
    if s == StatusApproved { /* approved */ }
    if s == StatusRejected { /* rejected */ }  // Typo impossible
}
\`\`\`

**4. Domain Knowledge Captured**
Constants encode business knowledge:

\`\`\`go
// Before: Requires domain expertise to understand
func CalculateShippingTime(miles int) int {
    if miles < 50 { return 1 }
    if miles < 500 { return 3 }
    return 7
}

// After: Business rules are explicit
const (
    localDeliveryRadius = 50      // miles - same-day delivery zone
    regionalDeliveryRadius = 500  // miles - 3-day delivery zone
    sameDay Delivery = 1          // days
    regionalDelivery = 3          // days
    nationalDelivery = 7          // days
)

func CalculateShippingTime(miles int) int {
    if miles < localDeliveryRadius {
        return sameDayDelivery
    }
    if miles < regionalDeliveryRadius {
        return regionalDelivery
    }
    return nationalDelivery
}
\`\`\`

**5. Easier Testing and Configuration**
Constants can be overridden in tests:

\`\`\`go
// Production constants
const (
    maxRetries = 3
    retryDelay = 5 * time.Second
)

// In tests, can use build tags for different values
// +build test
const (
    maxRetries = 1              // faster tests
    retryDelay = 1 * time.Millisecond  // no waiting
)

func TestWithRetry(t *testing.T) {
    // Uses test constants - fast execution
    err := retryOperation()
    // Test completes in milliseconds, not 15+ seconds
}
\`\`\`

**Real-World Example - HTTP Configuration:**

\`\`\`go
// Before: Scattered magic numbers
client := &http.Client{
    Timeout: 30 * time.Second,
}
server := &http.Server{
    ReadTimeout:  15 * time.Second,
    WriteTimeout: 15 * time.Second,
    IdleTimeout:  60 * time.Second,
    MaxHeaderBytes: 1 << 20,  // 1MB - what?
}

// After: Clear configuration with explanations
const (
    // Client timeouts
    httpClientTimeout = 30 * time.Second  // max time for complete request

    // Server timeouts for DDoS protection
    httpReadTimeout  = 15 * time.Second   // max time to read request
    httpWriteTimeout = 15 * time.Second   // max time to write response
    httpIdleTimeout  = 60 * time.Second   // max time between requests

    // Security limits
    maxHTTPHeaderSize = 1 << 20  // 1MB - prevent memory exhaustion
)

client := &http.Client{
    Timeout: httpClientTimeout,
}
server := &http.Server{
    ReadTimeout:    httpReadTimeout,
    WriteTimeout:   httpWriteTimeout,
    IdleTimeout:    httpIdleTimeout,
    MaxHeaderBytes: maxHTTPHeaderSize,
}
\`\`\`

**Common Magic Numbers to Extract:**
- Array/slice sizes and capacities
- Timeout durations
- Retry counts and delays
- Port numbers
- HTTP status codes
- Buffer sizes
- Percentage thresholds
- Business rule values (discounts, limits, etc.)

**Naming Conventions:**
- Use descriptive names: \`maxRetries\` not \`max\`
- Include units: \`timeoutSeconds\` or \`timeoutDuration\`
- Group related constants in const blocks
- Use ALL_CAPS for package-level constants in some languages (not Go)
- In Go, use camelCase: \`minPasswordLength\`

**When NOT to Extract:**
- \`0\` and \`1\` in obvious contexts (array indices, loop counters)
- Mathematical constants already named: \`math.Pi\`
- \`nil\`, \`true\`, \`false\` - self-explanatory
- String format specifiers: \`"%s %d"\``,
	order: 2,
	testCode: `package refactoring

import (
	"testing"
)

// Test1: ValidatePassword with valid password
func Test1(t *testing.T) {
	if !ValidatePassword("Passw0rd12") {
		t.Error("expected valid password with 1 uppercase, 2 digits, 8+ chars")
	}
}

// Test2: ValidatePassword with too short password
func Test2(t *testing.T) {
	if ValidatePassword("Pass12") {
		t.Error("expected false for password < 8 chars")
	}
}

// Test3: ValidatePassword with exactly 8 chars (boundary)
func Test3(t *testing.T) {
	if !ValidatePassword("Abcdef12") {
		t.Error("expected valid for exactly 8 chars with uppercase and 2 digits")
	}
}

// Test4: ValidatePassword with no uppercase
func Test4(t *testing.T) {
	if ValidatePassword("password12") {
		t.Error("expected false for no uppercase letters")
	}
}

// Test5: ValidatePassword with only 1 digit
func Test5(t *testing.T) {
	if ValidatePassword("Password1") {
		t.Error("expected false for only 1 digit (need 2)")
	}
}

// Test6: ValidatePassword with no digits
func Test6(t *testing.T) {
	if ValidatePassword("Password") {
		t.Error("expected false for no digits")
	}
}

// Test7: ValidatePassword with multiple uppercase
func Test7(t *testing.T) {
	if !ValidatePassword("PASSword12") {
		t.Error("expected valid with multiple uppercase")
	}
}

// Test8: ValidatePassword with many digits
func Test8(t *testing.T) {
	if !ValidatePassword("Pass12345") {
		t.Error("expected valid with many digits")
	}
}

// Test9: ValidatePassword with 7 chars (boundary fail)
func Test9(t *testing.T) {
	if ValidatePassword("Abcde12") {
		t.Error("expected false for 7 chars")
	}
}

// Test10: ValidatePassword with special characters
func Test10(t *testing.T) {
	if !ValidatePassword("Pass@123") {
		t.Error("expected valid with special char, uppercase, and 3 digits")
	}
}
`,
	translations: {
		ru: {
			title: 'Extract Variable - Магические числа',
			description: `Замените магические числа именованными константами, которые раскрывают их значение и назначение.

**Вы выполните рефакторинг:**

1. **ValidatePassword()** - Содержит магические числа для правил паролей
2. Извлечь **minPasswordLength** - Константа минимальной длины пароля
3. Извлечь **minUppercaseChars** - Минимальное количество заглавных букв
4. Извлечь **minDigits** - Минимальное количество цифр

**Ключевые концепции:**
- **Самодокументируемый код**: Именованные константы объясняют себя
- **Поддерживаемость**: Изменяйте правила в одном месте
- **Типобезопасность**: Используйте типизированные константы
- **Читаемость**: Код читается как документация

**До рефакторинга:**

\`\`\`go
if len(password) < 8 { return false }  // Что такое 8?
\`\`\`

**После рефакторинга:**

\`\`\`go
const minPasswordLength = 8
if len(password) < minPasswordLength { return false }
\`\`\`

**Когда извлекать переменные:**
- Жёстко закодированные числа без контекста
- Повторяющиеся литеральные значения
- Сложные вычисления
- Значения конфигурации
- Константы бизнес-правил

**Ограничения:**
- Сохранить исходную сигнатуру ValidatePassword
- Извлечь ровно 3 константы на уровне пакета
- Использовать ключевое слово const
- Сохранить точно такую же логику валидации`,
			hint1: `Объявите три константы на уровне пакета (над функцией) используя const: minPasswordLength = 8, minUppercaseChars = 1 и minDigits = 2.`,
			hint2: `Замените магические числа 8, 1 и 2 в if операторах соответствующими именами констант.`,
			whyItMatters: `Замена магических чисел именованными константами необходима для поддерживаемости и понимания кода.`
		},
		uz: {
			title: 'Extract Variable - Sehrli raqamlar',
			description: `Sehrli raqamlarni ularning ma'nosi va maqsadini ochib beradigan nomlangan konstantalar bilan almashtiring.

**Siz refaktoring qilasiz:**

1. **ValidatePassword()** - Parol qoidalari uchun sehrli raqamlarni o'z ichiga oladi
2. Ajratish **minPasswordLength** - Minimal parol uzunligi konstantasi
3. Ajratish **minUppercaseChars** - Minimal katta harflar soni
4. Ajratish **minDigits** - Minimal raqamlar soni

**Asosiy tushunchalar:**
- **O'z-o'zini hujjatlaydigan kod**: Nomlangan konstantalar o'zlarini tushuntiradi
- **Qo'llab-quvvatlash**: Qoidalarni bir joyda o'zgartiring
- **Tur xavfsizligi**: Turlangan konstantalardan foydalaning
- **O'qilishi**: Kod hujjat kabi o'qiladi

**Refaktoring oldidan:**

\`\`\`go
if len(password) < 8 { return false }  // 8 nima?
\`\`\`

**Refaktoringdan keyin:**

\`\`\`go
const minPasswordLength = 8
if len(password) < minPasswordLength { return false }
\`\`\`

**Qachon o'zgaruvchilarni ajratish kerak:**
- Kontekstsiz qattiq practixngan raqamlar
- Takrorlanuvchi literal qiymatlar
- Murakkab hisoblashlar
- Konfiguratsiya qiymatlari
- Biznes qoidalari konstantalari

**Cheklovlar:**
- Asl ValidatePassword imzosini saqlash
- Aynan 3 ta konstantani paket darajasida ajratish
- const kalit so'zidan foydalanish
- Aynan bir xil validatsiya logikasini saqlash`,
			hint1: `Uchta konstantani paket darajasida (funksiya ustida) const dan foydalanib e'lon qiling: minPasswordLength = 8, minUppercaseChars = 1 va minDigits = 2.`,
			hint2: `if operatorlaridagi 8, 1 va 2 sehrli raqamlarni mos konstanta nomlari bilan almashtiring.`,
			whyItMatters: `Sehrli raqamlarni nomlangan konstantalar bilan almashtirish kodni qo'llab-quvvatlash va tushunish uchun zarurdir.`
		}
	}
};

export default task;
