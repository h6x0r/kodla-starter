import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-is-not-found',
	title: 'Error Inspection Helper',
	difficulty: 'medium',	tags: ['go', 'errors', 'inspection'],
	estimatedTime: '20m',	isPremium: false,
	youtubeUrl: '',
	description: `Implement **IsNotFound()** helper to check if error chain contains ErrNotFound.

**Requirements:**
1. Create function \`IsNotFound(err error) bool\`
2. Use \`errors.Is()\` to check error chain
3. Return true if ErrNotFound is anywhere in the chain
4. Work with wrapped errors

**Example:**
\`\`\`go
var ErrNotFound = errors.New("not found")

func GetUser(id string) (*User, error) {
    user, err := db.Query(id)
    if err == sql.ErrNoRows {
        return nil, E("NOT_FOUND", "users.GetUser", ErrNotFound)
    }
    return user, err
}

// Caller code
user, err := GetUser("123")
if IsNotFound(err) {
    return http.StatusNotFound, "User not found"
}
\`\`\`

**Constraints:**
- Must use errors.Is() for chain inspection
- Must return false for nil errors`,
	initialCode: `package errorsx

import "errors"

var ErrNotFound = errors.New("not found")

// TODO: Implement IsNotFound helper
func IsNotFound(err error) bool {
	return false // TODO: Implement
}`,
	solutionCode: `package errorsx

import "errors"

var ErrNotFound = errors.New("not found")

func IsNotFound(err error) bool {
	return errors.Is(err, ErrNotFound)  // Check entire error chain
}`,
		testCode: `package errorsx

import (
	"errors"
	"fmt"
	"testing"
)

func Test1(t *testing.T) {
	// IsNotFound returns true for ErrNotFound
	if !IsNotFound(ErrNotFound) {
		t.Error("expected true for ErrNotFound")
	}
}

func Test2(t *testing.T) {
	// IsNotFound returns false for nil
	if IsNotFound(nil) {
		t.Error("expected false for nil")
	}
}

func Test3(t *testing.T) {
	// IsNotFound returns false for other errors
	other := errors.New("other error")
	if IsNotFound(other) {
		t.Error("expected false for other error")
	}
}

func Test4(t *testing.T) {
	// IsNotFound works with wrapped error using fmt.Errorf
	wrapped := fmt.Errorf("context: %w", ErrNotFound)
	if !IsNotFound(wrapped) {
		t.Error("expected true for wrapped ErrNotFound")
	}
}

func Test5(t *testing.T) {
	// IsNotFound works with deeply wrapped error
	first := fmt.Errorf("first: %w", ErrNotFound)
	second := fmt.Errorf("second: %w", first)
	if !IsNotFound(second) {
		t.Error("expected true for deeply wrapped ErrNotFound")
	}
}

func Test6(t *testing.T) {
	// IsNotFound returns false for wrapped other error
	other := errors.New("other")
	wrapped := fmt.Errorf("context: %w", other)
	if IsNotFound(wrapped) {
		t.Error("expected false for wrapped other error")
	}
}

func Test7(t *testing.T) {
	// IsNotFound returns false for error with similar message
	similar := errors.New("not found")
	if IsNotFound(similar) {
		t.Error("expected false for similar but different error")
	}
}

func Test8(t *testing.T) {
	// IsNotFound is consistent
	result1 := IsNotFound(ErrNotFound)
	result2 := IsNotFound(ErrNotFound)
	if result1 != result2 {
		t.Error("expected consistent results")
	}
}

func Test9(t *testing.T) {
	// IsNotFound works with triple wrapped
	first := fmt.Errorf("first: %w", ErrNotFound)
	second := fmt.Errorf("second: %w", first)
	third := fmt.Errorf("third: %w", second)
	if !IsNotFound(third) {
		t.Error("expected true for triple wrapped")
	}
}

func Test10(t *testing.T) {
	// IsNotFound returns boolean
	var result bool = IsNotFound(ErrNotFound)
	if !result {
		t.Error("expected true")
	}
}
`,
		hint1: `Use errors.Is() which automatically traverses the error chain via Unwrap().`,
			hint2: `One line of code - just return the result of errors.Is().`,
			whyItMatters: `Error inspection helpers provide type-safe, semantic error checking that decouples caller code from implementation details.

**Why Inspection Helpers:**
- **Semantic Clarity:** \`IsNotFound(err)\` is clearer than \`errors.Is(err, ErrNotFound)\`
- **Encapsulation:** Callers don't need to know about ErrNotFound variable
- **Refactoring Safety:** Change error implementation without breaking callers
- **API Stability:** Public IsNotFound() can remain stable even if internal errors change

**Production Pattern:**
\`\`\`go
// Package errorsx provides error helpers
package errorsx

var (
    ErrNotFound     = errors.New("not found")
    ErrUnauthorized = errors.New("unauthorized")
    ErrConflict     = errors.New("conflict")
)

func IsNotFound(err error) bool     { return errors.Is(err, ErrNotFound) }
func IsUnauthorized(err error) bool { return errors.Is(err, ErrUnauthorized) }
func IsConflict(err error) bool     { return errors.Is(err, ErrConflict) }

// Service layer - clean error handling
func (s *Service) GetUser(id string) (*User, error) {
    user, err := s.repo.GetUser(id)
    if IsNotFound(err) {
        return nil, E("USER_NOT_FOUND", "service.GetUser", err)
    }
    return user, err
}

// HTTP handler - map to status codes
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
    user, err := h.service.GetUser(id)
    if err != nil {
        switch {
        case IsNotFound(err):
            w.WriteHeader(404)
        case IsUnauthorized(err):
            w.WriteHeader(401)
        case IsConflict(err):
            w.WriteHeader(409)
        default:
            w.WriteHeader(500)
        }
        return
    }
    json.NewEncoder(w).Encode(user)
}
\`\`\`

**Real-World Benefits:**
- **HTTP Status Codes:** Map errors to status codes easily
- **Retry Logic:** Decide whether to retry based on error type
- **Circuit Breakers:** Open circuits for specific error types
- **Metrics:** Count errors by semantic type

**Standard Library Examples:**
- \`os.IsNotExist(err)\` - Check for file not found
- \`os.IsPermission(err)\` - Check for permission errors
- \`net.ErrClosed\` with helpers in network code

**Why errors.Is():** It's better than string comparison or type assertion because it traverses the entire error chain, finding the sentinel even when wrapped multiple times.`,	order: 5,
	translations: {
		ru: {
			title: 'Проверка ошибки "не найдено"',
			description: `Реализуйте хелпер **IsNotFound()** для проверки наличия ErrNotFound в цепочке ошибок.

**Требования:**
1. Создайте функцию \`IsNotFound(err error) bool\`
2. Используйте \`errors.Is()\` для проверки цепочки
3. Возвращайте true если ErrNotFound есть в цепочке
4. Работайте с обернутыми ошибками

**Пример:**
\`\`\`go
var ErrNotFound = errors.New("not found")

user, err := GetUser("123")
if IsNotFound(err) {
    return http.StatusNotFound, "User not found"
}
\`\`\`

**Ограничения:**
- Должна использовать errors.Is()
- Должна возвращать false для nil`,
			hint1: `Используйте errors.Is() который автоматически обходит цепочку.`,
			hint2: `Одна строка кода - просто верните результат errors.Is().`,
			whyItMatters: `Хелперы проверки ошибок обеспечивают type-safe семантическую проверку.

**Почему важно:**
- **Семантическая ясность:** \`IsNotFound(err)\` яснее
- **Инкапсуляция:** Вызывающий код не знает о ErrNotFound
- **Рефакторинг:** Изменение реализации не ломает вызывающий код
- **Стабильность API:** Публичный IsNotFound() стабилен

**Продакшен паттерн:**
\`\`\`go
// Пакет errorsx предоставляет хелперы ошибок
package errorsx

var (
    ErrNotFound     = errors.New("not found")
    ErrUnauthorized = errors.New("unauthorized")
    ErrConflict     = errors.New("conflict")
)

func IsNotFound(err error) bool     { return errors.Is(err, ErrNotFound) }
func IsUnauthorized(err error) bool { return errors.Is(err, ErrUnauthorized) }
func IsConflict(err error) bool     { return errors.Is(err, ErrConflict) }

// Слой сервиса - чистая обработка ошибок
func (s *Service) GetUser(id string) (*User, error) {
    user, err := s.repo.GetUser(id)
    if IsNotFound(err) {
        return nil, E("USER_NOT_FOUND", "service.GetUser", err)
    }
    return user, err
}

// HTTP обработчик - сопоставление со статус-кодами
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
    user, err := h.service.GetUser(id)
    if err != nil {
        switch {
        case IsNotFound(err):
            w.WriteHeader(404)
        case IsUnauthorized(err):
            w.WriteHeader(401)
        case IsConflict(err):
            w.WriteHeader(409)
        default:
            w.WriteHeader(500)
        }
        return
    }
    json.NewEncoder(w).Encode(user)
}
\`\`\`

**Практические преимущества:**
- **HTTP статус-коды:** Легкое сопоставление ошибок со статус-кодами
- **Логика повторов:** Решение о повторе на основе типа ошибки
- **Circuit Breakers:** Открытие цепей для определенных типов ошибок
- **Метрики:** Подсчет ошибок по семантическому типу

**Примеры из стандартной библиотеки:**
- \`os.IsNotExist(err)\` - Проверка на отсутствие файла
- \`os.IsPermission(err)\` - Проверка на ошибки прав доступа
- \`net.ErrClosed\` с хелперами в сетевом коде

**Почему errors.Is():** Это лучше, чем сравнение строк или приведение типов, потому что он обходит всю цепочку ошибок, находя sentinel даже при многократной обертке.`,
			solutionCode: `package errorsx

import "errors"

var ErrNotFound = errors.New("not found")

func IsNotFound(err error) bool {
	return errors.Is(err, ErrNotFound)  // Проверка всей цепочки ошибок
}`
		},
		uz: {
			title: '"Topilmadi" xatosini tekshirish',
			description: `Error zanjirida ErrNotFound borligini tekshirish uchun **IsNotFound()** yordamchisini amalga oshiring.

**Talablar:**
1. \`IsNotFound(err error) bool\` funksiyasini yarating
2. Zanjirni tekshirish uchun \`errors.Is()\` dan foydalaning
3. Agar ErrNotFound zanjirda bo'lsa true qaytaring
4. O'ralgan xatolar bilan ishlang

**Misol:**
\`\`\`go
var ErrNotFound = errors.New("not found")

user, err := GetUser("123")
if IsNotFound(err) {
    return http.StatusNotFound, "User not found"
}
\`\`\`

**Cheklovlar:**
- errors.Is() dan foydalanishi kerak
- nil xatolar uchun false qaytarishi kerak`,
			hint1: `Avtomatik ravishda zanjirni aylanadigan errors.Is() dan foydalaning.`,
			hint2: `Bir qator kod - faqat errors.Is() natijasini qaytaring.`,
			whyItMatters: `Error tekshirish yordamchilari type-safe semantik xato tekshiruvini ta'minlaydi.

**Nima uchun muhim:**
- **Semantik aniqlik:** \`IsNotFound(err)\` aniqroq
- **Inkapsulatsiya:** Chaqiruvchi kod ErrNotFound haqida bilmaydi
- **Refaktoring xavfsizligi:** Implementatsiyani o'zgartirish chaqiruvchi kodni buzmaydi
- **API barqarorligi:** Ommaviy IsNotFound() barqaror qoladi

**Ishlab chiqarish patterni:**
\`\`\`go
// errorsx paketi xato yordamchilarini taqdim etadi
package errorsx

var (
    ErrNotFound     = errors.New("not found")
    ErrUnauthorized = errors.New("unauthorized")
    ErrConflict     = errors.New("conflict")
)

func IsNotFound(err error) bool     { return errors.Is(err, ErrNotFound) }
func IsUnauthorized(err error) bool { return errors.Is(err, ErrUnauthorized) }
func IsConflict(err error) bool     { return errors.Is(err, ErrConflict) }

// Servis qatlami - toza xato ishlash
func (s *Service) GetUser(id string) (*User, error) {
    user, err := s.repo.GetUser(id)
    if IsNotFound(err) {
        return nil, E("USER_NOT_FOUND", "service.GetUser", err)
    }
    return user, err
}

// HTTP handler - status practixriga moslashtirish
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
    user, err := h.service.GetUser(id)
    if err != nil {
        switch {
        case IsNotFound(err):
            w.WriteHeader(404)
        case IsUnauthorized(err):
            w.WriteHeader(401)
        case IsConflict(err):
            w.WriteHeader(409)
        default:
            w.WriteHeader(500)
        }
        return
    }
    json.NewEncoder(w).Encode(user)
}
\`\`\`

**Amaliy foydalari:**
- **HTTP status practixri:** Xatolarni status practixriga oson moslashtirish
- **Retry logikasi:** Xato turiga qarab qayta urinish haqida qaror qabul qilish
- **Circuit Breakers:** Muayyan xato turlari uchun zanjirlarni ochish
- **Metrikalar:** Semantik tur bo'yicha xatolarni sanash

**Standart kutubxonadan misollar:**
- \`os.IsNotExist(err)\` - Fayl topilmadi xatosini tekshirish
- \`os.IsPermission(err)\` - Ruxsat xatolarini tekshirish
- \`net.ErrClosed\` tarmoq kodida yordamchilar bilan

**Nima uchun errors.Is():** Bu string taqqoslash yoki tip kelishuvidan yaxshiroq, chunki u butun xato zanjirini aylanadi va ko'p marta o'ralgan bo'lsa ham sentinelni topadi.`,
			solutionCode: `package errorsx

import "errors"

var ErrNotFound = errors.New("not found")

func IsNotFound(err error) bool {
	return errors.Is(err, ErrNotFound)  // Butun xato zanjirini tekshirish
}`
		}
	}
};

export default task;
