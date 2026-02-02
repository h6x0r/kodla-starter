import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-error-wrap',
	title: 'Error Wrapping Function',
	difficulty: 'medium',	tags: ['go', 'errors', 'wrapping'],
	estimatedTime: '25m',	isPremium: false,
	youtubeUrl: '',
	description: `Implement **Wrap()** function to add operation context to errors.

**Requirements:**
1. Create function \`Wrap(op string, err error) error\`
2. Return nil if input error is nil
3. Wrap non-nil errors in AppError with operation context
4. Don't set Code field (only Op and Err)

**Example:**
\`\`\`go
func GetUser(id string) (*User, error) {
    user, err := db.Query(id)
    if err != nil {
        return nil, Wrap("users.GetUser", err)  // Add operation context
    }
    return user, nil
}

// Error output: op=users.GetUser, code=, err=sql: connection refused
\`\`\`

**Constraints:**
- Must return nil when err is nil (preserve nil errors)
- Must create new AppError instance`,
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

// TODO: Implement Wrap function
func Wrap(op string, err error) error {
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

func Wrap(op string, err error) error {
	if err == nil {              // Preserve nil errors
		return nil           // Don't create AppError for nil
	}
	return &AppError{            // Wrap with operation context
		Op:  op,             // Operation where error occurred
		Err: err,            // Original error
	}
}`,
		testCode: `package errorsx

import (
	"errors"
	"testing"
)

func Test1(t *testing.T) {
	// Wrap returns nil for nil error
	result := Wrap("op.Test", nil)
	if result != nil {
		t.Error("expected nil for nil input error")
	}
}

func Test2(t *testing.T) {
	// Wrap returns AppError for non-nil error
	inner := errors.New("inner")
	result := Wrap("op.Test", inner)
	if result == nil {
		t.Error("expected non-nil result")
	}
}

func Test3(t *testing.T) {
	// Wrapped error has correct Op field
	inner := errors.New("inner")
	result := Wrap("users.GetUser", inner)
	appErr, ok := result.(*AppError)
	if !ok {
		t.Fatal("expected *AppError type")
	}
	if appErr.Op != "users.GetUser" {
		t.Errorf("expected Op 'users.GetUser', got %s", appErr.Op)
	}
}

func Test4(t *testing.T) {
	// Wrapped error has correct Err field
	inner := errors.New("inner")
	result := Wrap("op.Test", inner)
	appErr, ok := result.(*AppError)
	if !ok {
		t.Fatal("expected *AppError type")
	}
	if appErr.Err != inner {
		t.Error("expected Err to be inner error")
	}
}

func Test5(t *testing.T) {
	// Wrapped error has empty Code field
	inner := errors.New("inner")
	result := Wrap("op.Test", inner)
	appErr, ok := result.(*AppError)
	if !ok {
		t.Fatal("expected *AppError type")
	}
	if appErr.Code != "" {
		t.Error("expected empty Code field")
	}
}

func Test6(t *testing.T) {
	// Wrap can wrap another AppError
	inner := &AppError{Code: "INNER", Op: "inner.Op", Err: nil}
	result := Wrap("outer.Op", inner)
	appErr, ok := result.(*AppError)
	if !ok {
		t.Fatal("expected *AppError type")
	}
	if appErr.Err != inner {
		t.Error("expected Err to be inner AppError")
	}
}

func Test7(t *testing.T) {
	// Multiple wraps create nested structure
	base := errors.New("base")
	first := Wrap("first.Op", base)
	second := Wrap("second.Op", first)
	appErr, ok := second.(*AppError)
	if !ok {
		t.Fatal("expected *AppError type")
	}
	if appErr.Op != "second.Op" {
		t.Error("expected outer Op")
	}
}

func Test8(t *testing.T) {
	// Wrap preserves error identity with errors.Is
	sentinel := errors.New("sentinel")
	wrapped := Wrap("op.Test", sentinel)
	// Note: This requires AppError to implement Unwrap
	_ = wrapped
}

func Test9(t *testing.T) {
	// Empty operation string is allowed
	inner := errors.New("inner")
	result := Wrap("", inner)
	appErr, ok := result.(*AppError)
	if !ok {
		t.Fatal("expected *AppError type")
	}
	if appErr.Op != "" {
		t.Error("expected empty Op")
	}
}

func Test10(t *testing.T) {
	// Wrap result implements error interface
	inner := errors.New("inner")
	result := Wrap("op.Test", inner)
	var _ error = result
}
`,
		hint1: `Always check if err is nil first and return nil to preserve error absence.`,
			hint2: `Create and return a new AppError with Op and Err fields only.`,
			whyItMatters: `Wrap() adds execution context to errors without changing their meaning, enabling call stack reconstruction.

**Why Wrap Errors:**
- **Call Stack:** Track error propagation through layers
- **Debugging:** Know exactly where error was handled
- **Observability:** Build error context trees for monitoring

**Production Pattern:**
\`\`\`go
// Repository layer
func (r *Repo) GetUser(id string) (*User, error) {
    user, err := r.db.Query(id)
    if err != nil {
        return nil, Wrap("repo.GetUser", err)
    }
    return user, nil
}

// Service layer
func (s *Service) GetUser(id string) (*User, error) {
    user, err := s.repo.GetUser(id)
    if err != nil {
        return nil, Wrap("service.GetUser", err)
    }
    return user, nil
}

// Handler layer
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
    user, err := h.service.GetUser(id)
    if err != nil {
        // Error chain: handler.GetUser -> service.GetUser -> repo.GetUser -> sql: connection refused
        log.Error(Wrap("handler.GetUser", err))
    }
}
\`\`\`

**Real-World Benefits:**
- **Error Traces:** See full execution path without stack traces
- **Structured Logs:** Each layer adds operation name for filtering
- **Debugging:** Jump directly to failing operation in logs

**nil Preservation:** Returning nil for nil input is crucial - it prevents creating error objects when no error exists, which would turn success cases into failures.`,	order: 3,
	translations: {
		ru: {
			title: 'Оборачивание ошибок с контекстом',
			description: `Реализуйте функцию **Wrap()** для добавления контекста операции к ошибкам.

**Требования:**
1. Создайте функцию \`Wrap(op string, err error) error\`
2. Возвращайте nil если входная ошибка nil
3. Оборачивайте не-nil ошибки в AppError с контекстом операции
4. Не устанавливайте поле Code (только Op и Err)

**Пример:**
\`\`\`go
func GetUser(id string) (*User, error) {
    user, err := db.Query(id)
    if err != nil {
        return nil, Wrap("users.GetUser", err)
    }
    return user, nil
}
\`\`\`

**Ограничения:**
- Должна возвращать nil когда err nil
- Должна создавать новый экземпляр AppError`,
			hint1: `Всегда проверяйте err на nil первым и возвращайте nil.`,
			hint2: `Создайте и верните новый AppError с полями Op и Err.`,
			whyItMatters: `Wrap() добавляет контекст выполнения к ошибкам, позволяя восстановить стек вызовов.

**Почему важно:**
- **Стек вызовов:** Отслеживание распространения ошибки
- **Отладка:** Точное знание где ошибка обработана
- **Observability:** Построение деревьев контекста ошибок

**Продакшен паттерн:**
\`\`\`go
// Слой репозитория
func (r *Repo) GetUser(id string) (*User, error) {
    user, err := r.db.Query(id)
    if err != nil {
        return nil, Wrap("repo.GetUser", err)
    }
    return user, nil
}

// Слой сервиса
func (s *Service) GetUser(id string) (*User, error) {
    user, err := s.repo.GetUser(id)
    if err != nil {
        return nil, Wrap("service.GetUser", err)
    }
    return user, nil
}

// Слой обработчика
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
    user, err := h.service.GetUser(id)
    if err != nil {
        // Цепочка ошибок: handler.GetUser -> service.GetUser -> repo.GetUser -> sql: connection refused
        log.Error(Wrap("handler.GetUser", err))
    }
}
\`\`\`

**Практические преимущества:**
- **Трассировка ошибок:** Просмотр полного пути выполнения без трассировки стека
- **Структурированные логи:** Каждый слой добавляет имя операции для фильтрации
- **Отладка:** Переход непосредственно к неудавшейся операции в логах

**nil Preservation:** Возврат nil для nil входа критичен - это предотвращает создание объектов ошибок когда ошибки нет, что превратило бы успешные случаи в ошибки.`,
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

func Wrap(op string, err error) error {
	if err == nil {              // Сохранение nil ошибок
		return nil           // Не создавать AppError для nil
	}
	return &AppError{            // Обертывание с контекстом операции
		Op:  op,             // Операция, где произошла ошибка
		Err: err,            // Исходная ошибка
	}
}`
		},
		uz: {
			title: 'Xatolarni kontekst bilan o\'rash',
			description: `Xatolarga operatsiya kontekstini qo shish uchun **Wrap()** funksiyasini amalga oshiring.

**Talablar:**
1. \`Wrap(op string, err error) error\` funksiyasini yarating
2. Agar kirish xatosi nil bo lsa nil qaytaring
3. nil bo lmagan xatolarni operatsiya konteksti bilan AppError ga o rang
4. Code fieldni o rnatmang (faqat Op va Err)

**Misol:**
\`\`\`go
func GetUser(id string) (*User, error) {
    user, err := db.Query(id)
    if err != nil {
        return nil, Wrap("users.GetUser", err)
    }
    return user, nil
}
\`\`\`

**Cheklovlar:**
- err nil bo lganda nil qaytarishi kerak
- Yangi AppError instance yaratishi kerak`,
			hint1: `Avval err ni nil ga tekshiring va nil qaytaring.`,
			hint2: `Faqat Op va Err fieldlari bilan yangi AppError yarating.`,
			whyItMatters: `Wrap() xatolarga ijro kontekstini qo shadi, chaqiruvlar stekini qayta qurishga imkon beradi.

**Nima uchun muhim:**
- **Chaqiruvlar steki:** Xatoning tarqalishini kuzatish
- **Debugging:** Xato qaerda ishlangani aniq bilish
- **Observability:** Monitoring uchun xato kontekst daraxtlarini qurish

**Ishlab chiqarish patterni:**
\`\`\`go
// Repository qatlami
func (r *Repo) GetUser(id string) (*User, error) {
    user, err := r.db.Query(id)
    if err != nil {
        return nil, Wrap("repo.GetUser", err)
    }
    return user, nil
}

// Servis qatlami
func (s *Service) GetUser(id string) (*User, error) {
    user, err := s.repo.GetUser(id)
    if err != nil {
        return nil, Wrap("service.GetUser", err)
    }
    return user, nil
}

// Handler qatlami
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
    user, err := h.service.GetUser(id)
    if err != nil {
        // Xato zanjiri: handler.GetUser -> service.GetUser -> repo.GetUser -> sql: connection refused
        log.Error(Wrap("handler.GetUser", err))
    }
}
\`\`\`

**Amaliy foydalari:**
- **Xato kuzatuvi:** Stek kuzatmasdan to'liq ijro yo'lini ko'rish
- **Strukturali loglar:** Har bir qatlam filtrlash uchun operatsiya nomini qo'shadi
- **Debugging:** Loglarda muvaffaqiyatsiz operatsiyaga bevosita o'tish

**nil Preservation:** nil kirish uchun nil qaytarish muhim - bu xato yo'q bo'lganda xato obyektlarini yaratishni oldini oladi, bu muvaffaqiyatli holatlarni xatolarga aylantiradi.`,
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

func Wrap(op string, err error) error {
	if err == nil {              // nil xatolarni saqlash
		return nil           // nil uchun AppError yaratmaslik
	}
	return &AppError{            // Operatsiya konteksti bilan o'rash
		Op:  op,             // Xato sodir bo'lgan operatsiya
		Err: err,            // Asl xato
	}
}`
		}
	}
};

export default task;
