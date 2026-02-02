import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-test-main',
	title: 'TestMain Setup',
	difficulty: 'medium',	tags: ['go', 'testing', 'setup', 'teardown'],
	estimatedTime: '25m',	isPremium: false,
	youtubeUrl: '',
	description: `Use **TestMain** for test setup and teardown logic.

**Requirements:**
1. Implement \`TestMain(m *testing.M)\` function
2. Set up test resources (e.g., temporary directory)
3. Run tests with \`m.Run()\`
4. Clean up resources after tests
5. Exit with test result code

**Example:**
\`\`\`go
func TestMain(m *testing.M) {
    // Setup
    tmpDir, _ := os.MkdirTemp("", "test")
    defer os.RemoveAll(tmpDir)

    // Run tests
    code := m.Run()

    // Exit with test result
    os.Exit(code)
}
\`\`\`

**Constraints:**
- Must call m.Run() to execute tests
- Must call os.Exit() with m.Run() result
- Setup before m.Run(), cleanup after`,
	initialCode: `package testmain_test

import (
	"os"
)

var testDir string

// TODO: Implement TestMain with setup and teardown
func TestMain(m *testing.M) {
	// TODO: Implement
}

// TODO: Write test that uses testDir
func TestFileOperations(t *T) {
	// TODO: Implement
}`,
	solutionCode: `package testmain_test

import (
	"os"
	"path/filepath"
)

var testDir string

func TestMain(m *testing.M) {
	// Setup: Create temporary directory
	var err error
	testDir, err = os.MkdirTemp("", "test-*")
	if err != nil {
		panic(err)  // Setup failure should panic
	}

	// Run all tests
	code := m.Run()

	// Teardown: Remove temporary directory
	os.RemoveAll(testDir)

	// Exit with test result code
	os.Exit(code)
}

func TestFileOperations(t *T) {
	// Test can use testDir set by TestMain
	testFile := filepath.Join(testDir, "test.txt")

	// Write to file
	err := os.WriteFile(testFile, []byte("test data"), 0644)
	if err != nil {
		t.Fatalf("WriteFile failed: %v", err)
	}

	// Read from file
	data, err := os.ReadFile(testFile)
	if err != nil {
		t.Fatalf("ReadFile failed: %v", err)
	}

	// Assert content
	expected := "test data"
	if string(data) != expected {
		t.Errorf("got %q, want %q", string(data), expected)
	}
}`,
			hint1: `TestMain runs before all tests. Use it for package-level setup like database connections.`,
			hint2: `Always call os.Exit(m.Run()) - the exit code tells CI systems if tests passed.`,
			testCode: `package testmain_test

import (
	"os"
	"path/filepath"
)

// Test1: testDir is set by TestMain
func Test1(t *T) {
	if testDir == "" {
		t.Error("testDir should be set by TestMain")
	}
}

// Test2: testDir exists
func Test2(t *T) {
	if _, err := os.Stat(testDir); os.IsNotExist(err) {
		t.Errorf("testDir %q should exist", testDir)
	}
}

// Test3: Can create file in testDir
func Test3(t *T) {
	testFile := filepath.Join(testDir, "test3.txt")
	err := os.WriteFile(testFile, []byte("test"), 0644)
	if err != nil {
		t.Fatalf("WriteFile failed: %v", err)
	}
	os.Remove(testFile)
}

// Test4: Can read file from testDir
func Test4(t *T) {
	testFile := filepath.Join(testDir, "test4.txt")
	content := []byte("read test")
	if err := os.WriteFile(testFile, content, 0644); err != nil {
		t.Fatalf("WriteFile failed: %v", err)
	}
	defer os.Remove(testFile)

	data, err := os.ReadFile(testFile)
	if err != nil {
		t.Fatalf("ReadFile failed: %v", err)
	}
	if string(data) != "read test" {
		t.Errorf("got %q, want %q", string(data), "read test")
	}
}

// Test5: testDir is a directory
func Test5(t *T) {
	info, err := os.Stat(testDir)
	if err != nil {
		t.Fatalf("Stat failed: %v", err)
	}
	if !info.IsDir() {
		t.Error("testDir should be a directory")
	}
}

// Test6: Can create subdirectory
func Test6(t *T) {
	subDir := filepath.Join(testDir, "subdir")
	err := os.Mkdir(subDir, 0755)
	if err != nil {
		t.Fatalf("Mkdir failed: %v", err)
	}
	os.RemoveAll(subDir)
}

// Test7: Multiple file operations
func Test7(t *T) {
	for i := 0; i < 3; i++ {
		file := filepath.Join(testDir, "multi"+string(rune('0'+i))+".txt")
		if err := os.WriteFile(file, []byte("data"), 0644); err != nil {
			t.Fatalf("WriteFile failed for %s: %v", file, err)
		}
		os.Remove(file)
	}
}

// Test8: testDir is writable
func Test8(t *T) {
	testFile := filepath.Join(testDir, "writable.txt")
	err := os.WriteFile(testFile, []byte("test"), 0644)
	if err != nil {
		t.Errorf("testDir should be writable: %v", err)
	}
	os.Remove(testFile)
}

// Test9: File content persists within test
func Test9(t *T) {
	testFile := filepath.Join(testDir, "persist.txt")
	content := "persistent data"
	os.WriteFile(testFile, []byte(content), 0644)
	defer os.Remove(testFile)

	data, _ := os.ReadFile(testFile)
	if string(data) != content {
		t.Errorf("content mismatch: got %q, want %q", string(data), content)
	}
}

// Test10: testDir path is absolute
func Test10(t *T) {
	if !filepath.IsAbs(testDir) {
		t.Errorf("testDir should be absolute path, got %q", testDir)
	}
}
`,
			whyItMatters: `TestMain enables expensive setup once instead of repeating it in every test.

**Why TestMain Matters:**
- **Performance:** Setup database once, not per test
- **Resources:** Share connections, temp directories across tests
- **Cleanup:** Guarantee teardown even if tests panic
- **Environment:** Set env vars, configure logging for all tests

**Without TestMain (slow):**
\`\`\`go
func TestUserCreate(t *testing.T) {
    db := setupDatabase()  // Slow
    defer db.Close()
    // test...
}

func TestUserUpdate(t *testing.T) {
    db := setupDatabase()  // Slow (repeated)
    defer db.Close()
    // test...
}
// Tests take 5 seconds
\`\`\`

**With TestMain (fast):**
\`\`\`go
var db *sql.DB

func TestMain(m *testing.M) {
    db = setupDatabase()  // Once
    code := m.Run()
    db.Close()
    os.Exit(code)
}

func TestUserCreate(t *testing.T) {
    // Use shared db
}

func TestUserUpdate(t *testing.T) {
    // Use shared db
}
// Tests take 1 second
\`\`\`

**Production Benefits:**
- **Database Tests:** Connect once, rollback transactions per test
- **File Tests:** Create temp directory once, clean up after
- **Mock Services:** Start mock server once, use in all tests
- **CI Speed:** Faster tests mean faster deployments

**Real-World Example:**
At Uber, service tests use TestMain to:
1. Start in-memory Redis
2. Initialize config
3. Set up logging
4. Run tests
5. Shutdown services

This shared setup saves minutes per test run.

**Common Patterns:**
\`\`\`go
// Database tests
func TestMain(m *testing.M) {
    // Start test database
    db, err := sql.Open("postgres", testDSN)
    if err != nil {
        log.Fatal(err)
    }

    // Migrate schema
    migrateDatabase(db)

    // Store in global
    testDB = db

    // Run tests
    code := m.Run()

    // Cleanup
    db.Close()
    os.Exit(code)
}

// HTTP service tests
func TestMain(m *testing.M) {
    // Start mock dependencies
    mockAuth := httptest.NewServer(authMock)
    mockDB := httptest.NewServer(dbMock)

    // Set URLs for tests
    os.Setenv("AUTH_URL", mockAuth.URL)
    os.Setenv("DB_URL", mockDB.URL)

    // Run tests
    code := m.Run()

    // Cleanup
    mockAuth.Close()
    mockDB.Close()
    os.Exit(code)
}
\`\`\`

**Important Notes:**
- TestMain runs once per package
- Defer doesn't work (os.Exit bypasses it)
- Must manually cleanup before os.Exit
- Setup failures should panic or log.Fatal

The Go standard library uses TestMain extensively - check net/http tests for examples.`,	order: 4,
	translations: {
		ru: {
			title: 'Настройка TestMain',
			description: `Используйте **TestMain** для настройки и очистки тестов.

**Требования:**
1. Реализуйте функцию \`TestMain(m *testing.M)\`
2. Настройте тестовые ресурсы (например, временную директорию)
3. Запустите тесты с \`m.Run()\`
4. Очистите ресурсы после тестов
5. Завершите с кодом результата теста

**Пример:**
\`\`\`go
func TestMain(m *testing.M) {
    // Настройка
    tmpDir, _ := os.MkdirTemp("", "test")
    defer os.RemoveAll(tmpDir)

    // Запуск тестов
    code := m.Run()

    // Завершение с результатом
    os.Exit(code)
}
\`\`\`

**Ограничения:**
- Должен вызвать m.Run() для выполнения тестов
- Должен вызвать os.Exit() с результатом m.Run()
- Настройка перед m.Run(), очистка после`,
			hint1: `TestMain запускается перед всеми тестами. Используйте для настройки уровня пакета.`,
			hint2: `Всегда вызывайте os.Exit(m.Run()) - код выхода сообщает CI системам прошли ли тесты.`,
			whyItMatters: `TestMain позволяет делать дорогую настройку один раз вместо повторения в каждом тесте.

**Почему TestMain важен:**
- **Производительность:** Настройте базу данных один раз, не на каждый тест
- **Ресурсы:** Разделяйте соединения, временные директории между тестами
- **Очистка:** Гарантируйте teardown даже если тесты паникуют
- **Окружение:** Установите env переменные, configure logging для всех тестов

**Без TestMain (медленно):**
\`\`\`go
func TestUserCreate(t *testing.T) {
    db := setupDatabase()  // Медленно
    defer db.Close()
    // test...
}

func TestUserUpdate(t *testing.T) {
    db := setupDatabase()  // Медленно (повторяется)
    defer db.Close()
    // test...
}
// Тесты занимают 5 секунд
\`\`\`

**С TestMain (быстро):**
\`\`\`go
var db *sql.DB

func TestMain(m *testing.M) {
    db = setupDatabase()  // Один раз
    code := m.Run()
    db.Close()
    os.Exit(code)
}

func TestUserCreate(t *testing.T) {
    // Используем общую db
}

func TestUserUpdate(t *testing.T) {
    // Используем общую db
}
// Тесты занимают 1 секунду
\`\`\`

**Продакшен паттерн:**
- **Тесты базы данных:** Подключитесь один раз, откатывайте транзакции на тест
- **Тесты файлов:** Создайте temp директорию один раз, очистите после
- **Mock сервисы:** Запустите mock server один раз, используйте во всех тестах
- **Скорость CI:** Быстрые тесты означают быстрые deployments

**Практический пример:**
В Uber тесты сервисов используют TestMain для:
1. Запуска in-memory Redis
2. Инициализации конфига
3. Настройки логирования
4. Запуска тестов
5. Shutdown сервисов

Эта общая настройка экономит минуты на каждый запуск тестов.

**Распространённые паттерны:**
\`\`\`go
// Тесты базы данных
func TestMain(m *testing.M) {
    // Запустить тестовую БД
    db, err := sql.Open("postgres", testDSN)
    if err != nil {
        log.Fatal(err)
    }

    // Мигрировать схему
    migrateDatabase(db)

    // Сохранить в глобальной переменной
    testDB = db

    // Запустить тесты
    code := m.Run()

    // Очистка
    db.Close()
    os.Exit(code)
}

// Тесты HTTP сервиса
func TestMain(m *testing.M) {
    // Запустить mock зависимости
    mockAuth := httptest.NewServer(authMock)
    mockDB := httptest.NewServer(dbMock)

    // Установить URLs для тестов
    os.Setenv("AUTH_URL", mockAuth.URL)
    os.Setenv("DB_URL", mockDB.URL)

    // Запустить тесты
    code := m.Run()

    // Очистка
    mockAuth.Close()
    mockDB.Close()
    os.Exit(code)
}
\`\`\`

**Важные заметки:**
- TestMain выполняется один раз на пакет
- Defer не работает (os.Exit обходит его)
- Необходимо вручную очищать перед os.Exit
- Сбои настройки должны вызывать panic или log.Fatal

Стандартная библиотека Go широко использует TestMain - проверьте net/http тесты для примеров.`,
			solutionCode: `package testmain_test

import (
	"os"
	"path/filepath"
)

var testDir string

func TestMain(m *testing.M) {
	// Настройка: Создать временную директорию
	var err error
	testDir, err = os.MkdirTemp("", "test-*")
	if err != nil {
		panic(err)  // Сбой настройки должен вызвать панику
	}

	// Запустить все тесты
	code := m.Run()

	// Очистка: Удалить временную директорию
	os.RemoveAll(testDir)

	// Выйти с кодом результата теста
	os.Exit(code)
}

func TestFileOperations(t *T) {
	// Тест может использовать testDir установленный TestMain
	testFile := filepath.Join(testDir, "test.txt")

	// Записать в файл
	err := os.WriteFile(testFile, []byte("test data"), 0644)
	if err != nil {
		t.Fatalf("WriteFile не удался: %v", err)
	}

	// Прочитать из файла
	data, err := os.ReadFile(testFile)
	if err != nil {
		t.Fatalf("ReadFile не удался: %v", err)
	}

	// Проверить содержимое
	expected := "test data"
	if string(data) != expected {
		t.Errorf("получено %q, ожидается %q", string(data), expected)
	}
}`
		},
		uz: {
			title: `TestMain sozlash`,
			description: `Test sozlash va tozalash mantiqasi uchun **TestMain** dan foydalaning.

**Talablar:**
1. \`TestMain(m *testing.M)\` funksiyasini amalga oshiring
2. Test resurslarini sozlang (masalan, vaqtinchalik katalog)
3. \`m.Run()\` bilan testlarni ishga tushiring
4. Testlardan keyin resurslarni tozalang
5. Test natijasi kodi bilan chiqing

**Misol:**
\`\`\`go
func TestMain(m *testing.M) {
    // Sozlash
    tmpDir, _ := os.MkdirTemp("", "test")
    defer os.RemoveAll(tmpDir)

    // Testlarni ishga tushirish
    code := m.Run()
    os.Exit(code)
}
\`\`\`

**Cheklovlar:**
- Testlarni bajarish uchun m.Run() ni chaqirishi kerak
- m.Run() natijasi bilan os.Exit() ni chaqirishi kerak`,
			hint1: `TestMain barcha testlardan oldin ishlaydi. Paket darajasidagi sozlash uchun foydalaning.`,
			hint2: `Har doim os.Exit(m.Run()) ni chaqiring - chiqish kodi CI tizimlariga testlar o'tganligini bildiradi.`,
			whyItMatters: `TestMain har bir testda takrorlash o'rniga qimmat sozlashni bir marta amalga oshirishga imkon beradi.

**Nima uchun TestMain muhim:**
- **Ishlash:** Ma'lumotlar bazasini bir marta sozlang, har bir test uchun emas
- **Resurslar:** Ulanishlar, vaqtinchalik kataloglarni testlar o'rtasida ulashing
- **Tozalash:** Testlar panic qilsa ham teardown ni kafolatlang
- **Muhit:** Barcha testlar uchun env o'zgaruvchilarini, configure logging ni o'rnating

**TestMain siz (sekin):**
\`\`\`go
func TestUserCreate(t *testing.T) {
    db := setupDatabase()  // Sekin
    defer db.Close()
    // test...
}

func TestUserUpdate(t *testing.T) {
    db := setupDatabase()  // Sekin (takrorlanadi)
    defer db.Close()
    // test...
}
// Testlar 5 soniya davom etadi
\`\`\`

**TestMain bilan (tez):**
\`\`\`go
var db *sql.DB

func TestMain(m *testing.M) {
    db = setupDatabase()  // Bir marta
    code := m.Run()
    db.Close()
    os.Exit(code)
}

func TestUserCreate(t *testing.T) {
    // Umumiy db dan foydalanamiz
}

func TestUserUpdate(t *testing.T) {
    // Umumiy db dan foydalanamiz
}
// Testlar 1 soniya davom etadi
\`\`\`

**Ishlab chiqarish patterni:**
- **Ma'lumotlar bazasi testlari:** Bir marta ulaning, test uchun tranzaksiyalarni qaytaring
- **Fayl testlari:** Vaqtinchalik katalogni bir marta yarating, keyin tozalang
- **Mock xizmatlar:** Mock serverni bir marta ishga tushiring, barcha testlarda ishlating
- **CI tezligi:** Tez testlar tez deploymentlar degani

**Amaliy misol:**
Uber da xizmat testlari TestMain dan quyidagilar uchun foydalanadi:
1. In-memory Redis ni ishga tushirish
2. Konfig ni boshlash
3. Logging sozlash
4. Testlarni ishga tushirish
5. Xizmatlarni to'xtatish

Bu umumiy sozlash har bir test ishga tushirishda daqiqalarni tejaydi.

Go standart kutubxonasi TestMain ni keng foydalanadi - misollar uchun net/http testlarni tekshiring.`,
			solutionCode: `package testmain_test

import (
	"os"
	"path/filepath"
)

var testDir string

func TestMain(m *testing.M) {
	// Sozlash: Vaqtinchalik katalog yaratish
	var err error
	testDir, err = os.MkdirTemp("", "test-*")
	if err != nil {
		panic(err)  // Sozlash xatosi panic bo'lishi kerak
	}

	// Barcha testlarni ishga tushirish
	code := m.Run()

	// Tozalash: Vaqtinchalik katalogni o'chirish
	os.RemoveAll(testDir)

	// Test natijasi kodi bilan chiqish
	os.Exit(code)
}

func TestFileOperations(t *T) {
	// Test TestMain tomonidan o'rnatilgan testDir dan foydalanishi mumkin
	testFile := filepath.Join(testDir, "test.txt")

	// Faylga yozish
	err := os.WriteFile(testFile, []byte("test data"), 0644)
	if err != nil {
		t.Fatalf("WriteFile muvaffaqiyatsiz: %v", err)
	}

	// Fayldan o'qish
	data, err := os.ReadFile(testFile)
	if err != nil {
		t.Fatalf("ReadFile muvaffaqiyatsiz: %v", err)
	}

	// Kontentni tekshirish
	expected := "test data"
	if string(data) != expected {
		t.Errorf("olindi %q, kutilgan %q", string(data), expected)
	}
}`
		}
	}
};

export default task;
