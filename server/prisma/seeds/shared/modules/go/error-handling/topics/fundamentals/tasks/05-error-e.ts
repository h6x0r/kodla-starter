import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-error-e',
	title: 'Error Constructor with Code',
	difficulty: 'medium',	tags: ['go', 'errors', 'constructor'],
	estimatedTime: '25m',	isPremium: false,
	youtubeUrl: '',
	description: `Implement **E()** constructor function to create AppError with error code.

**Requirements:**
1. Create function \`E(code, op string, err error) error\`
2. Return nil if input error is nil
3. Create AppError with all three fields: Code, Op, Err
4. Use short, descriptive name (E is idiomatic)

**Example:**
\`\`\`go
func GetUser(id string) (*User, error) {
    user, err := db.Query(id)
    if err != nil {
        return nil, E("DB_ERROR", "users.GetUser", err)
    }

    if user.DeletedAt != nil {
        return nil, E("USER_DELETED", "users.GetUser", ErrNotFound)
    }

    return user, nil
}

// Error output: op=users.GetUser, code=DB_ERROR, err=connection timeout
\`\`\`

**Constraints:**
- Must return nil when err is nil
- Must set all three AppError fields`,
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

// TODO: Implement E constructor function
func E(code, op string, err error) error {
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

func E(code, op string, err error) error {
	if err == nil {                  // Preserve nil errors
		return nil               // Don't create error object
	}
	return &AppError{                // Create fully populated AppError
		Code: code,              // Business error code
		Op:   op,                // Operation context
		Err:  err,               // Underlying error
	}
}`,
		testCode: `package errorsx

import (
	"errors"
	"testing"
)

func Test1(t *testing.T) {
	// E returns nil for nil error
	result := E("CODE", "op.Test", nil)
	if result != nil {
		t.Error("expected nil for nil input error")
	}
}

func Test2(t *testing.T) {
	// E returns AppError for non-nil error
	inner := errors.New("inner")
	result := E("CODE", "op.Test", inner)
	if result == nil {
		t.Error("expected non-nil result")
	}
}

func Test3(t *testing.T) {
	// E sets Code field correctly
	inner := errors.New("inner")
	result := E("DB_ERROR", "op.Test", inner)
	appErr, ok := result.(*AppError)
	if !ok {
		t.Fatal("expected *AppError type")
	}
	if appErr.Code != "DB_ERROR" {
		t.Errorf("expected Code 'DB_ERROR', got %s", appErr.Code)
	}
}

func Test4(t *testing.T) {
	// E sets Op field correctly
	inner := errors.New("inner")
	result := E("CODE", "users.Create", inner)
	appErr, ok := result.(*AppError)
	if !ok {
		t.Fatal("expected *AppError type")
	}
	if appErr.Op != "users.Create" {
		t.Errorf("expected Op 'users.Create', got %s", appErr.Op)
	}
}

func Test5(t *testing.T) {
	// E sets Err field correctly
	inner := errors.New("inner")
	result := E("CODE", "op.Test", inner)
	appErr, ok := result.(*AppError)
	if !ok {
		t.Fatal("expected *AppError type")
	}
	if appErr.Err != inner {
		t.Error("expected Err to be inner error")
	}
}

func Test6(t *testing.T) {
	// E with all fields populated
	inner := errors.New("inner")
	result := E("AUTH_ERROR", "service.Auth", inner)
	appErr, ok := result.(*AppError)
	if !ok {
		t.Fatal("expected *AppError type")
	}
	if appErr.Code != "AUTH_ERROR" || appErr.Op != "service.Auth" || appErr.Err != inner {
		t.Error("expected all fields to be set")
	}
}

func Test7(t *testing.T) {
	// E can wrap another AppError
	inner := &AppError{Code: "INNER", Op: "inner.Op", Err: nil}
	result := E("OUTER", "outer.Op", inner)
	appErr, ok := result.(*AppError)
	if !ok {
		t.Fatal("expected *AppError type")
	}
	if appErr.Err != inner {
		t.Error("expected Err to be inner AppError")
	}
}

func Test8(t *testing.T) {
	// E with empty code is allowed
	inner := errors.New("inner")
	result := E("", "op.Test", inner)
	appErr, ok := result.(*AppError)
	if !ok {
		t.Fatal("expected *AppError type")
	}
	if appErr.Code != "" {
		t.Error("expected empty Code")
	}
}

func Test9(t *testing.T) {
	// E with empty op is allowed
	inner := errors.New("inner")
	result := E("CODE", "", inner)
	appErr, ok := result.(*AppError)
	if !ok {
		t.Fatal("expected *AppError type")
	}
	if appErr.Op != "" {
		t.Error("expected empty Op")
	}
}

func Test10(t *testing.T) {
	// E result implements error interface
	inner := errors.New("inner")
	result := E("CODE", "op.Test", inner)
	var _ error = result
}
`,
		hint1: `Check if err is nil first and return nil to preserve success cases.`,
			hint2: `Create AppError with all three fields populated from function parameters.`,
			whyItMatters: `E() provides a concise way to create fully contextualized errors with business codes.

**Why Error Codes:**
- **Error Categorization:** Group errors by type (AUTH_ERROR, DB_ERROR, VALIDATION_ERROR)
- **Client Communication:** Return consistent error codes in APIs
- **Monitoring:** Track error rates by category in dashboards
- **Alerting:** Trigger alerts based on error codes

**Production Pattern:**
\`\`\`go
// Define error codes as constants
const (
    ErrCodeAuth       = "AUTH_ERROR"
    ErrCodeDB         = "DB_ERROR"
    ErrCodeValidation = "VALIDATION_ERROR"
    ErrCodeNotFound   = "NOT_FOUND"
)

// Service layer
func (s *Service) CreateOrder(order *Order) error {
    if err := order.Validate(); err != nil {
        return E(ErrCodeValidation, "service.CreateOrder", err)
    }

    if !s.auth.HasPermission(order.UserID) {
        return E(ErrCodeAuth, "service.CreateOrder", ErrUnauthorized)
    }

    if err := s.repo.Save(order); err != nil {
        return E(ErrCodeDB, "service.CreateOrder", err)
    }

    return nil
}

// HTTP handler
func (h *Handler) CreateOrder(w http.ResponseWriter, r *http.Request) {
    err := h.service.CreateOrder(order)
    if err != nil {
        var appErr *AppError
        if errors.As(err, &appErr) {
            // Map error codes to HTTP status
            switch appErr.Code {
            case ErrCodeAuth:
                w.WriteHeader(401)
            case ErrCodeValidation:
                w.WriteHeader(400)
            case ErrCodeDB:
                w.WriteHeader(500)
            }
        }
    }
}
\`\`\`

**Real-World Benefits:**
- **Metrics:** \`errors{code="DB_ERROR",op="orders.Create"}\` in Prometheus
- **API Consistency:** Clients can handle errors programmatically
- **Debugging:** Filter logs by error code to find related failures
- **SLA Monitoring:** Track error budgets by error category

**Short Name:** E() is intentionally brief - it's used frequently in error handling, so a short name reduces noise in code.`,	order: 4,
	translations: {
		ru: {
			title: 'Проверка типа ошибки через As()',
			description: `Реализуйте функцию-конструктор **E()** для создания AppError с кодом ошибки.

**Требования:**
1. Создайте функцию \`E(code, op string, err error) error\`
2. Возвращайте nil если входная ошибка nil
3. Создайте AppError со всеми тремя полями: Code, Op, Err
4. Используйте короткое имя (E идиоматично)

**Пример:**
\`\`\`go
func GetUser(id string) (*User, error) {
    user, err := db.Query(id)
    if err != nil {
        return nil, E("DB_ERROR", "users.GetUser", err)
    }
    return user, nil
}
\`\`\`

**Ограничения:**
- Должна возвращать nil когда err nil
- Должна заполнять все три поля AppError`,
			hint1: `Проверьте err на nil первым и верните nil.`,
			hint2: `Создайте AppError со всеми тремя полями из параметров.`,
			whyItMatters: `E() предоставляет лаконичный способ создания полностью контекстуализированных ошибок с бизнес-кодами.

**Почему коды ошибок:**
- **Категоризация:** Группировка ошибок по типу
- **API:** Возврат консистентных кодов ошибок
- **Мониторинг:** Отслеживание частоты ошибок по категориям
- **Алерты:** Триггеры алертов по кодам ошибок

**Продакшен паттерн:**
\`\`\`go
// Определение кодов ошибок как констант
const (
    ErrCodeAuth       = "AUTH_ERROR"
    ErrCodeDB         = "DB_ERROR"
    ErrCodeValidation = "VALIDATION_ERROR"
    ErrCodeNotFound   = "NOT_FOUND"
)

// Слой сервиса
func (s *Service) CreateOrder(order *Order) error {
    if err := order.Validate(); err != nil {
        return E(ErrCodeValidation, "service.CreateOrder", err)
    }

    if !s.auth.HasPermission(order.UserID) {
        return E(ErrCodeAuth, "service.CreateOrder", ErrUnauthorized)
    }

    if err := s.repo.Save(order); err != nil {
        return E(ErrCodeDB, "service.CreateOrder", err)
    }

    return nil
}

// HTTP обработчик
func (h *Handler) CreateOrder(w http.ResponseWriter, r *http.Request) {
    err := h.service.CreateOrder(order)
    if err != nil {
        var appErr *AppError
        if errors.As(err, &appErr) {
            // Сопоставление кодов ошибок со статусами HTTP
            switch appErr.Code {
            case ErrCodeAuth:
                w.WriteHeader(401)
            case ErrCodeValidation:
                w.WriteHeader(400)
            case ErrCodeDB:
                w.WriteHeader(500)
            }
        }
    }
}
\`\`\`

**Практические преимущества:**
- **Метрики:** \`errors{code="DB_ERROR",op="orders.Create"}\` в Prometheus
- **Согласованность API:** Клиенты могут обрабатывать ошибки программно
- **Отладка:** Фильтрация логов по коду ошибки для поиска связанных сбоев
- **Мониторинг SLA:** Отслеживание бюджетов ошибок по категориям

**Короткое имя:** E() намеренно краткое - оно используется часто в обработке ошибок, поэтому короткое имя уменьшает шум в коде.`,
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

func E(code, op string, err error) error {
	if err == nil {                  // Сохранение nil ошибок
		return nil               // Не создавать объект ошибки
	}
	return &AppError{                // Создание полностью заполненного AppError
		Code: code,              // Бизнес-код ошибки
		Op:   op,                // Контекст операции
		Err:  err,               // Вложенная ошибка
	}
}`
		},
		uz: {
			title: 'As() orqali xato turini tekshirish',
			description: `Xato kodi bilan AppError yaratish uchun **E()** konstruktor funksiyasini amalga oshiring.

**Talablar:**
1. \`E(code, op string, err error) error\` funksiyasini yarating
2. Agar kirish xatosi nil bo lsa nil qaytaring
3. Uchta field bilan AppError yarating: Code, Op, Err
4. Qisqa, tavsiflovchi nom ishlating (E idiomatik)

**Misol:**
\`\`\`go
func GetUser(id string) (*User, error) {
    user, err := db.Query(id)
    if err != nil {
        return nil, E("DB_ERROR", "users.GetUser", err)
    }
    return user, nil
}
\`\`\`

**Cheklovlar:**
- err nil bo lganda nil qaytarishi kerak
- AppError ning uchta fieldini to ldirishi kerak`,
			hint1: `Avval err ni nil ga tekshiring va nil qaytaring.`,
			hint2: `Parametrlardan uchta field bilan AppError yarating.`,
			whyItMatters: `E() biznes practixri bilan to liq kontekstlashtirilgan xatolarni yaratishning qisqa usulini taqdim etadi.

**Nima uchun xato practixri:**
- **Kategoriyalash:** Xatolarni tur bo yicha guruhlash
- **API:** API larda doimiy xato practixrini qaytarish
- **Monitoring:** Dashboard larda kategoriya bo yicha xato darajalarini kuzatish
- **Alerting:** Xato practixri asosida alert larni ishga tushirish

**Ishlab chiqarish patterni:**
\`\`\`go
// Xato practixrini konstantalar sifatida aniqlash
const (
    ErrCodeAuth       = "AUTH_ERROR"
    ErrCodeDB         = "DB_ERROR"
    ErrCodeValidation = "VALIDATION_ERROR"
    ErrCodeNotFound   = "NOT_FOUND"
)

// Servis qatlami
func (s *Service) CreateOrder(order *Order) error {
    if err := order.Validate(); err != nil {
        return E(ErrCodeValidation, "service.CreateOrder", err)
    }

    if !s.auth.HasPermission(order.UserID) {
        return E(ErrCodeAuth, "service.CreateOrder", ErrUnauthorized)
    }

    if err := s.repo.Save(order); err != nil {
        return E(ErrCodeDB, "service.CreateOrder", err)
    }

    return nil
}

// HTTP handler
func (h *Handler) CreateOrder(w http.ResponseWriter, r *http.Request) {
    err := h.service.CreateOrder(order)
    if err != nil {
        var appErr *AppError
        if errors.As(err, &appErr) {
            // Xato practixrini HTTP statusga moslashtirish
            switch appErr.Code {
            case ErrCodeAuth:
                w.WriteHeader(401)
            case ErrCodeValidation:
                w.WriteHeader(400)
            case ErrCodeDB:
                w.WriteHeader(500)
            }
        }
    }
}
\`\`\`

**Amaliy foydalari:**
- **Metrikalar:** Prometheus da \`errors{code="DB_ERROR",op="orders.Create"}\`
- **API barqarorligi:** Mijozlar xatolarni dasturiy ravishda qayta ishlashi mumkin
- **Debugging:** Tegishli xatolarni topish uchun xato kodi bo'yicha loglarni filtrlash
- **SLA Monitoring:** Kategoriyalar bo'yicha xato byudjetlarini kuzatish

**Qisqa nom:** E() ataylab qisqa - u xatolarni qayta ishlashda tez-tez ishlatiladi, shuning uchun qisqa nom koddagi shovqinni kamaytiradi.`,
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

func E(code, op string, err error) error {
	if err == nil {                  // nil xatolarni saqlash
		return nil               // Xato obyektini yaratmaslik
	}
	return &AppError{                // To'liq to'ldirilgan AppError yaratish
		Code: code,              // Biznes xato kodi
		Op:   op,                // Operatsiya konteksti
		Err:  err,               // Ichki xato
	}
}`
		}
	}
};

export default task;
