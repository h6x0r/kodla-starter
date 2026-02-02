import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-pointersx-optional-pattern',
	title: 'Optional Type Pattern with Pointers',
	difficulty: 'medium',
	tags: ['go', 'pointers', 'design-patterns', 'type-safety'],
	estimatedTime: '45m',
	isPremium: false,
	youtubeUrl: '',
	description: `Master the Optional/Nullable pattern in Go by implementing a generic-style Optional type using pointers to represent presence or absence of values, similar to Rust's Option<T> or Java's Optional<T>.

**You will implement:**

1. **IntOptional** type and methods:
   1.1. **NewIntOptional(value int) *IntOptional** - Create present optional
   1.2. **EmptyIntOptional() *IntOptional** - Create empty optional
   1.3. **IsPresent() bool** - Check if value exists
   1.4. **Get() (int, bool)** - Get value safely
   1.5. **OrElse(def int) int** - Get value or default
   1.6. **Map(fn func(int) int) *IntOptional** - Transform value

2. **StringOptional** type and methods:
   2.1. **NewStringOptional(value string) *StringOptional**
   2.2. **EmptyStringOptional() *StringOptional**
   2.3. **IsPresent() bool**
   2.4. **Get() (string, bool)**
   2.5. **OrElse(def string) string**
   2.6. **Filter(predicate func(string) bool) *StringOptional**

**Key Concepts:**
- **Optional Pattern**: Type-safe null handling
- **Pointer-Based Presence**: Using nil pointer to represent absence
- **Method Chaining**: Fluent API design
- **Higher-Order Functions**: Map, Filter operations
- **Defensive Programming**: Safe value extraction
- **Functional Programming**: Monadic operations

**Example Usage:**
\`\`\`go
// Create present optional
opt := NewIntOptional(42)
if opt.IsPresent() {
    value, _ := opt.Get()
    fmt.Println(value)  // 42
}

// Create empty optional
empty := EmptyIntOptional()
value := empty.OrElse(100)  // 100

// Map transformation
opt = NewIntOptional(10)
doubled := opt.Map(func(x int) int { return x * 2 })
result := doubled.OrElse(0)  // 20

// Chaining operations
opt = NewIntOptional(5)
result = opt.Map(func(x int) int { return x * 3 }).
    Map(func(x int) int { return x + 10 }).
    OrElse(0)  // 25

// String optional with filter
opt2 := NewStringOptional("Hello")
filtered := opt2.Filter(func(s string) bool {
    return len(s) > 3
})
result2 := filtered.OrElse("default")  // "Hello"

opt2 = NewStringOptional("Hi")
filtered = opt2.Filter(func(s string) bool {
    return len(s) > 3
})
result2 = filtered.OrElse("default")  // "default"

// Safe database query result handling
func FindUserByID(id int) *StringOptional {
    user := db.QueryUser(id)
    if user == nil {
        return EmptyStringOptional()
    }
    return NewStringOptional(user.Name)
}

userName := FindUserByID(123).OrElse("Guest")

// Configuration with optional values
type Config struct {
    Port     *IntOptional
    Host     *StringOptional
    Timeout  *IntOptional
}

config := Config{
    Port: NewIntOptional(8080),
    Host: EmptyStringOptional(),
}

port := config.Port.OrElse(3000)      // 8080
host := config.Host.OrElse("localhost")  // "localhost"
\`\`\`

**Constraints:**
- Use pointer fields to represent presence/absence
- Empty optional should have nil pointer internally
- All methods must be nil-safe (handle empty optionals)
- Map should return empty optional if original is empty
- Filter should return empty if predicate fails or optional is empty`,
	initialCode: `package pointersx

// IntOptional represents an optional integer value
type IntOptional struct {
	value *int // nil means absent, non-nil means present
}

// StringOptional represents an optional string value
type StringOptional struct {
	value *string // nil means absent, non-nil means present
}

// TODO: Implement NewIntOptional
// Create an IntOptional with a present value
// Hint: Allocate pointer with &value, set o.value = ptr
func NewIntOptional(value int) *IntOptional {
	// TODO: Implement
}

// TODO: Implement EmptyIntOptional
// Create an IntOptional with no value
// Hint: Return &IntOptional{value: nil}
func EmptyIntOptional() *IntOptional {
	// TODO: Implement
}

// TODO: Implement IsPresent for IntOptional
// Check if optional contains a value
// Hint: Return o.value != nil
func (o *IntOptional) IsPresent() bool {
	// TODO: Implement
}

// TODO: Implement Get for IntOptional
// Return value and true if present, otherwise 0 and false
// Hint: Check o.value != nil, return *o.value, true or 0, false
func (o *IntOptional) Get() (int, bool) {
	// TODO: Implement
}

// TODO: Implement OrElse for IntOptional
// Return value if present, otherwise return def
// Hint: if o.value != nil return *o.value, else return def
func (o *IntOptional) OrElse(def int) int {
	return 0 // TODO: Implement
}

// TODO: Implement Map for IntOptional
// Transform value if present, return new IntOptional
// Hint: Check IsPresent(), if true apply fn and return NewIntOptional(result), else return EmptyIntOptional()
func (o *IntOptional) Map(fn func(int) int) *IntOptional {
	// TODO: Implement
}

// TODO: Implement NewStringOptional
// Create a StringOptional with a present value
// Hint: Same pattern as NewIntOptional but with string
func NewStringOptional(value string) *StringOptional {
	// TODO: Implement
}

// TODO: Implement EmptyStringOptional
// Create a StringOptional with no value
// Hint: Return &StringOptional{value: nil}
func EmptyStringOptional() *StringOptional {
	// TODO: Implement
}

// TODO: Implement IsPresent for StringOptional
// Check if optional contains a value
// Hint: Return o.value != nil
func (o *StringOptional) IsPresent() bool {
	// TODO: Implement
}

// TODO: Implement Get for StringOptional
// Return value and true if present, otherwise empty string and false
// Hint: Check o.value != nil, return *o.value, true or "", false
func (o *StringOptional) Get() (string, bool) {
	// TODO: Implement
}

// TODO: Implement OrElse for StringOptional
// Return value if present, otherwise return def
// Hint: if o.value != nil return *o.value, else return def
func (o *StringOptional) OrElse(def string) string {
	return "" // TODO: Implement
}

// TODO: Implement Filter for StringOptional
// Return optional if present and predicate passes, otherwise empty
// Hint: Check IsPresent() and predicate(*o.value), return this or EmptyStringOptional()
func (o *StringOptional) Filter(predicate func(string) bool) *StringOptional {
	// TODO: Implement
}`,
	solutionCode: `package pointersx

type IntOptional struct {
	value *int // internal pointer stores the wrapped integer or nil for absence
}

type StringOptional struct {
	value *string // internal pointer stores the wrapped string or nil for absence
}

func NewIntOptional(value int) *IntOptional {
	return &IntOptional{value: &value} // allocate int on heap and wrap in optional
}

func EmptyIntOptional() *IntOptional {
	return &IntOptional{value: nil} // create optional with nil pointer to signal absence
}

func (o *IntOptional) IsPresent() bool {
	return o != nil && o.value != nil // check both optional wrapper and internal value exist
}

func (o *IntOptional) Get() (int, bool) {
	if !o.IsPresent() { // guard against absent value
		return 0, false // return zero value as safe default
	}
	return *o.value, true // dereference to extract actual integer with success flag
}

func (o *IntOptional) OrElse(def int) int {
	if !o.IsPresent() { // detect absent value scenario
		return def // substitute caller-provided default
	}
	return *o.value // extract present value through pointer indirection
}

func (o *IntOptional) Map(fn func(int) int) *IntOptional {
	if !o.IsPresent() { // cannot transform absent value
		return EmptyIntOptional() // propagate emptiness through transformation chain
	}
	transformed := fn(*o.value) // apply transformation function to unwrapped value
	return NewIntOptional(transformed) // wrap transformed result in new optional
}

func NewStringOptional(value string) *StringOptional {
	return &StringOptional{value: &value} // heap-allocate string and encapsulate in optional
}

func EmptyStringOptional() *StringOptional {
	return &StringOptional{value: nil} // construct empty optional with nil pointer
}

func (o *StringOptional) IsPresent() bool {
	return o != nil && o.value != nil // verify both wrapper and value pointer are valid
}

func (o *StringOptional) Get() (string, bool) {
	if !o.IsPresent() { // handle missing value case
		return "", false // return empty string with failure indicator
	}
	return *o.value, true // retrieve string through dereference with success flag
}

func (o *StringOptional) OrElse(def string) string {
	if !o.IsPresent() { // value is absent
		return def // provide fallback string
	}
	return *o.value // extract the present string value
}

func (o *StringOptional) Filter(predicate func(string) bool) *StringOptional {
	if !o.IsPresent() { // empty optional fails all filters
		return EmptyStringOptional() // maintain empty state
	}
	if predicate(*o.value) { // test unwrapped value against condition
		return o // predicate passed, keep current optional
	}
	return EmptyStringOptional() // predicate failed, convert to empty
}`,
	testCode: `package pointersx

import "testing"

func Test1(t *testing.T) {
	// IntOptional present
	opt := NewIntOptional(42)
	if !opt.IsPresent() {
		t.Error("expected present")
	}
	val, ok := opt.Get()
	if !ok || val != 42 {
		t.Errorf("expected 42, got %d", val)
	}
}

func Test2(t *testing.T) {
	// IntOptional empty
	opt := EmptyIntOptional()
	if opt.IsPresent() {
		t.Error("expected empty")
	}
	val := opt.OrElse(100)
	if val != 100 {
		t.Errorf("expected 100, got %d", val)
	}
}

func Test3(t *testing.T) {
	// IntOptional Map
	opt := NewIntOptional(10)
	doubled := opt.Map(func(x int) int { return x * 2 })
	if doubled.OrElse(0) != 20 {
		t.Errorf("expected 20, got %d", doubled.OrElse(0))
	}
}

func Test4(t *testing.T) {
	// IntOptional Map on empty
	opt := EmptyIntOptional()
	doubled := opt.Map(func(x int) int { return x * 2 })
	if doubled.IsPresent() {
		t.Error("expected empty after map on empty")
	}
}

func Test5(t *testing.T) {
	// StringOptional present
	opt := NewStringOptional("hello")
	if !opt.IsPresent() {
		t.Error("expected present")
	}
	val, ok := opt.Get()
	if !ok || val != "hello" {
		t.Errorf("expected hello, got %s", val)
	}
}

func Test6(t *testing.T) {
	// StringOptional empty
	opt := EmptyStringOptional()
	val := opt.OrElse("default")
	if val != "default" {
		t.Errorf("expected default, got %s", val)
	}
}

func Test7(t *testing.T) {
	// StringOptional Filter pass
	opt := NewStringOptional("Hello")
	filtered := opt.Filter(func(s string) bool { return len(s) > 3 })
	if !filtered.IsPresent() || filtered.OrElse("") != "Hello" {
		t.Error("expected filter to pass")
	}
}

func Test8(t *testing.T) {
	// StringOptional Filter fail
	opt := NewStringOptional("Hi")
	filtered := opt.Filter(func(s string) bool { return len(s) > 3 })
	if filtered.IsPresent() {
		t.Error("expected filter to fail")
	}
}

func Test9(t *testing.T) {
	// IntOptional chaining
	result := NewIntOptional(5).
		Map(func(x int) int { return x * 3 }).
		Map(func(x int) int { return x + 10 }).
		OrElse(0)
	if result != 25 {
		t.Errorf("expected 25, got %d", result)
	}
}

func Test10(t *testing.T) {
	// Nil receiver safety
	var opt *IntOptional = nil
	if opt.IsPresent() {
		t.Error("nil receiver should return false for IsPresent")
	}
	val := opt.OrElse(99)
	if val != 99 {
		t.Errorf("expected 99 for nil receiver, got %d", val)
	}
}`,
	hint1: `For constructors: NewIntOptional needs to allocate value on heap with &value, then wrap it. EmptyIntOptional returns struct with nil pointer. For IsPresent: check o != nil && o.value != nil. For Get: return (*o.value, true) if present, else (0, false).`,
	hint2: `For Map: Check IsPresent() first. If empty, return EmptyIntOptional(). If present, apply fn(*o.value) to get result, then return NewIntOptional(result). For Filter: Check IsPresent() and predicate(*o.value). If both true, return o (self). Otherwise return EmptyStringOptional().`,
	whyItMatters: `The Optional pattern is a fundamental design pattern that eliminates null pointer errors and makes code more explicit about the possibility of missing values, leading to safer and more maintainable applications.

**Why Optional Pattern Matters:**

**1. Production Incident: Billion-Dollar Mistake**

Tony Hoare, inventor of null references, called it his "billion-dollar mistake" because of countless bugs and crashes caused by null pointer exceptions.

\`\`\`go
// DANGEROUS - implicit nil handling
func GetUserEmail(id int) string {
    user := db.FindUser(id)
    return user.Email  // PANIC if user is nil!
}

// SAFE - explicit optional pattern
func GetUserEmail(id int) *StringOptional {
    user := db.FindUser(id)
    if user == nil {
        return EmptyStringOptional()
    }
    return NewStringOptional(user.Email)
}

// Usage forces explicit handling
email := GetUserEmail(123).OrElse("noreply@example.com")
\`\`\`

**Impact**: Makes absence explicit in type signature. Compiler/reader knows value might be missing.

**2. Real-World Example: AWS SDK**

AWS SDK for Go uses pointer fields extensively to represent optional API parameters:

\`\`\`go
// AWS S3 PutObject input
type PutObjectInput struct {
    Bucket              *string  // Required
    Key                 *string  // Required
    Body                io.Reader
    ContentType         *string  // Optional
    CacheControl        *string  // Optional
    ContentDisposition  *string  // Optional
    Metadata            map[string]*string  // Optional
}

// With Optional pattern
input := &PutObjectInput{
    Bucket:      NewStringOptional("my-bucket"),
    Key:         NewStringOptional("file.txt"),
    ContentType: NewStringOptional("text/plain"),
}

// AWS checks presence before including in request
if input.ContentType.IsPresent() {
    req.Header.Set("Content-Type", input.ContentType.OrElse(""))
}
\`\`\`

**3. Database NULL Handling**

SQL NULL values map naturally to Optional pattern:

\`\`\`go
type User struct {
    ID       int
    Name     string
    Email    *StringOptional  // NULL-able column
    Phone    *StringOptional  // NULL-able column
    Age      *IntOptional     // NULL-able column
}

// Query with NULL handling
func GetUser(id int) (*User, error) {
    row := db.QueryRow("SELECT id, name, email, phone, age FROM users WHERE id = ?", id)

    var user User
    var email, phone sql.NullString
    var age sql.NullInt64

    err := row.Scan(&user.ID, &user.Name, &email, &phone, &age)

    // Convert sql.Null* to Optional
    if email.Valid {
        user.Email = NewStringOptional(email.String)
    } else {
        user.Email = EmptyStringOptional()
    }

    if phone.Valid {
        user.Phone = NewStringOptional(phone.String)
    } else {
        user.Phone = EmptyStringOptional()
    }

    if age.Valid {
        user.Age = NewIntOptional(int(age.Int64))
    } else {
        user.Age = EmptyIntOptional()
    }

    return &user, err
}

// Usage with defaults
user, _ := GetUser(123)
displayEmail := user.Email.OrElse("Not provided")
displayPhone := user.Phone.OrElse("Not provided")
displayAge := user.Age.OrElse(0)
\`\`\`

**4. Map Transformation: Functional Chaining**

Map allows transforming optional values without explicit nil checks:

\`\`\`go
// Without Optional - verbose
var finalPrice float64
if pricePtr != nil {
    price := *pricePtr
    withTax := price * 1.1
    withDiscount := withTax * 0.9
    finalPrice = withDiscount
} else {
    finalPrice = 0.0
}

// With Optional - clean
finalPrice := NewFloatOptional(basePrice).
    Map(func(p float64) float64 { return p * 1.1 }).    // Add tax
    Map(func(p float64) float64 { return p * 0.9 }).    // Apply discount
    OrElse(0.0)

// Real example: API response transformation
type APIResponse struct {
    Data *UserData
}

func GetUserAge(resp APIResponse) int {
    return NewOptional(resp.Data).
        Map(func(d *UserData) int { return d.Age }).
        Filter(func(age int) bool { return age > 0 }).
        OrElse(18)  // Default age
}
\`\`\`

**5. Filter: Conditional Validation**

Filter pattern combines presence check with validation:

\`\`\`go
// Email validation
func ValidateEmail(input string) *StringOptional {
    opt := NewStringOptional(input)
    return opt.Filter(func(s string) bool {
        return strings.Contains(s, "@") && len(s) > 3
    })
}

email := ValidateEmail("user@example.com").OrElse("invalid@example.com")

// Age validation
func ValidateAge(input int) *IntOptional {
    opt := NewIntOptional(input)
    return opt.Filter(func(age int) bool {
        return age >= 0 && age <= 150
    })
}

age := ValidateAge(25).OrElse(0)   // 25
age = ValidateAge(-5).OrElse(0)    // 0 (filtered out)
age = ValidateAge(200).OrElse(0)   // 0 (filtered out)
\`\`\`

**6. Configuration Management**

Optional pattern is perfect for configuration with defaults:

\`\`\`go
type ServerConfig struct {
    Port         *IntOptional
    Host         *StringOptional
    Timeout      *IntOptional
    MaxConns     *IntOptional
    EnableHTTPS  *BoolOptional
}

func LoadConfig(file string) *ServerConfig {
    cfg := &ServerConfig{}

    // Load from file, environment, etc.
    if portStr := os.Getenv("PORT"); portStr != "" {
        if port, err := strconv.Atoi(portStr); err == nil {
            cfg.Port = NewIntOptional(port)
        }
    }

    if host := os.Getenv("HOST"); host != "" {
        cfg.Host = NewStringOptional(host)
    }

    return cfg
}

func NewServer(cfg *ServerConfig) *Server {
    return &Server{
        port:        cfg.Port.OrElse(8080),
        host:        cfg.Host.OrElse("localhost"),
        timeout:     cfg.Timeout.OrElse(30),
        maxConns:    cfg.MaxConns.OrElse(100),
        enableHTTPS: cfg.EnableHTTPS.OrElse(false),
    }
}
\`\`\`

**7. Comparison with Other Languages**

**Rust Option<T>:**
\`\`\`rust
let some_number = Some(5);
let no_number: Option<i32> = None;

let result = some_number.map(|x| x * 2).unwrap_or(0);
\`\`\`

**Java Optional<T>:**
\`\`\`java
Optional<String> opt = Optional.of("hello");
Optional<String> empty = Optional.empty();

String result = opt.map(String::toUpperCase).orElse("default");
\`\`\`

**Kotlin Nullable:**
\`\`\`kotlin
val nullable: String? = "hello"
val result = nullable?.uppercase() ?: "default"
\`\`\`

Go's approach with pointers is similar but requires manual pattern implementation.

**8. Performance Considerations**

\`\`\`go
// Memory layout
type IntOptional struct {
    value *int  // 8 bytes (pointer)
}

// Heap allocation for each value
opt := NewIntOptional(42)  // Allocates int on heap

// Alternative: embed value (more efficient but different semantics)
type IntOptionalValue struct {
    value   int
    present bool  // 1 byte (+ padding)
}
\`\`\`

**Trade-offs:**
- Pointer approach: Consistent semantics, slightly slower
- Value+bool approach: Faster, but different memory model
- For production: Consider value approach for hot paths

**9. Type-Safe Error Handling**

Optional pattern complements error handling:

\`\`\`go
// Return optional instead of error for expected absence
func FindUser(id int) (*UserOptional, error) {
    user, err := db.QueryUser(id)
    if err != nil {
        return nil, err  // Unexpected error
    }
    if user == nil {
        return EmptyUserOptional(), nil  // Expected absence
    }
    return NewUserOptional(user), nil
}

// Usage distinguishes absence from error
opt, err := FindUser(123)
if err != nil {
    log.Fatal("Database error:", err)
}

if !opt.IsPresent() {
    fmt.Println("User not found (expected)")
}
\`\`\`

**10. Common Mistakes**

**Mistake 1: Not checking nil optional**
\`\`\`go
// WRONG
func Process(opt *IntOptional) {
    value := opt.OrElse(0)  // PANIC if opt is nil!
}

// RIGHT
func Process(opt *IntOptional) {
    if opt == nil {
        opt = EmptyIntOptional()
    }
    value := opt.OrElse(0)
}
\`\`\`

**Mistake 2: Over-using Optional**
\`\`\`go
// WRONG - too much wrapping
func Add(a, b *IntOptional) *IntOptional {
    if !a.IsPresent() || !b.IsPresent() {
        return EmptyIntOptional()
    }
    return NewIntOptional(a.OrElse(0) + b.OrElse(0))
}

// RIGHT - use regular values
func Add(a, b int) int {
    return a + b
}
\`\`\`

**When NOT to use Optional:**
- Function parameters (use regular types + error)
- Return values that are always present
- Performance-critical code (adds overhead)
- Simple internal functions

**When TO use Optional:**
- Configuration with defaults
- Database nullable columns
- API optional parameters
- Optional struct fields
- Transformation pipelines

**Key Takeaways:**
- Optional pattern makes absence explicit in types
- Eliminates null pointer exceptions at design level
- Supports functional programming patterns (map, filter)
- Used extensively in modern languages (Rust, Java, Kotlin)
- Go uses pointers to simulate optional semantics
- Trade-off between type safety and performance
- Best for public APIs and configuration management`,
	order: 3,
	translations: {
		ru: {
			title: 'Паттерн Optional типа с указателями',
			description: `Освойте паттерн Optional/Nullable в Go, реализовав generic-style Optional тип с использованием указателей для представления наличия или отсутствия значений, аналогично Rust's Option<T> или Java's Optional<T>.

**Вы реализуете:**

1. **IntOptional** тип и методы:
   1.1. **NewIntOptional(value int) *IntOptional** - Создать присутствующий optional
   1.2. **EmptyIntOptional() *IntOptional** - Создать пустой optional
   1.3. **IsPresent() bool** - Проверить существование значения
   1.4. **Get() (int, bool)** - Получить значение безопасно
   1.5. **OrElse(def int) int** - Получить значение или дефолт
   1.6. **Map(fn func(int) int) *IntOptional** - Трансформировать значение

2. **StringOptional** тип и методы:
   2.1. **NewStringOptional(value string) *StringOptional**
   2.2. **EmptyStringOptional() *StringOptional**
   2.3. **IsPresent() bool**
   2.4. **Get() (string, bool)**
   2.5. **OrElse(def string) string**
   2.6. **Filter(predicate func(string) bool) *StringOptional**

**Ключевые концепции:**
- **Optional Pattern**: Типобезопасная обработка null
- **Pointer-Based Presence**: Использование nil указателя для представления отсутствия
- **Method Chaining**: Дизайн fluent API
- **Higher-Order Functions**: Map, Filter операции
- **Defensive Programming**: Безопасное извлечение значений
- **Functional Programming**: Монадические операции

**Пример использования:**
\`\`\`go
// Создать присутствующий optional
opt := NewIntOptional(42)
if opt.IsPresent() {
    value, _ := opt.Get()
    fmt.Println(value)  // 42
}

// Создать пустой optional
empty := EmptyIntOptional()
value := empty.OrElse(100)  // 100

// Map трансформация
opt = NewIntOptional(10)
doubled := opt.Map(func(x int) int { return x * 2 })
result := doubled.OrElse(0)  // 20

// Цепочка операций
opt = NewIntOptional(5)
result = opt.Map(func(x int) int { return x * 3 }).
    Map(func(x int) int { return x + 10 }).
    OrElse(0)  // 25

// String optional с filter
opt2 := NewStringOptional("Hello")
filtered := opt2.Filter(func(s string) bool {
    return len(s) > 3
})
result2 := filtered.OrElse("default")  // "Hello"

opt2 = NewStringOptional("Hi")
filtered = opt2.Filter(func(s string) bool {
    return len(s) > 3
})
result2 = filtered.OrElse("default")  // "default"
\`\`\`

**Ограничения:**
- Используйте pointer поля для представления присутствия/отсутствия
- Пустой optional должен иметь nil указатель внутри
- Все методы должны быть nil-безопасными (обрабатывать пустые optionals)
- Map должен возвращать пустой optional если оригинал пуст
- Filter должен возвращать пустой если предикат не прошёл или optional пуст`,
			hint1: `Для конструкторов: NewIntOptional нужно выделить значение на heap с &value, затем обернуть его. EmptyIntOptional возвращает структуру с nil указателем. Для IsPresent: проверьте o != nil && o.value != nil. Для Get: верните (*o.value, true) если присутствует, иначе (0, false).`,
			hint2: `Для Map: Сначала проверьте IsPresent(). Если пусто, верните EmptyIntOptional(). Если присутствует, примените fn(*o.value) чтобы получить результат, затем верните NewIntOptional(result). Для Filter: Проверьте IsPresent() и predicate(*o.value). Если оба true, верните o (self). Иначе верните EmptyStringOptional().`,
			whyItMatters: `Паттерн Optional — фундаментальный паттерн проектирования, который устраняет ошибки null pointer и делает код более явным относительно возможности отсутствующих значений, приводя к более безопасным и поддерживаемым приложениям.

**Почему паттерн Optional важен:**

**1. Инцидент в продакшене: Ошибка на миллиард долларов**

Тони Хоар, изобретатель null ссылок, назвал это своей "ошибкой на миллиард долларов" из-за бесчисленных багов и падений вызванных null pointer exceptions.

\`\`\`go
// ОПАСНО - неявная обработка nil
func GetUserEmail(id int) string {
    user := db.FindUser(id)
    return user.Email  // ПАНИКА если user равен nil!
}

// БЕЗОПАСНО - явный паттерн optional
func GetUserEmail(id int) *StringOptional {
    user := db.FindUser(id)
    if user == nil {
        return EmptyStringOptional()
    }
    return NewStringOptional(user.Email)
}

// Использование принуждает к явной обработке
email := GetUserEmail(123).OrElse("noreply@example.com")
\`\`\`

**Влияние**: Делает отсутствие явным в сигнатуре типа. Компилятор/читатель знает что значение может отсутствовать.

**2. Реальный пример: AWS SDK**

AWS SDK для Go широко использует указатель поля для представления опциональных API параметров:

\`\`\`go
// AWS S3 PutObject input
type PutObjectInput struct {
    Bucket              *string  // Обязательное
    Key                 *string  // Обязательное
    Body                io.Reader
    ContentType         *string  // Опциональное
    CacheControl        *string  // Опциональное
    ContentDisposition  *string  // Опциональное
    Metadata            map[string]*string  // Опциональное
}

// С паттерном Optional
input := &PutObjectInput{
    Bucket:      NewStringOptional("my-bucket"),
    Key:         NewStringOptional("file.txt"),
    ContentType: NewStringOptional("text/plain"),
}

// AWS проверяет наличие перед включением в запрос
if input.ContentType.IsPresent() {
    req.Header.Set("Content-Type", input.ContentType.OrElse(""))
}
\`\`\`

**3. Обработка NULL в базе данных**

SQL NULL значения естественно отображаются на паттерн Optional:

\`\`\`go
type User struct {
    ID       int
    Name     string
    Email    *StringOptional  // NULL-able колонка
    Phone    *StringOptional  // NULL-able колонка
    Age      *IntOptional     // NULL-able колонка
}

// Запрос с обработкой NULL
func GetUser(id int) (*User, error) {
    row := db.QueryRow("SELECT id, name, email, phone, age FROM users WHERE id = ?", id)

    var user User
    var email, phone sql.NullString
    var age sql.NullInt64

    err := row.Scan(&user.ID, &user.Name, &email, &phone, &age)

    // Конвертировать sql.Null* в Optional
    if email.Valid {
        user.Email = NewStringOptional(email.String)
    } else {
        user.Email = EmptyStringOptional()
    }

    if phone.Valid {
        user.Phone = NewStringOptional(phone.String)
    } else {
        user.Phone = EmptyStringOptional()
    }

    if age.Valid {
        user.Age = NewIntOptional(int(age.Int64))
    } else {
        user.Age = EmptyIntOptional()
    }

    return &user, err
}

// Использование с дефолтами
user, _ := GetUser(123)
displayEmail := user.Email.OrElse("Не указано")
displayPhone := user.Phone.OrElse("Не указано")
displayAge := user.Age.OrElse(0)
\`\`\`

**4. Map трансформация: Функциональное связывание**

Map позволяет трансформировать опциональные значения без явных nil проверок:

\`\`\`go
// Без Optional - многословно
var finalPrice float64
if pricePtr != nil {
    price := *pricePtr
    withTax := price * 1.1
    withDiscount := withTax * 0.9
    finalPrice = withDiscount
} else {
    finalPrice = 0.0
}

// С Optional - чисто
finalPrice := NewFloatOptional(basePrice).
    Map(func(p float64) float64 { return p * 1.1 }).    // Добавить налог
    Map(func(p float64) float64 { return p * 0.9 }).    // Применить скидку
    OrElse(0.0)

// Реальный пример: трансформация API ответа
type APIResponse struct {
    Data *UserData
}

func GetUserAge(resp APIResponse) int {
    return NewOptional(resp.Data).
        Map(func(d *UserData) int { return d.Age }).
        Filter(func(age int) bool { return age > 0 }).
        OrElse(18)  // Возраст по умолчанию
}
\`\`\`

**5. Filter: Условная валидация**

Паттерн Filter комбинирует проверку наличия с валидацией:

\`\`\`go
// Валидация email
func ValidateEmail(input string) *StringOptional {
    opt := NewStringOptional(input)
    return opt.Filter(func(s string) bool {
        return strings.Contains(s, "@") && len(s) > 3
    })
}

email := ValidateEmail("user@example.com").OrElse("invalid@example.com")

// Валидация возраста
func ValidateAge(input int) *IntOptional {
    opt := NewIntOptional(input)
    return opt.Filter(func(age int) bool {
        return age >= 0 && age <= 150
    })
}

age := ValidateAge(25).OrElse(0)   // 25
age = ValidateAge(-5).OrElse(0)    // 0 (отфильтровано)
age = ValidateAge(200).OrElse(0)   // 0 (отфильтровано)
\`\`\`

**6. Управление конфигурацией**

Паттерн Optional идеален для конфигурации с дефолтами:

\`\`\`go
type ServerConfig struct {
    Port         *IntOptional
    Host         *StringOptional
    Timeout      *IntOptional
    MaxConns     *IntOptional
    EnableHTTPS  *BoolOptional
}

func LoadConfig(file string) *ServerConfig {
    cfg := &ServerConfig{}

    // Загрузить из файла, окружения и т.д.
    if portStr := os.Getenv("PORT"); portStr != "" {
        if port, err := strconv.Atoi(portStr); err == nil {
            cfg.Port = NewIntOptional(port)
        }
    }

    if host := os.Getenv("HOST"); host != "" {
        cfg.Host = NewStringOptional(host)
    }

    return cfg
}

func NewServer(cfg *ServerConfig) *Server {
    return &Server{
        port:        cfg.Port.OrElse(8080),
        host:        cfg.Host.OrElse("localhost"),
        timeout:     cfg.Timeout.OrElse(30),
        maxConns:    cfg.MaxConns.OrElse(100),
        enableHTTPS: cfg.EnableHTTPS.OrElse(false),
    }
}
\`\`\`

**7. Типобезопасная обработка ошибок**

Паттерн Optional дополняет обработку ошибок:

\`\`\`go
// Возвращать optional вместо ошибки для ожидаемого отсутствия
func FindUser(id int) (*UserOptional, error) {
    user, err := db.QueryUser(id)
    if err != nil {
        return nil, err  // Неожиданная ошибка
    }
    if user == nil {
        return EmptyUserOptional(), nil  // Ожидаемое отсутствие
    }
    return NewUserOptional(user), nil
}

// Использование различает отсутствие от ошибки
opt, err := FindUser(123)
if err != nil {
    log.Fatal("Ошибка БД:", err)
}

if !opt.IsPresent() {
    fmt.Println("Пользователь не найден (ожидаемо)")
}
\`\`\`

**8. Распространённые ошибки**

**Ошибка 1: Не проверять nil optional**
\`\`\`go
// НЕПРАВИЛЬНО
func Process(opt *IntOptional) {
    value := opt.OrElse(0)  // ПАНИКА если opt равен nil!
}

// ПРАВИЛЬНО
func Process(opt *IntOptional) {
    if opt == nil {
        opt = EmptyIntOptional()
    }
    value := opt.OrElse(0)
}
\`\`\`

**Ошибка 2: Чрезмерное использование Optional**
\`\`\`go
// НЕПРАВИЛЬНО - слишком много оборачивания
func Add(a, b *IntOptional) *IntOptional {
    if !a.IsPresent() || !b.IsPresent() {
        return EmptyIntOptional()
    }
    return NewIntOptional(a.OrElse(0) + b.OrElse(0))
}

// ПРАВИЛЬНО - использовать обычные значения
func Add(a, b int) int {
    return a + b
}
\`\`\`

**Когда НЕ использовать Optional:**
- Параметры функций (используйте обычные типы + error)
- Возвращаемые значения которые всегда присутствуют
- Критичный по производительности код (добавляет накладные расходы)
- Простые внутренние функции

**Когда использовать Optional:**
- Конфигурация с дефолтами
- NULL-able колонки базы данных
- Опциональные API параметры
- Опциональные поля структур
- Конвейеры трансформаций

**Ключевые выводы:**
- Optional паттерн делает отсутствие явным в типах
- Устраняет null pointer exceptions на уровне проектирования
- Поддерживает паттерны функционального программирования (map, filter)
- Широко используется в современных языках (Rust, Java, Kotlin)
- Go использует указатели для имитации optional семантики
- Компромисс между типобезопасностью и производительностью
- Лучше всего для публичных API и управления конфигурацией`,
			solutionCode: `package pointersx

type IntOptional struct {
	value *int // внутренний указатель хранит обёрнутое целое число или nil для отсутствия
}

type StringOptional struct {
	value *string // внутренний указатель хранит обёрнутую строку или nil для отсутствия
}

func NewIntOptional(value int) *IntOptional {
	return &IntOptional{value: &value} // выделяем int на heap и оборачиваем в optional
}

func EmptyIntOptional() *IntOptional {
	return &IntOptional{value: nil} // создаём optional с nil указателем для сигнала отсутствия
}

func (o *IntOptional) IsPresent() bool {
	return o != nil && o.value != nil // проверяем что и обёртка optional и внутреннее значение существуют
}

func (o *IntOptional) Get() (int, bool) {
	if !o.IsPresent() { // защита от отсутствующего значения
		return 0, false // возвращаем нулевое значение как безопасный дефолт
	}
	return *o.value, true // разыменовываем для извлечения фактического целого с флагом успеха
}

func (o *IntOptional) OrElse(def int) int {
	if !o.IsPresent() { // обнаруживаем сценарий отсутствующего значения
		return def // подставляем предоставленный вызывающей стороной дефолт
	}
	return *o.value // извлекаем присутствующее значение через косвенность указателя
}

func (o *IntOptional) Map(fn func(int) int) *IntOptional {
	if !o.IsPresent() { // невозможно трансформировать отсутствующее значение
		return EmptyIntOptional() // распространяем пустоту через цепочку трансформаций
	}
	transformed := fn(*o.value) // применяем функцию трансформации к распакованному значению
	return NewIntOptional(transformed) // оборачиваем трансформированный результат в новый optional
}

func NewStringOptional(value string) *StringOptional {
	return &StringOptional{value: &value} // выделяем строку на heap и инкапсулируем в optional
}

func EmptyStringOptional() *StringOptional {
	return &StringOptional{value: nil} // конструируем пустой optional с nil указателем
}

func (o *StringOptional) IsPresent() bool {
	return o != nil && o.value != nil // проверяем что и обёртка и указатель значения валидны
}

func (o *StringOptional) Get() (string, bool) {
	if !o.IsPresent() { // обрабатываем случай отсутствующего значения
		return "", false // возвращаем пустую строку с индикатором неудачи
	}
	return *o.value, true // получаем строку через разыменование с флагом успеха
}

func (o *StringOptional) OrElse(def string) string {
	if !o.IsPresent() { // значение отсутствует
		return def // предоставляем запасную строку
	}
	return *o.value // извлекаем присутствующее строковое значение
}

func (o *StringOptional) Filter(predicate func(string) bool) *StringOptional {
	if !o.IsPresent() { // пустой optional не проходит все фильтры
		return EmptyStringOptional() // поддерживаем пустое состояние
	}
	if predicate(*o.value) { // тестируем распакованное значение против условия
		return o // предикат прошёл, сохраняем текущий optional
	}
	return EmptyStringOptional() // предикат не прошёл, конвертируем в пустой
}`
		},
		uz: {
			title: `Ko'rsatkichlar bilan Optional tip patterni`,
			description: `Rust ning Option<T> yoki Java ning Optional<T> ga o'xshash qiymatlarning mavjudligi yoki yo'qligini ko'rsatish uchun ko'rsatkichlardan foydalangan holda generic-style Optional tipini amalga oshirish orqali Go da Optional/Nullable patternini o'zlashtiring.

**Siz amalga oshirasiz:**

1. **IntOptional** tipi va metodlar:
   1.1. **NewIntOptional(value int) *IntOptional** - Mavjud optionalni yaratish
   1.2. **EmptyIntOptional() *IntOptional** - Bo'sh optionalni yaratish
   1.3. **IsPresent() bool** - Qiymat mavjudligini tekshirish
   1.4. **Get() (int, bool)** - Qiymatni xavfsiz olish
   1.5. **OrElse(def int) int** - Qiymatni yoki defaultni olish
   1.6. **Map(fn func(int) int) *IntOptional** - Qiymatni transformatsiya qilish

2. **StringOptional** tipi va metodlar:
   2.1. **NewStringOptional(value string) *StringOptional**
   2.2. **EmptyStringOptional() *StringOptional**
   2.3. **IsPresent() bool**
   2.4. **Get() (string, bool)**
   2.5. **OrElse(def string) string**
   2.6. **Filter(predicate func(string) bool) *StringOptional**

**Asosiy tushunchalar:**
- **Optional Pattern**: Tip-xavfsiz null bilan ishlash
- **Pointer-Based Presence**: Yo'qlikni ifodalash uchun nil ko'rsatkichdan foydalanish
- **Method Chaining**: Fluent API dizayni
- **Higher-Order Functions**: Map, Filter operatsiyalari
- **Defensive Programming**: Xavfsiz qiymat chiqarish
- **Functional Programming**: Monadik operatsiyalar

**Foydalanish misoli:**
\`\`\`go
// Mavjud optionalni yaratish
opt := NewIntOptional(42)
if opt.IsPresent() {
    value, _ := opt.Get()
    fmt.Println(value)  // 42
}

// Bo'sh optionalni yaratish
empty := EmptyIntOptional()
value := empty.OrElse(100)  // 100

// Map transformatsiyasi
opt = NewIntOptional(10)
doubled := opt.Map(func(x int) int { return x * 2 })
result := doubled.OrElse(0)  // 20

// Operatsiyalar zanjiri
opt = NewIntOptional(5)
result = opt.Map(func(x int) int { return x * 3 }).
    Map(func(x int) int { return x + 10 }).
    OrElse(0)  // 25

// Filter bilan String optional
opt2 := NewStringOptional("Hello")
filtered := opt2.Filter(func(s string) bool {
    return len(s) > 3
})
result2 := filtered.OrElse("default")  // "Hello"

opt2 = NewStringOptional("Hi")
filtered = opt2.Filter(func(s string) bool {
    return len(s) > 3
})
result2 = filtered.OrElse("default")  // "default"
\`\`\`

**Cheklovlar:**
- Mavjudlik/yo'qlikni ifodalash uchun pointer maydonlaridan foydalaning
- Bo'sh optional ichki nil ko'rsatkichga ega bo'lishi kerak
- Barcha metodlar nil-xavfsiz bo'lishi kerak (bo'sh optionallarni qayta ishlash)
- Agar asl bo'sh bo'lsa, Map bo'sh optional qaytarishi kerak
- Agar predikat o'tmasa yoki optional bo'sh bo'lsa, Filter bo'sh qaytarishi kerak`,
			hint1: `Konstruktorlar uchun: NewIntOptional qiymatni &value bilan heap da ajratishi kerak, keyin uni o'rash. EmptyIntOptional nil ko'rsatkichli strukturani qaytaradi. IsPresent uchun: o != nil && o.value != nil ni tekshiring. Get uchun: agar mavjud bo'lsa (*o.value, true) ni qaytaring, aks holda (0, false).`,
			hint2: `Map uchun: Avval IsPresent() ni tekshiring. Agar bo'sh bo'lsa, EmptyIntOptional() ni qaytaring. Agar mavjud bo'lsa, natijani olish uchun fn(*o.value) ni qo'llang, keyin NewIntOptional(result) ni qaytaring. Filter uchun: IsPresent() va predicate(*o.value) ni tekshiring. Agar ikkisi ham true bo'lsa, o (self) ni qaytaring. Aks holda EmptyStringOptional() ni qaytaring.`,
			whyItMatters: `Optional pattern asosiy dizayn patterni bo'lib, u null pointer xatolarini yo'q qiladi va qiymatlarning yo'qligi ehtimoli haqida kodni yanada aniq qiladi, bu esa xavfsizroq va qo'llab-quvvatlanadigan ilovalarga olib keladi.

**Nima uchun Optional pattern muhim:**

**1. Ishlab chiqarishdagi hodisa: Milliard dollarlik xato**

Null havolalarning ixtirochisi Toni Xoar buni o'zining "milliard dollarlik xatosi" deb atadi, chunki null pointer exceptionlar sabab bo'lgan son-sanoqsiz xatolar va ishdan chiqishlar.

\`\`\`go
// XAVFLI - yashirin nil bilan ishlash
func GetUserEmail(id int) string {
    user := db.FindUser(id)
    return user.Email  // user nil bo'lsa PANIC!
}

// XAVFSIZ - aniq optional pattern
func GetUserEmail(id int) *StringOptional {
    user := db.FindUser(id)
    if user == nil {
        return EmptyStringOptional()
    }
    return NewStringOptional(user.Email)
}

// Foydalanish aniq qayta ishlashni majbur qiladi
email := GetUserEmail(123).OrElse("noreply@example.com")
\`\`\`

**Ta'siri**: Yo'qlikni tip imzosida aniq qiladi. Kompilyator/o'quvchi qiymat yo'q bo'lishi mumkinligini biladi.

**2. Haqiqiy misol: AWS SDK**

Go uchun AWS SDK ixtiyoriy API parametrlarini ifodalash uchun ko'rsatkich maydonlaridan keng foydalanadi:

\`\`\`go
// AWS S3 PutObject input
type PutObjectInput struct {
    Bucket              *string  // Majburiy
    Key                 *string  // Majburiy
    Body                io.Reader
    ContentType         *string  // Ixtiyoriy
    CacheControl        *string  // Ixtiyoriy
    ContentDisposition  *string  // Ixtiyoriy
    Metadata            map[string]*string  // Ixtiyoriy
}

// Optional pattern bilan
input := &PutObjectInput{
    Bucket:      NewStringOptional("my-bucket"),
    Key:         NewStringOptional("file.txt"),
    ContentType: NewStringOptional("text/plain"),
}

// AWS so'rovga qo'shishdan oldin mavjudligini tekshiradi
if input.ContentType.IsPresent() {
    req.Header.Set("Content-Type", input.ContentType.OrElse(""))
}
\`\`\`

**3. Ma'lumotlar bazasida NULL bilan ishlash**

SQL NULL qiymatlari Optional patternga tabiiy mos keladi:

\`\`\`go
type User struct {
    ID       int
    Name     string
    Email    *StringOptional  // NULL bo'lishi mumkin bo'lgan ustun
    Phone    *StringOptional  // NULL bo'lishi mumkin bo'lgan ustun
    Age      *IntOptional     // NULL bo'lishi mumkin bo'lgan ustun
}

// NULL bilan ishlash bilan so'rov
func GetUser(id int) (*User, error) {
    row := db.QueryRow("SELECT id, name, email, phone, age FROM users WHERE id = ?", id)

    var user User
    var email, phone sql.NullString
    var age sql.NullInt64

    err := row.Scan(&user.ID, &user.Name, &email, &phone, &age)

    // sql.Null* ni Optional ga aylantirish
    if email.Valid {
        user.Email = NewStringOptional(email.String)
    } else {
        user.Email = EmptyStringOptional()
    }

    if phone.Valid {
        user.Phone = NewStringOptional(phone.String)
    } else {
        user.Phone = EmptyStringOptional()
    }

    if age.Valid {
        user.Age = NewIntOptional(int(age.Int64))
    } else {
        user.Age = EmptyIntOptional()
    }

    return &user, err
}

// Default qiymatlar bilan foydalanish
user, _ := GetUser(123)
displayEmail := user.Email.OrElse("Ko'rsatilmagan")
displayPhone := user.Phone.OrElse("Ko'rsatilmagan")
displayAge := user.Age.OrElse(0)
\`\`\`

**4. Map transformatsiyasi: Funksional bog'lanish**

Map ixtiyoriy qiymatlarni aniq nil tekshiruvsiz transformatsiya qilish imkonini beradi:

\`\`\`go
// Optional siz - ko'p so'zli
var finalPrice float64
if pricePtr != nil {
    price := *pricePtr
    withTax := price * 1.1
    withDiscount := withTax * 0.9
    finalPrice = withDiscount
} else {
    finalPrice = 0.0
}

// Optional bilan - toza
finalPrice := NewFloatOptional(basePrice).
    Map(func(p float64) float64 { return p * 1.1 }).    // Soliq qo'shish
    Map(func(p float64) float64 { return p * 0.9 }).    // Chegirma qo'llash
    OrElse(0.0)

// Haqiqiy misol: API javobini transformatsiya qilish
type APIResponse struct {
    Data *UserData
}

func GetUserAge(resp APIResponse) int {
    return NewOptional(resp.Data).
        Map(func(d *UserData) int { return d.Age }).
        Filter(func(age int) bool { return age > 0 }).
        OrElse(18)  // Default yosh
}
\`\`\`

**5. Filter: Shartli validatsiya**

Filter pattern mavjudlik tekshiruvini validatsiya bilan birlashtiradi:

\`\`\`go
// Email validatsiyasi
func ValidateEmail(input string) *StringOptional {
    opt := NewStringOptional(input)
    return opt.Filter(func(s string) bool {
        return strings.Contains(s, "@") && len(s) > 3
    })
}

email := ValidateEmail("user@example.com").OrElse("invalid@example.com")

// Yosh validatsiyasi
func ValidateAge(input int) *IntOptional {
    opt := NewIntOptional(input)
    return opt.Filter(func(age int) bool {
        return age >= 0 && age <= 150
    })
}

age := ValidateAge(25).OrElse(0)   // 25
age = ValidateAge(-5).OrElse(0)    // 0 (filtrlab tashlangan)
age = ValidateAge(200).OrElse(0)   // 0 (filtrlab tashlangan)
\`\`\`

**6. Konfiguratsiya boshqaruvi**

Optional pattern defaultlar bilan konfiguratsiya uchun ideal:

\`\`\`go
type ServerConfig struct {
    Port         *IntOptional
    Host         *StringOptional
    Timeout      *IntOptional
    MaxConns     *IntOptional
    EnableHTTPS  *BoolOptional
}

func LoadConfig(file string) *ServerConfig {
    cfg := &ServerConfig{}

    // Fayl, muhitdan va h.k. yuklash
    if portStr := os.Getenv("PORT"); portStr != "" {
        if port, err := strconv.Atoi(portStr); err == nil {
            cfg.Port = NewIntOptional(port)
        }
    }

    if host := os.Getenv("HOST"); host != "" {
        cfg.Host = NewStringOptional(host)
    }

    return cfg
}

func NewServer(cfg *ServerConfig) *Server {
    return &Server{
        port:        cfg.Port.OrElse(8080),
        host:        cfg.Host.OrElse("localhost"),
        timeout:     cfg.Timeout.OrElse(30),
        maxConns:    cfg.MaxConns.OrElse(100),
        enableHTTPS: cfg.EnableHTTPS.OrElse(false),
    }
}
\`\`\`

**7. Tip-xavfsiz xatolarni qayta ishlash**

Optional pattern xatolarni qayta ishlashni to'ldiradi:

\`\`\`go
// Kutilgan yo'qlik uchun xato o'rniga optional qaytarish
func FindUser(id int) (*UserOptional, error) {
    user, err := db.QueryUser(id)
    if err != nil {
        return nil, err  // Kutilmagan xato
    }
    if user == nil {
        return EmptyUserOptional(), nil  // Kutilgan yo'qlik
    }
    return NewUserOptional(user), nil
}

// Foydalanish yo'qlikni xatodan ajratadi
opt, err := FindUser(123)
if err != nil {
    log.Fatal("Ma'lumotlar bazasi xatosi:", err)
}

if !opt.IsPresent() {
    fmt.Println("Foydalanuvchi topilmadi (kutilgan)")
}
\`\`\`

**8. Keng tarqalgan xatolar**

**Xato 1: Nil optionalni tekshirmaslik**
\`\`\`go
// NOTO'G'RI
func Process(opt *IntOptional) {
    value := opt.OrElse(0)  // opt nil bo'lsa PANIC!
}

// TO'G'RI
func Process(opt *IntOptional) {
    if opt == nil {
        opt = EmptyIntOptional()
    }
    value := opt.OrElse(0)
}
\`\`\`

**Xato 2: Optional dan ortiqcha foydalanish**
\`\`\`go
// NOTO'G'RI - juda ko'p o'rash
func Add(a, b *IntOptional) *IntOptional {
    if !a.IsPresent() || !b.IsPresent() {
        return EmptyIntOptional()
    }
    return NewIntOptional(a.OrElse(0) + b.OrElse(0))
}

// TO'G'RI - oddiy qiymatlardan foydalanish
func Add(a, b int) int {
    return a + b
}
\`\`\`

**Qachon Optional ishlatMASLIK kerak:**
- Funksiya parametrlari (oddiy tiplar + error ishlating)
- Har doim mavjud bo'lgan qaytish qiymatlari
- Ishlash uchun muhim kod (overhead qo'shadi)
- Oddiy ichki funksiyalar

**Qachon Optional ishlatish kerak:**
- Defaultlar bilan konfiguratsiya
- Ma'lumotlar bazasi NULL bo'lishi mumkin bo'lgan ustunlari
- Ixtiyoriy API parametrlari
- Ixtiyoriy struktura maydonlari
- Transformatsiya konveyerlari

**Asosiy xulosalar:**
- Optional pattern tiplarda yo'qlikni aniq qiladi
- Dizayn darajasida null pointer exceptionlarni yo'q qiladi
- Funksional dasturlash patternlarini qo'llab-quvvatlaydi (map, filter)
- Zamonaviy tillarda keng qo'llaniladi (Rust, Java, Kotlin)
- Go optional semantikasini taqlid qilish uchun ko'rsatkichlardan foydalanadi
- Tip xavfsizligi va ishlash o'rtasida murosaga borish
- Ommaviy API va konfiguratsiya boshqaruvi uchun eng yaxshi`,
			solutionCode: `package pointersx

type IntOptional struct {
	value *int // ichki ko'rsatkich o'ralgan butun sonni yoki yo'qlik uchun nil ni saqlaydi
}

type StringOptional struct {
	value *string // ichki ko'rsatkich o'ralgan stringni yoki yo'qlik uchun nil ni saqlaydi
}

func NewIntOptional(value int) *IntOptional {
	return &IntOptional{value: &value} // heap da int ajratish va optional ga o'rash
}

func EmptyIntOptional() *IntOptional {
	return &IntOptional{value: nil} // yo'qlikni bildirish uchun nil ko'rsatkichli optional yaratish
}

func (o *IntOptional) IsPresent() bool {
	return o != nil && o.value != nil // optional o'rami va ichki qiymat mavjudligini tekshirish
}

func (o *IntOptional) Get() (int, bool) {
	if !o.IsPresent() { // yo'q qiymatdan himoyalanish
		return 0, false // xavfsiz default sifatida nol qiymatni qaytarish
	}
	return *o.value, true // muvaffaqiyat belgisi bilan haqiqiy butun sonni olish uchun dereference qilish
}

func (o *IntOptional) OrElse(def int) int {
	if !o.IsPresent() { // yo'q qiymat stsenariyini aniqlash
		return def // chaqiruvchi tomonidan taqdim etilgan defaultni almashtirish
	}
	return *o.value // ko'rsatkich bilvositasi orqali mavjud qiymatni olish
}

func (o *IntOptional) Map(fn func(int) int) *IntOptional {
	if !o.IsPresent() { // yo'q qiymatni transformatsiya qilib bo'lmaydi
		return EmptyIntOptional() // transformatsiya zanjiri orqali bo'shlikni tarqatish
	}
	transformed := fn(*o.value) // ochilgan qiymatga transformatsiya funksiyasini qo'llash
	return NewIntOptional(transformed) // transformatsiya qilingan natijani yangi optional ga o'rash
}

func NewStringOptional(value string) *StringOptional {
	return &StringOptional{value: &value} // heap da string ajratish va optional ga inkapsulyatsiya qilish
}

func EmptyStringOptional() *StringOptional {
	return &StringOptional{value: nil} // nil ko'rsatkichli bo'sh optional yaratish
}

func (o *StringOptional) IsPresent() bool {
	return o != nil && o.value != nil // o'ram va qiymat ko'rsatkichi yaroqli ekanligini tekshirish
}

func (o *StringOptional) Get() (string, bool) {
	if !o.IsPresent() { // yo'qolgan qiymat holatini qayta ishlash
		return "", false // muvaffaqiyatsizlik ko'rsatkichi bilan bo'sh string qaytarish
	}
	return *o.value, true // muvaffaqiyat belgisi bilan dereference orqali stringni olish
}

func (o *StringOptional) OrElse(def string) string {
	if !o.IsPresent() { // qiymat yo'q
		return def // zaxira stringni taqdim etish
	}
	return *o.value // mavjud string qiymatini olish
}

func (o *StringOptional) Filter(predicate func(string) bool) *StringOptional {
	if !o.IsPresent() { // bo'sh optional barcha filtrlardan o'tmaydi
		return EmptyStringOptional() // bo'sh holatni saqlash
	}
	if predicate(*o.value) { // ochilgan qiymatni shartga qarshi sinash
		return o // predikat o'tdi, joriy optionalni saqlash
	}
	return EmptyStringOptional() // predikat o'tmadi, bo'shga aylantirish
}`
		}
	}
};

export default task;
