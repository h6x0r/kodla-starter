import { Task } from '../../../../types';

export const task: Task = {
    slug: 'go-db-query-row',
    title: 'Query Single Row',
    difficulty: 'easy',
    tags: ['go', 'database', 'sql', 'query'],
    estimatedTime: '20m',
    isPremium: false,
    youtubeUrl: '',
    description: `Implement a function that queries a single user from the database using QueryRowContext. You must handle the Scan operation and return appropriate errors for missing rows or scan failures.

**Requirements:**
- Use db.QueryRowContext with context
- Scan into User struct fields
- Return sql.ErrNoRows if user not found
- Handle scan errors properly

**Type Definition:**
\`\`\`go
type User struct {
    ID    int64
    Name  string
    Email string
}
\`\`\``,
    initialCode: `package dbx

import (
    "context"
    "database/sql"
)

type User struct {
    ID    int64
    Name  string
    Email string
}

// TODO: Query a single user by ID
func QueryUser(ctx context.Context, db *sql.DB, id int64) (*User, error) {
    panic("TODO: implement QueryRowContext with Scan")
}`,
    solutionCode: `package dbx

import (
    "context"
    "database/sql"
)

type User struct {
    ID    int64
    Name  string
    Email string
}

func QueryUser(ctx context.Context, db *sql.DB, id int64) (*User, error) {
    // Query single row and scan into user struct
    var user User
    query := "SELECT id, name, email FROM users WHERE id = ?"

    err := db.QueryRowContext(ctx, query, id).Scan(&user.ID, &user.Name, &user.Email)
    if err != nil {
        return nil, err
    }

    return &user, nil
}`,
	testCode: `package dbx

import (
	"context"
	"database/sql"
	"errors"
	"testing"
)

// Mock scanner for testing without real database
type mockScanner struct {
	id    int64
	name  string
	email string
	err   error
}

func (m *mockScanner) Scan(dest ...interface{}) error {
	if m.err != nil {
		return m.err
	}
	if len(dest) >= 3 {
		*dest[0].(*int64) = m.id
		*dest[1].(*string) = m.name
		*dest[2].(*string) = m.email
	}
	return nil
}

// Mock row that wraps scanner
type mockRow struct {
	scanner *mockScanner
}

// MockDB for testing
type MockDB struct {
	rows map[int64]*mockScanner
}

func (m *MockDB) QueryRowContext(ctx context.Context, query string, args ...interface{}) *mockRow {
	if len(args) > 0 {
		if id, ok := args[0].(int64); ok {
			if scanner, exists := m.rows[id]; exists {
				return &mockRow{scanner: scanner}
			}
		}
	}
	return &mockRow{scanner: &mockScanner{err: sql.ErrNoRows}}
}

// QueryUserMock is a testable version that uses interface
func QueryUserMock(ctx context.Context, db *MockDB, id int64) (*User, error) {
	var user User
	row := db.QueryRowContext(ctx, "SELECT id, name, email FROM users WHERE id = ?", id)
	err := row.scanner.Scan(&user.ID, &user.Name, &user.Email)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func Test1(t *testing.T) {
	// User struct has correct fields
	u := User{ID: 1, Name: "John", Email: "john@example.com"}
	if u.ID != 1 || u.Name != "John" || u.Email != "john@example.com" {
		t.Error("User struct fields not working correctly")
	}
}

func Test2(t *testing.T) {
	// QueryUserMock returns user when found
	db := &MockDB{rows: map[int64]*mockScanner{
		1: {id: 1, name: "John", email: "john@example.com"},
	}}
	user, err := QueryUserMock(context.Background(), db, 1)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	if user.Name != "John" {
		t.Errorf("expected name John, got %s", user.Name)
	}
}

func Test3(t *testing.T) {
	// QueryUserMock returns error when not found
	db := &MockDB{rows: map[int64]*mockScanner{}}
	_, err := QueryUserMock(context.Background(), db, 999)
	if !errors.Is(err, sql.ErrNoRows) {
		t.Errorf("expected sql.ErrNoRows, got %v", err)
	}
}

func Test4(t *testing.T) {
	// QueryUserMock populates all User fields
	db := &MockDB{rows: map[int64]*mockScanner{
		42: {id: 42, name: "Alice", email: "alice@test.com"},
	}}
	user, err := QueryUserMock(context.Background(), db, 42)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	if user.ID != 42 {
		t.Errorf("expected ID 42, got %d", user.ID)
	}
	if user.Email != "alice@test.com" {
		t.Errorf("expected email alice@test.com, got %s", user.Email)
	}
}

func Test5(t *testing.T) {
	// QueryUserMock returns nil user on error
	db := &MockDB{rows: map[int64]*mockScanner{}}
	user, _ := QueryUserMock(context.Background(), db, 1)
	if user != nil {
		t.Error("expected nil user on error")
	}
}

func Test6(t *testing.T) {
	// QueryUserMock handles scan error
	db := &MockDB{rows: map[int64]*mockScanner{
		1: {err: errors.New("scan error")},
	}}
	_, err := QueryUserMock(context.Background(), db, 1)
	if err == nil {
		t.Error("expected error")
	}
}

func Test7(t *testing.T) {
	// QueryUserMock works with different IDs
	db := &MockDB{rows: map[int64]*mockScanner{
		100: {id: 100, name: "User100", email: "user100@test.com"},
	}}
	user, err := QueryUserMock(context.Background(), db, 100)
	if err != nil || user.ID != 100 {
		t.Errorf("expected ID 100, got %v, err: %v", user, err)
	}
}

func Test8(t *testing.T) {
	// QueryUserMock returns valid pointer
	db := &MockDB{rows: map[int64]*mockScanner{
		1: {id: 1, name: "Ptr", email: "ptr@test.com"},
	}}
	user, _ := QueryUserMock(context.Background(), db, 1)
	if user == nil {
		t.Error("expected non-nil pointer")
	}
}

func Test9(t *testing.T) {
	// QueryUserMock handles empty string fields
	db := &MockDB{rows: map[int64]*mockScanner{
		1: {id: 1, name: "", email: ""},
	}}
	user, err := QueryUserMock(context.Background(), db, 1)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	if user.Name != "" || user.Email != "" {
		t.Error("expected empty strings")
	}
}

func Test10(t *testing.T) {
	// QueryUser function signature is correct
	var _ func(context.Context, *sql.DB, int64) (*User, error) = QueryUser
	t.Log("QueryUser has correct signature")
}
`,
    hint1: `Use db.QueryRowContext() which returns a *Row. Call .Scan() on it to populate the User struct fields.`,
    hint2: `QueryRow always returns a non-nil Row. The error, if any, is deferred until Scan is called. sql.ErrNoRows is returned when no row matches.`,
    whyItMatters: `QueryRowContext is the foundation of database operations in Go. Understanding how to query a single row with context cancellation support is essential for building timeout-aware and cancellable database operations.

**Production Pattern:**
\`\`\`go
// Query with timeout to protect from slow queries
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

user, err := QueryUser(ctx, db, userID)
if err != nil {
    return fmt.Errorf("failed to get user: %w", err)
}
\`\`\`

**Practical Benefits:**
- Automatic cancellation on timeout
- Prevents resource blocking
- Better fault tolerance in distributed systems`,
    order: 0,
    translations: {
        ru: {
            title: 'Запрос одной строки',
            solutionCode: `package dbx

import (
    "context"
    "database/sql"
)

type User struct {
    ID    int64
    Name  string
    Email string
}

func QueryUser(ctx context.Context, db *sql.DB, id int64) (*User, error) {
    // Запрашиваем одну строку и сканируем в структуру пользователя
    var user User
    query := "SELECT id, name, email FROM users WHERE id = ?"

    err := db.QueryRowContext(ctx, query, id).Scan(&user.ID, &user.Name, &user.Email)
    if err != nil {
        return nil, err
    }

    return &user, nil
}`,
            description: `Реализуйте функцию, которая запрашивает одного пользователя из базы данных с помощью QueryRowContext. Необходимо обработать операцию Scan и вернуть соответствующие ошибки для отсутствующих строк или ошибок сканирования.

**Требования:**
- Используйте db.QueryRowContext с контекстом
- Сканируйте в поля структуры User
- Верните sql.ErrNoRows если пользователь не найден
- Правильно обрабатывайте ошибки сканирования

**Определение типа:**
\`\`\`go
type User struct {
    ID    int64
    Name  string
    Email string
}
\`\`\``,
            hint1: `Используйте db.QueryRowContext(), который возвращает *Row. Вызовите .Scan() на нем для заполнения полей структуры User.`,
            hint2: `QueryRow всегда возвращает ненулевой Row. Ошибка, если она есть, откладывается до вызова Scan. sql.ErrNoRows возвращается когда нет совпадающей строки.`,
            whyItMatters: `QueryRowContext является основой операций с базой данных в Go. Понимание того, как запрашивать одну строку с поддержкой отмены контекста, необходимо для создания операций с базой данных, учитывающих тайм-ауты и отмену.

**Продакшен паттерн:**
\`\`\`go
// Запрос с тайм-аутом для защиты от медленных запросов
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

user, err := QueryUser(ctx, db, userID)
if err != nil {
    return fmt.Errorf("failed to get user: %w", err)
}
\`\`\`

**Практические преимущества:**
- Автоматическая отмена при превышении времени
- Предотвращение блокировки ресурсов
- Лучшая отказоустойчивость в распределенных системах`
        },
        uz: {
            title: 'Bitta qator so\'rovi',
            solutionCode: `package dbx

import (
    "context"
    "database/sql"
)

type User struct {
    ID    int64
    Name  string
    Email string
}

func QueryUser(ctx context.Context, db *sql.DB, id int64) (*User, error) {
    // Bitta qatorni so'rab, foydalanuvchi strukturasiga skanlaymiz
    var user User
    query := "SELECT id, name, email FROM users WHERE id = ?"

    err := db.QueryRowContext(ctx, query, id).Scan(&user.ID, &user.Name, &user.Email)
    if err != nil {
        return nil, err
    }

    return &user, nil
}`,
            description: `QueryRowContext yordamida ma'lumotlar bazasidan bitta foydalanuvchini so'raydigan funksiyani amalga oshiring. Scan operatsiyasini boshqarishingiz va yo'qolgan qatorlar yoki skanlash xatolari uchun tegishli xatolarni qaytarishingiz kerak.

**Talablar:**
- db.QueryRowContext ni kontekst bilan ishlating
- User strukturasi maydonlariga skanlang
- Agar foydalanuvchi topilmasa sql.ErrNoRows qaytaring
- Skanlash xatolarini to'g'ri boshqaring

**Tur ta'rifi:**
\`\`\`go
type User struct {
    ID    int64
    Name  string
    Email string
}
\`\`\``,
            hint1: `db.QueryRowContext() dan foydalaning, u *Row qaytaradi. User strukturasi maydonlarini to'ldirish uchun unda .Scan() ni chaqiring.`,
            hint2: `QueryRow har doim null bo'lmagan Row qaytaradi. Agar xato bo'lsa, u Scan chaqirilgunga qadar kechiktiriladi. Hech qanday qator mos kelmasa sql.ErrNoRows qaytariladi.`,
            whyItMatters: `QueryRowContext Go da ma'lumotlar bazasi operatsiyalarining asosi hisoblanadi. Kontekstni bekor qilishni qo'llab-quvvatlaydigan bitta qatorni so'rashni tushunish, vaqt tugashi va bekor qilinadigan ma'lumotlar bazasi operatsiyalarini yaratish uchun zarur.

**Ishlab chiqarish patterni:**
\`\`\`go
// Sekin so'rovlardan himoya qilish uchun vaqt tugashi bilan so'rov
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

user, err := QueryUser(ctx, db, userID)
if err != nil {
    return fmt.Errorf("failed to get user: %w", err)
}
\`\`\`

**Amaliy foydalari:**
- Vaqt oshganda avtomatik bekor qilish
- Resurslar blokirovkasining oldini olish
- Taqsimlangan tizimlarda yaxshiroq bardoshlilik`
        }
    }
};

export default task;
