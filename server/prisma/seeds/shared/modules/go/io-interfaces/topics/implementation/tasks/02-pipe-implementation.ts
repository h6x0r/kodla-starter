import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-interfaces-pipe',
	title: 'Implement Custom Pipe for Goroutine Communication',
	difficulty: 'medium',
	tags: ['go', 'interfaces', 'io', 'pipe', 'concurrency'],
	estimatedTime: '30m',
	isPremium: false,
	youtubeUrl: '',
	description: `Implement a custom **Pipe()** function that creates a synchronous in-memory pipe for goroutine communication, similar to \`io.Pipe()\`.

**Requirements:**
1. Create a \`PipeReader\` and \`PipeWriter\` that are connected
2. Data written to \`PipeWriter\` must be readable from \`PipeReader\`
3. \`Write\` blocks until corresponding \`Read\` is called (synchronous behavior)
4. \`Read\` blocks until data is written or writer is closed
5. Closing writer must propagate \`io.EOF\` to reader
6. Closing writer with error must propagate that error to reader
7. Thread-safe implementation using channels and mutexes
8. Handle concurrent reads/writes correctly

**Function Signature:**
\`\`\`go
func Pipe() (*PipeReader, *PipeWriter)

type PipeReader struct {
	// internal fields
}

func (r *PipeReader) Read(p []byte) (n int, err error)
func (r *PipeReader) Close() error

type PipeWriter struct {
	// internal fields
}

func (w *PipeWriter) Write(p []byte) (n int, err error)
func (w *PipeWriter) Close() error
func (w *PipeWriter) CloseWithError(err error) error
\`\`\`

**Example Usage:**
\`\`\`go
r, w := Pipe()

// Writer goroutine
go func() {
    w.Write([]byte("hello"))
    w.Write([]byte(" world"))
    w.Close()
}()

// Reader goroutine
buf := make([]byte, 100)
n, err := r.Read(buf)
// n == 5, string(buf[:n]) == "hello"

n, err = r.Read(buf)
// n == 6, string(buf[:n]) == " world"

n, err = r.Read(buf)
// n == 0, err == io.EOF (writer closed)
\`\`\`

**Key Concepts:**
- **Synchronous I/O**: Write blocks until Read consumes data
- **Channel communication**: Use channels to pass data between goroutines
- **Graceful shutdown**: Properly propagate close and EOF
- **Error propagation**: CloseWithError allows custom error reporting
- **Thread safety**: Multiple goroutines can safely interact

**Implementation Strategy:**
1. Use a channel to pass data slices between writer and reader
2. Use another channel to signal write completion
3. Store close error in shared state (protected by mutex)
4. Writer.Write sends data and waits for reader to finish
5. Reader.Read receives data, copies it, then signals completion
6. Handle close by closing the data channel and storing EOF/error
7. Protect shared state (closed, error) with sync.Mutex

**Constraints:**
- Do not use \`io.Pipe\` from standard library
- Must be fully thread-safe
- Write must block until Read consumes data
- Read must block until Write provides data or pipe closes
- CloseWithError must propagate error to reader`,
	initialCode: `package interfaces

import (
	"errors"
	"io"
	"sync"
)

type PipeReader struct {
	// TODO: Add fields (data channel, done channel, mutex, error state)
}

func (r *PipeReader) Read(p []byte) (n int, err error) {
	// TODO: Implement blocking read
	// Hint: Receive from data channel, copy to p, signal done
	// TODO: Implement
}

func (r *PipeReader) Close() error {
	// TODO: Close reader side
	// TODO: Implement
}

type PipeWriter struct {
	// TODO: Add fields (data channel, done channel, mutex, error state)
}

func (w *PipeWriter) Write(p []byte) (n int, err error) {
	// TODO: Implement blocking write
	// Hint: Send data to channel, wait for done signal
	// TODO: Implement
}

func (w *PipeWriter) Close() error {
	// TODO: Close with EOF
	return w.CloseWithError(io.EOF)
}

func (w *PipeWriter) CloseWithError(err error) error {
	// TODO: Close writer and propagate error to reader
	// TODO: Implement
}

func Pipe() (*PipeReader, *PipeWriter) {
	// TODO: Create connected reader and writer
	// Hint: Make channels, share between reader/writer
	// TODO: Implement
}`,
	solutionCode: `package interfaces

import (
	"errors"
	"io"
	"sync"
)

var errClosedPipe = errors.New("io: read/write on closed pipe")

type pipe struct {
	wrCh    chan []byte  // Data from writer to reader
	rdCh    chan int     // Acknowledgment from reader to writer
	err     error        // Error to propagate to reader
	closeMu sync.Mutex   // Protects closed state
	wrMu    sync.Mutex   // Protects write operations
	rdMu    sync.Mutex   // Protects read operations
	closed  bool         // Tracks if pipe is closed
}

type PipeReader struct {
	p *pipe
}

func (r *PipeReader) Read(b []byte) (n int, err error) {
	r.p.rdMu.Lock()
	defer r.p.rdMu.Unlock()

	// Receive data from writer
	data, ok := <-r.p.wrCh
	if !ok {
		// Pipe is closed, return stored error
		r.p.closeMu.Lock()
		err := r.p.err
		r.p.closeMu.Unlock()
		return 0, err
	}

	// Copy data to buffer
	n = copy(b, data)

	// Signal writer that we're done reading
	r.p.rdCh <- n

	return n, nil
}

func (r *PipeReader) Close() error {
	r.p.closeMu.Lock()
	defer r.p.closeMu.Unlock()

	if !r.p.closed {
		r.p.closed = true
		r.p.err = errClosedPipe
		close(r.p.wrCh)
	}
	return nil
}

type PipeWriter struct {
	p *pipe
}

func (w *PipeWriter) Write(b []byte) (n int, err error) {
	w.p.wrMu.Lock()
	defer w.p.wrMu.Unlock()

	// Check if pipe is closed before attempting write
	w.p.closeMu.Lock()
	if w.p.closed {
		w.p.closeMu.Unlock()
		return 0, errClosedPipe
	}
	w.p.closeMu.Unlock()

	// Make a copy to avoid data race
	data := make([]byte, len(b))
	copy(data, b)

	// Handle panic from sending on closed channel (race condition)
	defer func() {
		if r := recover(); r != nil {
			n = 0
			err = errClosedPipe
		}
	}()

	// Send data to reader
	w.p.wrCh <- data

	// Wait for reader to acknowledge
	n = <-w.p.rdCh
	return n, nil
}

func (w *PipeWriter) Close() error {
	return w.CloseWithError(io.EOF)
}

func (w *PipeWriter) CloseWithError(err error) error {
	if err == nil {
		err = io.EOF
	}

	w.p.closeMu.Lock()
	defer w.p.closeMu.Unlock()

	if !w.p.closed {
		w.p.closed = true
		w.p.err = err
		close(w.p.wrCh)
	}

	return nil
}

func Pipe() (*PipeReader, *PipeWriter) {
	p := &pipe{
		wrCh: make(chan []byte),
		rdCh: make(chan int),
		err:  io.EOF,
	}

	return &PipeReader{p: p}, &PipeWriter{p: p}
}`,
	testCode: `package interfaces

import (
	"bytes"
	"io"
	"testing"
	"time"
)

func Test1PipeBasicReadWrite(t *testing.T) {
	r, w := Pipe()
	data := []byte("hello")
	go func() {
		w.Write(data)
		w.Close()
	}()
	buf := make([]byte, 10)
	n, err := r.Read(buf)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	if n != 5 {
		t.Errorf("expected 5 bytes, got %d", n)
	}
	if string(buf[:n]) != "hello" {
		t.Errorf("expected 'hello', got '%s'", string(buf[:n]))
	}
}

func Test2PipeEOFAfterClose(t *testing.T) {
	r, w := Pipe()
	go func() {
		w.Write([]byte("test"))
		w.Close()
	}()
	buf := make([]byte, 10)
	r.Read(buf)
	n, err := r.Read(buf)
	if err != io.EOF {
		t.Errorf("expected io.EOF, got %v", err)
	}
	if n != 0 {
		t.Errorf("expected 0 bytes, got %d", n)
	}
}

func Test3PipeMultipleWrites(t *testing.T) {
	r, w := Pipe()
	go func() {
		w.Write([]byte("hello"))
		w.Write([]byte(" "))
		w.Write([]byte("world"))
		w.Close()
	}()
	buf := make([]byte, 10)
	var result bytes.Buffer
	for {
		n, err := r.Read(buf)
		if n > 0 {
			result.Write(buf[:n])
		}
		if err == io.EOF {
			break
		}
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	}
	if result.String() != "hello world" {
		t.Errorf("expected 'hello world', got '%s'", result.String())
	}
}

func Test4PipeCloseWithError(t *testing.T) {
	r, w := Pipe()
	customErr := io.ErrClosedPipe
	go func() {
		w.Write([]byte("test"))
		w.CloseWithError(customErr)
	}()
	buf := make([]byte, 10)
	r.Read(buf)
	_, err := r.Read(buf)
	if err != customErr {
		t.Errorf("expected custom error, got %v", err)
	}
}

func Test5PipeBlockingWrite(t *testing.T) {
	r, w := Pipe()
	done := make(chan bool)
	go func() {
		time.Sleep(100 * time.Millisecond)
		buf := make([]byte, 10)
		r.Read(buf)
		done <- true
	}()
	start := time.Now()
	w.Write([]byte("test"))
	elapsed := time.Since(start)
	if elapsed < 50*time.Millisecond {
		t.Error("write did not block")
	}
	<-done
	w.Close()
}

func Test6PipeBlockingRead(t *testing.T) {
	r, w := Pipe()
	done := make(chan bool)
	go func() {
		time.Sleep(100 * time.Millisecond)
		w.Write([]byte("test"))
		w.Close()
		done <- true
	}()
	buf := make([]byte, 10)
	start := time.Now()
	r.Read(buf)
	elapsed := time.Since(start)
	if elapsed < 50*time.Millisecond {
		t.Error("read did not block")
	}
	<-done
}

func Test7PipeEmptyWrite(t *testing.T) {
	r, w := Pipe()
	go func() {
		w.Write([]byte{})
		w.Write([]byte("test"))
		w.Close()
	}()
	buf := make([]byte, 10)
	n, err := r.Read(buf)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	if n != 0 {
		t.Errorf("expected 0 bytes for empty write, got %d", n)
	}
	n, err = r.Read(buf)
	if n != 4 || string(buf[:n]) != "test" {
		t.Errorf("expected 'test', got '%s'", string(buf[:n]))
	}
}

func Test8PipeSmallBuffer(t *testing.T) {
	r, w := Pipe()
	go func() {
		w.Write([]byte("hello world"))
		w.Close()
	}()
	buf := make([]byte, 5)
	n, err := r.Read(buf)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	if n != 5 {
		t.Errorf("expected 5 bytes, got %d", n)
	}
	if string(buf[:n]) != "hello" {
		t.Errorf("expected 'hello', got '%s'", string(buf[:n]))
	}
}

func Test9PipeReaderClose(t *testing.T) {
	r, w := Pipe()
	r.Close()
	buf := make([]byte, 10)
	_, err := w.Write([]byte("test"))
	if err == nil {
		t.Error("expected error writing to closed pipe")
	}
}

func Test10PipeConcurrentReads(t *testing.T) {
	r, w := Pipe()
	go func() {
		for i := 0; i < 5; i++ {
			w.Write([]byte("data"))
		}
		w.Close()
	}()
	done := make(chan bool, 2)
	for i := 0; i < 2; i++ {
		go func() {
			buf := make([]byte, 10)
			for {
				_, err := r.Read(buf)
				if err == io.EOF {
					break
				}
			}
			done <- true
		}()
	}
	timeout := time.After(2 * time.Second)
	count := 0
	for count < 2 {
		select {
		case <-done:
			count++
		case <-timeout:
			t.Fatal("test timed out")
		}
	}
}`,
	hint1: `Create a shared pipe struct with two channels: one for data ([]byte) and one for acknowledgment (int). Writer sends data on first channel, Reader copies it and sends byte count on second channel.`,
	hint2: `Use sync.Once to ensure close happens exactly once. Store the close error in the pipe struct and return it when Reader tries to read after writer closes.`,
	whyItMatters: `Understanding pipes is essential for building streaming data pipelines and goroutine communication patterns in Go.

**Why This Matters:**

**1. Goroutine Communication Pattern**
Pipes enable streaming data transfer between goroutines without buffering:

\`\`\`go
// Stream processing pipeline
r, w := Pipe()

// Producer goroutine
go func() {
    for _, data := range largeDateset {
        w.Write(process(data))
    }
    w.Close()
}()

// Consumer goroutine
io.Copy(destination, r) // Streams data as it arrives
\`\`\`

**2. Real-World Usage**

**HTTP Response Streaming:**
\`\`\`go
func HandleStream(w http.ResponseWriter, r *http.Request) {
    pr, pw := io.Pipe()

	// Generate data in background
    go func() {
        defer pw.Close()
        for i := 0; i < 1000; i++ {
            fmt.Fprintf(pw, "Chunk %d\\n", i)
            time.Sleep(10 * time.Millisecond)
        }
    }()

	// Stream to client
    io.Copy(w, pr) // Sends data as generated
}
\`\`\`

Without pipes, you'd need to buffer all data in memory first.

**3. Production Incident: Memory Exhaustion**

A video processing service had this code:
\`\`\`go
// BAD - loads entire video into memory
data, _ := os.ReadFile("video.mp4") // 2GB file!
encoded := encode(data) // Another 2GB!
os.WriteFile("output.mp4", encoded, 0644)
\`\`\`

Problem:
- 4GB memory per video
- Only 8GB RAM available
- Can only process 1 video at a time
- Out of memory crashes

Fix with pipes:
\`\`\`go
// GOOD - streams through memory
r, w := io.Pipe()

go func() {
    file, _ := os.Open("video.mp4")
    io.Copy(w, file) // Streams in chunks
    w.Close()
}()

output, _ := os.Create("output.mp4")
encoder := NewEncoder(output)
io.Copy(encoder, r) // Processes as it reads
\`\`\`

Result:
- Only ~100MB memory per video
- Can process 50+ videos concurrently
- No more crashes

**4. Command Pipeline Pattern**

**Chaining Processors:**
\`\`\`go
// Download -> Decompress -> Parse pipeline
func ProcessURL(url string) ([]Record, error) {
	// Download stage
    resp, _ := http.Get(url)
    defer resp.Body.Close()

	// Decompress stage
    r1, w1 := io.Pipe()
    go func() {
        gzipReader, _ := gzip.NewReader(resp.Body)
        io.Copy(w1, gzipReader)
        w1.Close()
    }()

	// Parse stage
    r2, w2 := io.Pipe()
    go func() {
        decoder := json.NewDecoder(r1)
        encoder := json.NewEncoder(w2)
	// Transform each record
        for decoder.More() {
            var rec Record
            decoder.Decode(&rec)
            encoder.Encode(transform(rec))
        }
        w2.Close()
    }()

	// Collect results
    var records []Record
    decoder := json.NewDecoder(r2)
    decoder.Decode(&records)
    return records, nil
}
\`\`\`

**5. Synchronous Behavior**

Pipes provide backpressure automatically:
\`\`\`go
r, w := io.Pipe()

// Fast writer
go func() {
    for i := 0; i < 1000; i++ {
        w.Write([]byte("data"))
	// Blocks here until reader consumes!
    }
}()

// Slow reader
time.Sleep(1 * time.Second)
io.Copy(os.Stdout, r) // Writer waits for this
\`\`\`

This prevents memory buildup from fast producers.

**6. Error Propagation**

**Custom Error Handling:**
\`\`\`go
r, w := io.Pipe()

go func() {
    _, err := doWork(w)
    if err != nil {
        w.CloseWithError(err) // Propagate error
    } else {
        w.Close() // Success (EOF)
    }
}()

// Reader gets the error
_, err := io.Copy(os.Stdout, r)
if err != nil && err != io.EOF {
    log.Fatal("Work failed:", err)
}
\`\`\`

**7. Testing with Pipes**

**Mock Network Connections:**
\`\`\`go
func TestHTTPHandler(t *testing.T) {
    r, w := io.Pipe()

	// Simulate slow client
    go func() {
        for i := 0; i < 10; i++ {
            w.Write([]byte("chunk"))
            time.Sleep(100 * time.Millisecond)
        }
        w.Close()
    }()

	// Test handler with simulated input
    req := httptest.NewRequest("POST", "/", r)
    rec := httptest.NewRecorder()
    handler(rec, req)

	// Verify behavior
    if rec.Code != 200 {
        t.Errorf("expected 200, got %d", rec.Code)
    }
}
\`\`\`

**8. Standard Library Examples**

Pipes are used throughout stdlib:
- \`exec.Cmd.StdoutPipe()\` - capture command output
- \`exec.Cmd.StdinPipe()\` - send input to command
- \`httputil.DumpRequest\` - capture HTTP request
- \`gzip.Writer\` composition - compress while writing

**9. Performance Characteristics**

\`\`\`go
// Unbuffered pipe - synchronous
r, w := io.Pipe()
w.Write(data) // Blocks until r.Read() called

// vs buffered channel - asynchronous
ch := make(chan []byte, 100)
ch <- data // Doesn't block until buffer full
\`\`\`

Choose pipes when:
- You want backpressure
- Memory is constrained
- Reader/writer speeds should balance

**10. Advanced Pattern: Multi-Writer**

**Broadcast to Multiple Readers:**
\`\`\`go
func Broadcast(source io.Reader, destinations ...io.Writer) error {
    readers := make([]*io.PipeReader, len(destinations))
    writers := make([]*io.PipeWriter, len(destinations))

    for i := range destinations {
        readers[i], writers[i] = io.Pipe()
        go io.Copy(destinations[i], readers[i])
    }

    buf := make([]byte, 32*1024)
    for {
        n, err := source.Read(buf)
        if n > 0 {
            for _, w := range writers {
                w.Write(buf[:n])
            }
        }
        if err != nil {
            for _, w := range writers {
                w.CloseWithError(err)
            }
            return err
        }
    }
}
\`\`\`

**Key Takeaways:**
- Pipes enable zero-copy goroutine communication
- Synchronous behavior provides automatic backpressure
- Essential for streaming large data without buffering
- CloseWithError enables proper error propagation
- Thread-safe by design using channels
- Used extensively in standard library
- Critical for building efficient data pipelines`,
	order: 1,
	translations: {
		ru: {
			title: 'Реализация пользовательского Pipe для связи горутин',
			description: `Реализуйте пользовательскую функцию **Pipe()**, которая создает синхронный канал в памяти для связи горутин, аналогичный \`io.Pipe()\`.

**Требования:**
1. Создать \`PipeReader\` и \`PipeWriter\`, которые соединены
2. Данные, записанные в \`PipeWriter\`, должны быть читаемы из \`PipeReader\`
3. \`Write\` блокируется до вызова соответствующего \`Read\` (синхронное поведение)
4. \`Read\` блокируется до записи данных или закрытия writer
5. Закрытие writer должно распространять \`io.EOF\` на reader
6. Закрытие writer с ошибкой должно распространять эту ошибку на reader
7. Потокобезопасная реализация используя каналы и мьютексы
8. Корректная обработка параллельных чтений/записей

**Сигнатура функции:**
\`\`\`go
func Pipe() (*PipeReader, *PipeWriter)

type PipeReader struct {
	// внутренние поля
}

func (r *PipeReader) Read(p []byte) (n int, err error)
func (r *PipeReader) Close() error

type PipeWriter struct {
	// внутренние поля
}

func (w *PipeWriter) Write(p []byte) (n int, err error)
func (w *PipeWriter) Close() error
func (w *PipeWriter) CloseWithError(err error) error
\`\`\`

**Пример использования:**
\`\`\`go
r, w := Pipe()

// Горутина writer
go func() {
    w.Write([]byte("hello"))
    w.Write([]byte(" world"))
    w.Close()
}()

// Горутина reader
buf := make([]byte, 100)
n, err := r.Read(buf)
// n == 5, string(buf[:n]) == "hello"

n, err = r.Read(buf)
// n == 6, string(buf[:n]) == " world"

n, err = r.Read(buf)
// n == 0, err == io.EOF (writer закрыт)
\`\`\`

**Ключевые концепции:**
- **Синхронный I/O**: Write блокируется пока Read не потребляет данные
- **Канальная коммуникация**: Использование каналов для передачи данных между горутинами
- **Корректное завершение**: Правильное распространение close и EOF
- **Распространение ошибок**: CloseWithError позволяет сообщать о пользовательских ошибках
- **Потокобезопасность**: Несколько горутин могут безопасно взаимодействовать

**Стратегия реализации:**
1. Использовать канал для передачи срезов данных между writer и reader
2. Использовать другой канал для сигнализации завершения записи
3. Хранить ошибку закрытия в общем состоянии (защищенном мьютексом)
4. Writer.Write отправляет данные и ждет завершения reader
5. Reader.Read получает данные, копирует их, затем сигнализирует о завершении
6. Обработать закрытие закрывая канал данных и сохраняя EOF/ошибку
7. Защитить общее состояние (закрыто, ошибка) с помощью sync.Mutex

**Ограничения:**
- Не использовать \`io.Pipe\` из стандартной библиотеки
- Должна быть полностью потокобезопасной
- Write должен блокироваться пока Read не потребляет данные
- Read должен блокироваться пока Write не предоставляет данные или pipe не закрыт
- CloseWithError должен распространять ошибку на reader`,
			hint1: `Создайте общую структуру pipe с двумя каналами: один для данных ([]byte) и один для подтверждения (int). Writer отправляет данные по первому каналу, Reader копирует их и отправляет количество байт по второму каналу.`,
			hint2: `Используйте sync.Once чтобы убедиться, что close происходит ровно один раз. Сохраните ошибку закрытия в структуре pipe и верните её когда Reader пытается читать после закрытия writer.`,
			whyItMatters: `Понимание pipes необходимо для построения потоковых конвейеров данных и паттернов коммуникации горутин в Go.

**Почему это важно:**

**1. Паттерн коммуникации горутин**
Pipes позволяют потоковую передачу данных между горутинами без буферизации:

\`\`\`go
// Конвейер обработки потока
r, w := Pipe()

// Горутина-производитель
go func() {
    for _, data := range largeDateset {
        w.Write(process(data))
    }
    w.Close()
}()

// Горутина-потребитель
io.Copy(destination, r) // Стримит данные по мере поступления
\`\`\`

**2. Практическое использование**

**HTTP потоковый ответ:**
\`\`\`go
func HandleStream(w http.ResponseWriter, r *http.Request) {
    pr, pw := io.Pipe()

	// Генерация данных в фоне
    go func() {
        defer pw.Close()
        for i := 0; i < 1000; i++ {
            fmt.Fprintf(pw, "Chunk %d\\n", i)
            time.Sleep(10 * time.Millisecond)
        }
    }()

	// Поток клиенту
    io.Copy(w, pr) // Отправляет данные по мере генерации
}
\`\`\`

Без pipes пришлось бы буферизовать все данные в памяти сначала.

**3. Инцидент в продакшене: Истощение памяти**

Сервис обработки видео имел этот код:
\`\`\`go
// ПЛОХО - загружает все видео в память
data, _ := os.ReadFile("video.mp4") // файл 2GB!
encoded := encode(data) // Ещё 2GB!
os.WriteFile("output.mp4", encoded, 0644)
\`\`\`

Проблема:
- 4GB памяти на видео
- Только 8GB RAM доступно
- Может обработать только 1 видео одновременно
- Крэши из-за нехватки памяти

Исправление с pipes:
\`\`\`go
// ХОРОШО - стримит через память
r, w := io.Pipe()

go func() {
    file, _ := os.Open("video.mp4")
    io.Copy(w, file) // Стримит порциями
    w.Close()
}()

output, _ := os.Create("output.mp4")
encoder := NewEncoder(output)
io.Copy(encoder, r) // Обрабатывает по мере чтения
\`\`\`

Результат:
- Только ~100MB памяти на видео
- Может обрабатывать 50+ видео одновременно
- Больше никаких крэшей

**4. Паттерн конвейера команд**

**Цепочка обработчиков:**
\`\`\`go
// Конвейер Download -> Decompress -> Parse
func ProcessURL(url string) ([]Record, error) {
	// Стадия загрузки
    resp, _ := http.Get(url)
    defer resp.Body.Close()

	// Стадия распаковки
    r1, w1 := io.Pipe()
    go func() {
        gzipReader, _ := gzip.NewReader(resp.Body)
        io.Copy(w1, gzipReader)
        w1.Close()
    }()

	// Стадия парсинга
    r2, w2 := io.Pipe()
    go func() {
        decoder := json.NewDecoder(r1)
        encoder := json.NewEncoder(w2)
	// Преобразование каждой записи
        for decoder.More() {
            var rec Record
            decoder.Decode(&rec)
            encoder.Encode(transform(rec))
        }
        w2.Close()
    }()

	// Сбор результатов
    var records []Record
    decoder := json.NewDecoder(r2)
    decoder.Decode(&records)
    return records, nil
}
\`\`\`

**5. Синхронное поведение**

Pipes обеспечивают противодавление автоматически:
\`\`\`go
r, w := io.Pipe()

// Быстрый writer
go func() {
    for i := 0; i < 1000; i++ {
        w.Write([]byte("data"))
	// Блокируется здесь пока reader не потребляет!
    }
}()

// Медленный reader
time.Sleep(1 * time.Second)
io.Copy(os.Stdout, r) // Writer ждет этого
\`\`\`

Это предотвращает накопление памяти от быстрых производителей.

**6. Распространение ошибок**

**Обработка пользовательских ошибок:**
\`\`\`go
r, w := io.Pipe()

go func() {
    _, err := doWork(w)
    if err != nil {
        w.CloseWithError(err) // Распространить ошибку
    } else {
        w.Close() // Успех (EOF)
    }
}()

// Reader получает ошибку
_, err := io.Copy(os.Stdout, r)
if err != nil && err != io.EOF {
    log.Fatal("Work failed:", err)
}
\`\`\`

**7. Тестирование с Pipes**

**Имитация сетевых соединений:**
\`\`\`go
func TestHTTPHandler(t *testing.T) {
    r, w := io.Pipe()

	// Имитация медленного клиента
    go func() {
        for i := 0; i < 10; i++ {
            w.Write([]byte("chunk"))
            time.Sleep(100 * time.Millisecond)
        }
        w.Close()
    }()

	// Тестирование handler с имитированным вводом
    req := httptest.NewRequest("POST", "/", r)
    rec := httptest.NewRecorder()
    handler(rec, req)

	// Проверка поведения
    if rec.Code != 200 {
        t.Errorf("expected 200, got %d", rec.Code)
    }
}
\`\`\`

**8. Примеры из стандартной библиотеки**

Pipes используются повсюду в stdlib:
- \`exec.Cmd.StdoutPipe()\` - захват вывода команды
- \`exec.Cmd.StdinPipe()\` - отправка ввода команде
- \`httputil.DumpRequest\` - захват HTTP запроса
- Композиция \`gzip.Writer\` - сжатие при записи

**9. Характеристики производительности**

\`\`\`go
// Небуферизованный pipe - синхронный
r, w := io.Pipe()
w.Write(data) // Блокируется пока не вызван r.Read()

// против буферизованного канала - асинхронный
ch := make(chan []byte, 100)
ch <- data // Не блокируется пока буфер не заполнен
\`\`\`

Выбирайте pipes когда:
- Вам нужно противодавление
- Память ограничена
- Скорости reader/writer должны балансироваться

**10. Продвинутый паттерн: Multi-Writer**

**Широковещание нескольким читателям:**
\`\`\`go
func Broadcast(source io.Reader, destinations ...io.Writer) error {
    readers := make([]*io.PipeReader, len(destinations))
    writers := make([]*io.PipeWriter, len(destinations))

    for i := range destinations {
        readers[i], writers[i] = io.Pipe()
        go io.Copy(destinations[i], readers[i])
    }

    buf := make([]byte, 32*1024)
    for {
        n, err := source.Read(buf)
        if n > 0 {
            for _, w := range writers {
                w.Write(buf[:n])
            }
        }
        if err != nil {
            for _, w := range writers {
                w.CloseWithError(err)
            }
            return err
        }
    }
}
\`\`\`

**Ключевые выводы:**
- Pipes обеспечивают коммуникацию горутин без копирования
- Синхронное поведение обеспечивает автоматическое противодавление
- Необходимы для потоковой обработки больших данных без буферизации
- CloseWithError позволяет правильное распространение ошибок
- Потокобезопасны по дизайну используя каналы
- Широко используются в стандартной библиотеке
- Критичны для построения эффективных конвейеров данных`,
			solutionCode: `package interfaces

import (
	"errors"
	"io"
	"sync"
)

var errClosedPipe = errors.New("io: read/write on closed pipe")

type pipe struct {
	wrCh    chan []byte  // Данные от writer к reader
	rdCh    chan int     // Подтверждение от reader к writer
	err     error        // Ошибка для распространения на reader
	closeMu sync.Mutex   // Защита состояния закрытия
	wrMu    sync.Mutex   // Защита операций записи
	rdMu    sync.Mutex   // Защита операций чтения
	closed  bool         // Отслеживание закрытия pipe
}

type PipeReader struct {
	p *pipe
}

func (r *PipeReader) Read(b []byte) (n int, err error) {
	r.p.rdMu.Lock()
	defer r.p.rdMu.Unlock()

	// Получить данные от writer
	data, ok := <-r.p.wrCh
	if !ok {
		// Pipe закрыт, вернуть сохранённую ошибку
		r.p.closeMu.Lock()
		err := r.p.err
		r.p.closeMu.Unlock()
		return 0, err
	}

	// Скопировать данные в буфер
	n = copy(b, data)

	// Сигнализировать writer что мы закончили чтение
	r.p.rdCh <- n

	return n, nil
}

func (r *PipeReader) Close() error {
	r.p.closeMu.Lock()
	defer r.p.closeMu.Unlock()

	if !r.p.closed {
		r.p.closed = true
		r.p.err = errClosedPipe
		close(r.p.wrCh)
	}
	return nil
}

type PipeWriter struct {
	p *pipe
}

func (w *PipeWriter) Write(b []byte) (n int, err error) {
	w.p.wrMu.Lock()
	defer w.p.wrMu.Unlock()

	// Проверить закрыт ли pipe перед попыткой записи
	w.p.closeMu.Lock()
	if w.p.closed {
		w.p.closeMu.Unlock()
		return 0, errClosedPipe
	}
	w.p.closeMu.Unlock()

	// Сделать копию чтобы избежать гонки данных
	data := make([]byte, len(b))
	copy(data, b)

	// Обработка паники при отправке в закрытый канал (гонка)
	defer func() {
		if r := recover(); r != nil {
			n = 0
			err = errClosedPipe
		}
	}()

	// Отправить данные reader
	w.p.wrCh <- data

	// Ждать подтверждения от reader
	n = <-w.p.rdCh
	return n, nil
}

func (w *PipeWriter) Close() error {
	return w.CloseWithError(io.EOF)
}

func (w *PipeWriter) CloseWithError(err error) error {
	if err == nil {
		err = io.EOF
	}

	w.p.closeMu.Lock()
	defer w.p.closeMu.Unlock()

	if !w.p.closed {
		w.p.closed = true
		w.p.err = err
		close(w.p.wrCh)
	}

	return nil
}

func Pipe() (*PipeReader, *PipeWriter) {
	p := &pipe{
		wrCh: make(chan []byte),
		rdCh: make(chan int),
		err:  io.EOF,
	}

	return &PipeReader{p: p}, &PipeWriter{p: p}
}`
		},
		uz: {
			title: `Goroutine aloqasi uchun maxsus Pipe ni amalga oshirish`,
			description: `\`io.Pipe()\` ga o'xshash goroutine aloqasi uchun sinxron xotira kanalini yaratuvchi maxsus **Pipe()** funksiyasini amalga oshiring.

**Talablar:**
1. Bir-biriga ulangan \`PipeReader\` va \`PipeWriter\` yaratish
2. \`PipeWriter\` ga yozilgan ma'lumotlar \`PipeReader\` dan o'qilishi kerak
3. \`Write\` mos \`Read\` chaqirilgunga qadar bloklanadi (sinxron xatti-harakat)
4. \`Read\` ma'lumotlar yozilgunga yoki writer yopilgunga qadar bloklanadi
5. Writer yopilishi \`io.EOF\` ni reader ga tarqatishi kerak
6. Writer xato bilan yopilishi o'sha xatoni reader ga tarqatishi kerak
7. Kanallar va mutex lar yordamida potok-xavfsiz amalga oshirish
8. Parallel o'qish/yozishni to'g'ri qayta ishlash

**Funksiya imzosi:**
\`\`\`go
func Pipe() (*PipeReader, *PipeWriter)

type PipeReader struct {
	// ichki maydonlar
}

func (r *PipeReader) Read(p []byte) (n int, err error)
func (r *PipeReader) Close() error

type PipeWriter struct {
	// ichki maydonlar
}

func (w *PipeWriter) Write(p []byte) (n int, err error)
func (w *PipeWriter) Close() error
func (w *PipeWriter) CloseWithError(err error) error
\`\`\`

**Foydalanish misoli:**
\`\`\`go
r, w := Pipe()

// Writer goroutine
go func() {
    w.Write([]byte("hello"))
    w.Write([]byte(" world"))
    w.Close()
}()

// Reader goroutine
buf := make([]byte, 100)
n, err := r.Read(buf)
// n == 5, string(buf[:n]) == "hello"

n, err = r.Read(buf)
// n == 6, string(buf[:n]) == " world"

n, err = r.Read(buf)
// n == 0, err == io.EOF (writer yopildi)
\`\`\`

**Asosiy tushunchalar:**
- **Sinxron I/O**: Write reader ma'lumotlarni iste'mol qilgunga qadar bloklanadi
- **Kanal aloqasi**: Goroutine lar o'rtasida ma'lumot uzatish uchun kanallardan foydalanish
- **To'g'ri tugatish**: Close va EOF ni to'g'ri tarqatish
- **Xato tarqatish**: CloseWithError maxsus xato haqida xabar berish imkonini beradi
- **Potok xavfsizligi**: Bir nechta goroutine xavfsiz tarzda o'zaro ta'sir qilishi mumkin

**Amalga oshirish strategiyasi:**
1. Writer va reader o'rtasida ma'lumot bo'laklarini uzatish uchun kanaldan foydalanish
2. Yozish tugallanganini bildirish uchun boshqa kanaldan foydalanish
3. Yopish xatosini umumiy holatda saqlash (mutex bilan himoyalangan)
4. Writer.Write ma'lumotlarni yuboradi va reader tugashini kutadi
5. Reader.Read ma'lumotlarni oladi, ularni nusxalaydi, keyin tugallanganini bildiradi
6. Yopishni ma'lumotlar kanalini yopish va EOF/xatoni saqlash orqali qayta ishlash
7. Umumiy holatni (yopilgan, xato) sync.Mutex bilan himoyalash

**Cheklovlar:**
- Standart kutubxonadan \`io.Pipe\` dan foydalanmang
- To'liq potok-xavfsiz bo'lishi kerak
- Write reader ma'lumotlarni iste'mol qilgunga qadar bloklanishi kerak
- Read writer ma'lumot bergunga yoki pipe yopilgunga qadar bloklanishi kerak
- CloseWithError xatoni reader ga tarqatishi kerak`,
			hint1: `Ikki kanalli umumiy pipe strukturasini yarating: biri ma'lumotlar uchun ([]byte) va biri tasdiqlash uchun (int). Writer birinchi kanalda ma'lumot yuboradi, Reader ularni nusxalaydi va ikkinchi kanalda bayt sonini yuboradi.`,
			hint2: `Yopish aynan bir marta sodir bo'lishini ta'minlash uchun sync.Once dan foydalaning. Yopish xatosini pipe strukturasida saqlang va writer yopilgandan keyin Reader o'qishga harakat qilganda uni qaytaring.`,
			whyItMatters: `Pipe larni tushunish Go da oqim ma'lumotlar quvurlari va goroutine aloqa patternlarini qurish uchun zarur.

**Nima uchun bu muhim:**

**1. Goroutine aloqa patterni**
Pipe lar goroutine lar o'rtasida buferlamasdan oqim ma'lumotlarini uzatish imkonini beradi:

\`\`\`go
// Oqim qayta ishlash quvuri
r, w := Pipe()

// Ishlab chiqaruvchi goroutine
go func() {
    for _, data := range largeDateset {
        w.Write(process(data))
    }
    w.Close()
}()

// Iste'molchi goroutine
io.Copy(destination, r) // Ma'lumotlar kelganda oqimlaydi
\`\`\`

**2. Amaliy foydalanish**

**HTTP javob oqimi:**
\`\`\`go
func HandleStream(w http.ResponseWriter, r *http.Request) {
    pr, pw := io.Pipe()

	// Fonda ma'lumot yaratish
    go func() {
        defer pw.Close()
        for i := 0; i < 1000; i++ {
            fmt.Fprintf(pw, "Chunk %d\\n", i)
            time.Sleep(10 * time.Millisecond)
        }
    }()

	// Mijozga oqim
    io.Copy(w, pr) // Yaratilganda ma'lumotlarni yuboradi
}
\`\`\`

Pipe lar bo'lmasa, avval barcha ma'lumotlarni xotirada buferlash kerak bo'lardi.

**3. Production hodisasi: Xotira tugashi**

Video qayta ishlash xizmati bu kodga ega edi:
\`\`\`go
// YOMON - butun videoni xotiraga yuklaydi
data, _ := os.ReadFile("video.mp4") // 2GB fayl!
encoded := encode(data) // Yana 2GB!
os.WriteFile("output.mp4", encoded, 0644)
\`\`\`

Muammo:
- Har bir video uchun 4GB xotira
- Faqat 8GB RAM mavjud
- Bir vaqtning o'zida faqat 1 ta videoni qayta ishlash mumkin
- Xotira tugashi tufayli ishdan chiqishlar

Pipe lar bilan tuzatish:
\`\`\`go
// YAXSHI - xotira orqali oqimlaydi
r, w := io.Pipe()

go func() {
    file, _ := os.Open("video.mp4")
    io.Copy(w, file) // Bo'laklar bilan oqimlaydi
    w.Close()
}()

output, _ := os.Create("output.mp4")
encoder := NewEncoder(output)
io.Copy(encoder, r) // O'qiganda qayta ishlaydi
\`\`\`

Natija:
- Har bir video uchun faqat ~100MB xotira
- 50+ videoni bir vaqtda qayta ishlash mumkin
- Endi ishdan chiqishlar yo'q

**4. Buyruqlar quvuri patterni**

**Qayta ishlovchilar zanjiri:**
\`\`\`go
// Download -> Decompress -> Parse quvuri
func ProcessURL(url string) ([]Record, error) {
	// Yuklab olish bosqichi
    resp, _ := http.Get(url)
    defer resp.Body.Close()

	// Siqishni ochish bosqichi
    r1, w1 := io.Pipe()
    go func() {
        gzipReader, _ := gzip.NewReader(resp.Body)
        io.Copy(w1, gzipReader)
        w1.Close()
    }()

	// Parsing bosqichi
    r2, w2 := io.Pipe()
    go func() {
        decoder := json.NewDecoder(r1)
        encoder := json.NewEncoder(w2)
	// Har bir yozuvni o'zgartirish
        for decoder.More() {
            var rec Record
            decoder.Decode(&rec)
            encoder.Encode(transform(rec))
        }
        w2.Close()
    }()

	// Natijalarni yig'ish
    var records []Record
    decoder := json.NewDecoder(r2)
    decoder.Decode(&records)
    return records, nil
}
\`\`\`

**5. Sinxron xatti-harakat**

Pipe lar avtomatik ravishda orqa bosimni ta'minlaydi:
\`\`\`go
r, w := io.Pipe()

// Tez writer
go func() {
    for i := 0; i < 1000; i++ {
        w.Write([]byte("data"))
	// Bu yerda reader iste'mol qilgunga qadar bloklanadi!
    }
}()

// Sekin reader
time.Sleep(1 * time.Second)
io.Copy(os.Stdout, r) // Writer buni kutadi
\`\`\`

Bu tez ishlab chiqaruvchilardan xotira to'planishining oldini oladi.

**6. Xatolarni tarqatish**

**Maxsus xatolarga ishlov berish:**
\`\`\`go
r, w := io.Pipe()

go func() {
    _, err := doWork(w)
    if err != nil {
        w.CloseWithError(err) // Xatoni tarqatish
    } else {
        w.Close() // Muvaffaqiyat (EOF)
    }
}()

// Reader xatoni oladi
_, err := io.Copy(os.Stdout, r)
if err != nil && err != io.EOF {
    log.Fatal("Work failed:", err)
}
\`\`\`

**7. Pipe lar bilan test qilish**

**Tarmoq ulanishlarini taqlid qilish:**
\`\`\`go
func TestHTTPHandler(t *testing.T) {
    r, w := io.Pipe()

	// Sekin mijozni taqlid qilish
    go func() {
        for i := 0; i < 10; i++ {
            w.Write([]byte("chunk"))
            time.Sleep(100 * time.Millisecond)
        }
        w.Close()
    }()

	// Handler ni taqlid qilingan kirish bilan test qilish
    req := httptest.NewRequest("POST", "/", r)
    rec := httptest.NewRecorder()
    handler(rec, req)

	// Xatti-harakatni tekshirish
    if rec.Code != 200 {
        t.Errorf("expected 200, got %d", rec.Code)
    }
}
\`\`\`

**8. Standart kutubxona misollari**

Pipe lar stdlib da hamma joyda ishlatiladi:
- \`exec.Cmd.StdoutPipe()\` - buyruq chiqishini ushlab olish
- \`exec.Cmd.StdinPipe()\` - buyruqqa kirish yuborish
- \`httputil.DumpRequest\` - HTTP so'rovini ushlab olish
- \`gzip.Writer\` kompozitsiyasi - yozishda siqish

**9. Unumdorlik xarakteristikalari**

\`\`\`go
// Bufersiz pipe - sinxron
r, w := io.Pipe()
w.Write(data) // r.Read() chaqirilgunga qadar bloklanadi

// buferli kanalga qarshi - asinxron
ch := make(chan []byte, 100)
ch <- data // Bufer to'lgunga qadar bloklanmaydi
\`\`\`

Pipe larni qachon tanlash:
- Sizga orqa bosim kerak
- Xotira cheklangan
- Reader/writer tezliklari muvozanatlashishi kerak

**10. Ilg'or pattern: Multi-Writer**

**Bir nechta o'quvchilarga translyatsiya:**
\`\`\`go
func Broadcast(source io.Reader, destinations ...io.Writer) error {
    readers := make([]*io.PipeReader, len(destinations))
    writers := make([]*io.PipeWriter, len(destinations))

    for i := range destinations {
        readers[i], writers[i] = io.Pipe()
        go io.Copy(destinations[i], readers[i])
    }

    buf := make([]byte, 32*1024)
    for {
        n, err := source.Read(buf)
        if n > 0 {
            for _, w := range writers {
                w.Write(buf[:n])
            }
        }
        if err != nil {
            for _, w := range writers {
                w.CloseWithError(err)
            }
            return err
        }
    }
}
\`\`\`

**Asosiy xulosalar:**
- Pipe lar nusxalamasdan goroutine aloqasini ta'minlaydi
- Sinxron xatti-harakat avtomatik orqa bosimni ta'minlaydi
- Buferlamasdan katta ma'lumotlarni oqimlash uchun zarur
- CloseWithError to'g'ri xato tarqatishni ta'minlaydi
- Kanallardan foydalangan holda dizayn bo'yicha potok-xavfsiz
- Standart kutubxonada keng qo'llaniladi
- Samarali ma'lumot quvurlari qurish uchun muhim`,
			solutionCode: `package interfaces

import (
	"errors"
	"io"
	"sync"
)

var errClosedPipe = errors.New("io: read/write on closed pipe")

type pipe struct {
	wrCh    chan []byte  // Writer dan reader ga ma'lumotlar
	rdCh    chan int     // Reader dan writer ga tasdiqlash
	err     error        // Reader ga tarqatish uchun xato
	closeMu sync.Mutex   // Yopilish holatini himoyalash
	wrMu    sync.Mutex   // Yozish operatsiyalarini himoyalash
	rdMu    sync.Mutex   // O'qish operatsiyalarini himoyalash
	closed  bool         // Pipe yopilganligini kuzatish
}

type PipeReader struct {
	p *pipe
}

func (r *PipeReader) Read(b []byte) (n int, err error) {
	r.p.rdMu.Lock()
	defer r.p.rdMu.Unlock()

	// Writer dan ma'lumot olish
	data, ok := <-r.p.wrCh
	if !ok {
		// Pipe yopildi, saqlangan xatoni qaytarish
		r.p.closeMu.Lock()
		err := r.p.err
		r.p.closeMu.Unlock()
		return 0, err
	}

	// Ma'lumotlarni buferga nusxalash
	n = copy(b, data)

	// Writer ga o'qishni tugatganimizni bildirish
	r.p.rdCh <- n

	return n, nil
}

func (r *PipeReader) Close() error {
	r.p.closeMu.Lock()
	defer r.p.closeMu.Unlock()

	if !r.p.closed {
		r.p.closed = true
		r.p.err = errClosedPipe
		close(r.p.wrCh)
	}
	return nil
}

type PipeWriter struct {
	p *pipe
}

func (w *PipeWriter) Write(b []byte) (n int, err error) {
	w.p.wrMu.Lock()
	defer w.p.wrMu.Unlock()

	// Yozishga urinishdan oldin pipe yopilganini tekshirish
	w.p.closeMu.Lock()
	if w.p.closed {
		w.p.closeMu.Unlock()
		return 0, errClosedPipe
	}
	w.p.closeMu.Unlock()

	// Ma'lumot poygasidan qochish uchun nusxa yaratish
	data := make([]byte, len(b))
	copy(data, b)

	// Yopilgan kanalga yuborishdagi panikani qayta ishlash (poyga holati)
	defer func() {
		if r := recover(); r != nil {
			n = 0
			err = errClosedPipe
		}
	}()

	// Reader ga ma'lumot yuborish
	w.p.wrCh <- data

	// Reader dan tasdiqni kutish
	n = <-w.p.rdCh
	return n, nil
}

func (w *PipeWriter) Close() error {
	return w.CloseWithError(io.EOF)
}

func (w *PipeWriter) CloseWithError(err error) error {
	if err == nil {
		err = io.EOF
	}

	w.p.closeMu.Lock()
	defer w.p.closeMu.Unlock()

	if !w.p.closed {
		w.p.closed = true
		w.p.err = err
		close(w.p.wrCh)
	}

	return nil
}

func Pipe() (*PipeReader, *PipeWriter) {
	p := &pipe{
		wrCh: make(chan []byte),
		rdCh: make(chan int),
		err:  io.EOF,
	}

	return &PipeReader{p: p}, &PipeWriter{p: p}
}`
		}
	}
};

export default task;
