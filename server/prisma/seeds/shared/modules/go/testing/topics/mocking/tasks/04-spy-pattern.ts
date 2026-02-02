import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-spy-pattern',
	title: 'Spy Pattern',
	difficulty: 'medium',	tags: ['go', 'testing', 'spy', 'verification'],
	estimatedTime: '25m',	isPremium: false,
	youtubeUrl: '',
	description: `Implement spy pattern to verify method calls and arguments.

**Requirements:**
1. Create \`Logger\` interface with \`Log(message string)\`
2. Implement service that logs messages
3. Create \`SpyLogger\` that records all log calls
4. Verify service logs correct messages
5. Assert call count and arguments

**Constraints:**
- Spy must record all calls
- Verify both call count and arguments
- Test without real logging`,
	initialCode: `package spy_test
type Logger interface {
	Log(message string)
}

type UserService struct {
	logger Logger
}

func NewUserService(logger Logger) *UserService {
	return &UserService{logger: logger}
}

// TODO: Implement CreateUser that logs
func (s *UserService) CreateUser(name string) error {
	return nil // TODO: Implement
}

// TODO: Create SpyLogger
type SpyLogger struct{}

// TODO: Write tests verifying log calls
func TestUserService_CreateUser(t *T) {
	// TODO: Implement
}`,
	solutionCode: `package spy_test
type Logger interface {
	Log(message string)
}

type UserService struct {
	logger Logger
}

func NewUserService(logger Logger) *UserService {
	return &UserService{logger: logger}
}

func (s *UserService) CreateUser(name string) error {
	s.logger.Log("Creating user: " + name)	// Log creation
	// ... actual creation logic
	s.logger.Log("User created successfully")	// Log success
	return nil
}

type SpyLogger struct {
	Messages []string	// Record all messages
	CallCount int	// Count calls
}

func (s *SpyLogger) Log(message string) {
	s.Messages = append(s.Messages, message)	// Record message
	s.CallCount++	// Increment count
}

func TestUserService_CreateUser(t *T) {
	spy := &SpyLogger{}
	service := NewUserService(spy)

	err := service.CreateUser("John")

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Verify call count
	if spy.CallCount != 2 {
		t.Errorf("CallCount = %d, want 2", spy.CallCount)
	}

	// Verify messages
	if len(spy.Messages) != 2 {
		t.Fatalf("got %d messages, want 2", len(spy.Messages))
	}

	expectedFirst := "Creating user: John"
	if spy.Messages[0] != expectedFirst {
		t.Errorf("first message = %q, want %q", spy.Messages[0], expectedFirst)
	}

	expectedSecond := "User created successfully"
	if spy.Messages[1] != expectedSecond {
		t.Errorf("second message = %q, want %q", spy.Messages[1], expectedSecond)
	}
}`,
			hint1: `Spy records all interactions (calls, arguments) for later verification.`,
			hint2: `Store calls in a slice and provide assertion methods.`,
			testCode: `package spy_test
func Test1(t *T) {
	spy := &SpyLogger{}
	service := NewUserService(spy)
	err := service.CreateUser("Alice")
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
}

func Test2(t *T) {
	spy := &SpyLogger{}
	service := NewUserService(spy)
	service.CreateUser("Bob")
	if spy.CallCount != 2 {
		t.Errorf("expected 2 calls, got %d", spy.CallCount)
	}
}

func Test3(t *T) {
	spy := &SpyLogger{}
	service := NewUserService(spy)
	service.CreateUser("Charlie")
	if len(spy.Messages) != 2 {
		t.Errorf("expected 2 messages, got %d", len(spy.Messages))
	}
}

func Test4(t *T) {
	spy := &SpyLogger{}
	service := NewUserService(spy)
	service.CreateUser("Dave")
	expected := "Creating user: Dave"
	if spy.Messages[0] != expected {
		t.Errorf("first message: got %q, want %q", spy.Messages[0], expected)
	}
}

func Test5(t *T) {
	spy := &SpyLogger{}
	service := NewUserService(spy)
	service.CreateUser("Eve")
	expected := "User created successfully"
	if spy.Messages[1] != expected {
		t.Errorf("second message: got %q, want %q", spy.Messages[1], expected)
	}
}

func Test6(t *T) {
	spy := &SpyLogger{}
	service := NewUserService(spy)
	service.CreateUser("User1")
	service.CreateUser("User2")
	if spy.CallCount != 4 {
		t.Errorf("expected 4 calls for 2 users, got %d", spy.CallCount)
	}
}

func Test7(t *T) {
	spy := &SpyLogger{}
	service := NewUserService(spy)
	service.CreateUser("User1")
	service.CreateUser("User2")
	if len(spy.Messages) != 4 {
		t.Errorf("expected 4 messages for 2 users, got %d", len(spy.Messages))
	}
}

func Test8(t *T) {
	spy := &SpyLogger{}
	if spy.CallCount != 0 || len(spy.Messages) != 0 {
		t.Error("new spy should have zero calls and messages")
	}
}

func Test9(t *T) {
	spy := &SpyLogger{}
	spy.Log("direct call")
	if spy.CallCount != 1 || spy.Messages[0] != "direct call" {
		t.Error("direct Log call should work")
	}
}

func Test10(t *T) {
	spy := &SpyLogger{}
	service := NewUserService(spy)
	service.CreateUser("")
	if spy.Messages[0] != "Creating user: " {
		t.Errorf("expected 'Creating user: ' for empty name, got %q", spy.Messages[0])
	}
}
`,
			whyItMatters: `Spy pattern verifies interactions with dependencies, ensuring correct integration.`,
			order: 3,
	translations: {
		ru: {
			title: 'Шпион для отслеживания вызовов',
			description: `Реализуйте паттерн spy для проверки вызовов методов и аргументов.

**Требования:**
1. Создайте интерфейс \`Logger\` с методом \`Log(message string)\`
2. Реализуйте сервис, который логирует сообщения
3. Создайте \`SpyLogger\`, который записывает все вызовы логирования
4. Проверьте, что сервис логирует правильные сообщения
5. Проверьте количество вызовов и аргументы

**Ограничения:**
- Spy должен записывать все вызовы
- Проверяйте как количество вызовов, так и аргументы
- Тестируйте без реального логирования`,
			hint1: `Spy записывает все взаимодействия (вызовы, аргументы) для последующей проверки.`,
			hint2: `Храните вызовы в slice и предоставьте методы для проверок.`,
			whyItMatters: `Паттерн Spy проверяет взаимодействия с зависимостями, обеспечивая правильную интеграцию.`,
			solutionCode: `package spy_test
type Logger interface {
	Log(message string)
}

type UserService struct {
	logger Logger
}

func NewUserService(logger Logger) *UserService {
	return &UserService{logger: logger}
}

func (s *UserService) CreateUser(name string) error {
	s.logger.Log("Creating user: " + name)	// Логировать создание
	s.logger.Log("User created successfully")	// Логировать успех
	return nil
}

type SpyLogger struct {
	Messages []string	// Записать все сообщения
	CallCount int	// Подсчитать вызовы
}

func (s *SpyLogger) Log(message string) {
	s.Messages = append(s.Messages, message)	// Записать сообщение
	s.CallCount++	// Увеличить счетчик
}

func TestUserService_CreateUser(t *T) {
	spy := &SpyLogger{}
	service := NewUserService(spy)

	err := service.CreateUser("John")

	if err != nil {
		t.Fatalf("неожиданная ошибка: %v", err)
	}

	// Проверить количество вызовов
	if spy.CallCount != 2 {
		t.Errorf("CallCount = %d, want 2", spy.CallCount)
	}

	// Проверить сообщения
	if len(spy.Messages) != 2 {
		t.Fatalf("получено %d сообщений, ожидается 2", len(spy.Messages))
	}

	expectedFirst := "Creating user: John"
	if spy.Messages[0] != expectedFirst {
		t.Errorf("первое сообщение = %q, want %q", spy.Messages[0], expectedFirst)
	}

	expectedSecond := "User created successfully"
	if spy.Messages[1] != expectedSecond {
		t.Errorf("второе сообщение = %q, want %q", spy.Messages[1], expectedSecond)
	}
}`
		},
		uz: {
			title: `Chaqiruvlarni kuzatish uchun josus`,
			description: `Metod chaqiruvlari va argumentlarni tekshirish uchun spy patternini amalga oshiring.

**Talablar:**
1. \`Log(message string)\` metodi bilan \`Logger\` interfeysini yarating
2. Xabarlarni log qiladigan servisni amalga oshiring
3. Barcha log chaqiruvlarini yozib oladigan \`SpyLogger\` yarating
4. Servis to'g'ri xabarlarni log qilishini tekshiring
5. Chaqiruvlar soni va argumentlarni tasdiqlang

**Cheklovlar:**
- Spy barcha chaqiruvlarni yozib olishi kerak
- Ham chaqiruvlar sonini, ham argumentlarni tekshiring
- Haqiqiy loglashsiz test qiling`,
			hint1: `Spy keyingi tekshirish uchun barcha o'zaro ta'sirlarni (chaqiruvlar, argumentlar) yozib oladi.`,
			hint2: `Chaqiruvlarni slice da saqlang va tekshirish metodlarini taqdim eting.`,
			whyItMatters: `Spy pattern bog'liqliklar bilan o'zaro ta'sirlarni tekshiradi va to'g'ri integratsiyani ta'minlaydi.`,
			solutionCode: `package spy_test
type Logger interface {
	Log(message string)
}

type UserService struct {
	logger Logger
}

func NewUserService(logger Logger) *UserService {
	return &UserService{logger: logger}
}

func (s *UserService) CreateUser(name string) error {
	s.logger.Log("Creating user: " + name)	// Yaratishni log qilish
	s.logger.Log("User created successfully")	// Muvaffaqiyatni log qilish
	return nil
}

type SpyLogger struct {
	Messages []string	// Barcha xabarlarni yozib olish
	CallCount int	// Chaqiruvlarni hisoblash
}

func (s *SpyLogger) Log(message string) {
	s.Messages = append(s.Messages, message)	// Xabarni yozib olish
	s.CallCount++	// Hisoblagichni oshirish
}

func TestUserService_CreateUser(t *T) {
	spy := &SpyLogger{}
	service := NewUserService(spy)

	err := service.CreateUser("John")

	if err != nil {
		t.Fatalf("kutilmagan xato: %v", err)
	}

	// Chaqiruvlar sonini tekshirish
	if spy.CallCount != 2 {
		t.Errorf("CallCount = %d, want 2", spy.CallCount)
	}

	// Xabarlarni tekshirish
	if len(spy.Messages) != 2 {
		t.Fatalf("%d xabar olindi, 2 kutilgan", len(spy.Messages))
	}

	expectedFirst := "Creating user: John"
	if spy.Messages[0] != expectedFirst {
		t.Errorf("birinchi xabar = %q, want %q", spy.Messages[0], expectedFirst)
	}

	expectedSecond := "User created successfully"
	if spy.Messages[1] != expectedSecond {
		t.Errorf("ikkinchi xabar = %q, want %q", spy.Messages[1], expectedSecond)
	}
}`
		}
	}
};

export default task;
