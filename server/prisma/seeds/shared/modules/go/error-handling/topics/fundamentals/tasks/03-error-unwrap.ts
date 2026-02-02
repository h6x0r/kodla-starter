import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-error-unwrap',
	title: 'Error Unwrapping',
	difficulty: 'medium',	tags: ['go', 'errors', 'unwrap'],
	estimatedTime: '20m',	isPremium: false,
	youtubeUrl: '',
	description: `Implement **Unwrap()** method for AppError to support error chain inspection.

**Requirements:**
1. Add \`Unwrap() error\` method to AppError
2. Return the underlying \`Err\` field
3. Handle nil receiver gracefully
4. Enable \`errors.Is()\` and \`errors.As()\` to traverse error chain

**Example:**
\`\`\`go
dbErr := sql.ErrNoRows
appErr := &AppError{
    Code: "NOT_FOUND",
    Op:   "users.GetByID",
    Err:  dbErr,
}

// Unwrap enables errors.Is to check underlying error
if errors.Is(appErr, sql.ErrNoRows) {
    fmt.Println("Database returned no rows")
}
\`\`\`

**Constraints:**
- Must return nil for nil receiver
- Must return the Err field`,
	initialCode: `package errorsx

import "fmt"

type AppError struct {
	Code string
	Op   string
	Err  error
}

// Error implements error interface
func (e *AppError) Error() string {
	if e == nil {
		return "<nil>"
	}
	return fmt.Sprintf("op=%s, code=%s, err=%v", e.Op, e.Code, e.Err)
}

// TODO: Implement Unwrap() method to return underlying error
func (e *AppError) Unwrap() error {
	return nil // TODO: Implement
}`,
	solutionCode: `package errorsx

import "fmt"

type AppError struct {
	Code string
	Op   string
	Err  error
}

// Error implements error interface
func (e *AppError) Error() string {
	if e == nil {
		return "<nil>"
	}
	return fmt.Sprintf("op=%s, code=%s, err=%v", e.Op, e.Code, e.Err)
}

func (e *AppError) Unwrap() error {
	if e == nil {        // Nil receiver check
		return nil   // Safe handling
	}
	return e.Err         // Return underlying error for chain inspection
}`,
		testCode: `package errorsx

import (
	"errors"
	"testing"
)

func Test1(t *testing.T) {
	// Unwrap returns underlying error
	inner := errors.New("inner")
	err := &AppError{Code: "ERR", Op: "op", Err: inner}
	if err.Unwrap() != inner {
		t.Error("expected Unwrap to return underlying error")
	}
}

func Test2(t *testing.T) {
	// Unwrap returns nil when Err is nil
	err := &AppError{Code: "ERR", Op: "op", Err: nil}
	if err.Unwrap() != nil {
		t.Error("expected Unwrap to return nil")
	}
}

func Test3(t *testing.T) {
	// Nil receiver does not panic
	var err *AppError = nil
	defer func() {
		if r := recover(); r != nil {
			t.Error("Unwrap should not panic on nil receiver")
		}
	}()
	_ = err.Unwrap()
}

func Test4(t *testing.T) {
	// Nil receiver returns nil
	var err *AppError = nil
	if err.Unwrap() != nil {
		t.Error("expected nil for nil receiver")
	}
}

func Test5(t *testing.T) {
	// errors.Is works through Unwrap
	sentinel := errors.New("sentinel")
	err := &AppError{Code: "ERR", Op: "op", Err: sentinel}
	if !errors.Is(err, sentinel) {
		t.Error("expected errors.Is to find sentinel through Unwrap")
	}
}

func Test6(t *testing.T) {
	// Nested errors work with errors.Is
	inner := errors.New("root cause")
	middle := &AppError{Code: "MID", Op: "mid", Err: inner}
	outer := &AppError{Code: "OUT", Op: "out", Err: middle}
	if !errors.Is(outer, inner) {
		t.Error("expected errors.Is to traverse nested errors")
	}
}

func Test7(t *testing.T) {
	// Unwrap returns exact error reference
	inner := errors.New("test")
	err := &AppError{Err: inner}
	unwrapped := err.Unwrap()
	if unwrapped != inner {
		t.Error("expected exact error reference")
	}
}

func Test8(t *testing.T) {
	// AppError can be unwrapped multiple times
	inner := errors.New("root")
	err := &AppError{Err: inner}
	first := err.Unwrap()
	if first != inner {
		t.Error("expected inner error on first unwrap")
	}
}

func Test9(t *testing.T) {
	// errors.Unwrap works with AppError
	inner := errors.New("test")
	err := &AppError{Err: inner}
	unwrapped := errors.Unwrap(err)
	if unwrapped != inner {
		t.Error("expected errors.Unwrap to work")
	}
}

func Test10(t *testing.T) {
	// Unwrap chain terminates correctly
	err := &AppError{Err: nil}
	if err.Unwrap() != nil {
		t.Error("expected chain to terminate with nil")
	}
}
`,
		hint1: `Check if receiver is nil before accessing fields.`,
			hint2: `Simply return the Err field to expose the underlying error.`,
			whyItMatters: `Unwrap() enables Go's standard error inspection functions to traverse error chains.

**Why Unwrap:**
- **errors.Is():** Check if any error in chain matches a target
- **errors.As():** Extract specific error type from chain
- **Error Context:** Preserve original error while adding context layers

**Production Pattern:**
\`\`\`go
// Layer 1: Database error
dbErr := sql.ErrNoRows

// Layer 2: Repository adds context
repoErr := &AppError{Op: "repo.GetUser", Err: dbErr}

// Layer 3: Service adds business context
svcErr := &AppError{Code: "USER_NOT_FOUND", Op: "service.GetUser", Err: repoErr}

// Check original error through all layers
if errors.Is(svcErr, sql.ErrNoRows) {
    // True! Unwrap() lets errors.Is traverse the chain
}
\`\`\`

**Real-World Benefits:**
- **Microservices:** Pass errors between services without losing root cause
- **Observability:** Log error chains for full context
- **Error Handling:** Make decisions based on root cause, not wrapper

Without Unwrap(), you'd lose access to the original error and couldn't use errors.Is/As.`,	order: 2,
	translations: {
		ru: {
			title: 'Извлечение вложенных ошибок',
			description: `Реализуйте метод **Unwrap()** для AppError для поддержки цепочки ошибок.

**Требования:**
1. Добавьте метод \`Unwrap() error\` к AppError
2. Возвращайте вложенное поле \`Err\`
3. Обрабатывайте nil receiver корректно
4. Включите поддержку \`errors.Is()\` и \`errors.As()\`

**Пример:**
\`\`\`go
dbErr := sql.ErrNoRows
appErr := &AppError{
    Code: "NOT_FOUND",
    Op:   "users.GetByID",
    Err:  dbErr,
}

if errors.Is(appErr, sql.ErrNoRows) {
    fmt.Println("База данных не вернула строк")
}
\`\`\`

**Ограничения:**
- Должен возвращать nil для nil receiver
- Должен возвращать поле Err`,
			hint1: `Проверьте nil receiver перед доступом к полям.`,
			hint2: `Просто верните поле Err для доступа к вложенной ошибке.`,
			whyItMatters: `Unwrap() позволяет стандартным функциям Go проверять цепочки ошибок.

**Почему важно:**
- **errors.Is():** Проверка ошибки в цепочке
- **errors.As():** Извлечение конкретного типа ошибки
- **Контекст ошибок:** Сохранение оригинальной ошибки с добавлением контекста

**Продакшен паттерн:**
\`\`\`go
// Слой 1: Ошибка базы данных
dbErr := sql.ErrNoRows

// Слой 2: Репозиторий добавляет контекст
repoErr := &AppError{Op: "repo.GetUser", Err: dbErr}

// Слой 3: Сервис добавляет бизнес-контекст
svcErr := &AppError{Code: "USER_NOT_FOUND", Op: "service.GetUser", Err: repoErr}

// Проверка исходной ошибки через все слои
if errors.Is(svcErr, sql.ErrNoRows) {
    // True! Unwrap() позволяет errors.Is обойти цепочку
}
\`\`\`

**Практические преимущества:**
- **Микросервисы:** Передача ошибок между сервисами без потери первопричины
- **Observability:** Логирование цепочек ошибок для полного контекста
- **Обработка ошибок:** Принятие решений на основе первопричины, а не обертки

Без Unwrap() вы потеряете доступ к оригинальной ошибке и не сможете использовать errors.Is/As.`,
			solutionCode: `package errorsx

import "fmt"

type AppError struct {
	Code string
	Op   string
	Err  error
}

// Error implements error interface
func (e *AppError) Error() string {
	if e == nil {
		return "<nil>"
	}
	return fmt.Sprintf("op=%s, code=%s, err=%v", e.Op, e.Code, e.Err)
}

func (e *AppError) Unwrap() error {
	if e == nil {        // Проверка nil receiver
		return nil   // Безопасная обработка
	}
	return e.Err         // Возврат вложенной ошибки для проверки цепочки
}`
		},
		uz: {
			title: 'Ichki xatolarni ajratib olish',
			description: `AppError uchun error zanjirini tekshirishni qo llab-quvvatlash uchun **Unwrap()** metodini amalga oshiring.

**Talablar:**
1. AppError ga 'Unwrap() error' metodini qo shing
2. Ichki 'Err' fieldni qaytaring
3. nil receiver ni to g ri ishlang
4. 'errors.Is()' va 'errors.As()' uchun support qo shing

**Misol:**
\`\`\`go
dbErr := sql.ErrNoRows
appErr := &AppError{
    Code: "NOT_FOUND",
    Op:   "users.GetByID",
    Err:  dbErr,
}

if errors.Is(appErr, sql.ErrNoRows) {
    fmt.Println("Database qatorlar qaytarmadi")
}
\`\`\`

**Cheklovlar:**
- nil receiver uchun nil qaytarishi kerak
- Err fieldni qaytarishi kerak`,
			hint1: `Fieldlarga kirishdan oldin nil receiver ni tekshiring.`,
			hint2: `Ichki xatoga kirish uchun Err fieldni qaytaring.`,
			whyItMatters: `Unwrap() Go ning standart funksiyalariga error zanjirlarini tekshirish imkonini beradi.

**Nima uchun muhim:**
- **errors.Is():** Zanjirdagi xatoni tekshirish
- **errors.As():** Muayyan xato turini ajratib olish
- **Error konteksti:** Asl xatoni kontekst qo shish bilan saqlash

**Ishlab chiqarish patterni:**
\`\`\`go
// Qatlam 1: Ma'lumotlar bazasi xatosi
dbErr := sql.ErrNoRows

// Qatlam 2: Repository kontekst qo'shadi
repoErr := &AppError{Op: "repo.GetUser", Err: dbErr}

// Qatlam 3: Servis biznes kontekstini qo'shadi
svcErr := &AppError{Code: "USER_NOT_FOUND", Op: "service.GetUser", Err: repoErr}

// Barcha qatlamlar orqali asl xatoni tekshirish
if errors.Is(svcErr, sql.ErrNoRows) {
    // To'g'ri! Unwrap() errors.Is ga zanjirni aylanishga imkon beradi
}
\`\`\`

**Amaliy foydalari:**
- **Mikroservislar:** Birinchi sababni yo'qotmasdan servislar o'rtasida xatolarni uzatish
- **Observability:** To'liq kontekst uchun xato zanjirlarini loglash
- **Xatolarni boshqarish:** O'rash emas, birinchi sabab asosida qarorlar qabul qilish

Unwrap() siz asl xatoga kirishni yo'qotasiz va errors.Is/As dan foydalana olmaysiz.`,
			solutionCode: `package errorsx

import "fmt"

type AppError struct {
	Code string
	Op   string
	Err  error
}

// Error implements error interface
func (e *AppError) Error() string {
	if e == nil {
		return "<nil>"
	}
	return fmt.Sprintf("op=%s, code=%s, err=%v", e.Op, e.Code, e.Err)
}

func (e *AppError) Unwrap() error {
	if e == nil {        // nil receiver tekshiruvi
		return nil   // Xavfsiz ishlash
	}
	return e.Err         // Zanjirni tekshirish uchun ichki xatoni qaytarish
}`
		}
	}
};

export default task;
