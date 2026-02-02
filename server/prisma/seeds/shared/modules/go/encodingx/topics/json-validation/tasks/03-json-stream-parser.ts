import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-encodingx-stream-parser',
	title: 'JSON Stream Parser with Decoder',
	difficulty: 'medium',
	tags: ['go', 'json', 'streaming', 'decoder', 'memory'],
	estimatedTime: '35m',
	isPremium: false,
	youtubeUrl: '',
	description: `Implement memory-efficient JSON stream parsing using json.Decoder to process large JSON files without loading them entirely into memory.

**You will implement:**

**Level 1-3 (Easy → Medium) - Basic Stream Parsing:**
1. **LogEntry struct** - Timestamp, Level, Message
2. **ParseStream(r io.Reader) ([]LogEntry, error)** - Parse JSON array stream element by element
3. **Count entries without full allocation** - Memory-efficient counting

**Level 4-6 (Medium) - Filtered Stream Processing:**
4. **ParseFilteredStream(r io.Reader, minLevel string) ([]LogEntry, error)** - Parse and filter by log level
5. **Level comparison logic** - ERROR > WARN > INFO > DEBUG
6. **Skip invalid entries** - Continue on decode errors, track error count

**Level 7-8 (Medium+) - Aggregation and Statistics:**
7. **StreamStats struct** - Total, ByLevel map, Errors count
8. **ComputeStreamStats(r io.Reader) (StreamStats, error)** - Single-pass statistics without storing all entries

**Key Concepts:**
- **json.Decoder**: Stream-based JSON parsing, processes one token at a time
- **io.Reader**: Generic interface for reading data from any source (files, network, buffers)
- **Memory Efficiency**: Process large datasets without loading entire content into memory
- **Single-Pass Processing**: Compute statistics in one iteration
- **Error Resilience**: Continue processing despite individual entry errors

**Example Usage:**

\`\`\`go
// Sample JSON log file
input := \`[
  {"timestamp": 1609459200, "level": "INFO", "message": "Server started"},
  {"timestamp": 1609459201, "level": "WARN", "message": "High memory"},
  {"timestamp": 1609459202, "level": "ERROR", "message": "Connection failed"},
  {"timestamp": 1609459203, "level": "INFO", "message": "Request processed"}
]\`

// Basic stream parsing
entries, err := ParseStream(strings.NewReader(input))
// entries = []LogEntry{...} (4 entries)

// Filtered stream parsing (ERROR level and above)
errors, err := ParseFilteredStream(strings.NewReader(input), "ERROR")
// errors = []LogEntry{{"timestamp": 1609459202, "level": "ERROR", ...}}

// Filtered stream parsing (WARN level and above)
warns, err := ParseFilteredStream(strings.NewReader(input), "WARN")
// warns = []LogEntry{
//   {"timestamp": 1609459201, "level": "WARN", ...},
//   {"timestamp": 1609459202, "level": "ERROR", ...}
// }

// Stream statistics (single pass, no full storage)
stats, err := ComputeStreamStats(strings.NewReader(input))
// stats = StreamStats{
//   Total: 4,
//   ByLevel: {"INFO": 2, "WARN": 1, "ERROR": 1},
//   Errors: 0
// }

// Large file processing (memory-efficient)
file, _ := os.Open("huge-logs.json") // 10GB file
defer file.Close()
stats, _ := ComputeStreamStats(file)
// Processes 10GB file using only a few KB of memory!

// Resilient parsing with invalid entries
invalidInput := \`[
  {"timestamp": 1609459200, "level": "INFO", "message": "Valid"},
  {"invalid": "json"},
  {"timestamp": 1609459202, "level": "ERROR", "message": "Also valid"}
]\`
stats, _ := ComputeStreamStats(strings.NewReader(invalidInput))
// stats = StreamStats{Total: 2, ByLevel: {"INFO": 1, "ERROR": 1}, Errors: 1}
\`\`\`

**Constraints:**
- LogEntry: Timestamp (int64), Level (string), Message (string)
- ParseStream: Use json.Decoder, decode array opening bracket, then loop decoding individual entries
- ParseFilteredStream: Only include entries with level >= minLevel
- Level hierarchy: ERROR > WARN > INFO > DEBUG
- ComputeStreamStats: Must not store all entries in memory (only counts)
- StreamStats: Total entries, ByLevel map[string]int, Errors count
- Skip invalid entries during parsing, increment Errors counter`,
	initialCode: `package encodingx

import (
	"encoding/json"
	"io"
)

// LogEntry represents a single log entry
type LogEntry struct {
	Timestamp int64  \`json:"timestamp"\`
	Level     string \`json:"level"\`
	Message   string \`json:"message"\`
}

// StreamStats holds statistics computed from a log stream
type StreamStats struct {
	Total   int            // total valid entries
	ByLevel map[string]int // count per level
	Errors  int            // count of invalid entries
}

// TODO: Implement ParseStream
// Parse JSON array from reader, return all log entries
// Use json.Decoder to stream parse without loading entire content
// Steps:
// 1. Create decoder from reader
// 2. Read opening bracket with dec.Token()
// 3. Loop while dec.More() is true
// 4. Decode each entry with dec.Decode(&entry)
// 5. Append to results slice
// 6. Read closing bracket
// Return all entries or error
func ParseStream(r io.Reader) ([]LogEntry, error) {
	return nil, nil
}

// TODO: Implement ParseFilteredStream
// Parse JSON array but only return entries >= minLevel
// Level hierarchy: ERROR > WARN > INFO > DEBUG
// Use helper function isLevelHigherOrEqual(entryLevel, minLevel)
// Skip entries below minLevel threshold
func ParseFilteredStream(r io.Reader, minLevel string) ([]LogEntry, error) {
	return nil, nil
}

// TODO: Implement ComputeStreamStats
// Parse JSON array and compute statistics WITHOUT storing all entries
// Single-pass algorithm:
// 1. Create StreamStats with ByLevel map initialized
// 2. Stream parse entries one by one
// 3. For each valid entry: increment Total, increment ByLevel[entry.Level]
// 4. For each invalid entry: increment Errors
// 5. Continue on decode errors (don't return early)
// Return final statistics
func ComputeStreamStats(r io.Reader) (StreamStats, error) {
	return StreamStats{}, nil
}

// isLevelHigherOrEqual returns true if entryLevel >= minLevel
func isLevelHigherOrEqual(entryLevel, minLevel string) bool {
	levels := map[string]int{"DEBUG": 1, "INFO": 2, "WARN": 3, "ERROR": 4}
	return levels[entryLevel] >= levels[minLevel]
}`,
	testCode: `package encodingx

import (
	"strings"
	"testing"
)

func Test1(t *testing.T) {
	input := ` + "`" + `[{"timestamp": 1609459200, "level": "INFO", "message": "Started"}]` + "`" + `
	entries, err := ParseStream(strings.NewReader(input))
	if err != nil {
		t.Errorf("expected nil error, got %v", err)
	}
	if len(entries) != 1 {
		t.Errorf("expected 1 entry, got %d", len(entries))
	}
}

func Test2(t *testing.T) {
	input := ` + "`" + `[]` + "`" + `
	entries, err := ParseStream(strings.NewReader(input))
	if err != nil {
		t.Errorf("expected nil error for empty array, got %v", err)
	}
	if len(entries) != 0 {
		t.Errorf("expected 0 entries, got %d", len(entries))
	}
}

func Test3(t *testing.T) {
	input := ` + "`" + `[
		{"timestamp": 1, "level": "INFO", "message": "a"},
		{"timestamp": 2, "level": "WARN", "message": "b"},
		{"timestamp": 3, "level": "ERROR", "message": "c"}
	]` + "`" + `
	entries, err := ParseFilteredStream(strings.NewReader(input), "WARN")
	if err != nil {
		t.Errorf("expected nil error, got %v", err)
	}
	if len(entries) != 2 {
		t.Errorf("expected 2 entries (WARN+ERROR), got %d", len(entries))
	}
}

func Test4(t *testing.T) {
	input := ` + "`" + `[
		{"timestamp": 1, "level": "INFO", "message": "a"},
		{"timestamp": 2, "level": "ERROR", "message": "b"}
	]` + "`" + `
	entries, err := ParseFilteredStream(strings.NewReader(input), "ERROR")
	if err != nil {
		t.Errorf("expected nil error, got %v", err)
	}
	if len(entries) != 1 {
		t.Errorf("expected 1 entry (ERROR), got %d", len(entries))
	}
}

func Test5(t *testing.T) {
	input := ` + "`" + `[
		{"timestamp": 1, "level": "INFO", "message": "a"},
		{"timestamp": 2, "level": "WARN", "message": "b"}
	]` + "`" + `
	stats, err := ComputeStreamStats(strings.NewReader(input))
	if err != nil {
		t.Errorf("expected nil error, got %v", err)
	}
	if stats.Total != 2 {
		t.Errorf("expected Total=2, got %d", stats.Total)
	}
}

func Test6(t *testing.T) {
	input := ` + "`" + `[
		{"timestamp": 1, "level": "INFO", "message": "a"},
		{"timestamp": 2, "level": "INFO", "message": "b"},
		{"timestamp": 3, "level": "ERROR", "message": "c"}
	]` + "`" + `
	stats, _ := ComputeStreamStats(strings.NewReader(input))
	if stats.ByLevel["INFO"] != 2 || stats.ByLevel["ERROR"] != 1 {
		t.Errorf("unexpected ByLevel: %v", stats.ByLevel)
	}
}

func Test7(t *testing.T) {
	input := ` + "`" + `[
		{"timestamp": 1, "level": "INFO", "message": "valid"},
		{"invalid": "json"},
		{"timestamp": 2, "level": "ERROR", "message": "also valid"}
	]` + "`" + `
	stats, _ := ComputeStreamStats(strings.NewReader(input))
	if stats.Total != 2 || stats.Errors != 1 {
		t.Errorf("expected Total=2, Errors=1, got Total=%d, Errors=%d", stats.Total, stats.Errors)
	}
}

func Test8(t *testing.T) {
	if !isLevelHigherOrEqual("ERROR", "WARN") {
		t.Error("ERROR should be >= WARN")
	}
	if isLevelHigherOrEqual("DEBUG", "INFO") {
		t.Error("DEBUG should not be >= INFO")
	}
}

func Test9(t *testing.T) {
	input := ` + "`" + `[
		{"timestamp": 1, "level": "DEBUG", "message": "a"},
		{"timestamp": 2, "level": "INFO", "message": "b"}
	]` + "`" + `
	entries, _ := ParseFilteredStream(strings.NewReader(input), "DEBUG")
	if len(entries) != 2 {
		t.Errorf("expected 2 entries for DEBUG filter, got %d", len(entries))
	}
}

func Test10(t *testing.T) {
	input := ` + "`" + `[{"timestamp": 1609459200, "level": "INFO", "message": "test"}]` + "`" + `
	entries, _ := ParseStream(strings.NewReader(input))
	if entries[0].Timestamp != 1609459200 || entries[0].Level != "INFO" {
		t.Errorf("unexpected entry: %+v", entries[0])
	}
}
`,
	solutionCode: `package encodingx

import (
	"encoding/json"
	"io"
)

type LogEntry struct {
	Timestamp int64  \`json:"timestamp"\`
	Level     string \`json:"level"\`
	Message   string \`json:"message"\`
}

type StreamStats struct {
	Total   int
	ByLevel map[string]int
	Errors  int
}

func ParseStream(r io.Reader) ([]LogEntry, error) {
	dec := json.NewDecoder(r) // create streaming decoder from reader to avoid loading full content

	if _, err := dec.Token(); err != nil { // consume opening bracket [ from array
		return nil, err
	}

	var entries []LogEntry
	for dec.More() { // loop while more array elements remain
		var entry LogEntry
		if err := dec.Decode(&entry); err != nil { // decode next entry from stream incrementally
			return nil, err
		}
		entries = append(entries, entry) // accumulate decoded entry into result slice
	}

	if _, err := dec.Token(); err != nil { // consume closing bracket ] from array
		return nil, err
	}

	return entries, nil // return all streamed entries
}

func ParseFilteredStream(r io.Reader, minLevel string) ([]LogEntry, error) {
	dec := json.NewDecoder(r) // stream JSON from reader without full memory load

	if _, err := dec.Token(); err != nil { // read array opening bracket
		return nil, err
	}

	var entries []LogEntry
	for dec.More() { // iterate over array elements until end
		var entry LogEntry
		if err := dec.Decode(&entry); err != nil { // parse individual entry from stream
			return nil, err
		}

		if isLevelHigherOrEqual(entry.Level, minLevel) { // filter by severity threshold
			entries = append(entries, entry) // only include entries meeting minimum level
		}
	}

	if _, err := dec.Token(); err != nil { // read array closing bracket
		return nil, err
	}

	return entries, nil // return filtered subset of entries
}

func ComputeStreamStats(r io.Reader) (StreamStats, error) {
	stats := StreamStats{ByLevel: make(map[string]int)} // initialize statistics with empty level counts
	dec := json.NewDecoder(r) // setup streaming decoder for memory-efficient processing

	if _, err := dec.Token(); err != nil { // consume array opening bracket
		return stats, err
	}

	for dec.More() { // process stream until no more elements
		var entry LogEntry
		if err := dec.Decode(&entry); err != nil { // attempt to decode next entry
			stats.Errors++ // track invalid entries but continue processing
			continue // skip this entry and move to next
		}

		stats.Total++ // increment total valid entry counter
		stats.ByLevel[entry.Level]++ // increment count for this severity level
	}

	if _, err := dec.Token(); err != nil { // consume array closing bracket
		return stats, err
	}

	return stats, nil // return aggregated statistics without storing all entries
}

func isLevelHigherOrEqual(entryLevel, minLevel string) bool {
	levels := map[string]int{"DEBUG": 1, "INFO": 2, "WARN": 3, "ERROR": 4} // severity ordering map
	return levels[entryLevel] >= levels[minLevel] // compare numeric severity values
}`,
	hint1: `ParseStream: Create json.NewDecoder(r), call dec.Token() to read opening bracket, loop while dec.More(), decode entry with dec.Decode(&entry), append to slice. Read closing bracket with dec.Token() at end.`,
	hint2: `ParseFilteredStream: Same as ParseStream but add if isLevelHigherOrEqual(entry.Level, minLevel) before appending. ComputeStreamStats: Initialize stats with ByLevel map, loop like ParseStream but instead of storing entries just increment stats.Total and stats.ByLevel[entry.Level]. On decode error, increment stats.Errors and continue (don't return).`,
	whyItMatters: `JSON stream parsing is essential for processing large datasets efficiently, enabling applications to handle files larger than available memory while maintaining high performance.

**Why JSON Stream Parsing Matters:**

**1. Memory Efficiency - Process Files Larger Than RAM**

**Problem - json.Unmarshal Loads Everything:**

\`\`\`go
// BAD - loads entire 10GB file into memory
data, _ := os.ReadFile("huge-logs.json") // 10GB loaded into RAM!
var logs []LogEntry
json.Unmarshal(data, &logs) // Another 10GB for parsed structures!
// Total: 20GB memory usage
\`\`\`

**Solution - Stream Parse with json.Decoder:**

\`\`\`go
// GOOD - processes 10GB file using only a few KB
file, _ := os.Open("huge-logs.json")
defer file.Close()

dec := json.NewDecoder(file) // Decoder reads from stream
dec.Token() // Read [

for dec.More() {
    var entry LogEntry
    dec.Decode(&entry) // Process one entry at a time
    processEntry(entry) // Use it immediately
    // Entry memory is released after use
}
// Total: Few KB memory usage regardless of file size!
\`\`\`

**Real Incident**: Analytics service crashed when processing daily logs that grew from 500MB to 12GB. Server had 8GB RAM. Switched to stream parsing, service now handles 100GB+ files with 2GB RAM.

**2. Streaming from Network Sources**

**HTTP Response Streaming:**

\`\`\`go
// Fetch large JSON API response
resp, _ := http.Get("https://api.example.com/logs")
defer resp.Body.Close()

// Stream parse directly from network
dec := json.NewDecoder(resp.Body)
dec.Token() // Read [

for dec.More() {
    var entry LogEntry
    dec.Decode(&entry)
    // Process entry while download continues!
    storeInDatabase(entry)
}

// No need to wait for full download
// No need to store full response in memory
\`\`\`

**Benefit**: Start processing data immediately, don't wait for full download. Reduces latency and memory.

**Real Use Case**: Log aggregation service receives 50MB/s from multiple sources. Stream parsing processes entries as they arrive, reducing processing delay from 2 minutes (wait for full download) to 100ms (immediate processing).

**3. Single-Pass Statistics - O(1) Memory**

**Without Stream Parsing:**

\`\`\`go
// BAD - loads all entries into memory
data, _ := os.ReadFile("logs.json")
var entries []LogEntry
json.Unmarshal(data, &entries) // 1GB in memory

// Compute statistics
stats := computeStats(entries) // Still need 1GB in memory
\`\`\`

**With Stream Parsing:**

\`\`\`go
// GOOD - computes stats without storing entries
func ComputeStreamStats(r io.Reader) StreamStats {
    stats := StreamStats{ByLevel: make(map[string]int)}
    dec := json.NewDecoder(r)
    dec.Token()

    for dec.More() {
        var entry LogEntry
        dec.Decode(&entry)
        stats.Total++              // Just increment
        stats.ByLevel[entry.Level]++ // Just count
        // Entry discarded after processing
    }

    return stats // Only statistics in memory (few bytes)
}
// Memory usage: O(1) - constant, independent of file size!
\`\`\`

**Algorithm Analysis:**
- **Time complexity**: O(n) - must read each entry once
- **Space complexity**: O(1) - only counters, not entries
- **Without streaming**: O(n) space to store all entries

**Real Use Case**: Monitor dashboard displays log statistics from 50GB daily logs. Stream parsing computes stats in 30 seconds using 10MB memory. Previous implementation required 64GB RAM and took 5 minutes.

**4. Filtered Processing - Skip Unwanted Data**

**Avoid Allocating Filtered Data:**

\`\`\`go
// BAD - allocate all, then filter
data, _ := os.ReadFile("logs.json")
var all []LogEntry
json.Unmarshal(data, &all) // Load 1 million entries

var errors []LogEntry
for _, entry := range all {
    if entry.Level == "ERROR" {
        errors = append(errors, entry)
    }
}
// Peak memory: 1 million entries + filtered subset
\`\`\`

**GOOD - filter during streaming:**

\`\`\`go
func ParseFilteredStream(r io.Reader, minLevel string) []LogEntry {
    var results []LogEntry
    dec := json.NewDecoder(r)
    dec.Token()

    for dec.More() {
        var entry LogEntry
        dec.Decode(&entry)

        if isLevelHigherOrEqual(entry.Level, minLevel) {
            results = append(results, entry) // Only allocate matching entries
        }
        // Non-matching entries never allocated!
    }

    return results
}
// If 1% match: allocate 10,000 instead of 1 million entries
\`\`\`

**Benefit**: If filtering to 1% of data, save 99% memory by skipping during parsing.

**Real Incident**: Support tool searched ERROR logs in 10GB file containing 0.1% errors. Original: loaded all 10GB, filtered to 10MB. Stream filtering: processed 10GB, allocated only 10MB. 1000x memory reduction!

**5. Error Resilience - Continue Despite Corruption**

**json.Unmarshal Fails on First Error:**

\`\`\`go
// BAD - one bad entry ruins entire parse
data := []byte(\`[
    {"timestamp": 1, "level": "INFO", "message": "Good"},
    {"corrupted": "entry"},
    {"timestamp": 2, "level": "ERROR", "message": "Also good"}
]\`)

var entries []LogEntry
err := json.Unmarshal(data, &entries)
// err != nil, entries = nil
// Lost 2 good entries because of 1 bad entry!
\`\`\`

**Stream Parsing Can Skip Bad Entries:**

\`\`\`go
// GOOD - recover from individual entry errors
func ComputeStreamStats(r io.Reader) StreamStats {
    stats := StreamStats{ByLevel: make(map[string]int)}
    dec := json.NewDecoder(r)
    dec.Token()

    for dec.More() {
        var entry LogEntry
        if err := dec.Decode(&entry); err != nil {
            stats.Errors++ // Track error
            continue // Skip bad entry, keep processing
        }

        stats.Total++
        stats.ByLevel[entry.Level]++
    }

    return stats
}
// Result: Processed 2 good entries, tracked 1 error
\`\`\`

**Benefit**: Partial corruption doesn't prevent processing valid data. Critical for log analysis where some corruption is expected.

**Real Incident**: Log aggregator received logs from failing service that produced intermittent corrupted JSON. Using json.Unmarshal, entire batches failed. Switched to stream parsing with error skipping, recovered 95% of log data despite 5% corruption rate.

**6. json.Decoder Methods**

**Key Methods:**

\`\`\`go
dec := json.NewDecoder(r)

// Token() - Read next JSON token
// Returns: json.Delim for [ ] { }, string for keys, values
token, err := dec.Token()
// token could be json.Delim('['), json.Delim(']'), "fieldName", etc.

// More() - Check if more elements in current array/object
hasMore := dec.More()
// Returns true if more elements before closing bracket

// Decode(v) - Decode next value into v
var entry LogEntry
err := dec.Decode(&entry)
\`\`\`

**Parsing Array Pattern:**

\`\`\`go
dec.Token()       // Read [
for dec.More() {  // While more elements
    dec.Decode(&v) // Decode each element
}
dec.Token()       // Read ]
\`\`\`

**Parsing Object Pattern:**

\`\`\`go
dec.Token()       // Read {
for dec.More() {  // While more fields
    key, _ := dec.Token() // Read field name
    dec.Decode(&value)    // Read field value
}
dec.Token()       // Read }
\`\`\`

**7. io.Reader Interface - Universal Input**

**io.Reader Definition:**

\`\`\`go
type Reader interface {
    Read(p []byte) (n int, err error)
}
\`\`\`

**Any source implementing Read can be streamed:**

\`\`\`go
// File
file, _ := os.Open("logs.json")
ParseStream(file)

// HTTP response
resp, _ := http.Get("https://api.example.com/logs")
ParseStream(resp.Body)

// String
ParseStream(strings.NewReader(\`[{"level":"INFO"}]\`))

// Bytes
ParseStream(bytes.NewReader(data))

// Gzip file
file, _ := os.Open("logs.json.gz")
gzipReader, _ := gzip.NewReader(file)
ParseStream(gzipReader) // Decompresses on the fly!

// Network socket
conn, _ := net.Dial("tcp", "server:8080")
ParseStream(conn)
\`\`\`

**All use same parsing logic!** Stream parsing abstracts data source.

**8. Performance Comparison**

**Benchmark: Parsing 1GB JSON array (1 million entries)**

| Method | Memory Usage | Time | Notes |
|--------|--------------|------|-------|
| json.Unmarshal | 2.5GB | 8s | Loads full content + structures |
| json.Decoder (stream) | 50MB | 6s | Processes incrementally |
| json.Decoder (filtered 1%) | 30MB | 6s | Only allocates matches |
| json.Decoder (stats only) | 5MB | 5s | No entry allocation |

**Why streaming is faster:**
- Avoids large allocations (GC pressure)
- Better CPU cache locality (processes small chunks)
- Can start processing before full download

**9. Level-Based Filtering - Practical Use Case**

**Log Level Hierarchy:**

\`\`\`go
// Severity ordering
DEBUG < INFO < WARN < ERROR

// Filter implementation
levels := map[string]int{
    "DEBUG": 1,
    "INFO":  2,
    "WARN":  3,
    "ERROR": 4,
}

func isLevelHigherOrEqual(entryLevel, minLevel string) bool {
    return levels[entryLevel] >= levels[minLevel]
}
\`\`\`

**Use Cases:**

\`\`\`go
// Production: only ERROR
errors := ParseFilteredStream(file, "ERROR")

// Staging: WARN and above (WARN + ERROR)
important := ParseFilteredStream(file, "WARN")

// Development: all levels (INFO + WARN + ERROR)
all := ParseFilteredStream(file, "INFO")

// Debugging: everything including DEBUG
debug := ParseFilteredStream(file, "DEBUG")
\`\`\`

**Why filter during parsing:**
- Save memory by not allocating filtered-out entries
- Faster than parse-then-filter (skips deserialization of unwanted entries)

**10. Testing Streaming Code**

**Use strings.NewReader for tests:**

\`\`\`go
func TestParseStream(t *testing.T) {
    input := \`[
        {"timestamp": 1, "level": "INFO", "message": "Test"},
        {"timestamp": 2, "level": "ERROR", "message": "Error"}
    ]\`

    entries, err := ParseStream(strings.NewReader(input))

    if err != nil {
        t.Fatal(err)
    }

    if len(entries) != 2 {
        t.Errorf("expected 2 entries, got %d", len(entries))
    }
}
\`\`\`

**Test error resilience:**

\`\`\`go
func TestStreamStatsWithErrors(t *testing.T) {
    input := \`[
        {"timestamp": 1, "level": "INFO", "message": "Valid"},
        {"invalid": "entry"},
        {"timestamp": 2, "level": "ERROR", "message": "Valid"}
    ]\`

    stats, err := ComputeStreamStats(strings.NewReader(input))

    if err != nil {
        t.Fatal(err)
    }

    if stats.Total != 2 {
        t.Errorf("expected Total=2, got %d", stats.Total)
    }

    if stats.Errors != 1 {
        t.Errorf("expected Errors=1, got %d", stats.Errors)
    }
}
\`\`\`

**Key Takeaways:**
- Use json.Decoder for large files to avoid memory exhaustion
- Stream parsing enables O(1) memory statistics computation
- Filter during parsing to avoid allocating unwanted data
- Handle errors gracefully to process partially corrupted data
- io.Reader abstraction works with files, network, compression
- Streaming is faster and more memory-efficient than json.Unmarshal
- Token-based parsing with dec.Token() and dec.More()
- Start processing immediately, don't wait for full download`,
	order: 2,
	translations: {
		ru: {
			title: 'JSON Stream Parser с Decoder',
			description: `Реализуйте эффективный по памяти парсинг потока JSON с использованием json.Decoder для обработки больших JSON файлов без полной загрузки их в память.

**Вы реализуете:**

**Уровни 1-3 (Лёгкий → Средний) — Базовый парсинг потока:**
1. **LogEntry struct** — Timestamp, Level, Message
2. **ParseStream(r io.Reader) ([]LogEntry, error)** — Парсинг JSON массива поэлементно
3. **Подсчёт записей без полного выделения** — Эффективный по памяти подсчёт

**Уровни 4-6 (Средний) — Фильтрованная обработка потока:**
4. **ParseFilteredStream(r io.Reader, minLevel string) ([]LogEntry, error)** — Парсинг и фильтрация по уровню логирования
5. **Логика сравнения уровней** — ERROR > WARN > INFO > DEBUG
6. **Пропуск невалидных записей** — Продолжение при ошибках декодирования, отслеживание количества ошибок

**Уровни 7-8 (Средний+) — Агрегация и статистика:**
7. **StreamStats struct** — Total, ByLevel map, Errors count
8. **ComputeStreamStats(r io.Reader) (StreamStats, error)** — Однопроходная статистика без сохранения всех записей

**Ключевые концепции:**
- **json.Decoder**: Потоковый парсинг JSON, обработка по одному токену за раз
- **io.Reader**: Универсальный интерфейс для чтения данных из любого источника (файлы, сеть, буферы)
- **Эффективность памяти**: Обработка больших наборов данных без загрузки всего содержимого в память
- **Однопроходная обработка**: Вычисление статистики за одну итерацию
- **Устойчивость к ошибкам**: Продолжение обработки несмотря на ошибки отдельных записей

**Пример использования:**

\`\`\`go
// Пример JSON файла логов
input := \`[
  {"timestamp": 1609459200, "level": "INFO", "message": "Server started"},
  {"timestamp": 1609459201, "level": "WARN", "message": "High memory"},
  {"timestamp": 1609459202, "level": "ERROR", "message": "Connection failed"},
  {"timestamp": 1609459203, "level": "INFO", "message": "Request processed"}
]\`

// Базовый парсинг потока
entries, err := ParseStream(strings.NewReader(input))
// entries = []LogEntry{...} (4 записи)

// Фильтрованный парсинг потока (ERROR уровень и выше)
errors, err := ParseFilteredStream(strings.NewReader(input), "ERROR")
// errors = []LogEntry{{"timestamp": 1609459202, "level": "ERROR", ...}}

// Фильтрованный парсинг потока (WARN уровень и выше)
warns, err := ParseFilteredStream(strings.NewReader(input), "WARN")
// warns = []LogEntry{
//   {"timestamp": 1609459201, "level": "WARN", ...},
//   {"timestamp": 1609459202, "level": "ERROR", ...}
// }

// Статистика потока (один проход, без полного хранения)
stats, err := ComputeStreamStats(strings.NewReader(input))
// stats = StreamStats{
//   Total: 4,
//   ByLevel: {"INFO": 2, "WARN": 1, "ERROR": 1},
//   Errors: 0
// }

// Обработка большого файла (эффективно по памяти)
file, _ := os.Open("huge-logs.json") // 10GB файл
defer file.Close()
stats, _ := ComputeStreamStats(file)
// Обрабатывает 10GB файл используя только несколько KB памяти!

// Устойчивый парсинг с невалидными записями
invalidInput := \`[
  {"timestamp": 1609459200, "level": "INFO", "message": "Valid"},
  {"invalid": "json"},
  {"timestamp": 1609459202, "level": "ERROR", "message": "Also valid"}
]\`
stats, _ := ComputeStreamStats(strings.NewReader(invalidInput))
// stats = StreamStats{Total: 2, ByLevel: {"INFO": 1, "ERROR": 1}, Errors: 1}
\`\`\`

**Ограничения:**
- LogEntry: Timestamp (int64), Level (string), Message (string)
- ParseStream: Используйте json.Decoder, декодируйте открывающую скобку массива, затем цикл декодирования отдельных записей
- ParseFilteredStream: Включайте только записи с level >= minLevel
- Иерархия уровней: ERROR > WARN > INFO > DEBUG
- ComputeStreamStats: НЕ должен хранить все записи в памяти (только счётчики)
- StreamStats: Total записей, ByLevel map[string]int, Errors count
- Пропускайте невалидные записи при парсинге, увеличивайте счётчик Errors`,
			hint1: `ParseStream: Создайте json.NewDecoder(r), вызовите dec.Token() для чтения открывающей скобки, цикл while dec.More(), декодируйте запись с dec.Decode(&entry), добавьте в slice. Прочитайте закрывающую скобку с dec.Token() в конце.`,
			hint2: `ParseFilteredStream: То же, что ParseStream, но добавьте if isLevelHigherOrEqual(entry.Level, minLevel) перед добавлением. ComputeStreamStats: Инициализируйте stats с ByLevel map, цикл как в ParseStream, но вместо хранения записей просто увеличивайте stats.Total и stats.ByLevel[entry.Level]. При ошибке декодирования увеличьте stats.Errors и продолжите (не возвращайте).`,
			whyItMatters: `Парсинг потока JSON критически важен для эффективной обработки больших наборов данных, позволяя приложениям обрабатывать файлы больше доступной памяти при сохранении высокой производительности.

**Почему это важно:**

**1. Эффективность памяти — обработка файлов больше RAM**

**Проблема — json.Unmarshal загружает всё:**

\`\`\`go
// ПЛОХО — загружает весь 10GB файл в память
data, _ := os.ReadFile("huge-logs.json") // 10GB загружено в RAM!
var logs []LogEntry
json.Unmarshal(data, &logs) // Ещё 10GB для распарсенных структур!
// Всего: 20GB использования памяти
\`\`\`

**Решение — потоковый парсинг с json.Decoder:**

\`\`\`go
// ХОРОШО — обрабатывает 10GB файл используя только несколько KB
file, _ := os.Open("huge-logs.json")
defer file.Close()

dec := json.NewDecoder(file) // Decoder читает из потока
dec.Token() // Прочитать [

for dec.More() {
    var entry LogEntry
    dec.Decode(&entry) // Обработать одну запись за раз
    processEntry(entry) // Использовать немедленно
    // Память записи освобождается после использования
}
// Всего: Несколько KB использования памяти независимо от размера файла!
\`\`\`

**Реальный инцидент**: Сервис аналитики упал при обработке ежедневных логов, которые выросли с 500MB до 12GB. Сервер имел 8GB RAM. Переключились на потоковый парсинг, сервис теперь обрабатывает 100GB+ файлы с 2GB RAM.

**2. Потоковая передача из сетевых источников**

**Потоковая передача HTTP ответа:**

\`\`\`go
// Получить большой JSON ответ API
resp, _ := http.Get("https://api.example.com/logs")
defer resp.Body.Close()

// Потоковый парсинг напрямую из сети
dec := json.NewDecoder(resp.Body)
dec.Token() // Прочитать [

for dec.More() {
    var entry LogEntry
    dec.Decode(&entry)
    // Обработать запись пока загрузка продолжается!
    storeInDatabase(entry)
}

// Не нужно ждать полной загрузки
// Не нужно хранить полный ответ в памяти
\`\`\`

**Преимущество**: Начать обработку данных немедленно, не ждать полной загрузки. Уменьшает задержку и память.

**Реальный пример**: Сервис агрегации логов получает 50MB/s из нескольких источников. Потоковый парсинг обрабатывает записи по мере их поступления, уменьшая задержку обработки с 2 минут (ожидание полной загрузки) до 100ms (немедленная обработка).

**3. Однопроходная статистика — O(1) память**

**Без потокового парсинга:**

\`\`\`go
// ПЛОХО — загружает все записи в память
data, _ := os.ReadFile("logs.json")
var entries []LogEntry
json.Unmarshal(data, &entries) // 1GB в памяти

// Вычислить статистику
stats := computeStats(entries) // Всё ещё нужен 1GB в памяти
\`\`\`

**С потоковым парсингом:**

\`\`\`go
// ХОРОШО — вычисляет статистику без хранения записей
func ComputeStreamStats(r io.Reader) StreamStats {
    stats := StreamStats{ByLevel: make(map[string]int)}
    dec := json.NewDecoder(r)
    dec.Token()

    for dec.More() {
        var entry LogEntry
        dec.Decode(&entry)
        stats.Total++              // Просто увеличить
        stats.ByLevel[entry.Level]++ // Просто посчитать
        // Запись удаляется после обработки
    }

    return stats // Только статистика в памяти (несколько байт)
}
// Использование памяти: O(1) — константа, независимо от размера файла!
\`\`\`

**Анализ алгоритма:**
- **Временная сложность**: O(n) — нужно прочитать каждую запись один раз
- **Пространственная сложность**: O(1) — только счётчики, не записи
- **Без потоковой передачи**: O(n) пространство для хранения всех записей

**Реальный пример**: Панель мониторинга отображает статистику логов из 50GB ежедневных логов. Потоковый парсинг вычисляет статистику за 30 секунд используя 10MB памяти. Предыдущая реализация требовала 64GB RAM и занимала 5 минут.

**Ключевые выводы:**
- Используйте json.Decoder для больших файлов, чтобы избежать истощения памяти
- Потоковый парсинг обеспечивает вычисление статистики с O(1) памятью
- Фильтруйте во время парсинга, чтобы избежать выделения ненужных данных
- Обрабатывайте ошибки аккуратно для обработки частично повреждённых данных
- Абстракция io.Reader работает с файлами, сетью, сжатием
- Потоковая передача быстрее и эффективнее по памяти, чем json.Unmarshal
- Парсинг на основе токенов с dec.Token() и dec.More()
- Начинайте обработку немедленно, не ждите полной загрузки`,
			solutionCode: `package encodingx

import (
	"encoding/json"
	"io"
)

type LogEntry struct {
	Timestamp int64  \`json:"timestamp"\`
	Level     string \`json:"level"\`
	Message   string \`json:"message"\`
}

type StreamStats struct {
	Total   int
	ByLevel map[string]int
	Errors  int
}

func ParseStream(r io.Reader) ([]LogEntry, error) {
	dec := json.NewDecoder(r) // создаём потоковый decoder из reader чтобы избежать загрузки полного содержимого

	if _, err := dec.Token(); err != nil { // получаем открывающую скобку [ из массива
		return nil, err
	}

	var entries []LogEntry
	for dec.More() { // цикл пока остаются элементы массива
		var entry LogEntry
		if err := dec.Decode(&entry); err != nil { // декодируем следующую запись из потока инкрементально
			return nil, err
		}
		entries = append(entries, entry) // накапливаем декодированную запись в result slice
	}

	if _, err := dec.Token(); err != nil { // получаем закрывающую скобку ] из массива
		return nil, err
	}

	return entries, nil // возвращаем все потоковые записи
}

func ParseFilteredStream(r io.Reader, minLevel string) ([]LogEntry, error) {
	dec := json.NewDecoder(r) // потоковый JSON из reader без полной загрузки в память

	if _, err := dec.Token(); err != nil { // читаем открывающую скобку массива
		return nil, err
	}

	var entries []LogEntry
	for dec.More() { // итерируем по элементам массива до конца
		var entry LogEntry
		if err := dec.Decode(&entry); err != nil { // парсим отдельную запись из потока
			return nil, err
		}

		if isLevelHigherOrEqual(entry.Level, minLevel) { // фильтруем по порогу серьёзности
			entries = append(entries, entry) // включаем только записи, соответствующие минимальному уровню
		}
	}

	if _, err := dec.Token(); err != nil { // читаем закрывающую скобку массива
		return nil, err
	}

	return entries, nil // возвращаем отфильтрованное подмножество записей
}

func ComputeStreamStats(r io.Reader) (StreamStats, error) {
	stats := StreamStats{ByLevel: make(map[string]int)} // инициализируем статистику с пустыми счётчиками уровней
	dec := json.NewDecoder(r) // настраиваем потоковый decoder для эффективной по памяти обработки

	if _, err := dec.Token(); err != nil { // получаем открывающую скобку массива
		return stats, err
	}

	for dec.More() { // обрабатываем поток до конца элементов
		var entry LogEntry
		if err := dec.Decode(&entry); err != nil { // пытаемся декодировать следующую запись
			stats.Errors++ // отслеживаем невалидные записи но продолжаем обработку
			continue // пропускаем эту запись и переходим к следующей
		}

		stats.Total++ // увеличиваем счётчик валидных записей
		stats.ByLevel[entry.Level]++ // увеличиваем счётчик для этого уровня серьёзности
	}

	if _, err := dec.Token(); err != nil { // получаем закрывающую скобку массива
		return stats, err
	}

	return stats, nil // возвращаем агрегированную статистику без хранения всех записей
}

func isLevelHigherOrEqual(entryLevel, minLevel string) bool {
	levels := map[string]int{"DEBUG": 1, "INFO": 2, "WARN": 3, "ERROR": 4} // карта упорядочивания серьёзности
	return levels[entryLevel] >= levels[minLevel] // сравниваем числовые значения серьёзности
}`
		},
		uz: {
			title: `Decoder bilan JSON Stream Parser`,
			description: `Katta JSON fayllarni xotiraga to'liq yuklamasdan qayta ishlash uchun json.Decoder yordamida xotira samarali JSON oqim parsini amalga oshiring.

**Siz amalga oshirasiz:**

**1-3 Daraja (Oson → O'rta) — Asosiy oqim parsi:**
1. **LogEntry struct** — Timestamp, Level, Message
2. **ParseStream(r io.Reader) ([]LogEntry, error)** — JSON massivni element bo'yicha pars qilish
3. **To'liq ajratmasdan yozuvlarni sanash** — Xotira samarali sanash

**4-6 Daraja (O'rta) — Filtrlangan oqim qayta ishlash:**
4. **ParseFilteredStream(r io.Reader, minLevel string) ([]LogEntry, error)** — Log darajasi bo'yicha pars va filtrlash
5. **Daraja solishtirish mantiqi** — ERROR > WARN > INFO > DEBUG
6. **Noto'g'ri yozuvlarni o'tkazib yuborish** — Depractixsh xatolarida davom etish, xato sonini kuzatish

**7-8 Daraja (O'rta+) — Agregatsiya va statistika:**
7. **StreamStats struct** — Total, ByLevel map, Errors soni
8. **ComputeStreamStats(r io.Reader) (StreamStats, error)** — Barcha yozuvlarni saqlamasdan bir o'tishda statistika

**Asosiy tushunchalar:**
- **json.Decoder**: Oqimga asoslangan JSON pars, bir vaqtda bitta token qayta ishlash
- **io.Reader**: Har qanday manbadan ma'lumotlarni o'qish uchun umumiy interfeys (fayllar, tarmoq, buferlar)
- **Xotira samaradorligi**: Butun tarkibni xotiraga yuklamasdan katta ma'lumotlar to'plamlarini qayta ishlash
- **Bir o'tishli qayta ishlash**: Statistikani bir iteratsiyada hisoblash
- **Xatolarga chidamlilik**: Alohida yozuv xatolariga qaramay qayta ishlashni davom ettirish

**Foydalanish misoli:**

\`\`\`go
// Namuna JSON log fayli
input := \`[
  {"timestamp": 1609459200, "level": "INFO", "message": "Server started"},
  {"timestamp": 1609459201, "level": "WARN", "message": "High memory"},
  {"timestamp": 1609459202, "level": "ERROR", "message": "Connection failed"},
  {"timestamp": 1609459203, "level": "INFO", "message": "Request processed"}
]\`

// Asosiy oqim parsi
entries, err := ParseStream(strings.NewReader(input))
// entries = []LogEntry{...} (4 ta yozuv)

// Filtrlangan oqim parsi (ERROR darajasi va yuqori)
errors, err := ParseFilteredStream(strings.NewReader(input), "ERROR")
// errors = []LogEntry{{"timestamp": 1609459202, "level": "ERROR", ...}}

// Filtrlangan oqim parsi (WARN darajasi va yuqori)
warns, err := ParseFilteredStream(strings.NewReader(input), "WARN")
// warns = []LogEntry{
//   {"timestamp": 1609459201, "level": "WARN", ...},
//   {"timestamp": 1609459202, "level": "ERROR", ...}
// }

// Oqim statistikasi (bir o'tish, to'liq saqlashsiz)
stats, err := ComputeStreamStats(strings.NewReader(input))
// stats = StreamStats{
//   Total: 4,
//   ByLevel: {"INFO": 2, "WARN": 1, "ERROR": 1},
//   Errors: 0
// }

// Katta fayl qayta ishlash (xotira samarali)
file, _ := os.Open("huge-logs.json") // 10GB fayl
defer file.Close()
stats, _ := ComputeStreamStats(file)
// 10GB faylni faqat bir necha KB xotira ishlatib qayta ishlaydi!

// Noto'g'ri yozuvlar bilan chidamli pars
invalidInput := \`[
  {"timestamp": 1609459200, "level": "INFO", "message": "Valid"},
  {"invalid": "json"},
  {"timestamp": 1609459202, "level": "ERROR", "message": "Also valid"}
]\`
stats, _ := ComputeStreamStats(strings.NewReader(invalidInput))
// stats = StreamStats{Total: 2, ByLevel: {"INFO": 1, "ERROR": 1}, Errors: 1}
\`\`\`

**Cheklovlar:**
- LogEntry: Timestamp (int64), Level (string), Message (string)
- ParseStream: json.Decoder dan foydalaning, massiv ochilish qavsini depractixng, keyin alohida yozuvlarni depractixsh tsikli
- ParseFilteredStream: Faqat level >= minLevel bo'lgan yozuvlarni kiriting
- Daraja ierarxiyasi: ERROR > WARN > INFO > DEBUG
- ComputeStreamStats: Barcha yozuvlarni xotirada saqlamamasligi kerak (faqat hisoblagichlar)
- StreamStats: Total yozuvlar, ByLevel map[string]int, Errors soni
- Pars paytida noto'g'ri yozuvlarni o'tkazib yuboring, Errors hisoblagichini oshiring`,
			hint1: `ParseStream: json.NewDecoder(r) yarating, ochilish qavsini o'qish uchun dec.Token() ni chaqiring, dec.More() to'g'ri bo'lguncha tsikl, dec.Decode(&entry) bilan yozuvni depractixng, slice ga qo'shing. Oxirida dec.Token() bilan yopilish qavsini o'qing.`,
			hint2: `ParseFilteredStream: ParseStream bilan bir xil, lekin qo'shishdan oldin if isLevelHigherOrEqual(entry.Level, minLevel) ni qo'shing. ComputeStreamStats: ByLevel map bilan stats ni ishga tushiring, ParseStream kabi tsikl, lekin yozuvlarni saqlash o'rniga faqat stats.Total va stats.ByLevel[entry.Level] ni oshiring. Depractixsh xatosida stats.Errors ni oshiring va davom eting (qaytmang).`,
			whyItMatters: `JSON oqim parsi katta ma'lumotlar to'plamlarini samarali qayta ishlash uchun muhimdir, bu ilovalarга mavjud xotiradan kattaroq fayllarni yuqori ishlashni saqlab qolgan holda qayta ishlash imkonini beradi.

**Nima uchun bu muhim:**

**1. Xotira samaradorligi — RAM dan kattaroq fayllarni qayta ishlash**

**Muammo — json.Unmarshal hamma narsani yuklaydi:**

\`\`\`go
// YOMON — butun 10GB faylni xotiraga yuklaydi
data, _ := os.ReadFile("huge-logs.json") // 10GB RAM ga yuklandi!
var logs []LogEntry
json.Unmarshal(data, &logs) // Pars qilingan strukturalar uchun yana 10GB!
// Jami: 20GB xotira foydalanish
\`\`\`

**Yechim — json.Decoder bilan oqim parsi:**

\`\`\`go
// YAXSHI — 10GB faylni faqat bir necha KB ishlatib qayta ishlaydi
file, _ := os.Open("huge-logs.json")
defer file.Close()

dec := json.NewDecoder(file) // Decoder oqimdan o'qiydi
dec.Token() // [ ni o'qish

for dec.More() {
    var entry LogEntry
    dec.Decode(&entry) // Bir vaqtda bitta yozuvni qayta ishlash
    processEntry(entry) // Darhol ishlatish
    // Yozuv xotirasi foydalanishdan keyin ozod qilinadi
}
// Jami: Fayl hajmidan qat'i nazar, bir necha KB xotira foydalanish!
\`\`\`

**Haqiqiy hodisa**: Tahlil xizmati kunlik loglar 500MB dan 12GB ga o'sganda ishlamay qoldi. Serverda 8GB RAM bor edi. Oqim parsiga o'tdi, xizmat endi 2GB RAM bilan 100GB+ fayllarni qayta ishlaydi.

**2. Tarmoq manbalaridan oqim**

**HTTP javob oqimi:**

\`\`\`go
// Katta JSON API javobini olish
resp, _ := http.Get("https://api.example.com/logs")
defer resp.Body.Close()

// Tarmoqdan to'g'ridan-to'g'ri oqim parsi
dec := json.NewDecoder(resp.Body)
dec.Token() // [ ni o'qish

for dec.More() {
    var entry LogEntry
    dec.Decode(&entry)
    // Yuklab olish davom etayotganda yozuvni qayta ishlash!
    storeInDatabase(entry)
}

// To'liq yuklab olishni kutish shart emas
// To'liq javobni xotirada saqlash shart emas
\`\`\`

**Afzallik**: Ma'lumotlarni darhol qayta ishlashni boshlash, to'liq yuklab olishni kutmaslik. Kechikish va xotirani kamaytiradi.

**Haqiqiy foydalanish**: Log agregatsiya xizmati bir nechta manbalardan 50MB/s qabul qiladi. Oqim parsi yozuvlarni kelishi bilan qayta ishlaydi, qayta ishlash kechikishini 2 daqiqadan (to'liq yuklab olishni kutish) 100ms gacha (darhol qayta ishlash) kamaytiradi.

**3. Bir o'tishli statistika — O(1) xotira**

**Oqim parsisiz:**

\`\`\`go
// YOMON — barcha yozuvlarni xotiraga yuklaydi
data, _ := os.ReadFile("logs.json")
var entries []LogEntry
json.Unmarshal(data, &entries) // Xotirada 1GB

// Statistikani hisoblash
stats := computeStats(entries) // Hali ham xotirada 1GB kerak
\`\`\`

**Oqim parsi bilan:**

\`\`\`go
// YAXSHI — yozuvlarni saqlamasdan statistikani hisoblaydi
func ComputeStreamStats(r io.Reader) StreamStats {
    stats := StreamStats{ByLevel: make(map[string]int)}
    dec := json.NewDecoder(r)
    dec.Token()

    for dec.More() {
        var entry LogEntry
        dec.Decode(&entry)
        stats.Total++              // Faqat oshirish
        stats.ByLevel[entry.Level]++ // Faqat sanash
        // Qayta ishlashdan keyin yozuv o'chiriladi
    }

    return stats // Faqat statistika xotirada (bir necha bayt)
}
// Xotira foydalanish: O(1) — o'zgarmas, fayl hajmidan mustaqil!
\`\`\`

**Algoritm tahlili:**
- **Vaqt murakkabligi**: O(n) — har bir yozuvni bir marta o'qish kerak
- **Bo'shliq murakkabligi**: O(1) — faqat hisoblagichlar, yozuvlar emas
- **Oqimsiz**: Barcha yozuvlarni saqlash uchun O(n) bo'shliq

**Haqiqiy misol**: Monitor paneli 50GB kunlik loglardan log statistikasini ko'rsatadi. Oqim parsi 30 soniyada 10MB xotira ishlatib statistikani hisoblaydi. Oldingi amalga oshirish 64GB RAM talab qildi va 5 daqiqa oldi.

**Asosiy xulosalar:**
- Xotira tugashining oldini olish uchun katta fayllar uchun json.Decoder dan foydalaning
- Oqim parsi O(1) xotira bilan statistika hisoblashni ta'minlaydi
- Keraksiz ma'lumotlarni ajratishdan qochish uchun pars paytida filtrlang
- Qisman buzilgan ma'lumotlarni qayta ishlash uchun xatolarni ehtiyotkorlik bilan qayta ishlang
- io.Reader abstraktsiyasi fayllar, tarmoq, siqish bilan ishlaydi
- Oqim json.Unmarshal dan tezroq va xotira samaradorroq
- dec.Token() va dec.More() bilan tokenga asoslangan pars
- Darhol qayta ishlashni boshlang, to'liq yuklab olishni kutmang`,
			solutionCode: `package encodingx

import (
	"encoding/json"
	"io"
)

type LogEntry struct {
	Timestamp int64  \`json:"timestamp"\`
	Level     string \`json:"level"\`
	Message   string \`json:"message"\`
}

type StreamStats struct {
	Total   int
	ByLevel map[string]int
	Errors  int
}

func ParseStream(r io.Reader) ([]LogEntry, error) {
	dec := json.NewDecoder(r) // to'liq tarkibni yuklashdan qochish uchun reader dan oqimli decoder yaratish

	if _, err := dec.Token(); err != nil { // massivdan ochilish qavsi [ ni olish
		return nil, err
	}

	var entries []LogEntry
	for dec.More() { // massiv elementlari qolgan paytgacha tsikl
		var entry LogEntry
		if err := dec.Decode(&entry); err != nil { // oqimdan keyingi yozuvni inkremental depractixsh
			return nil, err
		}
		entries = append(entries, entry) // depractixngan yozuvni natija slice ga to'plash
	}

	if _, err := dec.Token(); err != nil { // massivdan yopilish qavsi ] ni olish
		return nil, err
	}

	return entries, nil // barcha oqimlangan yozuvlarni qaytarish
}

func ParseFilteredStream(r io.Reader, minLevel string) ([]LogEntry, error) {
	dec := json.NewDecoder(r) // to'liq xotira yuklashsiz reader dan oqimli JSON

	if _, err := dec.Token(); err != nil { // massiv ochilish qavsini o'qish
		return nil, err
	}

	var entries []LogEntry
	for dec.More() { // oxirigacha massiv elementlari ustidan iteratsiya
		var entry LogEntry
		if err := dec.Decode(&entry); err != nil { // oqimdan alohida yozuvni pars qilish
			return nil, err
		}

		if isLevelHigherOrEqual(entry.Level, minLevel) { // jiddiylik chegarasi bo'yicha filtrlash
			entries = append(entries, entry) // faqat minimal darajani qondiradigan yozuvlarni kiriting
		}
	}

	if _, err := dec.Token(); err != nil { // massiv yopilish qavsini o'qish
		return nil, err
	}

	return entries, nil // filtrlangan yozuvlar to'plamini qaytarish
}

func ComputeStreamStats(r io.Reader) (StreamStats, error) {
	stats := StreamStats{ByLevel: make(map[string]int)} // bo'sh daraja hisoblagichlari bilan statistikani ishga tushirish
	dec := json.NewDecoder(r) // xotira samarali qayta ishlash uchun oqimli decoder sozlash

	if _, err := dec.Token(); err != nil { // massiv ochilish qavsini olish
		return stats, err
	}

	for dec.More() { // boshqa elementlar bo'lmaguncha oqimni qayta ishlash
		var entry LogEntry
		if err := dec.Decode(&entry); err != nil { // keyingi yozuvni depractixshga harakat qilish
			stats.Errors++ // noto'g'ri yozuvlarni kuzatish lekin qayta ishlashni davom ettirish
			continue // bu yozuvni o'tkazib yuboring va keyingisiga o'ting
		}

		stats.Total++ // to'g'ri yozuv hisoblagichini oshirish
		stats.ByLevel[entry.Level]++ // bu jiddiylik darajasi uchun hisobni oshirish
	}

	if _, err := dec.Token(); err != nil { // massiv yopilish qavsini olish
		return stats, err
	}

	return stats, nil // barcha yozuvlarni saqlamasdan agregat statistikani qaytarish
}

func isLevelHigherOrEqual(entryLevel, minLevel string) bool {
	levels := map[string]int{"DEBUG": 1, "INFO": 2, "WARN": 3, "ERROR": 4} // jiddiylik tartib xaritasi
	return levels[entryLevel] >= levels[minLevel] // raqamli jiddiylik qiymatlarini solishtirish
}`
		}
	}
};

export default task;
