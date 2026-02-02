import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-encodingx-strict-validation',
	title: 'Strict JSON Validation and Encoding',
	difficulty: 'medium',
	tags: ['go', 'json', 'validation', 'encoding', 'security'],
	estimatedTime: '35m',
	isPremium: false,
	youtubeUrl: '',
	description: `Implement production-grade JSON parsing with strict validation, unknown field rejection, business rule enforcement, and trailing token detection.

**You will implement:**

**Level 1-4 (Easy → Medium+) - Strict Decoding:**
1. **UserDTO struct** - DTO with JSON tags for id, name, age (optional)
2. **StrictDecode(data []byte) (UserDTO, error)** - Strict JSON decoder that:
   2.1. Uses \`json.Decoder\` with \`DisallowUnknownFields()\`
   2.2. Validates business rules via \`ValidateUser\`
   2.3. Checks for trailing tokens after object

**Level 5 (Medium) - Business Validation:**
3. **ValidateUser(u UserDTO) error** - Enforce business rules:
   3.1. \`ID > 0\` (positive identifier)
   3.2. \`Name != ""\` (non-empty name)
   3.3. \`Age == nil\` or \`*Age >= 0\` (optional, but non-negative if present)

**Level 6 (Medium+) - Array Decoding:**
4. **StrictDecodeList(data []byte) ([]UserDTO, error)** - Decode array with per-item validation:
   4.1. Decode to \`[]json.RawMessage\`
   4.2. Call \`StrictDecode\` for each element
   4.3. Fail fast on first error

**Level 7 (Medium+) - Encoding:**
5. **MarshalUser(u UserDTO) ([]byte, error)** - Validate before encoding

**Level 8 (Medium+) - Panic Wrapper:**
6. **MustStrictDecode(data []byte) UserDTO** - Panic on decode error

**Helper Function:**
7. **ensureEOF(dec *json.Decoder) error** - Check no trailing tokens remain

**Key Concepts:**
- **json.Decoder vs json.Unmarshal**: Decoder provides streaming and stricter controls
- **DisallowUnknownFields**: Security feature to reject extra fields
- **Trailing Token Detection**: Prevent partial parsing attacks
- **Optional Fields**: Using pointers for omitempty semantics
- **Validation Separation**: Business logic separate from parsing

**Example Usage:**

\`\`\`go
// Valid user
valid := []byte(\`{"id": 1, "name": "Alice", "age": 25}\`)
user, err := StrictDecode(valid)
// user = UserDTO{ID: 1, Name: "Alice", Age: &25}, err = nil

// Unknown field rejected
unknown := []byte(\`{"id": 1, "name": "Bob", "role": "admin"}\`)
_, err = StrictDecode(unknown)
// err != nil (unknown field "role")

// Invalid business rules
invalidID := []byte(\`{"id": 0, "name": "Charlie"}\`)
_, err = StrictDecode(invalidID)
// err = ErrBadInput (ID must be > 0)

emptyName := []byte(\`{"id": 1, "name": ""}\`)
_, err = StrictDecode(emptyName)
// err = ErrBadInput (name cannot be empty)

negativeAge := []byte(\`{"id": 1, "name": "Dave", "age": -5}\`)
_, err = StrictDecode(negativeAge)
// err = ErrBadInput (age cannot be negative)

// Optional age field
noAge := []byte(\`{"id": 1, "name": "Eve"}\`)
user, err = StrictDecode(noAge)
// user = UserDTO{ID: 1, Name: "Eve", Age: nil}, err = nil

// Trailing tokens rejected
trailing := []byte(\`{"id": 1, "name": "Frank"}{"extra": "data"}\`)
_, err = StrictDecode(trailing)
// err != nil (trailing tokens detected)

// Array decoding
array := []byte(\`[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]\`)
users, err := StrictDecodeList(array)
// users = []UserDTO{{ID: 1, Name: "Alice"}, {ID: 2, Name: "Bob"}}

// Encoding with validation
user := UserDTO{ID: 1, Name: "Alice", Age: ptr(25)}
data, err := MarshalUser(user)
// data = \`{"id":1,"name":"Alice","age":25}\`, err = nil

invalidUser := UserDTO{ID: 0, Name: "Bad"}
_, err = MarshalUser(invalidUser)
// err = ErrBadInput (validation before encoding)

// Panic version
user = MustStrictDecode([]byte(\`{"id": 1, "name": "Alice"}\`))
// user = UserDTO{ID: 1, Name: "Alice"}

// MustStrictDecode([]byte(\`invalid\`)) // PANIC
\`\`\`

**Constraints:**
- UserDTO: Use JSON tags, Age is *int for optional field
- StrictDecode: Must call DisallowUnknownFields() and ensureEOF()
- ValidateUser: Return ErrBadInput for rule violations
- StrictDecodeList: Reuse StrictDecode for each element
- MarshalUser: Validate before marshaling
- MustStrictDecode: Panic on any error`,
	initialCode: `package encodingx

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
)

// UserDTO represents a user data transfer object
type UserDTO struct {
	ID   int    \`json:"id"\`
	Name string \`json:"name"\`
	Age  *int   \`json:"age,omitempty"\`
}

var ErrBadInput = errors.New("bad input")

// TODO: Implement StrictDecode
// Decode JSON with strict validation:
// 1. Create json.Decoder from bytes.NewReader(data)
// 2. Call dec.DisallowUnknownFields()
// 3. Decode into dto
// 4. Call ValidateUser(dto)
// 5. Call ensureEOF(dec) to check for trailing tokens
// Return decoded dto or error
func StrictDecode(data []byte) (UserDTO, error) {
	return UserDTO{}, nil
}

// TODO: Implement ValidateUser
// Validate business rules:
// - ID must be > 0
// - Name must be non-empty
// - Age (if not nil) must be >= 0
// Return ErrBadInput for violations, nil otherwise
func ValidateUser(u UserDTO) error {
	return nil
}

// TODO: Implement StrictDecodeList
// Decode array of users with strict validation:
// 1. Create decoder, call DisallowUnknownFields()
// 2. Decode into []json.RawMessage
// 3. Call ensureEOF(dec)
// 4. Loop through raw messages, call StrictDecode on each
// 5. Return error on first failure
// Return []UserDTO or error
func StrictDecodeList(data []byte) ([]UserDTO, error) {
	return nil, nil
}

// TODO: Implement MarshalUser
// Validate then encode:
// 1. Call ValidateUser(u)
// 2. If valid, call json.Marshal(u)
// Return JSON bytes or error
func MarshalUser(u UserDTO) ([]byte, error) {
	return nil, nil
}

// TODO: Implement MustStrictDecode
// Panic version of StrictDecode:
// 1. Call StrictDecode(data)
// 2. If error != nil, panic(err)
// 3. Return decoded user
func MustStrictDecode(data []byte) UserDTO {
	return UserDTO{}
}

// ensureEOF checks that no trailing tokens remain in decoder
func ensureEOF(dec *json.Decoder) error {
	if err := dec.Decode(&struct{}{}); err != nil {
		if errors.Is(err, io.EOF) {
			return nil // Proper end of stream
		}
		return err // Unexpected error
	}
	return ErrBadInput // Extra tokens found
}`,
	testCode: `package encodingx

import (
	"errors"
	"testing"
)

func Test1(t *testing.T) {
	data := []byte(` + "`" + `{"id": 1, "name": "Alice"}` + "`" + `)
	user, err := StrictDecode(data)
	if err != nil {
		t.Errorf("expected nil error, got %v", err)
	}
	if user.ID != 1 || user.Name != "Alice" {
		t.Errorf("unexpected user: %+v", user)
	}
}

func Test2(t *testing.T) {
	data := []byte(` + "`" + `{"id": 1, "name": "Alice", "age": 25}` + "`" + `)
	user, err := StrictDecode(data)
	if err != nil {
		t.Errorf("expected nil error, got %v", err)
	}
	if user.Age == nil || *user.Age != 25 {
		t.Error("expected age 25")
	}
}

func Test3(t *testing.T) {
	data := []byte(` + "`" + `{"id": 1, "name": "Alice", "role": "admin"}` + "`" + `)
	_, err := StrictDecode(data)
	if err == nil {
		t.Error("expected error for unknown field")
	}
}

func Test4(t *testing.T) {
	data := []byte(` + "`" + `{"id": 0, "name": "Bob"}` + "`" + `)
	_, err := StrictDecode(data)
	if err == nil || !errors.Is(err, ErrBadInput) {
		t.Errorf("expected ErrBadInput for id=0, got %v", err)
	}
}

func Test5(t *testing.T) {
	data := []byte(` + "`" + `{"id": 1, "name": ""}` + "`" + `)
	_, err := StrictDecode(data)
	if err == nil || !errors.Is(err, ErrBadInput) {
		t.Errorf("expected ErrBadInput for empty name, got %v", err)
	}
}

func Test6(t *testing.T) {
	data := []byte(` + "`" + `{"id": 1, "name": "Dave", "age": -5}` + "`" + `)
	_, err := StrictDecode(data)
	if err == nil || !errors.Is(err, ErrBadInput) {
		t.Errorf("expected ErrBadInput for negative age, got %v", err)
	}
}

func Test7(t *testing.T) {
	data := []byte(` + "`" + `[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]` + "`" + `)
	users, err := StrictDecodeList(data)
	if err != nil {
		t.Errorf("expected nil error, got %v", err)
	}
	if len(users) != 2 {
		t.Errorf("expected 2 users, got %d", len(users))
	}
}

func Test8(t *testing.T) {
	user := UserDTO{ID: 1, Name: "Alice"}
	data, err := MarshalUser(user)
	if err != nil {
		t.Errorf("expected nil error, got %v", err)
	}
	if len(data) == 0 {
		t.Error("expected non-empty data")
	}
}

func Test9(t *testing.T) {
	user := UserDTO{ID: 0, Name: "Bad"}
	_, err := MarshalUser(user)
	if err == nil || !errors.Is(err, ErrBadInput) {
		t.Errorf("expected ErrBadInput, got %v", err)
	}
}

func Test10(t *testing.T) {
	data := []byte(` + "`" + `{"id": 1, "name": "Alice"}` + "`" + `)
	user := MustStrictDecode(data)
	if user.ID != 1 || user.Name != "Alice" {
		t.Errorf("unexpected user: %+v", user)
	}
}
`,
	solutionCode: `package encodingx

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
)

type UserDTO struct {
	ID   int    \`json:"id"\`
	Name string \`json:"name"\`
	Age  *int   \`json:"age,omitempty"\`
}

var ErrBadInput = errors.New("bad input")

func StrictDecode(data []byte) (UserDTO, error) {
	dec := json.NewDecoder(bytes.NewReader(data))	// stream JSON input through decoder to control strictness
	dec.DisallowUnknownFields()	// reject payloads containing unknown fields
	var dto UserDTO	// allocate DTO to fill with decoded data
	if err := dec.Decode(&dto); err != nil {	// decode the first JSON object into dto
		return UserDTO{}, err	// propagate decoding error to caller
	}
	if err := ValidateUser(dto); err != nil {	// ensure DTO satisfies business constraints
		return UserDTO{}, err	// return validation error for bad input
	}
	if err := ensureEOF(dec); err != nil {	// confirm there are no trailing tokens after object
		return UserDTO{}, err	// fail when unexpected extra data is present
	}
	return dto, nil	// return decoded and validated DTO
}

func ValidateUser(u UserDTO) error {
	if u.ID <= 0 {	// reject non-positive identifiers
		return ErrBadInput
	}
	if u.Name == "" {	// require non-empty user names
		return ErrBadInput
	}
	if u.Age != nil && *u.Age < 0 {	// forbid negative age values when provided
		return ErrBadInput
	}
	return nil	// otherwise validation succeeds
}

func StrictDecodeList(data []byte) ([]UserDTO, error) {
	dec := json.NewDecoder(bytes.NewReader(data))	// construct decoder for array payload
	dec.DisallowUnknownFields()	// forbid unknown fields at the top level array
	var rawItems []json.RawMessage	// hold raw JSON elements for per-item validation
	if err := dec.Decode(&rawItems); err != nil {	// decode entire array into raw messages slice
		return nil, err	// propagate decoding errors to caller
	}
	if err := ensureEOF(dec); err != nil {	// ensure no trailing tokens remain after array
		return nil, err	// fail when extra data found
	}
	users := make([]UserDTO, 0, len(rawItems))	// preallocate result slice with exact capacity
	for _, raw := range rawItems {	// iterate over raw JSON representations
		user, err := StrictDecode(raw)	// reuse strict single-object decoder for each element
		if err != nil {	// stop iteration upon first validation failure
			return nil, err
		}
		users = append(users, user)	// append valid user to result slice
	}
	return users, nil	// return fully decoded user collection
}

func MarshalUser(u UserDTO) ([]byte, error) {
	if err := ValidateUser(u); err != nil {	// forbid serializing invalid DTOs
		return nil, err
	}
	payload, err := json.Marshal(u)	// encode DTO into JSON bytes
	if err != nil {	// handle potential marshaling errors
		return nil, err
	}
	return payload, nil	// pass serialized representation to caller
}

func MustStrictDecode(data []byte) UserDTO {
	user, err := StrictDecode(data)	// attempt strict decoding using shared logic
	if err != nil {	// panic when decoding fails to satisfy strict contract
		panic(err)
	}
	return user	// return decoded DTO when parsing succeeds
}

func ensureEOF(dec *json.Decoder) error {
	if err := dec.Decode(&struct{}{}); err != nil {	// attempt to consume next token from decoder
		if errors.Is(err, io.EOF) {	// io.EOF indicates proper end of stream
			return nil
		}
		return err	// propagate unexpected errors
	}
	return ErrBadInput	// return validation error when extra tokens exist
}`,
	hint1: `StrictDecode: Create decoder with json.NewDecoder(bytes.NewReader(data)), call dec.DisallowUnknownFields(), Decode into dto, then ValidateUser(dto), then ensureEOF(dec). Return dto or error.`,
	hint2: `ValidateUser: Check if u.ID <= 0 || u.Name == "" return ErrBadInput. Check if u.Age != nil && *u.Age < 0 return ErrBadInput. StrictDecodeList: Decode to []json.RawMessage, loop and call StrictDecode on each raw element.`,
	whyItMatters: `Strict JSON validation is critical for API security, data integrity, and preventing injection attacks in production systems.

**Why Strict JSON Validation Matters:**

**1. Unknown Field Rejection - Security Feature**

**Attack Vector**: Extra fields used for injection:

\`\`\`go
// Without DisallowUnknownFields - VULNERABLE
func InsecureDecode(data []byte) (UserDTO, error) {
    var user UserDTO
    json.Unmarshal(data, &user)  // Silently ignores unknown fields!
    return user, nil
}

// Attacker sends:
// {"id": 1, "name": "Alice", "role": "admin", "__proto__": {...}}

// "role" and "__proto__" silently ignored
// User created without admin validation
// Prototype pollution in JavaScript backend
\`\`\`

**With strict validation - SECURE:**

\`\`\`go
dec := json.NewDecoder(bytes.NewReader(data))
dec.DisallowUnknownFields()  // REJECT unknown fields
\`\`\`

**Real Incident**: A payment API silently ignored extra fields. Attacker sent \`{"amount": 100, "currency": "USD", "discount": 100}\`. The \`discount\` field was ignored during parsing but processed later by a different service, resulting in free transactions.

**2. Trailing Token Detection**

**Attack - Partial Parsing:**

\`\`\`go
// WITHOUT trailing token check - VULNERABLE
func VulnerableDecode(data []byte) (UserDTO, error) {
    var user UserDTO
    json.Unmarshal(data, &user)
    // Stops after first object, ignores rest!
    return user, nil
}

// Attacker sends:
// {"id": 1, "name": "Alice"}{"id": 999, "name": "Admin"}
//                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                           This second object is ignored!

// Application processes first object
// Logger/audit system processes full payload
// Creates audit trail mismatch
\`\`\`

**With ensureEOF check:**

\`\`\`go
func ensureEOF(dec *json.Decoder) error {
    if err := dec.Decode(&struct{}{}); err != nil {
        if errors.Is(err, io.EOF) {
            return nil  // Proper end
        }
        return err
    }
    return ErrBadInput  // Extra tokens found - REJECT
}
\`\`\`

**Real Incident**: A logging service processed JSON logs. Attackers embedded extra objects after the first one. The parser stopped after the first object but stored the full payload. When logs were reprocessed for analytics, the extra malicious objects executed, compromising the analytics pipeline.

**3. Business Validation Separation**

**Bad Practice - Validation in Multiple Places:**

\`\`\`go
// WRONG - scattered validation
func CreateUser(data []byte) error {
    var user UserDTO
    json.Unmarshal(data, &user)

    if user.ID <= 0 {  // Validation here
        return errors.New("invalid ID")
    }

    db.Insert(user)  // What if Name is empty? Not checked!
    return nil
}

func UpdateUser(data []byte) error {
    var user UserDTO
    json.Unmarshal(data, &user)

    // Forgot to check ID!
    if user.Name == "" {  // Validation here
        return errors.New("invalid name")
    }

    db.Update(user)
    return nil
}
\`\`\`

**Result**: Inconsistent validation, bugs slip through.

**Good Practice - Centralized Validation:**

\`\`\`go
// GOOD - single source of truth
func ValidateUser(u UserDTO) error {
    if u.ID <= 0 {
        return ErrBadInput
    }
    if u.Name == "" {
        return ErrBadInput
    }
    if u.Age != nil && *u.Age < 0 {
        return ErrBadInput
    }
    return nil
}

// Reused everywhere
func CreateUser(data []byte) error {
    user, err := StrictDecode(data)  // Automatic validation
    // ...
}

func UpdateUser(data []byte) error {
    user, err := StrictDecode(data)  // Same validation
    // ...
}
\`\`\`

**4. Optional Fields with Pointers**

**Why \`*int\` for Age:**

\`\`\`go
type UserDTO struct {
    Name string
    Age  int  // BAD - cannot distinguish 0 from absent
}

// {"name": "Alice"}  →  Age = 0 (default)
// {"name": "Bob", "age": 0}  →  Age = 0 (explicit)
// No way to tell them apart!

type UserDTO struct {
    Name string
    Age  *int  // GOOD - nil = absent, non-nil = present
}

// {"name": "Alice"}  →  Age = nil (absent)
// {"name": "Bob", "age": 0}  →  Age = &0 (explicit zero)
// Clear distinction!
\`\`\`

**Production Use Case**: User profile updates. If Age is int, sending \`{"name": "Alice"}\` would set Age to 0, overwriting existing age. With \`*int\`, nil means "don't change", explicit value means "update".

**5. json.Decoder vs json.Unmarshal**

**Why Decoder is superior for strict parsing:**

\`\`\`go
// json.Unmarshal - convenient but less control
func ParseUnmarshal(data []byte) (UserDTO, error) {
    var user UserDTO
    err := json.Unmarshal(data, &user)
    // Cannot detect trailing tokens!
    // Cannot control stream processing!
    return user, err
}

// json.Decoder - full control
func ParseDecoder(data []byte) (UserDTO, error) {
    dec := json.NewDecoder(bytes.NewReader(data))
    dec.DisallowUnknownFields()  // Control 1: Reject unknown
    var user UserDTO
    dec.Decode(&user)
    ensureEOF(dec)  // Control 2: Check trailing tokens
    return user, nil
}
\`\`\`

**Decoder advantages:**
- DisallowUnknownFields() support
- Stream processing (efficient for large payloads)
- Trailing token detection
- Token-level control

**6. Array Validation with json.RawMessage**

**Why decode to \`[]json.RawMessage\` first:**

\`\`\`go
// BAD - cannot apply strict validation per-item
func DecodeArrayBad(data []byte) ([]UserDTO, error) {
    var users []UserDTO
    json.Unmarshal(data, &users)
    // Each item decoded without strict checks!
    return users, nil
}

// GOOD - strict validation per item
func StrictDecodeList(data []byte) ([]UserDTO, error) {
    var rawItems []json.RawMessage
    // Decode array structure
    dec.Decode(&rawItems)

    // Validate each item with full strict checks
    for _, raw := range rawItems {
        user, err := StrictDecode(raw)  // Reuse strict decoder!
        if err != nil {
            return nil, err  // Fail fast
        }
        users = append(users, user)
    }
    return users, nil
}
\`\`\`

**Benefit**: Each array element gets DisallowUnknownFields, business validation, and trailing token checks.

**7. MustStrictDecode - When to Use Panic**

**Panic-driven validation for trusted sources:**

\`\`\`go
// For embedded/hardcoded JSON (compile-time known)
var defaultConfig = MustStrictDecode([]byte(\`{
    "id": 1,
    "name": "default",
    "age": 0
}\`))

// For test fixtures
func TestUserProcessing(t *testing.T) {
    user := MustStrictDecode([]byte(\`{"id": 1, "name": "Alice"}\`))
    // Test logic
}

// NEVER for user input!
func HandleRequest(w http.ResponseWriter, r *http.Request) {
    data, _ := io.ReadAll(r.Body)
    user := MustStrictDecode(data)  // WRONG - will crash server!
}
\`\`\`

**Rule**: Use \`Must*\` functions only when failure indicates programmer error, not runtime condition.

**8. Production Incident Examples**

**Incident 1 - NoSQL Injection via Unknown Fields:**

E-commerce platform used:
\`\`\`go
var user UserDTO
json.Unmarshal(data, &user)
db.Query(bson.M{"id": user.ID})
\`\`\`

Attacker sent:
\`\`\`json
{"id": 1, "$where": "this.role === 'admin'"}
\`\`\`

The \`$where\` field was silently parsed, injected into MongoDB query, granting admin access.

**Fix**: Use \`DisallowUnknownFields()\`.

**Incident 2 - Double-Spend via Trailing Tokens:**

Payment processor:
\`\`\`go
var payment PaymentDTO
json.Unmarshal(data, &payment)
// Processes first payment object only
\`\`\`

Attacker sent:
\`\`\`json
{"amount": 10}{"amount": 1000}
\`\`\`

Frontend processed first (\$10), backend audit logged both, analytics processed second (\$1000), allowing double-spend.

**Fix**: Check \`ensureEOF()\`.

**Incident 3 - Age Validation Bypass:**

User registration:
\`\`\`go
type User struct {
    Age int  // Not pointer
}

// {"name": "Kid"}  →  Age = 0 (allowed, bug!)
// {"name": "Teen", "age": 10}  →  Age = 10 (allowed)
\`\`\`

Minors registered without providing age (defaulted to 0), bypassing age restrictions.

**Fix**: Use \`*int\` for Age, validate nil vs. explicit value.

**9. Performance Considerations**

**Decoder for streaming:**
\`\`\`go
// Large file parsing
file, _ := os.Open("users.json")
dec := json.NewDecoder(file)  // Stream from file
for {
    var user UserDTO
    if err := dec.Decode(&user); err == io.EOF {
        break
    }
    process(user)  // Memory-efficient, one user at a time
}
\`\`\`

**Unmarshal requires full data in memory:**
\`\`\`go
// BAD for large files
data, _ := os.ReadFile("users.json")  // Load entire file!
var users []UserDTO
json.Unmarshal(data, &users)  // Parse all at once
\`\`\`

**10. Testing Strategies**

**Test all validation branches:**
\`\`\`go
func TestStrictDecode(t *testing.T) {
    tests := []struct{
        name string
        input string
        wantErr bool
    }{
        {"valid", \`{"id":1,"name":"Alice"}\`, false},
        {"unknown field", \`{"id":1,"name":"Bob","extra":"bad"}\`, true},
        {"trailing tokens", \`{"id":1,"name":"Eve"}{"more":"data"}\`, true},
        {"invalid ID", \`{"id":0,"name":"Bad"}\`, true},
        {"empty name", \`{"id":1,"name":""}\`, true},
        {"negative age", \`{"id":1,"name":"Young","age":-1}\`, true},
        {"optional age", \`{"id":1,"name":"Ageless"}\`, false},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            _, err := StrictDecode([]byte(tt.input))
            if (err != nil) != tt.wantErr {
                t.Errorf("wanted error=%v, got error=%v", tt.wantErr, err != nil)
            }
        })
    }
}
\`\`\`

**Key Takeaways:**
- Always use \`DisallowUnknownFields()\` for untrusted input
- Check for trailing tokens with \`ensureEOF\`
- Separate business validation from parsing
- Use \`*T\` for optional fields (nil = absent)
- Use \`json.Decoder\` for strict control and streaming
- Decode arrays to \`[]json.RawMessage\` for per-item validation
- Never use \`Must*\` functions for user input
- Centralize validation logic in single function
- Test all validation branches and edge cases`,
	order: 0,
	translations: {
		ru: {
			title: 'Строгая JSON валидация и кодирование',
			description: `Реализуйте production-grade JSON парсинг со строгой валидацией, отклонением неизвестных полей, применением бизнес-правил и обнаружением trailing tokens.

**Вы реализуете:**

**Уровни 1-4 (Лёгкий → Средний+) — Строгое декодирование:**
1. **UserDTO struct** — DTO с JSON тегами для id, name, age (опциональный)
2. **StrictDecode(data []byte) (UserDTO, error)** — Строгий JSON decoder:
   2.1. Использует \`json.Decoder\` с \`DisallowUnknownFields()\`
   2.2. Валидирует бизнес-правила через \`ValidateUser\`
   2.3. Проверяет trailing tokens после объекта

**Уровень 5 (Средний) — Бизнес валидация:**
3. **ValidateUser(u UserDTO) error** — Проверка бизнес-правил:
   3.1. \`ID > 0\` (положительный идентификатор)
   3.2. \`Name != ""\` (непустое имя)
   3.3. \`Age == nil\` или \`*Age >= 0\` (опционально, но неотрицательный если присутствует)

**Уровень 6 (Средний+) — Декодирование массива:**
4. **StrictDecodeList(data []byte) ([]UserDTO, error)** — Декодирование массива с поэлементной валидацией:
   4.1. Декодировать в \`[]json.RawMessage\`
   4.2. Вызвать \`StrictDecode\` для каждого элемента
   4.3. Быстрый отказ при первой ошибке

**Уровень 7 (Средний+) — Кодирование:**
5. **MarshalUser(u UserDTO) ([]byte, error)** — Валидация перед кодированием

**Уровень 8 (Средний+) — Panic Wrapper:**
6. **MustStrictDecode(data []byte) UserDTO** — Panic при ошибке декодирования

**Вспомогательная функция:**
7. **ensureEOF(dec *json.Decoder) error** — Проверка отсутствия trailing tokens

**Ключевые концепции:**
- **json.Decoder vs json.Unmarshal**: Decoder предоставляет потоковую обработку и более строгий контроль
- **DisallowUnknownFields**: Функция безопасности для отклонения лишних полей
- **Trailing Token Detection**: Предотвращение атак с частичным парсингом
- **Optional Fields**: Использование указателей для семантики omitempty
- **Validation Separation**: Бизнес-логика отделена от парсинга

**Пример использования:**

\`\`\`go
// Валидный пользователь
valid := []byte(\`{"id": 1, "name": "Alice", "age": 25}\`)
user, err := StrictDecode(valid)
// user = UserDTO{ID: 1, Name: "Alice", Age: &25}, err = nil

// Неизвестное поле отклонено
unknown := []byte(\`{"id": 1, "name": "Bob", "role": "admin"}\`)
_, err = StrictDecode(unknown)
// err != nil (неизвестное поле "role")

// Невалидные бизнес-правила
invalidID := []byte(\`{"id": 0, "name": "Charlie"}\`)
_, err = StrictDecode(invalidID)
// err = ErrBadInput (ID должен быть > 0)

emptyName := []byte(\`{"id": 1, "name": ""}\`)
_, err = StrictDecode(emptyName)
// err = ErrBadInput (имя не может быть пустым)

negativeAge := []byte(\`{"id": 1, "name": "Dave", "age": -5}\`)
_, err = StrictDecode(negativeAge)
// err = ErrBadInput (возраст не может быть отрицательным)

// Опциональное поле age
noAge := []byte(\`{"id": 1, "name": "Eve"}\`)
user, err = StrictDecode(noAge)
// user = UserDTO{ID: 1, Name: "Eve", Age: nil}, err = nil

// Trailing tokens отклонены
trailing := []byte(\`{"id": 1, "name": "Frank"}{"extra": "data"}\`)
_, err = StrictDecode(trailing)
// err != nil (обнаружены trailing tokens)

// Декодирование массива
array := []byte(\`[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]\`)
users, err := StrictDecodeList(array)
// users = []UserDTO{{ID: 1, Name: "Alice"}, {ID: 2, Name: "Bob"}}

// Кодирование с валидацией
user := UserDTO{ID: 1, Name: "Alice", Age: ptr(25)}
data, err := MarshalUser(user)
// data = \`{"id":1,"name":"Alice","age":25}\`, err = nil

invalidUser := UserDTO{ID: 0, Name: "Bad"}
_, err = MarshalUser(invalidUser)
// err = ErrBadInput (валидация перед кодированием)

// Panic версия
user = MustStrictDecode([]byte(\`{"id": 1, "name": "Alice"}\`))
// user = UserDTO{ID: 1, Name: "Alice"}

// MustStrictDecode([]byte(\`invalid\`)) // PANIC
\`\`\`

**Ограничения:**
- UserDTO: Используйте JSON теги, Age — это *int для опционального поля
- StrictDecode: Должен вызывать DisallowUnknownFields() и ensureEOF()
- ValidateUser: Возвращать ErrBadInput при нарушении правил
- StrictDecodeList: Переиспользовать StrictDecode для каждого элемента
- MarshalUser: Валидировать перед маршалингом
- MustStrictDecode: Panic при любой ошибке`,
			hint1: `StrictDecode: Создайте decoder через json.NewDecoder(bytes.NewReader(data)), вызовите dec.DisallowUnknownFields(), Decode в dto, затем ValidateUser(dto), затем ensureEOF(dec). Верните dto или ошибку.`,
			hint2: `ValidateUser: Проверьте if u.ID <= 0 || u.Name == "" — верните ErrBadInput. Проверьте if u.Age != nil && *u.Age < 0 — верните ErrBadInput. StrictDecodeList: Декодируйте в []json.RawMessage, цикл и вызов StrictDecode для каждого raw элемента.`,
			whyItMatters: `Строгая JSON валидация критична для безопасности API, целостности данных и предотвращения injection-атак в production-системах.

**Почему это важно:**

**1. Отклонение неизвестных полей — функция безопасности**

**Вектор атаки**: Лишние поля используются для инъекции:

\`\`\`go
// Без DisallowUnknownFields — УЯЗВИМО
func InsecureDecode(data []byte) (UserDTO, error) {
    var user UserDTO
    json.Unmarshal(data, &user)  // Молча игнорирует неизвестные поля!
    return user, nil
}

// Атакующий отправляет:
// {"id": 1, "name": "Alice", "role": "admin", "__proto__": {...}}

// "role" и "__proto__" молча игнорируются
// Пользователь создан без проверки admin
// Prototype pollution в JavaScript бэкенде
\`\`\`

**Со строгой валидацией — БЕЗОПАСНО:**

\`\`\`go
dec := json.NewDecoder(bytes.NewReader(data))
dec.DisallowUnknownFields()  // ОТКЛОНИТЬ неизвестные поля
\`\`\`

**Реальный инцидент**: Платёжный API молча игнорировал лишние поля. Атакующий отправил \`{"amount": 100, "currency": "USD", "discount": 100}\`. Поле \`discount\` было проигнорировано при парсинге, но обработано позже другим сервисом, что привело к бесплатным транзакциям.

**2. Обнаружение Trailing Tokens**

**Атака — частичный парсинг:**

\`\`\`go
// БЕЗ проверки trailing tokens — УЯЗВИМО
func VulnerableDecode(data []byte) (UserDTO, error) {
    var user UserDTO
    json.Unmarshal(data, &user)
    // Останавливается после первого объекта, игнорирует остальное!
    return user, nil
}

// Атакующий отправляет:
// {"id": 1, "name": "Alice"}{"id": 999, "name": "Admin"}
//                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                           Этот второй объект игнорируется!

// Приложение обрабатывает первый объект
// Logger/audit система обрабатывает полный payload
// Создаёт несоответствие в audit trail
\`\`\`

**С проверкой ensureEOF:**

\`\`\`go
func ensureEOF(dec *json.Decoder) error {
    if err := dec.Decode(&struct{}{}); err != nil {
        if errors.Is(err, io.EOF) {
            return nil  // Правильный конец
        }
        return err
    }
    return ErrBadInput  // Найдены лишние токены — ОТКЛОНИТЬ
}
\`\`\`

**Реальный инцидент**: Сервис логирования обрабатывал JSON логи. Атакующие встроили дополнительные объекты после первого. Парсер остановился после первого объекта, но сохранил полный payload. При повторной обработке логов для аналитики дополнительные вредоносные объекты были выполнены, скомпрометировав аналитический пайплайн.

**3. Разделение бизнес-валидации**

**Плохая практика — валидация разбросана по разным местам:**

\`\`\`go
// НЕПРАВИЛЬНО — разбросанная валидация
func CreateUser(data []byte) error {
    var user UserDTO
    json.Unmarshal(data, &user)

    if user.ID <= 0 {  // Валидация здесь
        return errors.New("невалидный ID")
    }

    db.Insert(user)  // А если Name пустое? Не проверено!
    return nil
}

func UpdateUser(data []byte) error {
    var user UserDTO
    json.Unmarshal(data, &user)

    // Забыли проверить ID!
    if user.Name == "" {  // Валидация здесь
        return errors.New("невалидное имя")
    }

    db.Update(user)
    return nil
}
\`\`\`

**Результат**: Несогласованная валидация, баги проскакивают.

**Хорошая практика — централизованная валидация:**

\`\`\`go
// ХОРОШО — единый источник правды
func ValidateUser(u UserDTO) error {
    if u.ID <= 0 {
        return ErrBadInput
    }
    if u.Name == "" {
        return ErrBadInput
    }
    if u.Age != nil && *u.Age < 0 {
        return ErrBadInput
    }
    return nil
}

// Переиспользуется везде
func CreateUser(data []byte) error {
    user, err := StrictDecode(data)  // Автоматическая валидация
    // ...
}

func UpdateUser(data []byte) error {
    user, err := StrictDecode(data)  // Та же валидация
    // ...
}
\`\`\`

**4. Опциональные поля с указателями**

**Почему \`*int\` для Age:**

\`\`\`go
type UserDTO struct {
    Name string
    Age  int  // ПЛОХО — не может различить 0 от отсутствия
}

// {"name": "Alice"}  →  Age = 0 (по умолчанию)
// {"name": "Bob", "age": 0}  →  Age = 0 (явно)
// Невозможно различить!

type UserDTO struct {
    Name string
    Age  *int  // ХОРОШО — nil = отсутствует, не-nil = присутствует
}

// {"name": "Alice"}  →  Age = nil (отсутствует)
// {"name": "Bob", "age": 0}  →  Age = &0 (явный ноль)
// Чёткое различие!
\`\`\`

**Пример использования в продакшене**: Обновления профиля пользователя. Если Age — это int, отправка \`{"name": "Alice"}\` установит Age в 0, перезаписав существующий возраст. С \`*int\`, nil означает «не менять», явное значение означает «обновить».

**5. json.Decoder vs json.Unmarshal**

**Почему Decoder превосходит для строгого парсинга:**

\`\`\`go
// json.Unmarshal — удобно, но меньше контроля
func ParseUnmarshal(data []byte) (UserDTO, error) {
    var user UserDTO
    err := json.Unmarshal(data, &user)
    // Не может обнаружить trailing tokens!
    // Не может контролировать потоковую обработку!
    return user, err
}

// json.Decoder — полный контроль
func ParseDecoder(data []byte) (UserDTO, error) {
    dec := json.NewDecoder(bytes.NewReader(data))
    dec.DisallowUnknownFields()  // Контроль 1: Отклонить неизвестные
    var user UserDTO
    dec.Decode(&user)
    ensureEOF(dec)  // Контроль 2: Проверить trailing tokens
    return user, nil
}
\`\`\`

**Преимущества Decoder:**
- Поддержка DisallowUnknownFields()
- Потоковая обработка (эффективно для больших payload)
- Обнаружение trailing tokens
- Контроль на уровне токенов

**6. Валидация массивов с json.RawMessage**

**Почему сначала декодировать в \`[]json.RawMessage\`:**

\`\`\`go
// ПЛОХО — невозможно применить строгую валидацию поэлементно
func DecodeArrayBad(data []byte) ([]UserDTO, error) {
    var users []UserDTO
    json.Unmarshal(data, &users)
    // Каждый элемент декодирован без строгих проверок!
    return users, nil
}

// ХОРОШО — строгая валидация поэлементно
func StrictDecodeList(data []byte) ([]UserDTO, error) {
    var rawItems []json.RawMessage
    // Декодировать структуру массива
    dec.Decode(&rawItems)

    // Валидировать каждый элемент со всеми строгими проверками
    for _, raw := range rawItems {
        user, err := StrictDecode(raw)  // Переиспользовать строгий decoder!
        if err != nil {
            return nil, err  // Быстрый отказ
        }
        users = append(users, user)
    }
    return users, nil
}
\`\`\`

**Преимущество**: Каждый элемент массива получает DisallowUnknownFields, бизнес-валидацию и проверку trailing tokens.

**7. MustStrictDecode — когда использовать Panic**

**Panic-управляемая валидация для доверенных источников:**

\`\`\`go
// Для встроенного/захардкоженного JSON (известного в compile-time)
var defaultConfig = MustStrictDecode([]byte(\`{
    "id": 1,
    "name": "default",
    "age": 0
}\`))

// Для тестовых фикстур
func TestUserProcessing(t *testing.T) {
    user := MustStrictDecode([]byte(\`{"id": 1, "name": "Alice"}\`))
    // Тестовая логика
}

// НИКОГДА для пользовательского ввода!
func HandleRequest(w http.ResponseWriter, r *http.Request) {
    data, _ := io.ReadAll(r.Body)
    user := MustStrictDecode(data)  // НЕПРАВИЛЬНО — уронит сервер!
}
\`\`\`

**Правило**: Используйте функции \`Must*\` только когда неудача означает ошибку программиста, а не runtime-условие.

**8. Примеры инцидентов в продакшене**

**Инцидент 1 — NoSQL Injection через неизвестные поля:**

E-commerce платформа использовала:
\`\`\`go
var user UserDTO
json.Unmarshal(data, &user)
db.Query(bson.M{"id": user.ID})
\`\`\`

Атакующий отправил:
\`\`\`json
{"id": 1, "$where": "this.role === 'admin'"}
\`\`\`

Поле \`$where\` было молча распарсено, внедрено в MongoDB запрос, предоставив admin доступ.

**Исправление**: Используйте \`DisallowUnknownFields()\`.

**Инцидент 2 — Double-Spend через Trailing Tokens:**

Платёжный процессор:
\`\`\`go
var payment PaymentDTO
json.Unmarshal(data, &payment)
// Обрабатывает только первый объект платежа
\`\`\`

Атакующий отправил:
\`\`\`json
{"amount": 10}{"amount": 1000}
\`\`\`

Frontend обработал первый ($10), backend audit залогировал оба, analytics обработал второй ($1000), позволив double-spend.

**Исправление**: Проверяйте \`ensureEOF()\`.

**Инцидент 3 — Обход валидации возраста:**

Регистрация пользователя:
\`\`\`go
type User struct {
    Age int  // Не указатель
}

// {"name": "Kid"}  →  Age = 0 (разрешено, баг!)
// {"name": "Teen", "age": 10}  →  Age = 10 (разрешено)
\`\`\`

Несовершеннолетние регистрировались без указания возраста (по умолчанию 0), обходя возрастные ограничения.

**Исправление**: Используйте \`*int\` для Age, валидируйте nil vs явное значение.

**9. Соображения производительности**

**Decoder для потоковой обработки:**
\`\`\`go
// Парсинг большого файла
file, _ := os.Open("users.json")
dec := json.NewDecoder(file)  // Потоковая обработка из файла
for {
    var user UserDTO
    if err := dec.Decode(&user); err == io.EOF {
        break
    }
    process(user)  // Эффективно по памяти, один пользователь за раз
}
\`\`\`

**Unmarshal требует все данные в памяти:**
\`\`\`go
// ПЛОХО для больших файлов
data, _ := os.ReadFile("users.json")  // Загружает весь файл!
var users []UserDTO
json.Unmarshal(data, &users)  // Парсит всё сразу
\`\`\`

**10. Стратегии тестирования**

**Тестируйте все ветки валидации:**
\`\`\`go
func TestStrictDecode(t *testing.T) {
    tests := []struct{
        name string
        input string
        wantErr bool
    }{
        {"valid", \`{"id":1,"name":"Alice"}\`, false},
        {"unknown field", \`{"id":1,"name":"Bob","extra":"bad"}\`, true},
        {"trailing tokens", \`{"id":1,"name":"Eve"}{"more":"data"}\`, true},
        {"invalid ID", \`{"id":0,"name":"Bad"}\`, true},
        {"empty name", \`{"id":1,"name":""}\`, true},
        {"negative age", \`{"id":1,"name":"Young","age":-1}\`, true},
        {"optional age", \`{"id":1,"name":"Ageless"}\`, false},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            _, err := StrictDecode([]byte(tt.input))
            if (err != nil) != tt.wantErr {
                t.Errorf("ожидалась ошибка=%v, получена ошибка=%v", tt.wantErr, err != nil)
            }
        })
    }
}
\`\`\`

**Ключевые выводы:**
- Всегда используйте \`DisallowUnknownFields()\` для недоверенного ввода
- Проверяйте trailing tokens с \`ensureEOF\`
- Отделяйте бизнес-валидацию от парсинга
- Используйте \`*T\` для опциональных полей (nil = отсутствует)
- Используйте \`json.Decoder\` для строгого контроля и потоковой обработки
- Декодируйте массивы в \`[]json.RawMessage\` для поэлементной валидации
- Никогда не используйте функции \`Must*\` для пользовательского ввода
- Централизуйте логику валидации в одной функции
- Тестируйте все ветки валидации и граничные случаи`,
			solutionCode: `package encodingx

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
)

type UserDTO struct {
	ID   int    \`json:"id"\`
	Name string \`json:"name"\`
	Age  *int   \`json:"age,omitempty"\`
}

var ErrBadInput = errors.New("bad input")

func StrictDecode(data []byte) (UserDTO, error) {
	dec := json.NewDecoder(bytes.NewReader(data))	// потоковая обработка JSON через decoder для контроля строгости
	dec.DisallowUnknownFields()	// отклоняем payloads с неизвестными полями
	var dto UserDTO	// выделяем DTO для заполнения декодированными данными
	if err := dec.Decode(&dto); err != nil {	// декодируем первый JSON объект в dto
		return UserDTO{}, err	// передаём ошибку декодирования вызывающей стороне
	}
	if err := ValidateUser(dto); err != nil {	// проверяем, что DTO удовлетворяет бизнес-ограничениям
		return UserDTO{}, err	// возвращаем ошибку валидации для плохих данных
	}
	if err := ensureEOF(dec); err != nil {	// подтверждаем отсутствие trailing токенов после объекта
		return UserDTO{}, err	// fail когда присутствуют неожиданные дополнительные данные
	}
	return dto, nil	// возвращаем декодированный и проверенный DTO
}

func ValidateUser(u UserDTO) error {
	if u.ID <= 0 {	// отклоняем неположительные идентификаторы
		return ErrBadInput
	}
	if u.Name == "" {	// требуем непустые имена пользователей
		return ErrBadInput
	}
	if u.Age != nil && *u.Age < 0 {	// запрещаем отрицательные значения возраста когда предоставлены
		return ErrBadInput
	}
	return nil	// иначе валидация успешна
}

func StrictDecodeList(data []byte) ([]UserDTO, error) {
	dec := json.NewDecoder(bytes.NewReader(data))	// создаём decoder для array payload
	dec.DisallowUnknownFields()	// запрещаем неизвестные поля на уровне массива
	var rawItems []json.RawMessage	// храним raw JSON элементы для поэлементной валидации
	if err := dec.Decode(&rawItems); err != nil {	// декодируем весь массив в slice raw messages
		return nil, err	// передаём ошибки декодирования вызывающей стороне
	}
	if err := ensureEOF(dec); err != nil {	// проверяем отсутствие trailing токенов после массива
		return nil, err	// fail когда найдены дополнительные данные
	}
	users := make([]UserDTO, 0, len(rawItems))	// предварительно выделяем result slice с точной ёмкостью
	for _, raw := range rawItems {	// итерируем по raw JSON представлениям
		user, err := StrictDecode(raw)	// переиспользуем strict single-object decoder для каждого элемента
		if err != nil {	// останавливаем итерацию при первой ошибке валидации
			return nil, err
		}
		users = append(users, user)	// добавляем валидного пользователя в result slice
	}
	return users, nil	// возвращаем полностью декодированную коллекцию пользователей
}

func MarshalUser(u UserDTO) ([]byte, error) {
	if err := ValidateUser(u); err != nil {	// запрещаем сериализацию невалидных DTOs
		return nil, err
	}
	payload, err := json.Marshal(u)	// кодируем DTO в JSON байты
	if err != nil {	// обрабатываем потенциальные ошибки маршалинга
		return nil, err
	}
	return payload, nil	// передаём сериализованное представление вызывающей стороне
}

func MustStrictDecode(data []byte) UserDTO {
	user, err := StrictDecode(data)	// пытаемся строго декодировать используя общую логику
	if err != nil {	// panic когда декодирование не удовлетворяет строгому контракту
		panic(err)
	}
	return user	// возвращаем декодированный DTO когда парсинг успешен
}

func ensureEOF(dec *json.Decoder) error {
	if err := dec.Decode(&struct{}{}); err != nil {	// пытаемся получить следующий токен из decoder
		if errors.Is(err, io.EOF) {	// io.EOF указывает правильный конец потока
			return nil
		}
		return err	// передаём неожиданные ошибки
	}
	return ErrBadInput	// возвращаем ошибку валидации когда существуют дополнительные токены
}`
		},
		uz: {
			title: `Qat'iy JSON validatsiya va practixsh`,
			description: `Qat'iy validatsiya, noma'lum maydonlarni rad etish, biznes qoidalarini qo'llash va trailing tokenlarni aniqlash bilan production-darajali JSON parsini amalga oshiring.

**Siz amalga oshirasiz:**

**1-4 Daraja (Oson → O'rta+) — Qat'iy depractixsh:**
1. **UserDTO struct** — id, name, age (ixtiyoriy) uchun JSON teglari bilan DTO
2. **StrictDecode(data []byte) (UserDTO, error)** — Qat'iy JSON decoder:
   2.1. \`json.Decoder\` dan \`DisallowUnknownFields()\` bilan foydalanadi
   2.2. \`ValidateUser\` orqali biznes qoidalarini tekshiradi
   2.3. Ob'ektdan keyin trailing tokenlarni tekshiradi

**5-Daraja (O'rta) — Biznes validatsiya:**
3. **ValidateUser(u UserDTO) error** — Biznes qoidalarini tekshirish:
   3.1. \`ID > 0\` (musbat identifikator)
   3.2. \`Name != ""\` (bo'sh bo'lmagan ism)
   3.3. \`Age == nil\` yoki \`*Age >= 0\` (ixtiyoriy, lekin mavjud bo'lsa manfiy bo'lmasligi kerak)

**6-Daraja (O'rta+) — Massiv depractixsh:**
4. **StrictDecodeList(data []byte) ([]UserDTO, error)** — Elementlar bo'yicha validatsiya bilan massiv depractixsh:
   4.1. \`[]json.RawMessage\` ga depractixsh
   4.2. Har bir element uchun \`StrictDecode\` ni chaqirish
   4.3. Birinchi xatoda tez muvaffaqiyatsizlik

**7-Daraja (O'rta+) — Practixsh:**
5. **MarshalUser(u UserDTO) ([]byte, error)** — Practixshdan oldin validatsiya

**8-Daraja (O'rta+) — Panic Wrapper:**
6. **MustStrictDecode(data []byte) UserDTO** — Depractixsh xatosida Panic

**Yordamchi funksiya:**
7. **ensureEOF(dec *json.Decoder) error** — Trailing tokenlar yo'qligini tekshirish

**Asosiy tushunchalar:**
- **json.Decoder vs json.Unmarshal**: Decoder oqimli qayta ishlash va qat'iyroq nazoratni ta'minlaydi
- **DisallowUnknownFields**: Qo'shimcha maydonlarni rad etish uchun xavfsizlik xususiyati
- **Trailing Token Detection**: Qisman pars hujumlarini oldini olish
- **Optional Fields**: omitempty semantikasi uchun ko'rsatkichlardan foydalanish
- **Validation Separation**: Biznes mantiq parsingdan ajratilgan

**Foydalanish misoli:**

\`\`\`go
// Yaroqli foydalanuvchi
valid := []byte(\`{"id": 1, "name": "Alice", "age": 25}\`)
user, err := StrictDecode(valid)
// user = UserDTO{ID: 1, Name: "Alice", Age: &25}, err = nil

// Noma'lum maydon rad etildi
unknown := []byte(\`{"id": 1, "name": "Bob", "role": "admin"}\`)
_, err = StrictDecode(unknown)
// err != nil (noma'lum maydon "role")

// Noto'g'ri biznes qoidalari
invalidID := []byte(\`{"id": 0, "name": "Charlie"}\`)
_, err = StrictDecode(invalidID)
// err = ErrBadInput (ID > 0 bo'lishi kerak)

emptyName := []byte(\`{"id": 1, "name": ""}\`)
_, err = StrictDecode(emptyName)
// err = ErrBadInput (ism bo'sh bo'lishi mumkin emas)

negativeAge := []byte(\`{"id": 1, "name": "Dave", "age": -5}\`)
_, err = StrictDecode(negativeAge)
// err = ErrBadInput (yosh manfiy bo'lishi mumkin emas)

// Ixtiyoriy age maydoni
noAge := []byte(\`{"id": 1, "name": "Eve"}\`)
user, err = StrictDecode(noAge)
// user = UserDTO{ID: 1, Name: "Eve", Age: nil}, err = nil

// Trailing tokenlar rad etildi
trailing := []byte(\`{"id": 1, "name": "Frank"}{"extra": "data"}\`)
_, err = StrictDecode(trailing)
// err != nil (trailing tokenlar aniqlandi)

// Massiv depractixsh
array := []byte(\`[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]\`)
users, err := StrictDecodeList(array)
// users = []UserDTO{{ID: 1, Name: "Alice"}, {ID: 2, Name: "Bob"}}

// Validatsiya bilan practixsh
user := UserDTO{ID: 1, Name: "Alice", Age: ptr(25)}
data, err := MarshalUser(user)
// data = \`{"id":1,"name":"Alice","age":25}\`, err = nil

invalidUser := UserDTO{ID: 0, Name: "Bad"}
_, err = MarshalUser(invalidUser)
// err = ErrBadInput (practixshdan oldin validatsiya)

// Panic versiyasi
user = MustStrictDecode([]byte(\`{"id": 1, "name": "Alice"}\`))
// user = UserDTO{ID: 1, Name: "Alice"}

// MustStrictDecode([]byte(\`invalid\`)) // PANIC
\`\`\`

**Cheklovlar:**
- UserDTO: JSON teglaridan foydalaning, Age bu *int ixtiyoriy maydon uchun
- StrictDecode: DisallowUnknownFields() va ensureEOF() ni chaqirishi kerak
- ValidateUser: Qoidalar buzilganda ErrBadInput qaytarish
- StrictDecodeList: Har bir element uchun StrictDecode ni qayta ishlatish
- MarshalUser: Marshaling dan oldin validatsiya
- MustStrictDecode: Har qanday xatoda Panic`,
			hint1: `StrictDecode: json.NewDecoder(bytes.NewReader(data)) orqali decoder yarating, dec.DisallowUnknownFields() ni chaqiring, dto ga Decode qiling, keyin ValidateUser(dto), keyin ensureEOF(dec). dto yoki xato qaytaring.`,
			hint2: `ValidateUser: Agar u.ID <= 0 || u.Name == "" bo'lsa ErrBadInput qaytaring. Agar u.Age != nil && *u.Age < 0 bo'lsa ErrBadInput qaytaring. StrictDecodeList: []json.RawMessage ga depractixng, sikl va har bir raw element uchun StrictDecode ni chaqiring.`,
			whyItMatters: `Qat'iy JSON validatsiya API xavfsizligi, ma'lumotlar yaxlitligi va production tizimlarida injection hujumlarini oldini olish uchun muhimdir.

**Nima uchun bu muhim:**

**1. Noma'lum maydonlarni rad etish — xavfsizlik xususiyati**

**Hujum vektori**: Qo'shimcha maydonlar injection uchun ishlatiladi:

\`\`\`go
// DisallowUnknownFields yo'q — HIMOYASIZ
func InsecureDecode(data []byte) (UserDTO, error) {
    var user UserDTO
    json.Unmarshal(data, &user)  // Noma'lum maydonlarni jimgina e'tiborsiz qoldiradi!
    return user, nil
}

// Hujumchi yuboradi:
// {"id": 1, "name": "Alice", "role": "admin", "__proto__": {...}}

// "role" va "__proto__" jimgina e'tiborsiz qoldiriladi
// Foydalanuvchi admin tekshiruvisiz yaratiladi
// JavaScript backend da Prototype pollution
\`\`\`

**Qat'iy validatsiya bilan — XAVFSIZ:**

\`\`\`go
dec := json.NewDecoder(bytes.NewReader(data))
dec.DisallowUnknownFields()  // Noma'lum maydonlarni RAD ETISH
\`\`\`

**Haqiqiy hodisa**: To'lov API noma'lum maydonlarni jimgina e'tiborsiz qoldirdi. Hujumchi \`{"amount": 100, "currency": "USD", "discount": 100}\` yubordi. \`discount\` maydoni pars paytida e'tiborsiz qoldirildi, lekin keyinchalik boshqa xizmat tomonidan qayta ishlandi, bu bepul tranzaksiyalarga olib keldi.

**2. Trailing Tokenlarni aniqlash**

**Hujum — qisman pars:**

\`\`\`go
// Trailing token tekshiruvisiz — HIMOYASIZ
func VulnerableDecode(data []byte) (UserDTO, error) {
    var user UserDTO
    json.Unmarshal(data, &user)
    // Birinchi ob'ektdan keyin to'xtaydi, qolganini e'tiborsiz qoldiradi!
    return user, nil
}

// Hujumchi yuboradi:
// {"id": 1, "name": "Alice"}{"id": 999, "name": "Admin"}
//                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                           Bu ikkinchi ob'ekt e'tiborsiz qoldiriladi!

// Ilova birinchi ob'ektni qayta ishlaydi
// Logger/audit tizimi to'liq payload ni qayta ishlaydi
// Audit trail nomuvofiqligini yaratadi
\`\`\`

**ensureEOF tekshiruvi bilan:**

\`\`\`go
func ensureEOF(dec *json.Decoder) error {
    if err := dec.Decode(&struct{}{}); err != nil {
        if errors.Is(err, io.EOF) {
            return nil  // To'g'ri tugash
        }
        return err
    }
    return ErrBadInput  // Qo'shimcha tokenlar topildi — RAD ETISH
}
\`\`\`

**Haqiqiy hodisa**: Jurnal xizmati JSON jurnallarni qayta ishladi. Hujumchilar birinchidan keyin qo'shimcha ob'ektlarni joylashtirdilar. Parser birinchi ob'ektdan keyin to'xtadi, lekin to'liq payload ni saqladi. Jurnallarni analitika uchun qayta ishlashda qo'shimcha zararli ob'ektlar bajarildi, analitika quvurini buzdi.

**3. Biznes validatsiyani ajratish**

**Yomon amaliyot — validatsiya turli joylarga sochildi:**

\`\`\`go
// NOTO'G'RI — sochilib ketgan validatsiya
func CreateUser(data []byte) error {
    var user UserDTO
    json.Unmarshal(data, &user)

    if user.ID <= 0 {  // Validatsiya bu yerda
        return errors.New("noto'g'ri ID")
    }

    db.Insert(user)  // Agar Name bo'sh bo'lsa nima bo'ladi? Tekshirilmagan!
    return nil
}

func UpdateUser(data []byte) error {
    var user UserDTO
    json.Unmarshal(data, &user)

    // ID ni tekshirishni unutdik!
    if user.Name == "" {  // Validatsiya bu yerda
        return errors.New("noto'g'ri ism")
    }

    db.Update(user)
    return nil
}
\`\`\`

**Natija**: Nomuvofiq validatsiya, xatolar o'tib ketadi.

**Yaxshi amaliyot — markazlashtirilgan validatsiya:**

\`\`\`go
// YAXSHI — yagona haqiqat manbai
func ValidateUser(u UserDTO) error {
    if u.ID <= 0 {
        return ErrBadInput
    }
    if u.Name == "" {
        return ErrBadInput
    }
    if u.Age != nil && *u.Age < 0 {
        return ErrBadInput
    }
    return nil
}

// Hamma joyda qayta ishlatiladi
func CreateUser(data []byte) error {
    user, err := StrictDecode(data)  // Avtomatik validatsiya
    // ...
}

func UpdateUser(data []byte) error {
    user, err := StrictDecode(data)  // Bir xil validatsiya
    // ...
}
\`\`\`

**4. Ko'rsatkichlar bilan ixtiyoriy maydonlar**

**Nima uchun Age uchun \`*int\`:**

\`\`\`go
type UserDTO struct {
    Name string
    Age  int  // YOMON — 0 ni yo'qlikdan ajrata olmaydi
}

// {"name": "Alice"}  →  Age = 0 (standart)
// {"name": "Bob", "age": 0}  →  Age = 0 (aniq)
// Ajratib bo'lmaydi!

type UserDTO struct {
    Name string
    Age  *int  // YAXSHI — nil = yo'q, nil emas = mavjud
}

// {"name": "Alice"}  →  Age = nil (yo'q)
// {"name": "Bob", "age": 0}  →  Age = &0 (aniq nol)
// Aniq farq!
\`\`\`

**Ishlab chiqarishda foydalanish**: Foydalanuvchi profil yangilanishlari. Agar Age int bo'lsa, \`{"name": "Alice"}\` yuborish Age ni 0 ga o'rnatadi, mavjud yoshni qayta yozadi. \`*int\` bilan, nil «o'zgartirmang» degani, aniq qiymat «yangilang» degani.

**5. json.Decoder vs json.Unmarshal**

**Nima uchun Decoder qat'iy pars uchun ustun:**

\`\`\`go
// json.Unmarshal — qulay, lekin kamroq nazorat
func ParseUnmarshal(data []byte) (UserDTO, error) {
    var user UserDTO
    err := json.Unmarshal(data, &user)
    // Trailing tokenlarni aniqlay olmaydi!
    // Oqim qayta ishlashni boshqara olmaydi!
    return user, err
}

// json.Decoder — to'liq nazorat
func ParseDecoder(data []byte) (UserDTO, error) {
    dec := json.NewDecoder(bytes.NewReader(data))
    dec.DisallowUnknownFields()  // Nazorat 1: Noma'lumlarni rad etish
    var user UserDTO
    dec.Decode(&user)
    ensureEOF(dec)  // Nazorat 2: Trailing tokenlarni tekshirish
    return user, nil
}
\`\`\`

**Decoder afzalliklari:**
- DisallowUnknownFields() qo'llab-quvvatlashi
- Oqim qayta ishlash (katta payloadlar uchun samarali)
- Trailing token aniqlash
- Token darajasida nazorat

**6. json.RawMessage bilan massiv validatsiyasi**

**Nima uchun avval \`[]json.RawMessage\` ga depractixsh:**

\`\`\`go
// YOMON — elementlar bo'yicha qat'iy validatsiya qo'llab bo'lmaydi
func DecodeArrayBad(data []byte) ([]UserDTO, error) {
    var users []UserDTO
    json.Unmarshal(data, &users)
    // Har bir element qat'iy tekshiruvsiz depractixndi!
    return users, nil
}

// YAXSHI — elementlar bo'yicha qat'iy validatsiya
func StrictDecodeList(data []byte) ([]UserDTO, error) {
    var rawItems []json.RawMessage
    // Massiv strukturasini depractixsh
    dec.Decode(&rawItems)

    // Har bir elementni to'liq qat'iy tekshiruvlar bilan validatsiya qilish
    for _, raw := range rawItems {
        user, err := StrictDecode(raw)  // Qat'iy decoder ni qayta ishlatish!
        if err != nil {
            return nil, err  // Tez muvaffaqiyatsizlik
        }
        users = append(users, user)
    }
    return users, nil
}
\`\`\`

**Afzalligi**: Har bir massiv elementi DisallowUnknownFields, biznes validatsiya va trailing token tekshiruvlarini oladi.

**7. MustStrictDecode — Panic ni qachon ishlatish**

**Ishonchli manbalar uchun panic boshqariladigan validatsiya:**

\`\`\`go
// O'rnatilgan/hardcoded JSON uchun (compile-time ma'lum)
var defaultConfig = MustStrictDecode([]byte(\`{
    "id": 1,
    "name": "default",
    "age": 0
}\`))

// Test fiksturalari uchun
func TestUserProcessing(t *testing.T) {
    user := MustStrictDecode([]byte(\`{"id": 1, "name": "Alice"}\`))
    // Test mantiq
}

// HECH QACHON foydalanuvchi kiritishi uchun!
func HandleRequest(w http.ResponseWriter, r *http.Request) {
    data, _ := io.ReadAll(r.Body)
    user := MustStrictDecode(data)  // NOTO'G'RI — serverni yiqitadi!
}
\`\`\`

**Qoida**: \`Must*\` funksiyalarini faqat muvaffaqiyatsizlik dasturchi xatosini bildirgan holda ishlating, runtime sharoitini emas.

**8. Ishlab chiqarishdagi hodisa misollari**

**Hodisa 1 — Noma'lum maydonlar orqali NoSQL Injection:**

E-commerce platformasi foydalangan:
\`\`\`go
var user UserDTO
json.Unmarshal(data, &user)
db.Query(bson.M{"id": user.ID})
\`\`\`

Hujumchi yubordi:
\`\`\`json
{"id": 1, "$where": "this.role === 'admin'"}
\`\`\`

\`$where\` maydoni jimgina pars qilindi, MongoDB so'roviga kiritildi, admin kirishni berdi.

**Tuzatish**: \`DisallowUnknownFields()\` dan foydalaning.

**Hodisa 2 — Trailing Tokenlar orqali Double-Spend:**

To'lov protsessori:
\`\`\`go
var payment PaymentDTO
json.Unmarshal(data, &payment)
// Faqat birinchi to'lov ob'ektini qayta ishlaydi
\`\`\`

Hujumchi yubordi:
\`\`\`json
{"amount": 10}{"amount": 1000}
\`\`\`

Frontend birinchisini ($10) qayta ishladi, backend audit ikkalasini qayd qildi, analytics ikkinchisini ($1000) qayta ishladi, double-spend ga imkon berdi.

**Tuzatish**: \`ensureEOF()\` ni tekshiring.

**Hodisa 3 — Yosh validatsiyasini chetlab o'tish:**

Foydalanuvchi ro'yxatdan o'tish:
\`\`\`go
type User struct {
    Age int  // Ko'rsatkich emas
}

// {"name": "Kid"}  →  Age = 0 (ruxsat berildi, xato!)
// {"name": "Teen", "age": 10}  →  Age = 10 (ruxsat berildi)
\`\`\`

Voyaga yetmaganlar yosh ko'rsatmasdan ro'yxatdan o'tdilar (standart 0 ga), yosh cheklovlarini chetlab o'tdilar.

**Tuzatish**: Age uchun \`*int\` dan foydalaning, nil va aniq qiymatni tekshiring.

**9. Ishlash bo'yicha mulohazalar**

**Oqim qayta ishlash uchun Decoder:**
\`\`\`go
// Katta faylni pars qilish
file, _ := os.Open("users.json")
dec := json.NewDecoder(file)  // Fayldan oqim
for {
    var user UserDTO
    if err := dec.Decode(&user); err == io.EOF {
        break
    }
    process(user)  // Xotira samarali, bir vaqtda bitta foydalanuvchi
}
\`\`\`

**Unmarshal barcha ma'lumotlarni xotirada talab qiladi:**
\`\`\`go
// Katta fayllar uchun YOMON
data, _ := os.ReadFile("users.json")  // Butun faylni yuklaydi!
var users []UserDTO
json.Unmarshal(data, &users)  // Hammasini bir vaqtda pars qiladi
\`\`\`

**10. Testlash strategiyalari**

**Barcha validatsiya tarmoqlarini testlang:**
\`\`\`go
func TestStrictDecode(t *testing.T) {
    tests := []struct{
        name string
        input string
        wantErr bool
    }{
        {"yaroqli", \`{"id":1,"name":"Alice"}\`, false},
        {"noma'lum maydon", \`{"id":1,"name":"Bob","extra":"bad"}\`, true},
        {"trailing tokenlar", \`{"id":1,"name":"Eve"}{"more":"data"}\`, true},
        {"noto'g'ri ID", \`{"id":0,"name":"Bad"}\`, true},
        {"bo'sh ism", \`{"id":1,"name":""}\`, true},
        {"manfiy yosh", \`{"id":1,"name":"Young","age":-1}\`, true},
        {"ixtiyoriy yosh", \`{"id":1,"name":"Ageless"}\`, false},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            _, err := StrictDecode([]byte(tt.input))
            if (err != nil) != tt.wantErr {
                t.Errorf("xato kutildi=%v, xato olindi=%v", tt.wantErr, err != nil)
            }
        })
    }
}
\`\`\`

**Asosiy xulosalar:**
- Ishonchsiz kiritish uchun har doim \`DisallowUnknownFields()\` dan foydalaning
- \`ensureEOF\` bilan trailing tokenlarni tekshiring
- Biznes validatsiyani parsingdan ajrating
- Ixtiyoriy maydonlar uchun \`*T\` dan foydalaning (nil = yo'q)
- Qat'iy nazorat va oqim qayta ishlash uchun \`json.Decoder\` dan foydalaning
- Elementlar bo'yicha validatsiya uchun massivlarni \`[]json.RawMessage\` ga depractixng
- Foydalanuvchi kiritishi uchun \`Must*\` funksiyalaridan hech qachon foydalanmang
- Validatsiya mantiqini bitta funksiyada markazlashtiring
- Barcha validatsiya tarmoqlari va chegaraviy holatlarni testlang`,
			solutionCode: `package encodingx

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
)

type UserDTO struct {
	ID   int    \`json:"id"\`
	Name string \`json:"name"\`
	Age  *int   \`json:"age,omitempty"\`
}

var ErrBadInput = errors.New("bad input")

func StrictDecode(data []byte) (UserDTO, error) {
	dec := json.NewDecoder(bytes.NewReader(data))	// qat'iylikni nazorat qilish uchun decoder orqali JSON ni oqimli qayta ishlash
	dec.DisallowUnknownFields()	// noma'lum maydonli payload larni rad etish
	var dto UserDTO	// depractixngan ma'lumotlar bilan to'ldirish uchun DTO ajratish
	if err := dec.Decode(&dto); err != nil {	// birinchi JSON ob'ektini dto ga depractixsh
		return UserDTO{}, err	// depractixsh xatosini chaqiruvchiga uzatish
	}
	if err := ValidateUser(dto); err != nil {	// DTO biznes cheklovlarini qondirishini tekshirish
		return UserDTO{}, err	// yomon kiritish uchun validatsiya xatosini qaytarish
	}
	if err := ensureEOF(dec); err != nil {	// ob'ektdan keyin trailing tokenlar yo'qligini tasdiqlash
		return UserDTO{}, err	// kutilmagan qo'shimcha ma'lumotlar mavjud bo'lganda muvaffaqiyatsizlik
	}
	return dto, nil	// depractixngan va tekshirilgan DTO ni qaytarish
}

func ValidateUser(u UserDTO) error {
	if u.ID <= 0 {	// musbat bo'lmagan identifikatorlarni rad etish
		return ErrBadInput
	}
	if u.Name == "" {	// bo'sh bo'lmagan foydalanuvchi ismlarini talab qilish
		return ErrBadInput
	}
	if u.Age != nil && *u.Age < 0 {	// berilganda manfiy yosh qiymatlarini taqiqlash
		return ErrBadInput
	}
	return nil	// aks holda validatsiya muvaffaqiyatli
}

func StrictDecodeList(data []byte) ([]UserDTO, error) {
	dec := json.NewDecoder(bytes.NewReader(data))	// massiv payload uchun decoder yaratish
	dec.DisallowUnknownFields()	// yuqori darajadagi massivda noma'lum maydonlarni taqiqlash
	var rawItems []json.RawMessage	// elementlar bo'yicha validatsiya uchun raw JSON elementlarini saqlash
	if err := dec.Decode(&rawItems); err != nil {	// butun massivni raw messages slice ga depractixsh
		return nil, err	// depractixsh xatolarini chaqiruvchiga uzatish
	}
	if err := ensureEOF(dec); err != nil {	// massivdan keyin trailing tokenlar yo'qligini tekshirish
		return nil, err	// qo'shimcha ma'lumotlar topilganda muvaffaqiyatsizlik
	}
	users := make([]UserDTO, 0, len(rawItems))	// aniq sig'im bilan natija slice ni oldindan ajratish
	for _, raw := range rawItems {	// raw JSON tasvir ustidan iteratsiya
		user, err := StrictDecode(raw)	// har bir element uchun qat'iy bitta-ob'ektli decoder ni qayta ishlatish
		if err != nil {	// birinchi validatsiya muvaffaqiyatsizligida iteratsiyani to'xtatish
			return nil, err
		}
		users = append(users, user)	// yaroqli foydalanuvchini natija slice ga qo'shish
	}
	return users, nil	// to'liq depractixngan foydalanuvchi kolleksiyasini qaytarish
}

func MarshalUser(u UserDTO) ([]byte, error) {
	if err := ValidateUser(u); err != nil {	// noto'g'ri DTOlarni serializatsiya qilishni taqiqlash
		return nil, err
	}
	payload, err := json.Marshal(u)	// DTO ni JSON baytlariga practixsh
	if err != nil {	// marshaling xatolarini qayta ishlash
		return nil, err
	}
	return payload, nil	// serializatsiya qilingan tasvirni chaqiruvchiga uzatish
}

func MustStrictDecode(data []byte) UserDTO {
	user, err := StrictDecode(data)	// umumiy mantiq yordamida qat'iy depractixshga harakat qilish
	if err != nil {	// depractixsh qat'iy shartnomani qondirganda panic
		panic(err)
	}
	return user	// pars muvaffaqiyatli bo'lganda depractixngan DTO ni qaytarish
}

func ensureEOF(dec *json.Decoder) error {
	if err := dec.Decode(&struct{}{}); err != nil {	// decoder dan keyingi tokenni olishga harakat qilish
		if errors.Is(err, io.EOF) {	// io.EOF oqimning to'g'ri tugashini bildiradi
			return nil
		}
		return err	// kutilmagan xatolarni uzatish
	}
	return ErrBadInput	// qo'shimcha tokenlar mavjud bo'lganda validatsiya xatosini qaytarish
}`
		}
	}
};

export default task;
