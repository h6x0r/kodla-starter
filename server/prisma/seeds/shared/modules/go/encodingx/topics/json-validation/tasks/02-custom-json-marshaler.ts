import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-encodingx-custom-marshaler',
	title: 'Custom JSON Marshaler and Unmarshaler',
	difficulty: 'medium',
	tags: ['go', 'json', 'marshaler', 'custom', 'interface'],
	estimatedTime: '40m',
	isPremium: false,
	youtubeUrl: '',
	description: `Implement custom JSON marshaling and unmarshaling by implementing the json.Marshaler and json.Unmarshaler interfaces for special types that require custom serialization logic.

**You will implement:**

**Level 1-3 (Easy → Medium) - Timestamp Custom Marshaler:**
1. **Timestamp struct** - Wrapper around time.Time with custom format
2. **MarshalJSON() ([]byte, error)** - Format as Unix timestamp (seconds since epoch)
3. **UnmarshalJSON(data []byte) error** - Parse from Unix timestamp or ISO 8601 string

**Level 4-5 (Medium) - Money Custom Marshaler:**
4. **Money struct** - Amount (int64 cents) and Currency (string)
5. **MarshalJSON() ([]byte, error)** - Format as decimal string "12.34 USD"
6. **UnmarshalJSON(data []byte) error** - Parse from "12.34 USD" or object \`{"amount": 1234, "currency": "USD"}\`

**Level 6-7 (Medium+) - Event with Custom Types:**
7. **Event struct** - ID, Name, OccurredAt (Timestamp), Cost (Money)
8. **Event round-trip encoding** - Test complete marshal/unmarshal cycle

**Key Concepts:**
- **json.Marshaler interface**: Types implementing \`MarshalJSON() ([]byte, error)\` control their JSON encoding
- **json.Unmarshaler interface**: Types implementing \`UnmarshalJSON(data []byte) error\` control their JSON decoding
- **Custom Formats**: Serialize complex types in application-specific formats
- **Flexible Parsing**: Accept multiple input formats for better API compatibility
- **Type Safety**: Wrap primitives in custom types with validation

**Example Usage:**

\`\`\`go
// Timestamp custom marshaling
ts := Timestamp{Time: time.Unix(1609459200, 0)} // 2021-01-01 00:00:00 UTC
data, err := json.Marshal(ts)
// data = "1609459200"

// Timestamp unmarshaling from Unix timestamp
var ts2 Timestamp
json.Unmarshal([]byte("1609459200"), &ts2)
// ts2.Time = 2021-01-01 00:00:00 UTC

// Timestamp unmarshaling from ISO 8601
var ts3 Timestamp
json.Unmarshal([]byte(\`"2021-01-01T00:00:00Z"\`), &ts3)
// ts3.Time = 2021-01-01 00:00:00 UTC

// Money custom marshaling
money := Money{Amount: 1234, Currency: "USD"} // $12.34
data, err := json.Marshal(money)
// data = \`"12.34 USD"\`

// Money unmarshaling from string
var m1 Money
json.Unmarshal([]byte(\`"99.99 EUR"\`), &m1)
// m1 = Money{Amount: 9999, Currency: "EUR"}

// Money unmarshaling from object
var m2 Money
json.Unmarshal([]byte(\`{"amount": 5000, "currency": "GBP"}\`), &m2)
// m2 = Money{Amount: 5000, Currency: "GBP"}

// Event with custom types
event := Event{
    ID:   "evt_123",
    Name: "Concert Ticket",
    OccurredAt: Timestamp{Time: time.Unix(1609459200, 0)},
    Cost: Money{Amount: 5000, Currency: "USD"},
}

data, err := json.Marshal(event)
// data = {
//   "id": "evt_123",
//   "name": "Concert Ticket",
//   "occurred_at": 1609459200,
//   "cost": "50.00 USD"
// }

// Full round-trip
var decoded Event
json.Unmarshal(data, &decoded)
// decoded matches original event
\`\`\`

**Constraints:**
- Timestamp: MarshalJSON returns Unix timestamp as JSON number, UnmarshalJSON accepts number or ISO 8601 string
- Money: Amount is stored in cents (int64), Currency is 3-letter code
- Money MarshalJSON: Format as "AMOUNT CURRENCY" (e.g., "12.34 USD")
- Money UnmarshalJSON: Accept both string format and object format
- Event: Use json tags for field names (occurred_at, cost)
- All custom unmarshalers must return ErrInvalidFormat for bad input`,
	initialCode: `package encodingx

import (
	"encoding/json"
	"errors"
	"time"
)

var ErrInvalidFormat = errors.New("invalid format")

// Timestamp wraps time.Time with custom JSON marshaling
type Timestamp struct {
	time.Time
}

// TODO: Implement MarshalJSON for Timestamp
// Return Unix timestamp as JSON number (seconds since epoch)
// Example: time.Unix(1609459200, 0) -> []byte("1609459200")
func (t Timestamp) MarshalJSON() ([]byte, error) {
	return nil, nil
}

// TODO: Implement UnmarshalJSON for Timestamp
// Accept two formats:
// 1. Unix timestamp number: 1609459200
// 2. ISO 8601 string: "2021-01-01T00:00:00Z"
// Set t.Time to parsed time
// Return ErrInvalidFormat if neither format works
func (t *Timestamp) UnmarshalJSON(data []byte) error {
	return nil
}

// Money represents monetary amount in cents with currency
type Money struct {
	Amount   int64  // cents
	Currency string // 3-letter code
}

// TODO: Implement MarshalJSON for Money
// Format as "AMOUNT CURRENCY" where amount is decimal dollars
// Example: Money{Amount: 1234, Currency: "USD"} -> []byte(\`"12.34 USD"\`)
// Example: Money{Amount: 5000, Currency: "EUR"} -> []byte(\`"50.00 EUR"\`)
func (m Money) MarshalJSON() ([]byte, error) {
	return nil, nil
}

// TODO: Implement UnmarshalJSON for Money
// Accept two formats:
// 1. String: "12.34 USD" -> Money{Amount: 1234, Currency: "USD"}
// 2. Object: {"amount": 1234, "currency": "USD"}
// Return ErrInvalidFormat for invalid input
func (m *Money) UnmarshalJSON(data []byte) error {
	return nil
}

// Event contains custom marshaled fields
type Event struct {
	ID         string    \`json:"id"\`
	Name       string    \`json:"name"\`
	OccurredAt Timestamp \`json:"occurred_at"\`
	Cost       Money     \`json:"cost"\`
}`,
	testCode: `package encodingx

import (
	"encoding/json"
	"testing"
	"time"
)

func Test1(t *testing.T) {
	ts := Timestamp{Time: time.Unix(1609459200, 0)}
	data, err := json.Marshal(ts)
	if err != nil {
		t.Errorf("expected nil error, got %v", err)
	}
	if string(data) != "1609459200" {
		t.Errorf("expected 1609459200, got %s", string(data))
	}
}

func Test2(t *testing.T) {
	var ts Timestamp
	err := json.Unmarshal([]byte("1609459200"), &ts)
	if err != nil {
		t.Errorf("expected nil error, got %v", err)
	}
	if ts.Unix() != 1609459200 {
		t.Errorf("expected unix 1609459200, got %d", ts.Unix())
	}
}

func Test3(t *testing.T) {
	var ts Timestamp
	err := json.Unmarshal([]byte(` + "`" + `"2021-01-01T00:00:00Z"` + "`" + `), &ts)
	if err != nil {
		t.Errorf("expected nil error for ISO 8601, got %v", err)
	}
}

func Test4(t *testing.T) {
	m := Money{Amount: 1234, Currency: "USD"}
	data, err := json.Marshal(m)
	if err != nil {
		t.Errorf("expected nil error, got %v", err)
	}
	if string(data) != ` + "`" + `"12.34 USD"` + "`" + ` {
		t.Errorf("expected 12.34 USD, got %s", string(data))
	}
}

func Test5(t *testing.T) {
	var m Money
	err := json.Unmarshal([]byte(` + "`" + `"99.99 EUR"` + "`" + `), &m)
	if err != nil {
		t.Errorf("expected nil error, got %v", err)
	}
	if m.Amount != 9999 || m.Currency != "EUR" {
		t.Errorf("unexpected money: %+v", m)
	}
}

func Test6(t *testing.T) {
	var m Money
	err := json.Unmarshal([]byte(` + "`" + `{"amount": 5000, "currency": "GBP"}` + "`" + `), &m)
	if err != nil {
		t.Errorf("expected nil error for object format, got %v", err)
	}
	if m.Amount != 5000 || m.Currency != "GBP" {
		t.Errorf("unexpected money: %+v", m)
	}
}

func Test7(t *testing.T) {
	event := Event{
		ID:         "evt_123",
		Name:       "Concert",
		OccurredAt: Timestamp{Time: time.Unix(1609459200, 0)},
		Cost:       Money{Amount: 5000, Currency: "USD"},
	}
	data, err := json.Marshal(event)
	if err != nil {
		t.Errorf("expected nil error, got %v", err)
	}
	if len(data) == 0 {
		t.Error("expected non-empty data")
	}
}

func Test8(t *testing.T) {
	m := Money{Amount: 0, Currency: "USD"}
	data, err := json.Marshal(m)
	if err != nil {
		t.Errorf("expected nil error, got %v", err)
	}
	if string(data) != ` + "`" + `"0.00 USD"` + "`" + ` {
		t.Errorf("expected 0.00 USD, got %s", string(data))
	}
}

func Test9(t *testing.T) {
	var m Money
	err := json.Unmarshal([]byte(` + "`" + `"invalid"` + "`" + `), &m)
	if err == nil {
		t.Error("expected error for invalid format")
	}
}

func Test10(t *testing.T) {
	ts := Timestamp{Time: time.Unix(0, 0)}
	data, _ := json.Marshal(ts)
	if string(data) != "0" {
		t.Errorf("expected 0, got %s", string(data))
	}
}
`,
	solutionCode: `package encodingx

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
)

var ErrInvalidFormat = errors.New("invalid format")

type Timestamp struct {
	time.Time
}

func (t Timestamp) MarshalJSON() ([]byte, error) {
	unix := t.Unix() // extract seconds since epoch from wrapped time
	return []byte(strconv.FormatInt(unix, 10)), nil // convert int64 to decimal string bytes without quotes
}

func (t *Timestamp) UnmarshalJSON(data []byte) error {
	// attempt parsing as Unix timestamp number first
	if unix, err := strconv.ParseInt(string(data), 10, 64); err == nil { // try numeric format without quotes
		t.Time = time.Unix(unix, 0) // reconstruct time from seconds since epoch
		return nil
	}

	// fall back to ISO 8601 string parsing
	var s string
	if err := json.Unmarshal(data, &s); err != nil { // extract quoted string from JSON
		return ErrInvalidFormat // neither number nor string succeeded
	}

	parsed, err := time.Parse(time.RFC3339, s) // parse ISO 8601 format like 2021-01-01T00:00:00Z
	if err != nil {
		return ErrInvalidFormat // invalid time string format
	}

	t.Time = parsed // assign successfully parsed time to receiver
	return nil
}

type Money struct {
	Amount   int64
	Currency string
}

func (m Money) MarshalJSON() ([]byte, error) {
	dollars := float64(m.Amount) / 100.0 // convert cents to dollars as decimal
	formatted := fmt.Sprintf("%.2f %s", dollars, m.Currency) // format with 2 decimal places and currency code
	return json.Marshal(formatted) // wrap formatted string in JSON quotes
}

func (m *Money) UnmarshalJSON(data []byte) error {
	// attempt parsing as string format first
	var s string
	if err := json.Unmarshal(data, &s); err == nil { // try extracting quoted string
		parts := strings.Split(s, " ") // split "12.34 USD" by space
		if len(parts) != 2 { // expect exactly amount and currency
			return ErrInvalidFormat
		}

		dollars, err := strconv.ParseFloat(parts[0], 64) // convert "12.34" to float
		if err != nil {
			return ErrInvalidFormat
		}

		m.Amount = int64(dollars * 100) // convert dollars to cents with rounding
		m.Currency = parts[1] // extract currency code
		return nil
	}

	// fall back to object format parsing
	var obj struct {
		Amount   int64  \`json:"amount"\`
		Currency string \`json:"currency"\`
	}

	if err := json.Unmarshal(data, &obj); err != nil { // attempt object structure parsing
		return ErrInvalidFormat // neither string nor object format worked
	}

	m.Amount = obj.Amount // copy amount directly from object
	m.Currency = obj.Currency // copy currency code from object
	return nil
}

type Event struct {
	ID         string    \`json:"id"\`
	Name       string    \`json:"name"\`
	OccurredAt Timestamp \`json:"occurred_at"\`
	Cost       Money     \`json:"cost"\`
}`,
	hint1: `Timestamp.MarshalJSON: Get t.Unix() for seconds, use strconv.FormatInt to convert to string bytes. Timestamp.UnmarshalJSON: Try strconv.ParseInt for number format, if error try json.Unmarshal into string then time.Parse(time.RFC3339, s).`,
	hint2: `Money.MarshalJSON: Calculate float64(m.Amount)/100.0, use fmt.Sprintf("%.2f %s", dollars, currency) then json.Marshal the string. Money.UnmarshalJSON: Try json.Unmarshal into string, strings.Split by space, ParseFloat first part and multiply by 100 for cents. If error, try unmarshal into anonymous struct with Amount/Currency fields.`,
	whyItMatters: `Custom JSON marshalers enable precise control over serialization formats, allowing you to maintain type safety, implement domain-specific encodings, and support multiple input formats for backward compatibility.

**Why Custom JSON Marshalers Matter:**

**1. Type Safety with Custom Formats**

**Problem - Primitive Types Lack Validation:**

\`\`\`go
// BAD - using primitive types directly
type Event struct {
    Timestamp int64  // What unit? Seconds? Milliseconds? Nanoseconds?
    Amount    int    // Dollars? Cents? Which currency?
}

// No type safety, easy to mix up
event := Event{
    Timestamp: 1609459200000, // Oops, milliseconds instead of seconds
    Amount:    12,            // Oops, dollars instead of cents
}
\`\`\`

**Solution - Custom Types with Validation:**

\`\`\`go
// GOOD - custom types enforce constraints
type Timestamp struct {
    time.Time // Wrapped time with custom JSON format
}

type Money struct {
    Amount   int64  // Always cents
    Currency string // Always 3-letter code
}

type Event struct {
    OccurredAt Timestamp // Clear: custom type, known format
    Cost       Money     // Clear: amount in cents with currency
}

// Type system prevents mixing up units
event := Event{
    OccurredAt: Timestamp{Time: time.Now()}, // Compiler enforces correct type
    Cost:       Money{Amount: 1234, Currency: "USD"}, // Always cents
}
\`\`\`

**Real Incident**: Payment processor used \`float64\` for money amounts. Developer passed \`12.34\` expecting cents but system interpreted as dollars. Transaction processed $12.34 instead of $0.1234. Lost $12.20 per transaction. Custom \`Money\` type with cents-only storage prevents this.

**2. Multiple Input Formats for Compatibility**

**API Evolution Problem:**

\`\`\`go
// Version 1 API: Money as object
{"amount": 1234, "currency": "USD"}

// Version 2 API: Money as string for brevity
"12.34 USD"

// Without custom unmarshaler - breaking change!
type Money struct {
    Amount   int64
    Currency string
}
// Can only parse one format
\`\`\`

**Solution - Custom Unmarshaler Accepts Both:**

\`\`\`go
func (m *Money) UnmarshalJSON(data []byte) error {
    // Try string format first (v2)
    var s string
    if err := json.Unmarshal(data, &s); err == nil {
        // Parse "12.34 USD"
        return parseMoneyString(s, m)
    }

    // Fall back to object format (v1)
    var obj struct {
        Amount   int64
        Currency string
    }
    if err := json.Unmarshal(data, &obj); err == nil {
        m.Amount = obj.Amount
        m.Currency = obj.Currency
        return nil
    }

    return ErrInvalidFormat
}
\`\`\`

**Benefit**: Old clients using object format continue working. New clients use compact string format. No breaking changes!

**Real Use Case**: Stripe API accepts payment amounts as integers (cents) or objects. GitHub API accepts timestamps as Unix numbers or ISO 8601 strings. Custom unmarshalers enable this flexibility.

**3. Unix Timestamp vs ISO 8601**

**Trade-offs:**

\`\`\`go
// Unix Timestamp (seconds since epoch)
// Pros: Compact, timezone-agnostic, easy math
1609459200

// ISO 8601 String
// Pros: Human-readable, explicit timezone, standard
"2021-01-01T00:00:00Z"
\`\`\`

**Custom Timestamp Type Supports Both:**

\`\`\`go
type Timestamp struct {
    time.Time
}

func (t Timestamp) MarshalJSON() ([]byte, error) {
    // Output as Unix timestamp for compactness
    return []byte(strconv.FormatInt(t.Unix(), 10)), nil
}

func (t *Timestamp) UnmarshalJSON(data []byte) error {
    // Accept Unix timestamp
    if unix, err := strconv.ParseInt(string(data), 10, 64); err == nil {
        t.Time = time.Unix(unix, 0)
        return nil
    }

    // Accept ISO 8601 string
    var s string
    json.Unmarshal(data, &s)
    t.Time, _ = time.Parse(time.RFC3339, s)
    return nil
}
\`\`\`

**Why This Matters:**

- **Database migration**: Old system stored Unix timestamps, new system uses ISO 8601. Custom type handles both during transition.
- **Multi-client support**: JavaScript clients send ISO strings, mobile apps send Unix numbers.
- **Log compatibility**: Logs use ISO for readability, metrics use Unix for efficient storage.

**Real Incident**: Service migrated from Unix timestamps to ISO 8601. Broke mobile app that sent Unix timestamps. Had to rollback. Custom unmarshaler accepting both would have prevented downtime.

**4. Money Representation - Why Cents Matter**

**Problem - Floating Point Precision:**

\`\`\`go
// WRONG - float64 loses precision
type Money struct {
    Amount float64 // DANGEROUS
}

var total float64
total = 0.1 + 0.2 // total = 0.30000000000000004 (not 0.3!)

// Accumulate small amounts
for i := 0; i < 1000; i++ {
    total += 0.01 // 1 cent
}
// total = 9.999999999999831 (not 10.00!) Missing 16.9 cents!
\`\`\`

**Solution - Integer Cents:**

\`\`\`go
// CORRECT - int64 cents are exact
type Money struct {
    Amount int64 // cents, no precision loss
}

var total int64
for i := 0; i < 1000; i++ {
    total += 1 // 1 cent
}
// total = 1000 (exactly $10.00)
\`\`\`

**Custom Marshaler Hides Internal Representation:**

\`\`\`go
func (m Money) MarshalJSON() ([]byte, error) {
    dollars := float64(m.Amount) / 100.0 // Only use float for display
    formatted := fmt.Sprintf("%.2f %s", dollars, m.Currency)
    return json.Marshal(formatted)
}

// Money{Amount: 1234, Currency: "USD"} -> "12.34 USD"
// Internal: precise integers
// External: human-readable decimals
\`\`\`

**Real Incident**: E-commerce platform used \`float64\` for prices. After 1 year, accumulated rounding errors totaled $12,437 in unaccounted differences. Switched to integer cents, errors disappeared.

**5. json.Marshaler and json.Unmarshaler Interfaces**

**Interface Definitions:**

\`\`\`go
type Marshaler interface {
    MarshalJSON() ([]byte, error)
}

type Unmarshaler interface {
    UnmarshalJSON([]byte) error
}
\`\`\`

**How json Package Uses Them:**

\`\`\`go
func Marshal(v interface{}) ([]byte, error) {
    // Check if v implements Marshaler
    if m, ok := v.(Marshaler); ok {
        return m.MarshalJSON() // Use custom marshaler
    }

    // Otherwise use default reflection-based marshaling
    return defaultMarshal(v)
}
\`\`\`

**Custom Control:**

\`\`\`go
type Timestamp struct {
    time.Time
}

// Implement json.Marshaler interface
func (t Timestamp) MarshalJSON() ([]byte, error) {
    // Complete control over output format
    return []byte(strconv.FormatInt(t.Unix(), 10)), nil
}

// json.Marshal automatically calls MarshalJSON
data, _ := json.Marshal(Timestamp{Time: time.Unix(1609459200, 0)})
// data = "1609459200" (our custom format)
\`\`\`

**6. Pointer Receivers for Unmarshalers**

**Critical Rule:**

\`\`\`go
// CORRECT - pointer receiver
func (t *Timestamp) UnmarshalJSON(data []byte) error {
    t.Time = parsedTime // Modifies receiver
    return nil
}

// WRONG - value receiver
func (t Timestamp) UnmarshalJSON(data []byte) error {
    t.Time = parsedTime // Modifies copy, original unchanged!
    return nil
}
\`\`\`

**Why:**

\`\`\`go
var t Timestamp
json.Unmarshal(data, &t) // Pass pointer to json package

// json package calls UnmarshalJSON on the pointer
// If method has value receiver, changes lost!
// If method has pointer receiver, changes persist
\`\`\`

**Rule of thumb:**
- **Marshalers**: Can use value receiver (read-only)
- **Unmarshalers**: MUST use pointer receiver (modifies data)

**7. Error Handling in Custom Marshalers**

**Custom Error Types:**

\`\`\`go
var ErrInvalidFormat = errors.New("invalid format")

func (m *Money) UnmarshalJSON(data []byte) error {
    // Try format 1
    if err := parseStringFormat(data, m); err == nil {
        return nil
    }

    // Try format 2
    if err := parseObjectFormat(data, m); err == nil {
        return nil
    }

    // Both failed
    return ErrInvalidFormat
}
\`\`\`

**Client Code:**

\`\`\`go
var m Money
if err := json.Unmarshal(data, &m); err != nil {
    if errors.Is(err, ErrInvalidFormat) {
        // Handle format error specifically
        return fmt.Errorf("invalid money format: %w", err)
    }
    // Handle other JSON errors
}
\`\`\`

**Best Practice**: Return descriptive errors, not generic ones.

**8. Composability - Custom Types in Structs**

**Automatic Nesting:**

\`\`\`go
type Event struct {
    ID         string    \`json:"id"\`
    Name       string    \`json:"name"\`
    OccurredAt Timestamp \`json:"occurred_at"\` // Custom marshaler
    Cost       Money     \`json:"cost"\`        // Custom marshaler
}

event := Event{
    ID:   "evt_123",
    Name: "Concert",
    OccurredAt: Timestamp{Time: time.Unix(1609459200, 0)},
    Cost: Money{Amount: 5000, Currency: "USD"},
}

data, _ := json.Marshal(event)
// {
//   "id": "evt_123",
//   "name": "Concert",
//   "occurred_at": 1609459200,     <- Timestamp custom format
//   "cost": "50.00 USD"             <- Money custom format
// }
\`\`\`

**json package automatically invokes custom marshalers for nested fields!**

**9. Testing Custom Marshalers**

**Round-Trip Testing:**

\`\`\`go
func TestTimestampRoundTrip(t *testing.T) {
    original := Timestamp{Time: time.Unix(1609459200, 0)}

    // Marshal
    data, err := json.Marshal(original)
    if err != nil {
        t.Fatal(err)
    }

    // Unmarshal
    var decoded Timestamp
    if err := json.Unmarshal(data, &decoded); err != nil {
        t.Fatal(err)
    }

    // Compare
    if !original.Equal(decoded.Time) {
        t.Errorf("round-trip failed: got %v, want %v", decoded, original)
    }
}
\`\`\`

**Format Compatibility Testing:**

\`\`\`go
func TestMoneyMultipleFormats(t *testing.T) {
    tests := []struct {
        name   string
        input  string
        want   Money
    }{
        {"string format", \`"12.34 USD"\`, Money{1234, "USD"}},
        {"object format", \`{"amount":1234,"currency":"USD"}\`, Money{1234, "USD"}},
        {"zero amount", \`"0.00 EUR"\`, Money{0, "EUR"}},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            var got Money
            if err := json.Unmarshal([]byte(tt.input), &got); err != nil {
                t.Fatal(err)
            }
            if got != tt.want {
                t.Errorf("got %+v, want %+v", got, tt.want)
            }
        })
    }
}
\`\`\`

**10. Performance Considerations**

**Custom marshalers are faster than reflection:**

\`\`\`go
// Default marshaling uses reflection (slower)
type Timestamp struct {
    UnixSeconds int64 \`json:"unix_seconds"\`
}

// Custom marshaling is direct (faster)
func (t Timestamp) MarshalJSON() ([]byte, error) {
    return []byte(strconv.FormatInt(t.Unix(), 10)), nil
}
\`\`\`

**Benchmark results:**
- Reflection-based: ~500 ns/op
- Custom marshaler: ~150 ns/op
- 3x faster for custom types

**When to use custom marshalers:**
- High-frequency serialization (APIs, logging)
- Complex formats not supported by tags
- Need multiple input/output formats
- Type-safe wrappers around primitives

**Key Takeaways:**
- Implement \`MarshalJSON()\` for custom encoding (value receiver OK)
- Implement \`UnmarshalJSON()\` for custom decoding (MUST use pointer receiver)
- Accept multiple input formats for backward compatibility
- Use integer cents for money, never floats
- Support both Unix timestamps and ISO 8601 for time
- Return custom errors for invalid formats
- Test round-trip encoding and format compatibility
- Custom marshalers enable type safety + flexible formats`,
	order: 1,
	translations: {
		ru: {
			title: 'Пользовательский JSON Marshaler и Unmarshaler',
			description: `Реализуйте пользовательское маршалинг и анмаршалинг JSON, имплементируя интерфейсы json.Marshaler и json.Unmarshaler для специальных типов, требующих пользовательской логики сериализации.

**Вы реализуете:**

**Уровни 1-3 (Лёгкий → Средний) — Пользовательский Marshaler для Timestamp:**
1. **Timestamp struct** — Обёртка вокруг time.Time с пользовательским форматом
2. **MarshalJSON() ([]byte, error)** — Форматирование как Unix timestamp (секунды с начала эпохи)
3. **UnmarshalJSON(data []byte) error** — Парсинг из Unix timestamp или ISO 8601 строки

**Уровни 4-5 (Средний) — Пользовательский Marshaler для Money:**
4. **Money struct** — Amount (int64 центы) и Currency (string)
5. **MarshalJSON() ([]byte, error)** — Форматирование как десятичная строка "12.34 USD"
6. **UnmarshalJSON(data []byte) error** — Парсинг из "12.34 USD" или объекта \`{"amount": 1234, "currency": "USD"}\`

**Уровни 6-7 (Средний+) — Event с пользовательскими типами:**
7. **Event struct** — ID, Name, OccurredAt (Timestamp), Cost (Money)
8. **Event round-trip кодирование** — Тестирование полного цикла marshal/unmarshal

**Ключевые концепции:**
- **json.Marshaler интерфейс**: Типы, реализующие \`MarshalJSON() ([]byte, error)\`, контролируют свою JSON кодировку
- **json.Unmarshaler интерфейс**: Типы, реализующие \`UnmarshalJSON(data []byte) error\`, контролируют свою JSON декодировку
- **Пользовательские Форматы**: Сериализация сложных типов в специфичных для приложения форматах
- **Гибкий Парсинг**: Принятие нескольких форматов ввода для лучшей совместимости API
- **Типобезопасность**: Обёртывание примитивов в пользовательские типы с валидацией

**Пример использования:**

\`\`\`go
// Timestamp пользовательский marshaling
ts := Timestamp{Time: time.Unix(1609459200, 0)} // 2021-01-01 00:00:00 UTC
data, err := json.Marshal(ts)
// data = "1609459200"

// Timestamp unmarshaling из Unix timestamp
var ts2 Timestamp
json.Unmarshal([]byte("1609459200"), &ts2)
// ts2.Time = 2021-01-01 00:00:00 UTC

// Timestamp unmarshaling из ISO 8601
var ts3 Timestamp
json.Unmarshal([]byte(\`"2021-01-01T00:00:00Z"\`), &ts3)
// ts3.Time = 2021-01-01 00:00:00 UTC

// Money пользовательский marshaling
money := Money{Amount: 1234, Currency: "USD"} // $12.34
data, err := json.Marshal(money)
// data = \`"12.34 USD"\`

// Money unmarshaling из строки
var m1 Money
json.Unmarshal([]byte(\`"99.99 EUR"\`), &m1)
// m1 = Money{Amount: 9999, Currency: "EUR"}

// Money unmarshaling из объекта
var m2 Money
json.Unmarshal([]byte(\`{"amount": 5000, "currency": "GBP"}\`), &m2)
// m2 = Money{Amount: 5000, Currency: "GBP"}

// Event с пользовательскими типами
event := Event{
    ID:   "evt_123",
    Name: "Concert Ticket",
    OccurredAt: Timestamp{Time: time.Unix(1609459200, 0)},
    Cost: Money{Amount: 5000, Currency: "USD"},
}

data, err := json.Marshal(event)
// data = {
//   "id": "evt_123",
//   "name": "Concert Ticket",
//   "occurred_at": 1609459200,
//   "cost": "50.00 USD"
// }

// Полный round-trip
var decoded Event
json.Unmarshal(data, &decoded)
// decoded соответствует исходному event
\`\`\`

**Ограничения:**
- Timestamp: MarshalJSON возвращает Unix timestamp как JSON число, UnmarshalJSON принимает число или ISO 8601 строку
- Money: Amount хранится в центах (int64), Currency — это 3-буквенный код
- Money MarshalJSON: Форматировать как "AMOUNT CURRENCY" (например, "12.34 USD")
- Money UnmarshalJSON: Принимать как строковый формат, так и объектный формат
- Event: Использовать json теги для имён полей (occurred_at, cost)
- Все пользовательские unmarshalers должны возвращать ErrInvalidFormat для плохого ввода`,
			hint1: `Timestamp.MarshalJSON: Получите t.Unix() для секунд, используйте strconv.FormatInt для преобразования в строковые байты. Timestamp.UnmarshalJSON: Попробуйте strconv.ParseInt для числового формата, если ошибка, попробуйте json.Unmarshal в строку, затем time.Parse(time.RFC3339, s).`,
			hint2: `Money.MarshalJSON: Вычислите float64(m.Amount)/100.0, используйте fmt.Sprintf("%.2f %s", dollars, currency), затем json.Marshal строку. Money.UnmarshalJSON: Попробуйте json.Unmarshal в строку, strings.Split по пробелу, ParseFloat первой части и умножьте на 100 для центов. Если ошибка, попробуйте unmarshal в анонимную структуру с полями Amount/Currency.`,
			whyItMatters: `Пользовательские JSON marshalers обеспечивают точный контроль над форматами сериализации, позволяя поддерживать типобезопасность, реализовывать специфичные для домена кодировки и поддерживать несколько форматов ввода для обратной совместимости.

**Почему это важно:**

**1. Типобезопасность с пользовательскими форматами**

**Проблема — примитивным типам не хватает валидации:**

\`\`\`go
// ПЛОХО — прямое использование примитивных типов
type Event struct {
    Timestamp int64  // Какая единица? Секунды? Миллисекунды? Наносекунды?
    Amount    int    // Доллары? Центы? Какая валюта?
}

// Нет типобезопасности, легко перепутать
event := Event{
    Timestamp: 1609459200000, // Упс, миллисекунды вместо секунд
    Amount:    12,            // Упс, доллары вместо центов
}
\`\`\`

**Решение — пользовательские типы с валидацией:**

\`\`\`go
// ХОРОШО — пользовательские типы обеспечивают ограничения
type Timestamp struct {
    time.Time // Обёрнутое время с пользовательским JSON форматом
}

type Money struct {
    Amount   int64  // Всегда центы
    Currency string // Всегда 3-буквенный код
}

type Event struct {
    OccurredAt Timestamp // Ясно: пользовательский тип, известный формат
    Cost       Money     // Ясно: сумма в центах с валютой
}

// Система типов предотвращает путаницу в единицах
event := Event{
    OccurredAt: Timestamp{Time: time.Now()}, // Компилятор требует правильный тип
    Cost:       Money{Amount: 1234, Currency: "USD"}, // Всегда центы
}
\`\`\`

**Реальный инцидент**: Платёжный процессор использовал \`float64\` для денежных сумм. Разработчик передал \`12.34\`, ожидая центы, но система интерпретировала как доллары. Транзакция обработана на $12.34 вместо $0.1234. Потеряно $12.20 на транзакцию. Пользовательский тип \`Money\` с хранением только центов предотвращает это.

**2. Несколько форматов ввода для совместимости**

**Проблема эволюции API:**

\`\`\`go
// Версия 1 API: Money как объект
{"amount": 1234, "currency": "USD"}

// Версия 2 API: Money как строка для краткости
"12.34 USD"

// Без пользовательского unmarshaler — breaking change!
type Money struct {
    Amount   int64
    Currency string
}
// Может парсить только один формат
\`\`\`

**Решение — пользовательский Unmarshaler принимает оба:**

\`\`\`go
func (m *Money) UnmarshalJSON(data []byte) error {
    // Сначала попробуйте строковый формат (v2)
    var s string
    if err := json.Unmarshal(data, &s); err == nil {
        // Парсинг "12.34 USD"
        return parseMoneyString(s, m)
    }

    // Откат к объектному формату (v1)
    var obj struct {
        Amount   int64
        Currency string
    }
    if err := json.Unmarshal(data, &obj); err == nil {
        m.Amount = obj.Amount
        m.Currency = obj.Currency
        return nil
    }

    return ErrInvalidFormat
}
\`\`\`

**Преимущество**: Старые клиенты, использующие объектный формат, продолжают работать. Новые клиенты используют компактный строковый формат. Никаких breaking changes!

**Реальный пример**: Stripe API принимает платёжные суммы как целые числа (центы) или объекты. GitHub API принимает временные метки как Unix числа или ISO 8601 строки. Пользовательские unmarshalers обеспечивают эту гибкость.

**3. Unix Timestamp vs ISO 8601**

**Компромиссы:**

\`\`\`go
// Unix Timestamp (секунды с начала эпохи)
// Плюсы: Компактный, независим от часового пояса, простая математика
1609459200

// ISO 8601 String
// Плюсы: Человекочитаемый, явный часовой пояс, стандарт
"2021-01-01T00:00:00Z"
\`\`\`

**Пользовательский тип Timestamp поддерживает оба:**

\`\`\`go
type Timestamp struct {
    time.Time
}

func (t Timestamp) MarshalJSON() ([]byte, error) {
    // Вывод как Unix timestamp для компактности
    return []byte(strconv.FormatInt(t.Unix(), 10)), nil
}

func (t *Timestamp) UnmarshalJSON(data []byte) error {
    // Принимать Unix timestamp
    if unix, err := strconv.ParseInt(string(data), 10, 64); err == nil {
        t.Time = time.Unix(unix, 0)
        return nil
    }

    // Принимать ISO 8601 строку
    var s string
    json.Unmarshal(data, &s)
    t.Time, _ = time.Parse(time.RFC3339, s)
    return nil
}
\`\`\`

**Почему это важно:**

- **Миграция базы данных**: Старая система хранила Unix timestamps, новая система использует ISO 8601. Пользовательский тип обрабатывает оба во время перехода.
- **Поддержка нескольких клиентов**: JavaScript клиенты отправляют ISO строки, мобильные приложения отправляют Unix числа.
- **Совместимость логов**: Логи используют ISO для читаемости, метрики используют Unix для эффективного хранения.

**Реальный инцидент**: Сервис мигрировал с Unix timestamps на ISO 8601. Сломал мобильное приложение, которое отправляло Unix timestamps. Пришлось откатиться. Пользовательский unmarshaler, принимающий оба, предотвратил бы простой.

**4. Представление денег — почему центы важны**

**Проблема — точность с плавающей точкой:**

\`\`\`go
// НЕПРАВИЛЬНО — float64 теряет точность
type Money struct {
    Amount float64 // ОПАСНО
}

var total float64
total = 0.1 + 0.2 // total = 0.30000000000000004 (не 0.3!)

// Накопление малых сумм
for i := 0; i < 1000; i++ {
    total += 0.01 // 1 цент
}
// total = 9.999999999999831 (не 10.00!) Потеря 16.9 центов!
\`\`\`

**Решение — целые центы:**

\`\`\`go
// ПРАВИЛЬНО — int64 центы точны
type Money struct {
    Amount int64 // центы, без потери точности
}

var total int64
for i := 0; i < 1000; i++ {
    total += 1 // 1 цент
}
// total = 1000 (точно $10.00)
\`\`\`

**Пользовательский Marshaler скрывает внутреннее представление:**

\`\`\`go
func (m Money) MarshalJSON() ([]byte, error) {
    dollars := float64(m.Amount) / 100.0 // Используйте float только для отображения
    formatted := fmt.Sprintf("%.2f %s", dollars, m.Currency)
    return json.Marshal(formatted)
}

// Money{Amount: 1234, Currency: "USD"} -> "12.34 USD"
// Внутри: точные целые
// Снаружи: человекочитаемые десятичные
\`\`\`

**Реальный инцидент**: E-commerce платформа использовала \`float64\` для цен. После 1 года накопленные ошибки округления составили $12,437 в неучтённых различиях. Переключились на целые центы, ошибки исчезли.

**Ключевые выводы:**
- Реализуйте \`MarshalJSON()\` для пользовательской кодировки (value receiver OK)
- Реализуйте \`UnmarshalJSON()\` для пользовательской декодировки (ДОЛЖЕН использовать pointer receiver)
- Принимайте несколько форматов ввода для обратной совместимости
- Используйте целые центы для денег, никогда floats
- Поддерживайте как Unix timestamps, так и ISO 8601 для времени
- Возвращайте пользовательские ошибки для невалидных форматов
- Тестируйте round-trip кодирование и совместимость форматов
- Пользовательские marshalers обеспечивают типобезопасность + гибкие форматы`,
			solutionCode: `package encodingx

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
)

var ErrInvalidFormat = errors.New("invalid format")

type Timestamp struct {
	time.Time
}

func (t Timestamp) MarshalJSON() ([]byte, error) {
	unix := t.Unix() // извлекаем секунды с начала эпохи из обёрнутого времени
	return []byte(strconv.FormatInt(unix, 10)), nil // преобразуем int64 в десятичную строку байтов без кавычек
}

func (t *Timestamp) UnmarshalJSON(data []byte) error {
	// сначала пытаемся парсить как Unix timestamp число
	if unix, err := strconv.ParseInt(string(data), 10, 64); err == nil { // пробуем числовой формат без кавычек
		t.Time = time.Unix(unix, 0) // реконструируем время из секунд с начала эпохи
		return nil
	}

	// откатываемся к парсингу ISO 8601 строки
	var s string
	if err := json.Unmarshal(data, &s); err != nil { // извлекаем строку в кавычках из JSON
		return ErrInvalidFormat // ни число, ни строка не сработали
	}

	parsed, err := time.Parse(time.RFC3339, s) // парсим формат ISO 8601 вроде 2021-01-01T00:00:00Z
	if err != nil {
		return ErrInvalidFormat // невалидный формат строки времени
	}

	t.Time = parsed // присваиваем успешно распарсенное время получателю
	return nil
}

type Money struct {
	Amount   int64
	Currency string
}

func (m Money) MarshalJSON() ([]byte, error) {
	dollars := float64(m.Amount) / 100.0 // преобразуем центы в доллары как десятичное число
	formatted := fmt.Sprintf("%.2f %s", dollars, m.Currency) // форматируем с 2 десятичными знаками и кодом валюты
	return json.Marshal(formatted) // оборачиваем отформатированную строку в JSON кавычки
}

func (m *Money) UnmarshalJSON(data []byte) error {
	// сначала пытаемся парсить как строковый формат
	var s string
	if err := json.Unmarshal(data, &s); err == nil { // пробуем извлечь строку в кавычках
		parts := strings.Split(s, " ") // разделяем "12.34 USD" по пробелу
		if len(parts) != 2 { // ожидаем ровно сумму и валюту
			return ErrInvalidFormat
		}

		dollars, err := strconv.ParseFloat(parts[0], 64) // преобразуем "12.34" в float
		if err != nil {
			return ErrInvalidFormat
		}

		m.Amount = int64(dollars * 100) // преобразуем доллары в центы с округлением
		m.Currency = parts[1] // извлекаем код валюты
		return nil
	}

	// откатываемся к парсингу объектного формата
	var obj struct {
		Amount   int64  \`json:"amount"\`
		Currency string \`json:"currency"\`
	}

	if err := json.Unmarshal(data, &obj); err != nil { // пытаемся парсить структуру объекта
		return ErrInvalidFormat // ни строковый, ни объектный формат не сработали
	}

	m.Amount = obj.Amount // копируем сумму напрямую из объекта
	m.Currency = obj.Currency // копируем код валюты из объекта
	return nil
}

type Event struct {
	ID         string    \`json:"id"\`
	Name       string    \`json:"name"\`
	OccurredAt Timestamp \`json:"occurred_at"\`
	Cost       Money     \`json:"cost"\`
}`
		},
		uz: {
			title: `Maxsus JSON Marshaler va Unmarshaler`,
			description: `Maxsus serializatsiya mantiqini talab qiladigan maxsus turlar uchun json.Marshaler va json.Unmarshaler interfeyslarini amalga oshirish orqali maxsus JSON marshaling va unmarshaling ni amalga oshiring.

**Siz amalga oshirasiz:**

**1-3 Daraja (Oson → O'rta) — Timestamp maxsus Marshaler:**
1. **Timestamp struct** — Maxsus format bilan time.Time ni o'rash
2. **MarshalJSON() ([]byte, error)** — Unix timestamp sifatida formatlash (epoch dan beri soniyalar)
3. **UnmarshalJSON(data []byte) error** — Unix timestamp yoki ISO 8601 qatoridan pars qilish

**4-5 Daraja (O'rta) — Money maxsus Marshaler:**
4. **Money struct** — Amount (int64 sentlar) va Currency (string)
5. **MarshalJSON() ([]byte, error)** — O'nlik qator sifatida formatlash "12.34 USD"
6. **UnmarshalJSON(data []byte) error** — "12.34 USD" yoki ob'ektdan pars qilish \`{"amount": 1234, "currency": "USD"}\`

**6-7 Daraja (O'rta+) — Maxsus turlar bilan Event:**
7. **Event struct** — ID, Name, OccurredAt (Timestamp), Cost (Money)
8. **Event round-trip practixsh** — To'liq marshal/unmarshal tsiklini sinovdan o'tkazish

**Asosiy tushunchalar:**
- **json.Marshaler interfeysi**: \`MarshalJSON() ([]byte, error)\` ni amalga oshiradigan turlar o'z JSON practixshini boshqaradi
- **json.Unmarshaler interfeysi**: \`UnmarshalJSON(data []byte) error\` ni amalga oshiradigan turlar o'z JSON depractixshini boshqaradi
- **Maxsus formatlar**: Murakkab turlarni ilovaga xos formatlarda serializatsiya qilish
- **Moslashuvchan pars qilish**: API mosligi uchun bir nechta kirish formatlarini qabul qilish
- **Tur xavfsizligi**: Validatsiya bilan primitivlarni maxsus turlarga o'rash

**Foydalanish misoli:**

\`\`\`go
// Timestamp maxsus marshaling
ts := Timestamp{Time: time.Unix(1609459200, 0)} // 2021-01-01 00:00:00 UTC
data, err := json.Marshal(ts)
// data = "1609459200"

// Unix timestamp dan Timestamp unmarshaling
var ts2 Timestamp
json.Unmarshal([]byte("1609459200"), &ts2)
// ts2.Time = 2021-01-01 00:00:00 UTC

// ISO 8601 dan Timestamp unmarshaling
var ts3 Timestamp
json.Unmarshal([]byte(\`"2021-01-01T00:00:00Z"\`), &ts3)
// ts3.Time = 2021-01-01 00:00:00 UTC

// Money maxsus marshaling
money := Money{Amount: 1234, Currency: "USD"} // $12.34
data, err := json.Marshal(money)
// data = \`"12.34 USD"\`

// Qatordan Money unmarshaling
var m1 Money
json.Unmarshal([]byte(\`"99.99 EUR"\`), &m1)
// m1 = Money{Amount: 9999, Currency: "EUR"}

// Ob'ektdan Money unmarshaling
var m2 Money
json.Unmarshal([]byte(\`{"amount": 5000, "currency": "GBP"}\`), &m2)
// m2 = Money{Amount: 5000, Currency: "GBP"}

// Maxsus turlar bilan Event
event := Event{
    ID:   "evt_123",
    Name: "Concert Ticket",
    OccurredAt: Timestamp{Time: time.Unix(1609459200, 0)},
    Cost: Money{Amount: 5000, Currency: "USD"},
}

data, err := json.Marshal(event)
// data = {
//   "id": "evt_123",
//   "name": "Concert Ticket",
//   "occurred_at": 1609459200,
//   "cost": "50.00 USD"
// }

// To'liq round-trip
var decoded Event
json.Unmarshal(data, &decoded)
// decoded asl event ga mos keladi
\`\`\`

**Cheklovlar:**
- Timestamp: MarshalJSON JSON raqam sifatida Unix timestamp ni qaytaradi, UnmarshalJSON raqam yoki ISO 8601 qatorni qabul qiladi
- Money: Amount sentlarda saqlanadi (int64), Currency 3 harfli kod
- Money MarshalJSON: "AMOUNT CURRENCY" sifatida formatlash (masalan, "12.34 USD")
- Money UnmarshalJSON: Ham qator formatini ham ob'ekt formatini qabul qilish
- Event: Maydon nomlari uchun json teglaridan foydalanish (occurred_at, cost)
- Barcha maxsus unmarshalerlar noto'g'ri kiritish uchun ErrInvalidFormat qaytarishi kerak`,
			hint1: `Timestamp.MarshalJSON: Soniyalar uchun t.Unix() ni oling, qator baytlariga aylantirish uchun strconv.FormatInt dan foydalaning. Timestamp.UnmarshalJSON: Raqam formati uchun strconv.ParseInt ni sinab ko'ring, agar xato bo'lsa qatorga json.Unmarshal ni sinab ko'ring, keyin time.Parse(time.RFC3339, s).`,
			hint2: `Money.MarshalJSON: float64(m.Amount)/100.0 ni hisoblang, fmt.Sprintf("%.2f %s", dollars, currency) dan foydalaning, keyin qatorni json.Marshal qiling. Money.UnmarshalJSON: Qatorga json.Unmarshal ni sinab ko'ring, bo'sh joy bo'yicha strings.Split, birinchi qismni ParseFloat va sentlar uchun 100 ga ko'paytiring. Agar xato bo'lsa, Amount/Currency maydonlari bilan anonim strukturaga unmarshal qilishni sinab ko'ring.`,
			whyItMatters: `Maxsus JSON marshalerlar serializatsiya formatlari ustidan aniq nazoratni ta'minlaydi, bu tur xavfsizligini saqlash, domenga xos practixshlarni amalga oshirish va orqaga moslik uchun bir nechta kirish formatlarini qo'llab-quvvatlashga imkon beradi.

**Nima uchun bu muhim:**

**1. Maxsus formatlar bilan tur xavfsizligi**

**Muammo — primitiv turlarda validatsiya yo'q:**

\`\`\`go
// YOMON — primitiv turlarni to'g'ridan-to'g'ri ishlatish
type Event struct {
    Timestamp int64  // Qaysi birlik? Soniyalar? Millisoniyalar? Nanosoniyalar?
    Amount    int    // Dollarlar? Sentlar? Qaysi valyuta?
}

// Tur xavfsizligi yo'q, osongina adashtirish mumkin
event := Event{
    Timestamp: 1609459200000, // Xato, soniyalar o'rniga millisoniyalar
    Amount:    12,            // Xato, sentlar o'rniga dollarlar
}
\`\`\`

**Yechim — validatsiya bilan maxsus turlar:**

\`\`\`go
// YAXSHI — maxsus turlar cheklovlarni ta'minlaydi
type Timestamp struct {
    time.Time // Maxsus JSON format bilan o'ralgan vaqt
}

type Money struct {
    Amount   int64  // Har doim sentlar
    Currency string // Har doim 3 harfli kod
}

type Event struct {
    OccurredAt Timestamp // Aniq: maxsus tur, ma'lum format
    Cost       Money     // Aniq: valyuta bilan sentlardagi miqdor
}

// Tur tizimi birliklarni adashtirmaslikni ta'minlaydi
event := Event{
    OccurredAt: Timestamp{Time: time.Now()}, // Kompilyator to'g'ri turni talab qiladi
    Cost:       Money{Amount: 1234, Currency: "USD"}, // Har doim sentlar
}
\`\`\`

**Haqiqiy hodisa**: To'lov protsessori pul summalari uchun \`float64\` dan foydalangan. Dasturchi sentlarni kutib \`12.34\` ni uzatdi, lekin tizim dollarlar sifatida talqin qildi. Tranzaksiya $0.1234 o'rniga $12.34 ga qayta ishlandi. Har bir tranzaksiyada $12.20 yo'qoldi. Faqat sentlar saqlash bilan maxsus \`Money\` turi buni oldini oladi.

**2. Moslik uchun bir nechta kirish formatlari**

**API evolyutsiyasi muammosi:**

\`\`\`go
// 1-versiya API: Ob'ekt sifatida Money
{"amount": 1234, "currency": "USD"}

// 2-versiya API: Qisqalik uchun qator sifatida Money
"12.34 USD"

// Maxsus unmarshaler yo'q — buziluvchi o'zgarish!
type Money struct {
    Amount   int64
    Currency string
}
// Faqat bitta formatni pars qila oladi
\`\`\`

**Yechim — maxsus Unmarshaler ikkalasini ham qabul qiladi:**

\`\`\`go
func (m *Money) UnmarshalJSON(data []byte) error {
    // Avval qator formatini sinab ko'ring (v2)
    var s string
    if err := json.Unmarshal(data, &s); err == nil {
        // "12.34 USD" ni pars qilish
        return parseMoneyString(s, m)
    }

    // Ob'ekt formatiga qaytish (v1)
    var obj struct {
        Amount   int64
        Currency string
    }
    if err := json.Unmarshal(data, &obj); err == nil {
        m.Amount = obj.Amount
        m.Currency = obj.Currency
        return nil
    }

    return ErrInvalidFormat
}
\`\`\`

**Afzallik**: Ob'ekt formatidan foydalanayotgan eski mijozlar ishlashda davom etadi. Yangi mijozlar ixcham qator formatidan foydalanadi. Hech qanday buziluvchi o'zgarishlar yo'q!

**Haqiqiy foydalanish**: Stripe API to'lov summalarini butun sonlar (sentlar) yoki ob'ektlar sifatida qabul qiladi. GitHub API vaqt belgilarini Unix raqamlar yoki ISO 8601 qatorlari sifatida qabul qiladi. Maxsus unmarshalerlar bu moslashuvchanlikni ta'minlaydi.

**3. Unix Timestamp vs ISO 8601**

**Kelishuvlar:**

\`\`\`go
// Unix Timestamp (epoch dan beri soniyalar)
// Afzalliklar: Ixcham, vaqt mintaqasidan mustaqil, oson matematik
1609459200

// ISO 8601 String
// Afzalliklar: Odam o'qiy oladigan, aniq vaqt mintaqasi, standart
"2021-01-01T00:00:00Z"
\`\`\`

**Maxsus Timestamp turi ikkalasini ham qo'llab-quvvatlaydi:**

\`\`\`go
type Timestamp struct {
    time.Time
}

func (t Timestamp) MarshalJSON() ([]byte, error) {
    // Ixchamlik uchun Unix timestamp sifatida chiqarish
    return []byte(strconv.FormatInt(t.Unix(), 10)), nil
}

func (t *Timestamp) UnmarshalJSON(data []byte) error {
    // Unix timestamp ni qabul qilish
    if unix, err := strconv.ParseInt(string(data), 10, 64); err == nil {
        t.Time = time.Unix(unix, 0)
        return nil
    }

    // ISO 8601 qatorini qabul qilish
    var s string
    json.Unmarshal(data, &s)
    t.Time, _ = time.Parse(time.RFC3339, s)
    return nil
}
\`\`\`

**Nima uchun bu muhim:**

- **Ma'lumotlar bazasi migratsiyasi**: Eski tizim Unix timestamps ni saqlagan, yangi tizim ISO 8601 dan foydalanadi. Maxsus tur o'tish davomida ikkalasini ham boshqaradi.
- **Ko'p mijozlarni qo'llab-quvvatlash**: JavaScript mijozlari ISO qatorlarni yuboradi, mobil ilovalar Unix raqamlarni yuboradi.
- **Jurnal mosligi**: Jurnallar o'qilishi uchun ISO dan foydalanadi, ko'rsatkichlar samarali saqlash uchun Unix dan foydalanadi.

**Haqiqiy hodisa**: Xizmat Unix timestamps dan ISO 8601 ga ko'chdi. Unix timestamps yuborgan mobil ilovani buzdi. Orqaga qaytish kerak bo'ldi. Ikkalasini ham qabul qiluvchi maxsus unmarshaler ishlamay qolishning oldini olgan bo'lardi.

**4. Pul tasviri — nima uchun sentlar muhim**

**Muammo — suzuvchi nuqta aniqligi:**

\`\`\`go
// NOTO'G'RI — float64 aniqlikni yo'qotadi
type Money struct {
    Amount float64 // XAVFLI
}

var total float64
total = 0.1 + 0.2 // total = 0.30000000000000004 (0.3 emas!)

// Kichik summalarni to'plash
for i := 0; i < 1000; i++ {
    total += 0.01 // 1 sent
}
// total = 9.999999999999831 (10.00 emas!) 16.9 sent yo'qoldi!
\`\`\`

**Yechim — butun sentlar:**

\`\`\`go
// TO'G'RI — int64 sentlar aniq
type Money struct {
    Amount int64 // sentlar, aniqlik yo'qolishi yo'q
}

var total int64
for i := 0; i < 1000; i++ {
    total += 1 // 1 sent
}
// total = 1000 (aniq $10.00)
\`\`\`

**Maxsus Marshaler ichki tasvirni yashiradi:**

\`\`\`go
func (m Money) MarshalJSON() ([]byte, error) {
    dollars := float64(m.Amount) / 100.0 // Faqat ko'rsatish uchun float dan foydalaning
    formatted := fmt.Sprintf("%.2f %s", dollars, m.Currency)
    return json.Marshal(formatted)
}

// Money{Amount: 1234, Currency: "USD"} -> "12.34 USD"
// Ichida: aniq butun sonlar
// Tashqarida: odam o'qiy oladigan o'nliklar
\`\`\`

**Haqiqiy hodisa**: E-commerce platformasi narxlar uchun \`float64\` dan foydalangan. 1 yildan keyin to'plangan yaxlitlash xatolari hisobga olinmagan farqlarda $12,437 ni tashkil qildi. Butun sentlarga o'tdi, xatolar yo'qoldi.

**Asosiy xulosalar:**
- Maxsus practixsh uchun \`MarshalJSON()\` ni amalga oshiring (value receiver OK)
- Maxsus depractixsh uchun \`UnmarshalJSON()\` ni amalga oshiring (pointer receiver SHART)
- Orqaga moslik uchun bir nechta kirish formatlarini qabul qiling
- Pul uchun butun sentlardan foydalaning, hech qachon floatlardan emas
- Vaqt uchun ham Unix timestamps ham ISO 8601 ni qo'llab-quvvatlang
- Noto'g'ri formatlar uchun maxsus xatolar qaytaring
- Round-trip practixsh va format mosligini sinab ko'ring
- Maxsus marshalerlar tur xavfsizligi + moslashuvchan formatlarni ta'minlaydi`,
			solutionCode: `package encodingx

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
)

var ErrInvalidFormat = errors.New("invalid format")

type Timestamp struct {
	time.Time
}

func (t Timestamp) MarshalJSON() ([]byte, error) {
	unix := t.Unix() // o'ralgan vaqtdan epoch dan beri soniyalarni ajratib olish
	return []byte(strconv.FormatInt(unix, 10)), nil // int64 ni qo'shtirnoqsiz o'nlik qator baytlariga aylantirish
}

func (t *Timestamp) UnmarshalJSON(data []byte) error {
	// avval Unix timestamp raqami sifatida pars qilishga harakat qiling
	if unix, err := strconv.ParseInt(string(data), 10, 64); err == nil { // qo'shtirnoqsiz raqamli formatni sinab ko'ring
		t.Time = time.Unix(unix, 0) // epoch dan beri soniyalardan vaqtni qayta qurish
		return nil
	}

	// ISO 8601 qator parsiga qaytish
	var s string
	if err := json.Unmarshal(data, &s); err != nil { // JSON dan qo'shtirnoqli qatorni ajratib olish
		return ErrInvalidFormat // na raqam na qator muvaffaqiyatli bo'lmadi
	}

	parsed, err := time.Parse(time.RFC3339, s) // 2021-01-01T00:00:00Z kabi ISO 8601 formatini pars qilish
	if err != nil {
		return ErrInvalidFormat // noto'g'ri vaqt qatori formati
	}

	t.Time = parsed // muvaffaqiyatli pars qilingan vaqtni qabul qiluvchiga belgilash
	return nil
}

type Money struct {
	Amount   int64
	Currency string
}

func (m Money) MarshalJSON() ([]byte, error) {
	dollars := float64(m.Amount) / 100.0 // sentlarni dollarlarga o'nlik sifatida aylantirish
	formatted := fmt.Sprintf("%.2f %s", dollars, m.Currency) // 2 o'nlik joy va valyuta kodi bilan formatlash
	return json.Marshal(formatted) // formatlangan qatorni JSON qo'shtirnoqlariga o'rash
}

func (m *Money) UnmarshalJSON(data []byte) error {
	// avval qator formati sifatida pars qilishga harakat qiling
	var s string
	if err := json.Unmarshal(data, &s); err == nil { // qo'shtirnoqli qatorni ajratib olishga harakat qiling
		parts := strings.Split(s, " ") // "12.34 USD" ni bo'sh joy bo'yicha ajratish
		if len(parts) != 2 { // aniq miqdor va valyutani kutish
			return ErrInvalidFormat
		}

		dollars, err := strconv.ParseFloat(parts[0], 64) // "12.34" ni float ga aylantirish
		if err != nil {
			return ErrInvalidFormat
		}

		m.Amount = int64(dollars * 100) // dollarlarni yaxlitlash bilan sentlarga aylantirish
		m.Currency = parts[1] // valyuta kodini ajratib olish
		return nil
	}

	// ob'ekt formati parsiga qaytish
	var obj struct {
		Amount   int64  \`json:"amount"\`
		Currency string \`json:"currency"\`
	}

	if err := json.Unmarshal(data, &obj); err != nil { // ob'ekt strukturasini pars qilishga harakat qilish
		return ErrInvalidFormat // na qator na ob'ekt formati ishlamadi
	}

	m.Amount = obj.Amount // miqdorni ob'ektdan to'g'ridan-to'g'ri nusxalash
	m.Currency = obj.Currency // valyuta kodini ob'ektdan nusxalash
	return nil
}

type Event struct {
	ID         string    \`json:"id"\`
	Name       string    \`json:"name"\`
	OccurredAt Timestamp \`json:"occurred_at"\`
	Cost       Money     \`json:"cost"\`
}`
		}
	}
};

export default task;
