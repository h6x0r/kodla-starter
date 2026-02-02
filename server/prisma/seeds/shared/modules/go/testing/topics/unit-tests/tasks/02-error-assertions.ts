import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-error-assertions',
	title: 'Error Assertions',
	difficulty: 'easy',	tags: ['go', 'testing', 'errors'],
	estimatedTime: '20m',	isPremium: false,
	youtubeUrl: '',
	description: `Test error handling using **t.Fatal** and **t.Error** appropriately.

**Requirements:**
1. Implement \`Divide(a, b float64) (float64, error)\` that returns error when b is zero
2. Write \`TestDivide\` testing both success and error cases
3. Use \`t.Fatal\` when error state makes further testing impossible
4. Use \`t.Error\` for non-critical failures

**Example:**
\`\`\`go
result, err := Divide(10, 2)
if err != nil {
    t.Fatalf("unexpected error: %v", err)
}
if result != 5 {
    t.Errorf("got %v, want 5", result)
}
\`\`\`

**Constraints:**
- Division by zero must return error
- Error message should be descriptive
- Use correct assertion method (Fatal vs Error)`,
	initialCode: `package math_test
// TODO: Implement Divide function that returns error on division by zero
func Divide(a, b float64) (float64, error) {
	var zero float64
	return zero, nil // TODO: Implement
}

// TODO: Write TestDivide with success and error cases
func TestDivide(t *T) {
	// TODO: Implement
}`,
	solutionCode: `package math_test

import (
	"errors"
)

func Divide(a, b float64) (float64, error) {
	if b == 0 {  // Check for division by zero
		return 0, errors.New("division by zero")
	}
	return a / b, nil  // Return result
}

func TestDivide(t *T) {
	// Test successful division
	result, err := Divide(10, 2)
	if err != nil {  // Fatal: error here makes result invalid
		t.Fatalf("Divide(10, 2) unexpected error: %v", err)
	}
	if result != 5 {  // Error: wrong result but test can continue
		t.Errorf("Divide(10, 2) = %v; want 5", result)
	}

	// Test division by zero
	_, err = Divide(10, 0)
	if err == nil {  // Fatal: missing expected error
		t.Fatal("Divide(10, 0) expected error, got nil")
	}

	// Test negative numbers
	result, err = Divide(-10, 2)
	if err != nil {
		t.Fatalf("Divide(-10, 2) unexpected error: %v", err)
	}
	if result != -5 {
		t.Errorf("Divide(-10, 2) = %v; want -5", result)
	}
}`,
			hint1: `Use t.Fatal when an error means the test cannot continue meaningfully (e.g., setup failure).`,
			hint2: `Use t.Error when you want to report failure but continue testing other cases.`,
			testCode: `package math_test

import (
	"errors"
)

// Test1: Successful division
func Test1(t *T) {
	result, err := Divide(10, 2)
	if err != nil {
		t.Fatalf("Divide(10, 2) unexpected error: %v", err)
	}
	if result != 5 {
		t.Errorf("Divide(10, 2) = %v; want 5", result)
	}
}

// Test2: Division by zero returns error
func Test2(t *T) {
	_, err := Divide(10, 0)
	if err == nil {
		t.Fatal("Divide(10, 0) expected error, got nil")
	}
}

// Test3: Negative dividend
func Test3(t *T) {
	result, err := Divide(-10, 2)
	if err != nil {
		t.Fatalf("Divide(-10, 2) unexpected error: %v", err)
	}
	if result != -5 {
		t.Errorf("Divide(-10, 2) = %v; want -5", result)
	}
}

// Test4: Negative divisor
func Test4(t *T) {
	result, err := Divide(10, -2)
	if err != nil {
		t.Fatalf("Divide(10, -2) unexpected error: %v", err)
	}
	if result != -5 {
		t.Errorf("Divide(10, -2) = %v; want -5", result)
	}
}

// Test5: Both negative
func Test5(t *T) {
	result, err := Divide(-10, -2)
	if err != nil {
		t.Fatalf("Divide(-10, -2) unexpected error: %v", err)
	}
	if result != 5 {
		t.Errorf("Divide(-10, -2) = %v; want 5", result)
	}
}

// Test6: Zero dividend
func Test6(t *T) {
	result, err := Divide(0, 5)
	if err != nil {
		t.Fatalf("Divide(0, 5) unexpected error: %v", err)
	}
	if result != 0 {
		t.Errorf("Divide(0, 5) = %v; want 0", result)
	}
}

// Test7: Fractional result
func Test7(t *T) {
	result, err := Divide(5, 2)
	if err != nil {
		t.Fatalf("Divide(5, 2) unexpected error: %v", err)
	}
	if result != 2.5 {
		t.Errorf("Divide(5, 2) = %v; want 2.5", result)
	}
}

// Test8: Large numbers
func Test8(t *T) {
	result, err := Divide(1000000, 1000)
	if err != nil {
		t.Fatalf("Divide(1000000, 1000) unexpected error: %v", err)
	}
	if result != 1000 {
		t.Errorf("Divide(1000000, 1000) = %v; want 1000", result)
	}
}

// Test9: Division by one
func Test9(t *T) {
	result, err := Divide(42, 1)
	if err != nil {
		t.Fatalf("Divide(42, 1) unexpected error: %v", err)
	}
	if result != 42 {
		t.Errorf("Divide(42, 1) = %v; want 42", result)
	}
}

// Test10: Same number division
func Test10(t *T) {
	result, err := Divide(7, 7)
	if err != nil {
		t.Fatalf("Divide(7, 7) unexpected error: %v", err)
	}
	if result != 1 {
		t.Errorf("Divide(7, 7) = %v; want 1", result)
	}
}
`,
			whyItMatters: `Proper error testing ensures your code handles failures gracefully in production.

**Why Error Testing Matters:**
- **User Experience:** Errors should be informative, not cryptic
- **Reliability:** Code must fail safely without crashing
- **Debugging:** Good error messages save hours of debugging time
- **API Contracts:** Errors are part of your function's interface

**t.Fatal vs t.Error:**
\`\`\`go
// Use t.Fatal when:
result, err := Setup()
if err != nil {
    t.Fatal(err)  // Can't continue without setup
}

// Use t.Error when:
if result.Count != 5 {
    t.Error("wrong count")  // Continue testing other fields
}
if result.Name != "test" {
    t.Error("wrong name")  // Can still check this
}
\`\`\`

**Production Example:**
A payment API that returns unclear errors:
\`\`\`go
// Bad: "error" - what error?
return 0, errors.New("error")

// Good: "insufficient funds: balance=50, required=100"
return 0, fmt.Errorf("insufficient funds: balance=%d, required=%d", balance, amount)
\`\`\`

Clear error messages reduce support tickets and debugging time. At Stripe, error messages include request IDs, making debugging across services possible.

**Real-World Impact:**
When AWS S3 had an outage, services with proper error handling degraded gracefully. Services without error testing crashed completely.`,	order: 1,
	translations: {
		ru: {
			title: 'Проверка возвращаемых ошибок',
			description: `Тестируйте обработку ошибок используя **t.Fatal** и **t.Error** правильно.

**Требования:**
1. Реализуйте \`Divide(a, b float64) (float64, error)\` возвращающую ошибку при b == 0
2. Напишите \`TestDivide\` тестирующий успешные и ошибочные случаи
3. Используйте \`t.Fatal\` когда ошибка делает дальнейшее тестирование невозможным
4. Используйте \`t.Error\` для некритичных сбоев

**Пример:**
\`\`\`go
result, err := Divide(10, 2)
if err != nil {
    t.Fatalf("unexpected error: %v", err)
}
\`\`\`

**Ограничения:**
- Деление на ноль должно возвращать ошибку
- Сообщение об ошибке должно быть описательным`,
			hint1: `Используйте t.Fatal когда ошибка означает что тест не может продолжаться.`,
			hint2: `Используйте t.Error когда хотите сообщить о сбое но продолжить тестирование.`,
			whyItMatters: `Правильное тестирование ошибок гарантирует что код корректно обрабатывает сбои в production.

**Почему важно тестирование ошибок:**
- **Пользовательский опыт:** Ошибки должны быть информативными, не криптичными
- **Надежность:** Код должен безопасно падать без крашей
- **Отладка:** Хорошие сообщения об ошибках экономят часы отладки
- **API контракты:** Ошибки - часть интерфейса вашей функции

**t.Fatal vs t.Error:**
\`\`\`go
// Используйте t.Fatal когда:
result, err := Setup()
if err != nil {
    t.Fatal(err)  // Не можем продолжить без setup
}

// Используйте t.Error когда:
if result.Count != 5 {
    t.Error("неправильный count")  // Продолжаем тестировать другие поля
}
if result.Name != "test" {
    t.Error("неправильное имя")  // Можем все еще проверить это
}
\`\`\`

**Продакшен паттерн:**
API платежей, который возвращает неясные ошибки:
\`\`\`go
// Плохо: "error" - какая ошибка?
return 0, errors.New("error")

// Хорошо: "недостаточно средств: баланс=50, требуется=100"
return 0, fmt.Errorf("недостаточно средств: баланс=%d, требуется=%d", balance, amount)
\`\`\`

Четкие сообщения об ошибках сокращают обращения в поддержку и время отладки. В Stripe сообщения об ошибках включают ID запроса, что делает отладку между сервисами возможной.

**Практическое влияние:**
Когда у AWS S3 был сбой, сервисы с правильной обработкой ошибок деградировали gracefully. Сервисы без тестирования ошибок крашились полностью.`,
			solutionCode: `package math_test

import (
	"errors"
)

func Divide(a, b float64) (float64, error) {
	if b == 0 {  // Проверка деления на ноль
		return 0, errors.New("division by zero")
	}
	return a / b, nil  // Возврат результата
}

func TestDivide(t *T) {
	// Тестируем успешное деление
	result, err := Divide(10, 2)
	if err != nil {  // Fatal: ошибка здесь делает результат недействительным
		t.Fatalf("Divide(10, 2) неожиданная ошибка: %v", err)
	}
	if result != 5 {  // Error: неправильный результат но тест может продолжаться
		t.Errorf("Divide(10, 2) = %v; want 5", result)
	}

	// Тестируем деление на ноль
	_, err = Divide(10, 0)
	if err == nil {  // Fatal: отсутствует ожидаемая ошибка
		t.Fatal("Divide(10, 0) ожидается ошибка, получено nil")
	}

	// Тестируем отрицательные числа
	result, err = Divide(-10, 2)
	if err != nil {
		t.Fatalf("Divide(-10, 2) неожиданная ошибка: %v", err)
	}
	if result != -5 {
		t.Errorf("Divide(-10, 2) = %v; want -5", result)
	}
}`
		},
		uz: {
			title: `Qaytarilgan xatolarni tekshirish`,
			description: `**t.Fatal** va **t.Error** dan to'g'ri foydalanib xatolarni tekshiring.

**Talablar:**
1. b == 0 bo'lganda xato qaytaradigan 'Divide(a, b float64) (float64, error)' ni amalga oshiring
2. Muvaffaqiyatli va xato holatlarini tekshiradigan 'TestDivide' yozing
3. Xato keyingi testni imkonsiz qiladigan bo'lsa 't.Fatal' dan foydalaning
4. Muhim bo'lmagan xatolar uchun 't.Error' dan foydalaning

**Misol:**
\`\`\`go
result, err := Divide(10, 2)
if err != nil {
    t.Fatalf("unexpected error: %v", err)
}
\`\`\`

**Cheklovlar:**
- Nolga bo'lish xatoni qaytarishi kerak
- Xato xabari tavsiflovchi bo'lishi kerak`,
			hint1: `Xato testni davom ettirish mumkin emasligini bildirsa t.Fatal dan foydalaning.`,
			hint2: `Xato haqida xabar bermoqchi bo'lsangiz lekin testni davom ettirmoqchi bo'lsangiz t.Error dan foydalaning.`,
			whyItMatters: `To'g'ri xato tekshiruvi kodingiz production'da xatolarni to'g'ri boshqarishini ta'minlaydi.

**Nima uchun xato testlash muhim:**
- **Foydalanuvchi tajribasi:** Xatolar tushunarli bo'lishi kerak, sirli emas
- **Ishonchlilik:** Kod crash bo'lmasdan xavfsiz ishlamay qolishi kerak
- **Debug:** Yaxshi xato xabarlari soatlab debug vaqtini tejaydi
- **API shartnomasi:** Xatolar funksiya interfeysining bir qismi

**t.Fatal vs t.Error:**
\`\`\`go
// t.Fatal dan foydalaning qachonki:
result, err := Setup()
if err != nil {
    t.Fatal(err)  // Setup siz davom eta olmaymiz
}

// t.Error dan foydalaning qachonki:
if result.Count != 5 {
    t.Error("noto'g'ri count")  // Boshqa fieldlarni testlashni davom ettiramiz
}
if result.Name != "test" {
    t.Error("noto'g'ri ism")  // Buni hali ham tekshirishimiz mumkin
}
\`\`\`

**Ishlab chiqarish patterni:**
Noaniq xatolarni qaytaradigan to'lov API:
\`\`\`go
// Yomon: "error" - qanday xato?
return 0, errors.New("error")

// Yaxshi: "mablag' yetarli emas: balans=50, kerak=100"
return 0, fmt.Errorf("mablag' yetarli emas: balans=%d, kerak=%d", balance, amount)
\`\`\`

Aniq xato xabarlari qo'llab-quvvatlash murojaatlarini va debug vaqtini kamaytiradi. Stripe da xato xabarlari so'rov ID larini o'z ichiga oladi, bu xizmatlar o'rtasida debug qilishni mumkin qiladi.

**Amaliy ta'sir:**
AWS S3 nosozlik bo'lganda, to'g'ri xato boshqaruviga ega xizmatlar gracefully degradatsiya qilindi. Xato testlashsiz xizmatlar to'liq crash bo'ldi.`,
			solutionCode: `package math_test

import (
	"errors"
)

func Divide(a, b float64) (float64, error) {
	if b == 0 {  // Nolga bo'lishni tekshirish
		return 0, errors.New("division by zero")
	}
	return a / b, nil  // Natijani qaytarish
}

func TestDivide(t *T) {
	// Muvaffaqiyatli bo'linishni tekshirish
	result, err := Divide(10, 2)
	if err != nil {  // Fatal: bu yerda xato natijani noto'g'ri qiladi
		t.Fatalf("Divide(10, 2) kutilmagan xato: %v", err)
	}
	if result != 5 {  // Error: noto'g'ri natija lekin test davom etishi mumkin
		t.Errorf("Divide(10, 2) = %v; want 5", result)
	}

	// Nolga bo'linishni tekshirish
	_, err = Divide(10, 0)
	if err == nil {  // Fatal: kutilgan xato yo'q
		t.Fatal("Divide(10, 0) xato kutilgan, nil olindi")
	}

	// Manfiy sonlarni tekshirish
	result, err = Divide(-10, 2)
	if err != nil {
		t.Fatalf("Divide(-10, 2) kutilmagan xato: %v", err)
	}
	if result != -5 {
		t.Errorf("Divide(-10, 2) = %v; want -5", result)
	}
}`
		}
	}
};

export default task;
