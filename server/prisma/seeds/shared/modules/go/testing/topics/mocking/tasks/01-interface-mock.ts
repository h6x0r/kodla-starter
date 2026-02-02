import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-interface-mock',
	title: 'Interface Mocking',
	difficulty: 'medium',	tags: ['go', 'testing', 'mocking', 'interfaces'],
	estimatedTime: '25m',	isPremium: false,
	youtubeUrl: '',
	description: `Create a mock implementation of an interface for testing without external dependencies.

**Requirements:**
1. Define \`UserStore\` interface with \`GetUser(id int) (User, error)\`
2. Implement \`UserService\` that depends on UserStore
3. Create \`MockUserStore\` for testing
4. Test UserService using the mock
5. Simulate both success and error cases

**Example:**
\`\`\`go
type UserStore interface {
    GetUser(id int) (User, error)
}

type MockUserStore struct {
    GetUserFunc func(id int) (User, error)
}

func (m *MockUserStore) GetUser(id int) (User, error) {
    return m.GetUserFunc(id)
}
\`\`\`

**Constraints:**
- Mock must implement the interface
- Test both success and error scenarios
- Mock should be reusable across tests`,
	initialCode: `package mocking_test

import (
	"errors"
)

type User struct {
	ID   int
	Name string
}

// TODO: Define UserStore interface
type UserStore interface {
	GetUser(id int) (User, error)
}

// TODO: Implement UserService that uses UserStore
type UserService struct {
	store UserStore
}

func NewUserService(store UserStore) *UserService {
	return &UserService{store: store}
}

// TODO: Implement GetUserName method
func (s *UserService) GetUserName(id int) (string, error) {
	// TODO: Implement
}

// TODO: Create MockUserStore
type MockUserStore struct {
	GetUserFunc func(id int) (User, error)
}

func (m *MockUserStore) GetUser(id int) (User, error) {
	// TODO: Implement
}

// TODO: Write tests using mock
func TestUserService_GetUserName(t *T) {
	// TODO: Implement
}`,
	solutionCode: `package mocking_test

import (
	"errors"
)

type User struct {
	ID   int
	Name string
}

type UserStore interface {
	GetUser(id int) (User, error)
}

type UserService struct {
	store UserStore
}

func NewUserService(store UserStore) *UserService {
	return &UserService{store: store}
}

func (s *UserService) GetUserName(id int) (string, error) {
	user, err := s.store.GetUser(id)  // Call dependency
	if err != nil {
		return "", err
	}
	return user.Name, nil
}

type MockUserStore struct {
	GetUserFunc func(id int) (User, error)
}

func (m *MockUserStore) GetUser(id int) (User, error) {
	if m.GetUserFunc != nil {  // Call configured function
		return m.GetUserFunc(id)
	}
	return User{}, errors.New("GetUserFunc not set")
}

func TestUserService_GetUserName(t *T) {
	t.Run("success", func(t *T) {
		// Configure mock to return user
		mock := &MockUserStore{
			GetUserFunc: func(id int) (User, error) {
				return User{ID: 1, Name: "John Doe"}, nil
			},
		}

		service := NewUserService(mock)
		name, err := service.GetUserName(1)

		// Assert success
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if name != "John Doe" {
			t.Errorf("got %q, want %q", name, "John Doe")
		}
	})

	t.Run("store error", func(t *T) {
		// Configure mock to return error
		mock := &MockUserStore{
			GetUserFunc: func(id int) (User, error) {
				return User{}, errors.New("database error")
			},
		}

		service := NewUserService(mock)
		_, err := service.GetUserName(1)

		// Assert error propagated
		if err == nil {
			t.Fatal("expected error, got nil")
		}
		if err.Error() != "database error" {
			t.Errorf("error = %q, want %q", err.Error(), "database error")
		}
	})

	t.Run("user not found", func(t *T) {
		// Configure mock to return not found error
		mock := &MockUserStore{
			GetUserFunc: func(id int) (User, error) {
				return User{}, errors.New("user not found")
			},
		}

		service := NewUserService(mock)
		_, err := service.GetUserName(999)

		// Assert error
		if err == nil {
			t.Fatal("expected error for non-existent user")
		}
	})
}`,
			hint1: `Store a function in the mock struct and call it from the interface method. This allows configuring behavior per test.`,
			hint2: `Create separate test cases with t.Run for different mock behaviors (success, error, edge cases).`,
			testCode: `package mocking_test

import (
	"errors"
)

func Test1(t *T) {
	mock := &MockUserStore{
		GetUserFunc: func(id int) (User, error) {
			return User{ID: 1, Name: "Alice"}, nil
		},
	}
	service := NewUserService(mock)
	name, err := service.GetUserName(1)
	if err != nil || name != "Alice" {
		t.Errorf("expected 'Alice', got %q, err=%v", name, err)
	}
}

func Test2(t *T) {
	mock := &MockUserStore{
		GetUserFunc: func(id int) (User, error) {
			return User{}, errors.New("not found")
		},
	}
	service := NewUserService(mock)
	_, err := service.GetUserName(999)
	if err == nil {
		t.Error("expected error for not found")
	}
}

func Test3(t *T) {
	calledWith := 0
	mock := &MockUserStore{
		GetUserFunc: func(id int) (User, error) {
			calledWith = id
			return User{ID: id, Name: "User"}, nil
		},
	}
	service := NewUserService(mock)
	service.GetUserName(42)
	if calledWith != 42 {
		t.Errorf("expected GetUser called with 42, got %d", calledWith)
	}
}

func Test4(t *T) {
	mock := &MockUserStore{
		GetUserFunc: func(id int) (User, error) {
			return User{ID: id, Name: ""}, nil
		},
	}
	service := NewUserService(mock)
	name, err := service.GetUserName(1)
	if err != nil || name != "" {
		t.Errorf("expected empty name, got %q", name)
	}
}

func Test5(t *T) {
	mock := &MockUserStore{
		GetUserFunc: func(id int) (User, error) {
			return User{}, errors.New("database timeout")
		},
	}
	service := NewUserService(mock)
	_, err := service.GetUserName(1)
	if err == nil || err.Error() != "database timeout" {
		t.Errorf("expected 'database timeout' error, got %v", err)
	}
}

func Test6(t *T) {
	callCount := 0
	mock := &MockUserStore{
		GetUserFunc: func(id int) (User, error) {
			callCount++
			return User{Name: "Test"}, nil
		},
	}
	service := NewUserService(mock)
	service.GetUserName(1)
	service.GetUserName(2)
	service.GetUserName(3)
	if callCount != 3 {
		t.Errorf("expected 3 calls, got %d", callCount)
	}
}

func Test7(t *T) {
	mock := &MockUserStore{}
	service := NewUserService(mock)
	_, err := service.GetUserName(1)
	if err == nil {
		t.Error("expected error when GetUserFunc not set")
	}
}

func Test8(t *T) {
	mock := &MockUserStore{
		GetUserFunc: func(id int) (User, error) {
			return User{ID: -1, Name: "Negative"}, nil
		},
	}
	service := NewUserService(mock)
	name, _ := service.GetUserName(-1)
	if name != "Negative" {
		t.Errorf("expected 'Negative', got %q", name)
	}
}

func Test9(t *T) {
	mock := &MockUserStore{
		GetUserFunc: func(id int) (User, error) {
			return User{ID: 0, Name: "Zero"}, nil
		},
	}
	service := NewUserService(mock)
	name, _ := service.GetUserName(0)
	if name != "Zero" {
		t.Errorf("expected 'Zero', got %q", name)
	}
}

func Test10(t *T) {
	mock := &MockUserStore{
		GetUserFunc: func(id int) (User, error) {
			return User{ID: id, Name: "Long Name With Spaces"}, nil
		},
	}
	service := NewUserService(mock)
	name, err := service.GetUserName(100)
	if err != nil || name != "Long Name With Spaces" {
		t.Errorf("expected 'Long Name With Spaces', got %q", name)
	}
}
`,
			whyItMatters: `Interface mocking enables testing without external dependencies like databases or APIs.

**Why Interface Mocking Matters:**
- **Isolation:** Test business logic without real database/API
- **Speed:** Tests run in microseconds, not seconds
- **Reliability:** No flaky tests from network/database issues
- **Controllability:** Simulate any scenario (errors, edge cases)

**Without Mocking (slow, brittle):**
\`\`\`go
func TestUserService(t *testing.T) {
    // Need real database
    db := setupDatabase()
    defer db.Close()

    // Insert test data
    db.Exec("INSERT INTO users ...")

    service := NewUserService(db)
    name, _ := service.GetUserName(1)

    // Cleanup
    db.Exec("DELETE FROM users ...")
}
// Slow, requires database, can fail due to DB issues
\`\`\`

**With Mocking (fast, reliable):**
\`\`\`go
func TestUserService(t *testing.T) {
    mock := &MockUserStore{
        GetUserFunc: func(id int) (User, error) {
            return User{Name: "John"}, nil
        },
    }

    service := NewUserService(mock)
    name, _ := service.GetUserName(1)
    // Fast, no database, always works
}
\`\`\`

**Production Benefits:**
- **Fast Feedback:** Run 1000+ tests in seconds
- **CI/CD:** No database setup in CI environment
- **Edge Cases:** Test error scenarios that are hard to reproduce
- **Parallel Tests:** No shared database state

**Real-World Example:**
Uber's Go services use interface mocking extensively:
\`\`\`go
type PaymentProcessor interface {
    Charge(amount int, token string) error
}

type RideService struct {
    payment PaymentProcessor
}

// Test without calling real Stripe API
func TestRideService_CompleteRide(t *testing.T) {
    mockPayment := &MockPaymentProcessor{
        ChargeFunc: func(amount int, token string) error {
            if amount <= 0 {
                return errors.New("invalid amount")
            }
            return nil  // Simulate success
        },
    }

    service := NewRideService(mockPayment)
    err := service.CompleteRide(rideID)
    // Test passes without network call
}
\`\`\`

**Mock Pattern Variations:**
\`\`\`go
// Simple mock (fixed return)
type SimpleMock struct{}
func (m *SimpleMock) GetUser(id int) (User, error) {
    return User{ID: 1, Name: "Fixed"}, nil
}

// Configurable mock (flexible)
type ConfigurableMock struct {
    GetUserFunc func(id int) (User, error)
}
func (m *ConfigurableMock) GetUser(id int) (User, error) {
    return m.GetUserFunc(id)
}

// Spy mock (records calls)
type SpyMock struct {
    Calls []int
}
func (m *SpyMock) GetUser(id int) (User, error) {
    m.Calls = append(m.Calls, id)  // Record call
    return User{}, nil
}
\`\`\`

**When to Mock:**
- External services (APIs, databases)
- Slow operations (file I/O, network)
- Non-deterministic behavior (time, random)
- Error cases that are hard to trigger

**When NOT to Mock:**
- Pure functions (no dependencies)
- Simple data structures
- Standard library (usually)
- Integration tests (use real dependencies)

At Google, interface mocking is standard practice - their testing docs recommend "program to interfaces, mock for tests" as a core principle.

**Advanced Pattern - Table-Driven with Mocks:**
\`\`\`go
func TestUserService(t *testing.T) {
    tests := []struct {
        name      string
        mockFunc  func(id int) (User, error)
        userID    int
        wantName  string
        wantErr   bool
    }{
        {
            name: "success",
            mockFunc: func(id int) (User, error) {
                return User{Name: "John"}, nil
            },
            userID:   1,
            wantName: "John",
            wantErr:  false,
        },
        {
            name: "error",
            mockFunc: func(id int) (User, error) {
                return User{}, errors.New("db error")
            },
            userID:  1,
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            mock := &MockUserStore{GetUserFunc: tt.mockFunc}
            service := NewUserService(mock)
            name, err := service.GetUserName(tt.userID)

            if (err != nil) != tt.wantErr {
                t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
            }
            if name != tt.wantName {
                t.Errorf("name = %q, want %q", name, tt.wantName)
            }
        })
    }
}
\`\`\``,	order: 0,
	translations: {
		ru: {
			title: 'Мокирование интерфейсов',
			description: `Создайте mock реализацию интерфейса для тестирования без внешних зависимостей.

**Требования:**
1. Определите интерфейс \`UserStore\` с \`GetUser(id int) (User, error)\`
2. Реализуйте \`UserService\` зависящий от UserStore
3. Создайте \`MockUserStore\` для тестирования
4. Тестируйте UserService используя mock
5. Симулируйте успешные и ошибочные случаи

**Пример:**
\`\`\`go
type MockUserStore struct {
    GetUserFunc func(id int) (User, error)
}
\`\`\`

**Ограничения:**
- Mock должен реализовывать интерфейс
- Тестируйте успех и ошибки`,
			hint1: `Храните функцию в структуре mock и вызывайте её из метода интерфейса.`,
			hint2: `Создайте отдельные тестовые случаи с t.Run для разных поведений mock.`,
			whyItMatters: `Мокирование интерфейсов позволяет тестировать без внешних зависимостей, таких как базы данных или API.

**Почему мокирование интерфейсов важно:**
- **Изоляция:** Тестируйте бизнес-логику без реальной БД/API
- **Скорость:** Тесты выполняются за микросекунды, а не секунды
- **Надежность:** Нет нестабильных тестов из-за проблем сети/БД
- **Управляемость:** Симулируйте любой сценарий (ошибки, граничные случаи)

**Без мокирования (медленно, хрупко):**
\`\`\`go
func TestUserService(t *testing.T) {
    // Нужна реальная база данных
    db := setupDatabase()
    defer db.Close()

    // Вставить тестовые данные
    db.Exec("INSERT INTO users ...")

    service := NewUserService(db)
    name, _ := service.GetUserName(1)

    // Очистка
    db.Exec("DELETE FROM users ...")
}
// Медленно, требует БД, может упасть из-за проблем БД
\`\`\`

**С мокированием (быстро, надежно):**
\`\`\`go
func TestUserService(t *testing.T) {
    mock := &MockUserStore{
        GetUserFunc: func(id int) (User, error) {
            return User{Name: "John"}, nil
        },
    }

    service := NewUserService(mock)
    name, _ := service.GetUserName(1)
    // Быстро, без БД, всегда работает
}
\`\`\`

**Преимущества в production:**
- **Быстрая обратная связь:** Запускайте 1000+ тестов за секунды
- **CI/CD:** Не нужна настройка БД в CI окружении
- **Граничные случаи:** Тестируйте сценарии ошибок, которые трудно воспроизвести
- **Параллельные тесты:** Нет общего состояния БД

**Пример из реального мира:**
Go сервисы Uber активно используют мокирование интерфейсов:
\`\`\`go
type PaymentProcessor interface {
    Charge(amount int, token string) error
}

type RideService struct {
    payment PaymentProcessor
}

// Тест без вызова реального Stripe API
func TestRideService_CompleteRide(t *testing.T) {
    mockPayment := &MockPaymentProcessor{
        ChargeFunc: func(amount int, token string) error {
            if amount <= 0 {
                return errors.New("invalid amount")
            }
            return nil  // Симулировать успех
        },
    }

    service := NewRideService(mockPayment)
    err := service.CompleteRide(rideID)
    // Тест проходит без сетевого вызова
}
\`\`\`

**Варианты паттерна Mock:**
\`\`\`go
// Простой mock (фиксированный возврат)
type SimpleMock struct{}
func (m *SimpleMock) GetUser(id int) (User, error) {
    return User{ID: 1, Name: "Fixed"}, nil
}

// Настраиваемый mock (гибкий)
type ConfigurableMock struct {
    GetUserFunc func(id int) (User, error)
}
func (m *ConfigurableMock) GetUser(id int) (User, error) {
    return m.GetUserFunc(id)
}

// Spy mock (записывает вызовы)
type SpyMock struct {
    Calls []int
}
func (m *SpyMock) GetUser(id int) (User, error) {
    m.Calls = append(m.Calls, id)  // Записать вызов
    return User{}, nil
}
\`\`\`

**Когда использовать моки:**
- Внешние сервисы (API, базы данных)
- Медленные операции (файловый I/O, сеть)
- Недетерминированное поведение (время, случайность)
- Случаи ошибок, которые трудно вызвать

**Когда НЕ использовать моки:**
- Чистые функции (без зависимостей)
- Простые структуры данных
- Стандартная библиотека (обычно)
- Интеграционные тесты (используйте реальные зависимости)

В Google мокирование интерфейсов является стандартной практикой - их документация по тестированию рекомендует "программируйте на интерфейсы, мокируйте для тестов" как основной принцип.

**Продвинутый паттерн - Табличные тесты с моками:**
\`\`\`go
func TestUserService(t *testing.T) {
    tests := []struct {
        name      string
        mockFunc  func(id int) (User, error)
        userID    int
        wantName  string
        wantErr   bool
    }{
        {
            name: "success",
            mockFunc: func(id int) (User, error) {
                return User{Name: "John"}, nil
            },
            userID:   1,
            wantName: "John",
            wantErr:  false,
        },
        {
            name: "error",
            mockFunc: func(id int) (User, error) {
                return User{}, errors.New("db error")
            },
            userID:  1,
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            mock := &MockUserStore{GetUserFunc: tt.mockFunc}
            service := NewUserService(mock)
            name, err := service.GetUserName(tt.userID)

            if (err != nil) != tt.wantErr {
                t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
            }
            if name != tt.wantName {
                t.Errorf("name = %q, want %q", name, tt.wantName)
            }
        })
    }
}
\`\`\``,
			solutionCode: `package mocking_test

import (
	"errors"
)

type User struct {
	ID   int
	Name string
}

type UserStore interface {
	GetUser(id int) (User, error)
}

type UserService struct {
	store UserStore
}

func NewUserService(store UserStore) *UserService {
	return &UserService{store: store}
}

func (s *UserService) GetUserName(id int) (string, error) {
	user, err := s.store.GetUser(id)  // Вызвать зависимость
	if err != nil {
		return "", err
	}
	return user.Name, nil
}

type MockUserStore struct {
	GetUserFunc func(id int) (User, error)
}

func (m *MockUserStore) GetUser(id int) (User, error) {
	if m.GetUserFunc != nil {  // Вызвать настроенную функцию
		return m.GetUserFunc(id)
	}
	return User{}, errors.New("GetUserFunc not set")
}

func TestUserService_GetUserName(t *T) {
	t.Run("успех", func(t *T) {
		// Настроить mock для возврата пользователя
		mock := &MockUserStore{
			GetUserFunc: func(id int) (User, error) {
				return User{ID: 1, Name: "John Doe"}, nil
			},
		}

		service := NewUserService(mock)
		name, err := service.GetUserName(1)

		// Проверить успех
		if err != nil {
			t.Fatalf("неожиданная ошибка: %v", err)
		}
		if name != "John Doe" {
			t.Errorf("получено %q, ожидается %q", name, "John Doe")
		}
	})

	t.Run("ошибка хранилища", func(t *T) {
		// Настроить mock для возврата ошибки
		mock := &MockUserStore{
			GetUserFunc: func(id int) (User, error) {
				return User{}, errors.New("database error")
			},
		}

		service := NewUserService(mock)
		_, err := service.GetUserName(1)

		// Проверить что ошибка распространилась
		if err == nil {
			t.Fatal("ожидается ошибка, получено nil")
		}
		if err.Error() != "database error" {
			t.Errorf("ошибка = %q, ожидается %q", err.Error(), "database error")
		}
	})

	t.Run("пользователь не найден", func(t *T) {
		// Настроить mock для возврата ошибки не найдено
		mock := &MockUserStore{
			GetUserFunc: func(id int) (User, error) {
				return User{}, errors.New("user not found")
			},
		}

		service := NewUserService(mock)
		_, err := service.GetUserName(999)

		// Проверить ошибку
		if err == nil {
			t.Fatal("ожидается ошибка для несуществующего пользователя")
		}
	})
}`
		},
		uz: {
			title: `Interfeys mocklash`,
			description: `Tashqi bog'liqliksiz testlash uchun interfeys mock amalga oshirishini yarating.

**Talablar:**
1. \`GetUser(id int) (User, error)\` bilan 'UserStore' interfeysini aniqlang
2. UserStore ga bog'liq 'UserService' ni amalga oshiring
3. Testlash uchun 'MockUserStore' yarating
4. Mock dan foydalanib UserService ni test qiling
5. Muvaffaqiyatli va xato holatlarni simulyatsiya qiling

**Misol:**
\`\`\`go
type MockUserStore struct {
    GetUserFunc func(id int) (User, error)
}
\`\`\`

**Cheklovlar:**
- Mock interfeyni amalga oshirishi kerak
- Muvaffaqiyat va xatolarni test qiling`,
			hint1: `Mock strukturada funksiyani saqlang va uni interfeys metodidan chaqiring.`,
			hint2: `Turli mock xatti-harakatlari uchun t.Run bilan alohida test holatlarini yarating.`,
			whyItMatters: `Interfeys mocklash ma'lumotlar bazasi yoki API kabi tashqi bog'liqliksiz testlash imkonini beradi.

**Nima uchun interfeys mocking muhim:**
- **Izolyatsiya:** Haqiqiy DB/API siz biznes mantiqni test qiling
- **Tezlik:** Testlar soniyalar emas, mikrosekundlarda ishlaydi
- **Ishonchlilik:** Tarmoq/DB muammolari tufayli beqaror testlar yo'q
- **Boshqaruv:** Har qanday stsenariyni simulyatsiya qiling (xatolar, chegara holatlari)

**Mocklamasdan (sekin, mo'rt):**
\`\`\`go
func TestUserService(t *testing.T) {
    // Haqiqiy ma'lumotlar bazasi kerak
    db := setupDatabase()
    defer db.Close()

    // Test ma'lumotlarini kiritish
    db.Exec("INSERT INTO users ...")

    service := NewUserService(db)
    name, _ := service.GetUserName(1)

    // Tozalash
    db.Exec("DELETE FROM users ...")
}
// Sekin, DB talab qiladi, DB muammolari tufayli muvaffaqiyatsiz bo'lishi mumkin
\`\`\`

**Mock bilan (tez, ishonchli):**
\`\`\`go
func TestUserService(t *testing.T) {
    mock := &MockUserStore{
        GetUserFunc: func(id int) (User, error) {
            return User{Name: "John"}, nil
        },
    }

    service := NewUserService(mock)
    name, _ := service.GetUserName(1)
    // Tez, DB yo'q, har doim ishlaydi
}
\`\`\`

**Production afzalliklari:**
- **Tez fikr-mulohaza:** Soniyalarda 1000+ testni ishga tushiring
- **CI/CD:** CI muhitida DB sozlash kerak emas
- **Chegara holatlari:** Takrorlash qiyin bo'lgan xato stsenariylarini test qiling
- **Parallel testlar:** Umumiy DB holati yo'q

**Haqiqiy dunyo misoli:**
Uber Go servislari keng ko'lamda interfeys mocklashdan foydalanadi:
\`\`\`go
type PaymentProcessor interface {
    Charge(amount int, token string) error
}

type RideService struct {
    payment PaymentProcessor
}

// Haqiqiy Stripe API ni chaqirmasdan test
func TestRideService_CompleteRide(t *testing.T) {
    mockPayment := &MockPaymentProcessor{
        ChargeFunc: func(amount int, token string) error {
            if amount <= 0 {
                return errors.New("invalid amount")
            }
            return nil  // Muvaffaqiyatni simulyatsiya qilish
        },
    }

    service := NewRideService(mockPayment)
    err := service.CompleteRide(rideID)
    // Test tarmoq chaqiruvisiz o'tadi
}
\`\`\`

**Mock pattern variantlari:**
\`\`\`go
// Oddiy mock (qat'iy qaytarish)
type SimpleMock struct{}
func (m *SimpleMock) GetUser(id int) (User, error) {
    return User{ID: 1, Name: "Fixed"}, nil
}

// Sozlanuvchi mock (moslashuvchan)
type ConfigurableMock struct {
    GetUserFunc func(id int) (User, error)
}
func (m *ConfigurableMock) GetUser(id int) (User, error) {
    return m.GetUserFunc(id)
}

// Spy mock (chaqiruvlarni yozib oladi)
type SpyMock struct {
    Calls []int
}
func (m *SpyMock) GetUser(id int) (User, error) {
    m.Calls = append(m.Calls, id)  // Chaqiruvni yozib olish
    return User{}, nil
}
\`\`\`

**Qachon mockdan foydalanish kerak:**
- Tashqi servislar (API, ma'lumotlar bazalari)
- Sekin operatsiyalar (fayl I/O, tarmoq)
- Deterministik bo'lmagan xatti-harakatlar (vaqt, tasodifiy)
- Qo'zg'atish qiyin bo'lgan xato holatlari

**Qachon mockdan foydalanMASLIK kerak:**
- Toza funksiyalar (bog'liqliksiz)
- Oddiy ma'lumotlar strukturalari
- Standart kutubxona (odatda)
- Integratsiya testlari (haqiqiy bog'liqliklardan foydalaning)

Google'da interfeys mocklash standart amaliyot - ularning testlash hujjatlari "interfeyslar uchun dasturlash, testlar uchun mock" ni asosiy tamoyil sifatida tavsiya qiladi.

**Ilg'or pattern - Mocklar bilan jadval testlari:**
\`\`\`go
func TestUserService(t *testing.T) {
    tests := []struct {
        name      string
        mockFunc  func(id int) (User, error)
        userID    int
        wantName  string
        wantErr   bool
    }{
        {
            name: "success",
            mockFunc: func(id int) (User, error) {
                return User{Name: "John"}, nil
            },
            userID:   1,
            wantName: "John",
            wantErr:  false,
        },
        {
            name: "error",
            mockFunc: func(id int) (User, error) {
                return User{}, errors.New("db error")
            },
            userID:  1,
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            mock := &MockUserStore{GetUserFunc: tt.mockFunc}
            service := NewUserService(mock)
            name, err := service.GetUserName(tt.userID)

            if (err != nil) != tt.wantErr {
                t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
            }
            if name != tt.wantName {
                t.Errorf("name = %q, want %q", name, tt.wantName)
            }
        })
    }
}
\`\`\``,
			solutionCode: `package mocking_test

import (
	"errors"
)

type User struct {
	ID   int
	Name string
}

type UserStore interface {
	GetUser(id int) (User, error)
}

type UserService struct {
	store UserStore
}

func NewUserService(store UserStore) *UserService {
	return &UserService{store: store}
}

func (s *UserService) GetUserName(id int) (string, error) {
	user, err := s.store.GetUser(id)  // Bog'liqlikni chaqirish
	if err != nil {
		return "", err
	}
	return user.Name, nil
}

type MockUserStore struct {
	GetUserFunc func(id int) (User, error)
}

func (m *MockUserStore) GetUser(id int) (User, error) {
	if m.GetUserFunc != nil {  // Sozlangan funksiyani chaqirish
		return m.GetUserFunc(id)
	}
	return User{}, errors.New("GetUserFunc not set")
}

func TestUserService_GetUserName(t *T) {
	t.Run("muvaffaqiyat", func(t *T) {
		// Foydalanuvchini qaytarish uchun mock ni sozlash
		mock := &MockUserStore{
			GetUserFunc: func(id int) (User, error) {
				return User{ID: 1, Name: "John Doe"}, nil
			},
		}

		service := NewUserService(mock)
		name, err := service.GetUserName(1)

		// Muvaffaqiyatni tekshirish
		if err != nil {
			t.Fatalf("kutilmagan xato: %v", err)
		}
		if name != "John Doe" {
			t.Errorf("olindi %q, kutilgan %q", name, "John Doe")
		}
	})

	t.Run("saqlash xatosi", func(t *T) {
		// Xatoni qaytarish uchun mock ni sozlash
		mock := &MockUserStore{
			GetUserFunc: func(id int) (User, error) {
				return User{}, errors.New("database error")
			},
		}

		service := NewUserService(mock)
		_, err := service.GetUserName(1)

		// Xato tarqalganligini tekshirish
		if err == nil {
			t.Fatal("xato kutilgan, nil olindi")
		}
		if err.Error() != "database error" {
			t.Errorf("xato = %q, kutilgan %q", err.Error(), "database error")
		}
	})

	t.Run("foydalanuvchi topilmadi", func(t *T) {
		// Topilmadi xatosini qaytarish uchun mock ni sozlash
		mock := &MockUserStore{
			GetUserFunc: func(id int) (User, error) {
				return User{}, errors.New("user not found")
			},
		}

		service := NewUserService(mock)
		_, err := service.GetUserName(999)

		// Xatoni tekshirish
		if err == nil {
			t.Fatal("mavjud bo'lmagan foydalanuvchi uchun xato kutilgan")
		}
	})
}`
		}
	}
};

export default task;
