import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-fake-implementation',
	title: 'Fake Implementation',
	difficulty: 'hard',	tags: ['go', 'testing', 'fake', 'in-memory'],
	estimatedTime: '30m',	isPremium: false,
	youtubeUrl: '',
	description: `Create a fake in-memory implementation for testing complex interactions.

**Requirements:**
1. Define \`Cache\` interface: Set, Get, Delete
2. Implement in-memory \`FakeCache\` for testing
3. Test service using fake cache
4. Verify cache operations work correctly
5. Support multiple operations in one test

**Constraints:**
- Fake must be fully functional
- Store data in memory (map)
- Support all interface operations`,
	initialCode: `package fake_test
type Cache interface {
	Set(key, value string) error
	Get(key string) (string, bool)
	Delete(key string) error
}

// TODO: Implement FakeCache
type FakeCache struct{}

// TODO: Implement Cache interface methods
func (f *FakeCache) Set(key, value string) error {
	return nil // TODO: Implement
}
func (f *FakeCache) Get(key string) (string, bool) { // TODO: Implement }
func (f *FakeCache) Delete(key string) error {
	return nil // TODO: Implement
}

// TODO: Write tests
func TestFakeCache(t *T) {
	// TODO: Implement
}`,
	solutionCode: `package fake_test
type Cache interface {
	Set(key, value string) error
	Get(key string) (string, bool)
	Delete(key string) error
}

type FakeCache struct {
	data map[string]string	// In-memory storage
}

func NewFakeCache() *FakeCache {
	return &FakeCache{
		data: make(map[string]string),
	}
}

func (f *FakeCache) Set(key, value string) error {
	f.data[key] = value	// Store in map
	return nil
}

func (f *FakeCache) Get(key string) (string, bool) {
	value, ok := f.data[key]	// Retrieve from map
	return value, ok
}

func (f *FakeCache) Delete(key string) error {
	delete(f.data, key)	// Remove from map
	return nil
}

func TestFakeCache(t *T) {
	cache := NewFakeCache()

	// Test Set and Get
	t.Run("Set and Get", func(t *T) {
		err := cache.Set("user:1", "John")
		if err != nil {
			t.Fatalf("Set error: %v", err)
		}

		value, ok := cache.Get("user:1")
		if !ok {
			t.Fatal("expected key to exist")
		}
		if value != "John" {
			t.Errorf("got %q, want %q", value, "John")
		}
	})

	// Test Get non-existent key
	t.Run("Get non-existent", func(t *T) {
		_, ok := cache.Get("nonexistent")
		if ok {
			t.Error("expected key to not exist")
		}
	})

	// Test Delete
	t.Run("Delete", func(t *T) {
		cache.Set("temp", "value")

		err := cache.Delete("temp")
		if err != nil {
			t.Fatalf("Delete error: %v", err)
		}

		_, ok := cache.Get("temp")
		if ok {
			t.Error("expected key to be deleted")
		}
	})

	// Test multiple operations
	t.Run("Multiple operations", func(t *T) {
		cache := NewFakeCache()

		cache.Set("a", "1")
		cache.Set("b", "2")
		cache.Set("c", "3")

		v, _ := cache.Get("b")
		if v != "2" {
			t.Errorf("b = %q, want %q", v, "2")
		}

		cache.Delete("a")
		_, ok := cache.Get("a")
		if ok {
			t.Error("a should be deleted")
		}
	})
}`,
			hint1: `Fake is a working implementation using simple data structures (map, slice).`,
			hint2: `Unlike mocks, fakes have real logic and maintain state across calls.`,
			testCode: `package fake_test
func Test1(t *T) {
	cache := NewFakeCache()
	err := cache.Set("key", "value")
	if err != nil {
		t.Errorf("Set should not error: %v", err)
	}
}

func Test2(t *T) {
	cache := NewFakeCache()
	cache.Set("key", "value")
	val, ok := cache.Get("key")
	if !ok || val != "value" {
		t.Errorf("expected 'value', got %q, ok=%v", val, ok)
	}
}

func Test3(t *T) {
	cache := NewFakeCache()
	_, ok := cache.Get("nonexistent")
	if ok {
		t.Error("expected ok=false for nonexistent key")
	}
}

func Test4(t *T) {
	cache := NewFakeCache()
	cache.Set("key", "value")
	err := cache.Delete("key")
	if err != nil {
		t.Errorf("Delete should not error: %v", err)
	}
	_, ok := cache.Get("key")
	if ok {
		t.Error("key should be deleted")
	}
}

func Test5(t *T) {
	cache := NewFakeCache()
	cache.Set("key", "first")
	cache.Set("key", "second")
	val, _ := cache.Get("key")
	if val != "second" {
		t.Errorf("expected 'second' after overwrite, got %q", val)
	}
}

func Test6(t *T) {
	cache := NewFakeCache()
	cache.Set("a", "1")
	cache.Set("b", "2")
	cache.Set("c", "3")
	v1, _ := cache.Get("a")
	v2, _ := cache.Get("b")
	v3, _ := cache.Get("c")
	if v1 != "1" || v2 != "2" || v3 != "3" {
		t.Error("multiple keys not stored correctly")
	}
}

func Test7(t *T) {
	cache := NewFakeCache()
	err := cache.Delete("nonexistent")
	if err != nil {
		t.Error("deleting nonexistent key should not error")
	}
}

func Test8(t *T) {
	cache := NewFakeCache()
	cache.Set("key", "")
	val, ok := cache.Get("key")
	if !ok || val != "" {
		t.Errorf("expected empty string, got %q, ok=%v", val, ok)
	}
}

func Test9(t *T) {
	cache := NewFakeCache()
	cache.Set("", "empty key")
	val, ok := cache.Get("")
	if !ok || val != "empty key" {
		t.Errorf("expected 'empty key' for empty key, got %q", val)
	}
}

func Test10(t *T) {
	cache := NewFakeCache()
	for i := 0; i < 100; i++ {
		cache.Set("key", "value")
	}
	val, _ := cache.Get("key")
	if val != "value" {
		t.Error("repeated sets should keep last value")
	}
}
`,
			whyItMatters: `Fakes provide realistic testing environment without external dependencies, making tests faster and more reliable.

**Why Fakes Matter:**
- **Speed:** No network calls, database queries, or file I/O
- **Reliability:** Tests don't fail due to external service downtime
- **Simplicity:** Easier to set up than real dependencies
- **Control:** Full control over data and behavior

**When to Use Fakes:**
- **Database:** In-memory map instead of SQL database
- **Cache:** Map-based cache instead of Redis
- **File System:** Memory storage instead of disk
- **HTTP Client:** Hardcoded responses instead of real API

**Production Impact:**
At Google, fake implementations enable:
- Running thousands of tests in seconds
- Testing edge cases impossible with real services
- Parallel test execution without conflicts
- Deterministic test results

**Real Example:**
\`\`\`go
// Production Redis cache
type RedisCache struct {
    client *redis.Client
}

// Fast fake for testing
type FakeCache struct {
    data map[string]string
}

// Tests run 100x faster with fake
func TestUserService(t *testing.T) {
    cache := NewFakeCache()  // Instant
    service := NewUserService(cache)
    // Test complex flows...
}
\`\`\`

Fakes enable rapid iteration during development without waiting for slow dependencies.`,
			order: 4,
	translations: {
		ru: {
			title: 'Фейковая реализация',
			description: `Создайте fake in-memory реализацию для тестирования сложных взаимодействий.`,
			hint1: `Fake - это рабочая реализация используя простые структуры данных.`,
			hint2: `В отличие от mocks, fakes имеют реальную логику и поддерживают состояние.`,
			whyItMatters: `Фейковые реализации обеспечивают реалистичную среду тестирования без внешних зависимостей, делая тесты быстрее и надежнее.

**Почему фейки важны:**
- **Скорость:** Без сетевых вызовов, запросов к БД или операций ввода-вывода
- **Надежность:** Тесты не падают из-за недоступности внешних сервисов
- **Простота:** Легче настроить, чем реальные зависимости
- **Контроль:** Полный контроль над данными и поведением

**Когда использовать фейки:**
- **База данных:** In-memory map вместо SQL базы данных
- **Кеш:** Map-based кеш вместо Redis
- **Файловая система:** Хранилище в памяти вместо диска
- **HTTP клиент:** Заранее заданные ответы вместо реального API

**Влияние на продакшн:**
В Google фейковые реализации позволяют:
- Запускать тысячи тестов за секунды
- Тестировать граничные случаи, невозможные с реальными сервисами
- Параллельное выполнение тестов без конфликтов
- Детерминированные результаты тестов

**Реальный пример:**
\`\`\`go
// Production Redis кеш
type RedisCache struct {
    client *redis.Client
}

// Быстрый fake для тестирования
type FakeCache struct {
    data map[string]string
}

// Тесты работают в 100 раз быстрее с fake
func TestUserService(t *testing.T) {
    cache := NewFakeCache()  // Мгновенно
    service := NewUserService(cache)
    // Тестируем сложные сценарии...
}
\`\`\`

Фейки обеспечивают быструю итерацию во время разработки без ожидания медленных зависимостей.`,
			solutionCode: `package fake_test
type Cache interface {
	Set(key, value string) error
	Get(key string) (string, bool)
	Delete(key string) error
}

type FakeCache struct {
	data map[string]string	// Хранилище в памяти
}

func NewFakeCache() *FakeCache {
	return &FakeCache{
		data: make(map[string]string),
	}
}

func (f *FakeCache) Set(key, value string) error {
	f.data[key] = value	// Сохранить в map
	return nil
}

func (f *FakeCache) Get(key string) (string, bool) {
	value, ok := f.data[key]	// Получить из map
	return value, ok
}

func (f *FakeCache) Delete(key string) error {
	delete(f.data, key)	// Удалить из map
	return nil
}

func TestFakeCache(t *T) {
	cache := NewFakeCache()

	// Тест Set и Get
	t.Run("Set и Get", func(t *T) {
		err := cache.Set("user:1", "John")
		if err != nil {
			t.Fatalf("ошибка Set: %v", err)
		}

		value, ok := cache.Get("user:1")
		if !ok {
			t.Fatal("ожидается существование ключа")
		}
		if value != "John" {
			t.Errorf("получено %q, ожидается %q", value, "John")
		}
	})

	// Тест Get несуществующего ключа
	t.Run("Get несуществующего", func(t *T) {
		_, ok := cache.Get("nonexistent")
		if ok {
			t.Error("ожидается отсутствие ключа")
		}
	})

	// Тест Delete
	t.Run("Delete", func(t *T) {
		cache.Set("temp", "value")

		err := cache.Delete("temp")
		if err != nil {
			t.Fatalf("ошибка Delete: %v", err)
		}

		_, ok := cache.Get("temp")
		if ok {
			t.Error("ожидается удаление ключа")
		}
	})

	// Тест множественных операций
	t.Run("Множественные операции", func(t *T) {
		cache := NewFakeCache()

		cache.Set("a", "1")
		cache.Set("b", "2")
		cache.Set("c", "3")

		v, _ := cache.Get("b")
		if v != "2" {
			t.Errorf("b = %q, want %q", v, "2")
		}

		cache.Delete("a")
		_, ok := cache.Get("a")
		if ok {
			t.Error("a должен быть удален")
		}
	})
}`
		},
		uz: {
			title: `Fake implementatsiya`,
			description: `Murakkab o'zaro ta'sirlarni testlash uchun fake in-memory amalga oshirishni yarating.`,
			hint1: `Fake - bu oddiy ma'lumotlar strukturalaridan foydalangan holda ishlaydigan amalga oshirish.`,
			hint2: `Mock dan farqli o'laroq, fake lar haqiqiy mantiqqa ega va holatni saqlaydi.`,
			whyItMatters: `Fake implementatsiyalar tashqi bog'liqliksiz real test muhitini ta'minlaydi, testlarni tezroq va ishonchli qiladi.

**Fake lar nima uchun muhim:**
- **Tezlik:** Tarmoq chaqiruvlari, ma'lumotlar bazasi so'rovlari yoki fayl operatsiyalari yo'q
- **Ishonchlilik:** Testlar tashqi xizmatlarning ishdan chiqishi tufayli muvaffaqiyatsiz bo'lmaydi
- **Soddalik:** Haqiqiy bog'liqliklardan ko'ra sozlash osonroq
- **Nazorat:** Ma'lumotlar va xatti-harakat ustidan to'liq nazorat

**Fake lardan qachon foydalanish kerak:**
- **Ma'lumotlar bazasi:** SQL ma'lumotlar bazasi o'rniga in-memory map
- **Kesh:** Redis o'rniga map-based kesh
- **Fayl tizimi:** Disk o'rniga xotirada saqlash
- **HTTP mijoz:** Haqiqiy API o'rniga oldindan belgilangan javoblar

**Production ta'siri:**
Google da fake implementatsiyalar imkon beradi:
- Soniyalar ichida minglab testlarni ishga tushirish
- Haqiqiy xizmatlar bilan mumkin bo'lmagan chekka holatlarni test qilish
- Testlarni to'qnashuvlarsiz parallel bajarish
- Deterministik test natijalarini olish

**Haqiqiy misol:**
\`\`\`go
// Production Redis kesh
type RedisCache struct {
    client *redis.Client
}

// Test uchun tez fake
type FakeCache struct {
    data map[string]string
}

// Testlar fake bilan 100 marta tezroq ishlaydi
func TestUserService(t *testing.T) {
    cache := NewFakeCache()  // Bir zumda
    service := NewUserService(cache)
    // Murakkab oqimlarni test qilish...
}
\`\`\`

Fake lar sekin bog'liqliklarni kutmasdan rivojlantirish davomida tez iteratsiyani ta'minlaydi.`,
			solutionCode: `package fake_test
type Cache interface {
	Set(key, value string) error
	Get(key string) (string, bool)
	Delete(key string) error
}

type FakeCache struct {
	data map[string]string	// Xotirada saqlash
}

func NewFakeCache() *FakeCache {
	return &FakeCache{
		data: make(map[string]string),
	}
}

func (f *FakeCache) Set(key, value string) error {
	f.data[key] = value	// Map da saqlash
	return nil
}

func (f *FakeCache) Get(key string) (string, bool) {
	value, ok := f.data[key]	// Map dan olish
	return value, ok
}

func (f *FakeCache) Delete(key string) error {
	delete(f.data, key)	// Map dan o'chirish
	return nil
}

func TestFakeCache(t *T) {
	cache := NewFakeCache()

	// Set va Get testlari
	t.Run("Set va Get", func(t *T) {
		err := cache.Set("user:1", "John")
		if err != nil {
			t.Fatalf("Set xatosi: %v", err)
		}

		value, ok := cache.Get("user:1")
		if !ok {
			t.Fatal("kalit mavjud bo'lishi kutilgan")
		}
		if value != "John" {
			t.Errorf("olindi %q, kutilgan %q", value, "John")
		}
	})

	// Mavjud bo'lmagan kalitni olish testi
	t.Run("Mavjud bo'lmagan kalitni olish", func(t *T) {
		_, ok := cache.Get("nonexistent")
		if ok {
			t.Error("kalit mavjud bo'lmasligi kutilgan")
		}
	})

	// Delete testi
	t.Run("Delete", func(t *T) {
		cache.Set("temp", "value")

		err := cache.Delete("temp")
		if err != nil {
			t.Fatalf("Delete xatosi: %v", err)
		}

		_, ok := cache.Get("temp")
		if ok {
			t.Error("kalit o'chirilgan bo'lishi kutilgan")
		}
	})

	// Ko'p operatsiyalar testi
	t.Run("Ko'p operatsiyalar", func(t *T) {
		cache := NewFakeCache()

		cache.Set("a", "1")
		cache.Set("b", "2")
		cache.Set("c", "3")

		v, _ := cache.Get("b")
		if v != "2" {
			t.Errorf("b = %q, want %q", v, "2")
		}

		cache.Delete("a")
		_, ok := cache.Get("a")
		if ok {
			t.Error("a o'chirilgan bo'lishi kerak")
		}
	})
}`
		}
	}
};

export default task;
