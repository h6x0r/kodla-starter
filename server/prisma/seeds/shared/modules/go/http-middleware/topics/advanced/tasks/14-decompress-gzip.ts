import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-http-decompress-gzip',
	title: 'Decompress GZIP Middleware',
	difficulty: 'medium',	tags: ['go', 'http', 'middleware', 'compression'],
	estimatedTime: '30m',	isPremium: false,
	youtubeUrl: '',
	description: `Implement **DecompressGZIP** middleware that automatically decompresses gzip-encoded request bodies.

**Requirements:**
1. Create function \`DecompressGZIP(next http.Handler) http.Handler\`
2. Check Content-Encoding header for "gzip"
3. Skip decompression if not gzip
4. Create gzip.Reader and decompress body
5. Replace body with decompressed data
6. Remove Content-Encoding header after decompression
7. Update Content-Length to decompressed size
8. Return 400 on invalid gzip data
9. Handle nil next handler

**Example:**
\`\`\`go
handler := DecompressGZIP(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    body, _ := io.ReadAll(r.Body)
    fmt.Fprintf(w, "Decompressed: %s", body)
}))

// Request with gzip-compressed body and Content-Encoding: gzip
// Handler receives decompressed body
\`\`\`

**Constraints:**
- Must check Content-Encoding header (case-insensitive)
- Must handle gzip.Reader errors gracefully
- Must remove Content-Encoding after decompression`,
	initialCode: `package httpx

import (
	"bytes"
	"compress/gzip"
	"io"
	"net/http"
	"strings"
)

// TODO: Implement DecompressGZIP middleware
func DecompressGZIP(next http.Handler) http.Handler {
	// TODO: Implement
}`,
	solutionCode: `package httpx

import (
	"bytes"
	"compress/gzip"
	"io"
	"net/http"
	"strings"
)

func DecompressGZIP(next http.Handler) http.Handler {
	if next == nil {	// Handle nil next handler
		return http.HandlerFunc(func(http.ResponseWriter, *http.Request) {})
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.EqualFold(r.Header.Get("Content-Encoding"), "gzip") {	// Check if gzip encoded (case-insensitive)
			next.ServeHTTP(w, r)	// Not gzip, pass through
			return
		}
		reader, err := gzip.NewReader(r.Body)	// Create gzip reader
		if err != nil {
			http.Error(w, "invalid gzip body", http.StatusBadRequest)	// Handle invalid gzip
			return
		}
		defer reader.Close()	// Close gzip reader

		payload, err := io.ReadAll(reader)	// Read decompressed data
		if err != nil {
			http.Error(w, "invalid gzip body", http.StatusBadRequest)	// Handle read errors
			return
		}
		if err := r.Body.Close(); err != nil {	// Close original body
			http.Error(w, "invalid gzip body", http.StatusBadRequest)
			return
		}

		clone := r.WithContext(r.Context())	// Clone request (shallow)
		clone.Body = io.NopCloser(bytes.NewReader(payload))	// Replace body with decompressed data
		clone.ContentLength = int64(len(payload))	// Update Content-Length to decompressed size
		if clone.Header != nil {	// Check if headers exist
			clone.Header.Del("Content-Encoding")	// Remove Content-Encoding header
		}
		next.ServeHTTP(w, clone)	// Pass modified request
	})
}`,
			hint1: `Use gzip.NewReader(r.Body) to create a decompressing reader. Check Content-Encoding header first.`,
			hint2: `Read all decompressed data, close original body, create new body with io.NopCloser(bytes.NewReader(payload)).`,
			testCode: `package httpx

import (
	"bytes"
	"compress/gzip"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func Test1(t *testing.T) {
	// Test middleware returns non-nil handler
	h := DecompressGZIP(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	if h == nil {
		t.Error("handler should not be nil")
	}
}

func Test2(t *testing.T) {
	// Test nil handler returns non-nil
	h := DecompressGZIP(nil)
	if h == nil {
		t.Error("nil handler should return non-nil")
	}
}

func Test3(t *testing.T) {
	// Test non-gzip request passes through unchanged
	var body []byte
	h := DecompressGZIP(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, _ = io.ReadAll(r.Body)
	}))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("POST", "/", strings.NewReader("plain data")))
	if string(body) != "plain data" {
		t.Errorf("body = %q, want 'plain data'", string(body))
	}
}

func Test4(t *testing.T) {
	// Test gzip content is decompressed
	var buf bytes.Buffer
	gw := gzip.NewWriter(&buf)
	gw.Write([]byte("compressed data"))
	gw.Close()

	var body []byte
	h := DecompressGZIP(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, _ = io.ReadAll(r.Body)
	}))
	req := httptest.NewRequest("POST", "/", &buf)
	req.Header.Set("Content-Encoding", "gzip")
	h.ServeHTTP(httptest.NewRecorder(), req)
	if string(body) != "compressed data" {
		t.Errorf("body = %q, want 'compressed data'", string(body))
	}
}

func Test5(t *testing.T) {
	// Test Content-Encoding header removed after decompression
	var buf bytes.Buffer
	gw := gzip.NewWriter(&buf)
	gw.Write([]byte("data"))
	gw.Close()

	var encoding string
	h := DecompressGZIP(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		encoding = r.Header.Get("Content-Encoding")
	}))
	req := httptest.NewRequest("POST", "/", &buf)
	req.Header.Set("Content-Encoding", "gzip")
	h.ServeHTTP(httptest.NewRecorder(), req)
	if encoding != "" {
		t.Errorf("Content-Encoding = %q, want empty", encoding)
	}
}

func Test6(t *testing.T) {
	// Test method preserved
	var method string
	h := DecompressGZIP(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		method = r.Method
	}))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("PUT", "/", strings.NewReader("data")))
	if method != "PUT" {
		t.Errorf("method = %q, want PUT", method)
	}
}

func Test7(t *testing.T) {
	// Test other headers preserved
	var header string
	h := DecompressGZIP(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header = r.Header.Get("X-Custom")
	}))
	req := httptest.NewRequest("POST", "/", strings.NewReader("data"))
	req.Header.Set("X-Custom", "value")
	h.ServeHTTP(httptest.NewRecorder(), req)
	if header != "value" {
		t.Errorf("header = %q, want 'value'", header)
	}
}

func Test8(t *testing.T) {
	// Test response writing works
	h := DecompressGZIP(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("ok"))
	}))
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest("POST", "/", strings.NewReader("data")))
	if rec.Code != http.StatusCreated {
		t.Errorf("status = %d, want 201", rec.Code)
	}
}

func Test9(t *testing.T) {
	// Test empty gzip body
	var buf bytes.Buffer
	gw := gzip.NewWriter(&buf)
	gw.Close()

	var body []byte
	h := DecompressGZIP(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, _ = io.ReadAll(r.Body)
	}))
	req := httptest.NewRequest("POST", "/", &buf)
	req.Header.Set("Content-Encoding", "gzip")
	h.ServeHTTP(httptest.NewRecorder(), req)
	if len(body) != 0 {
		t.Errorf("body len = %d, want 0", len(body))
	}
}

func Test10(t *testing.T) {
	// Test path preserved
	var path string
	h := DecompressGZIP(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path = r.URL.Path
	}))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("POST", "/api/test", strings.NewReader("data")))
	if path != "/api/test" {
		t.Errorf("path = %q, want '/api/test'", path)
	}
}`,
			whyItMatters: `DecompressGZIP enables transparent compression support, reducing bandwidth and improving API performance without handler modifications.

**Why Decompress GZIP:**
- **Bandwidth Savings:** Reduce network transfer by 60-90%
- **Performance:** Faster uploads over slow connections
- **Transparency:** Handlers work with plain data
- **Client Support:** Many HTTP clients support automatic compression

**Production Pattern:**
\`\`\`go
// Complete compression middleware stack
func CompressionStack(next http.Handler) http.Handler {
    return Chain(
        DecompressGZIP,	// Decompress incoming requests
        CompressResponse,	// Compress outgoing responses
    )(next)
}

// Selective decompression based on content type
func SmartDecompression(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        contentType := r.Header.Get("Content-Type")

	// Only decompress compressible content
        compressible := []string{
            "application/json",
            "application/xml",
            "text/",
        }

        shouldDecompress := false
        for _, ct := range compressible {
            if strings.Contains(contentType, ct) {
                shouldDecompress = true
                break
            }
        }

        if shouldDecompress && r.Header.Get("Content-Encoding") == "gzip" {
            DecompressGZIP(next).ServeHTTP(w, r)
        } else {
            next.ServeHTTP(w, r)
        }
    })
}

// Logging decompression metrics
func DecompressionMetrics(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if r.Header.Get("Content-Encoding") != "gzip" {
            next.ServeHTTP(w, r)
            return
        }

        originalSize := r.ContentLength

	// Decompress
        handler := DecompressGZIP(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            decompressedSize := r.ContentLength

	// Log compression ratio
            if originalSize > 0 {
                ratio := float64(decompressedSize) / float64(originalSize)
                log.Printf("GZIP: %d → %d bytes (%.2fx)", originalSize, decompressedSize, ratio)

                metrics.RecordHistogram("http_gzip_compression_ratio", ratio, map[string]string{
                    "path": r.URL.Path,
                })
            }

            next.ServeHTTP(w, r)
        }))

        handler.ServeHTTP(w, r)
    })
}

// Security: Decompression bomb protection
func SafeDecompression(maxSize int64) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            if r.Header.Get("Content-Encoding") != "gzip" {
                next.ServeHTTP(w, r)
                return
            }

            reader, err := gzip.NewReader(r.Body)
            if err != nil {
                http.Error(w, "invalid gzip", http.StatusBadRequest)
                return
            }
            defer reader.Close()

	// Limit decompressed size to prevent bombs
            limitedReader := io.LimitReader(reader, maxSize)
            payload, err := io.ReadAll(limitedReader)
            if err != nil {
                http.Error(w, "decompression failed", http.StatusBadRequest)
                return
            }

	// Check if limit was exceeded
            if int64(len(payload)) == maxSize {
                http.Error(w, "decompressed size exceeds limit", http.StatusRequestEntityTooLarge)
                return
            }

            r.Body.Close()
            clone := r.WithContext(r.Context())
            clone.Body = io.NopCloser(bytes.NewReader(payload))
            clone.ContentLength = int64(len(payload))
            clone.Header.Del("Content-Encoding")

            next.ServeHTTP(w, clone)
        })
    }
}

// Multi-encoding support (gzip, deflate, br)
func AutoDecompress(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        encoding := r.Header.Get("Content-Encoding")

        switch strings.ToLower(encoding) {
        case "gzip":
            DecompressGZIP(next).ServeHTTP(w, r)
        case "deflate":
            DecompressDeflate(next).ServeHTTP(w, r)
        case "br":
            DecompressBrotli(next).ServeHTTP(w, r)
        default:
            next.ServeHTTP(w, r)
        }
    })
}
\`\`\`

**Real-World Benefits:**
- **API Performance:** Upload large payloads faster
- **Cost Savings:** Reduce bandwidth costs by 60-90%
- **Mobile Friendly:** Better performance on slow connections
- **Transparent:** Handlers receive plain data

**GZIP Best Practices:**
- **Check Encoding:** Always validate Content-Encoding header
- **Error Handling:** Return 400 for invalid gzip data
- **Security:** Protect against decompression bombs (limit size)
- **Content-Length:** Update to decompressed size
- **Remove Header:** Delete Content-Encoding after decompression

**Compression Ratios:**
- **JSON:** 60-80% reduction
- **XML:** 70-85% reduction
- **HTML:** 50-70% reduction
- **Text:** 50-75% reduction
- **Binary:** 10-30% reduction

**Security Considerations:**
- **Decompression Bombs:** Small compressed data → huge decompressed data
- **Memory Exhaustion:** Limit decompressed size
- **CPU DoS:** Limit decompression time
- **Validation:** Verify gzip integrity

Without DecompressGZIP, handlers must manually check encoding and decompress, leading to duplicate code and missed optimizations.`,	order: 13,
	translations: {
		ru: {
			title: 'Автоматическая распаковка GZIP запросов',
			description: `Реализуйте middleware **DecompressGZIP**, который автоматически распаковывает gzip-сжатые тела запросов.

**Требования:**
1. Создайте функцию \`DecompressGZIP(next http.Handler) http.Handler\`
2. Проверьте заголовок Content-Encoding на "gzip"
3. Пропустите распаковку если не gzip
4. Создайте gzip.Reader и распакуйте body
5. Замените body на распакованные данные
6. Удалите заголовок Content-Encoding после распаковки
7. Обновите Content-Length до размера распакованных данных
8. Верните 400 при невалидных gzip данных
9. Обработайте nil handler

**Пример:**
\`\`\`go
handler := DecompressGZIP(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    body, _ := io.ReadAll(r.Body)
    fmt.Fprintf(w, "Decompressed: %s", body)
}))

// Запрос с gzip-сжатым телом и Content-Encoding: gzip
// Handler получает распакованное тело
\`\`\`

**Ограничения:**
- Должен проверять заголовок Content-Encoding (без учёта регистра)
- Должен обрабатывать ошибки gzip.Reader корректно
- Должен удалять Content-Encoding после распаковки`,
			hint1: `Используйте gzip.NewReader(r.Body) для создания распаковывающего reader. Сначала проверьте заголовок Content-Encoding.`,
			hint2: `Прочитайте все распакованные данные, закройте оригинальный body, создайте новый body с io.NopCloser(bytes.NewReader(payload)).`,
			whyItMatters: `DecompressGZIP обеспечивает прозрачную поддержку сжатия, сокращая bandwidth и улучшая производительность API без модификации handlers.

**Почему Decompress GZIP:**
- **Экономия bandwidth:** Сокращение network transfer на 60-90%
- **Производительность:** Быстрая загрузка через медленные соединения
- **Прозрачность:** Handlers работают с обычными данными
- **Поддержка клиентов:** Многие HTTP клиенты поддерживают автоматическое сжатие

**Продакшен паттерн:**
\`\`\`go
// Полный стек сжатия
func CompressionStack(next http.Handler) http.Handler {
    return Chain(
        DecompressGZIP,	// Распаковка входящих запросов
        CompressResponse,	// Сжатие исходящих ответов
    )(next)
}

// Выборочная распаковка по типу контента
func SmartDecompression(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        contentType := r.Header.Get("Content-Type")

	// Распаковка только сжимаемого контента
        compressible := []string{
            "application/json",
            "application/xml",
            "text/",
        }

        shouldDecompress := false
        for _, ct := range compressible {
            if strings.Contains(contentType, ct) {
                shouldDecompress = true
                break
            }
        }

        if shouldDecompress && r.Header.Get("Content-Encoding") == "gzip" {
            DecompressGZIP(next).ServeHTTP(w, r)
        } else {
            next.ServeHTTP(w, r)
        }
    })
}

// Логирование метрик распаковки
func DecompressionMetrics(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if r.Header.Get("Content-Encoding") != "gzip" {
            next.ServeHTTP(w, r)
            return
        }

        originalSize := r.ContentLength

	// Распаковка
        handler := DecompressGZIP(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            decompressedSize := r.ContentLength

	// Логирование коэффициента сжатия
            if originalSize > 0 {
                ratio := float64(decompressedSize) / float64(originalSize)
                log.Printf("GZIP: %d → %d bytes (%.2fx)", originalSize, decompressedSize, ratio)

                metrics.RecordHistogram("http_gzip_compression_ratio", ratio, map[string]string{
                    "path": r.URL.Path,
                })
            }

            next.ServeHTTP(w, r)
        }))

        handler.ServeHTTP(w, r)
    })
}

// Безопасность: Защита от decompression bomb
func SafeDecompression(maxSize int64) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            if r.Header.Get("Content-Encoding") != "gzip" {
                next.ServeHTTP(w, r)
                return
            }

            reader, err := gzip.NewReader(r.Body)
            if err != nil {
                http.Error(w, "invalid gzip", http.StatusBadRequest)
                return
            }
            defer reader.Close()

            limitedReader := io.LimitReader(reader, maxSize)
            payload, err := io.ReadAll(limitedReader)
            if err != nil {
                http.Error(w, "decompression failed", http.StatusBadRequest)
                return
            }

            if int64(len(payload)) == maxSize {
                http.Error(w, "decompressed size exceeds limit", http.StatusRequestEntityTooLarge)
                return
            }

            r.Body.Close()
            clone := r.WithContext(r.Context())
            clone.Body = io.NopCloser(bytes.NewReader(payload))
            clone.ContentLength = int64(len(payload))
            clone.Header.Del("Content-Encoding")

            next.ServeHTTP(w, clone)
        })
    }
}

// Поддержка множественных кодировок (gzip, deflate, br)
func AutoDecompress(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        encoding := r.Header.Get("Content-Encoding")

        switch strings.ToLower(encoding) {
        case "gzip":
            DecompressGZIP(next).ServeHTTP(w, r)
        case "deflate":
            DecompressDeflate(next).ServeHTTP(w, r)
        case "br":
            DecompressBrotli(next).ServeHTTP(w, r)
        default:
            next.ServeHTTP(w, r)
        }
    })
}
\`\`\`

**Практические преимущества:**
- **Производительность API:** Быстрая загрузка больших payloads
- **Экономия затрат:** Сокращение bandwidth расходов на 60-90%
- **Mobile Friendly:** Лучшая производительность на медленных соединениях
- **Прозрачность:** Handlers получают обычные данные

**Лучшие практики GZIP:**
- **Проверка Encoding:** Всегда валидируйте Content-Encoding header
- **Обработка ошибок:** Возвращайте 400 для невалидных gzip данных
- **Безопасность:** Защита от decompression bombs (ограничение размера)
- **Content-Length:** Обновляйте до размера распакованных данных
- **Удаление Header:** Удаляйте Content-Encoding после распаковки

**Коэффициенты сжатия:**
- **JSON:** 60-80% сокращение
- **XML:** 70-85% сокращение
- **HTML:** 50-70% сокращение
- **Текст:** 50-75% сокращение
- **Binary:** 10-30% сокращение

**Коэффициенты сжатия:**
- **JSON:** 60-80% сокращение
- **XML:** 70-85% сокращение
- **HTML:** 50-70% сокращение
- **Текст:** 50-75% сокращение
- **Binary:** 10-30% сокращение

**Соображения безопасности:**
- **Decompression Bombs:** Маленькие сжатые данные → огромные распакованные
- **Исчерпание памяти:** Ограничивайте размер распакованных данных
- **CPU DoS:** Ограничивайте время распаковки
- **Валидация:** Проверяйте целостность gzip

**Общие сценарии использования:**
- **API Performance:** Загрузка больших payloads быстрее
- **Cost Savings:** Сокращение bandwidth costs на 60-90%
- **Mobile Friendly:** Улучшенная производительность на медленных соединениях
- **Transparent:** Handlers получают plain data

Без DecompressGZIP handlers должны вручную проверять encoding и распаковывать, что ведёт к дублированию кода и упущенным оптимизациям.`,
			solutionCode: `package httpx

import (
	"bytes"
	"compress/gzip"
	"io"
	"net/http"
	"strings"
)

func DecompressGZIP(next http.Handler) http.Handler {
	if next == nil {	// Обработка nil next handler
		return http.HandlerFunc(func(http.ResponseWriter, *http.Request) {})
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.EqualFold(r.Header.Get("Content-Encoding"), "gzip") {	// Проверка gzip кодировки (без учёта регистра)
			next.ServeHTTP(w, r)	// Не gzip, пропуск
			return
		}
		reader, err := gzip.NewReader(r.Body)	// Создание gzip reader
		if err != nil {
			http.Error(w, "invalid gzip body", http.StatusBadRequest)	// Обработка невалидного gzip
			return
		}
		defer reader.Close()	// Закрытие gzip reader

		payload, err := io.ReadAll(reader)	// Чтение распакованных данных
		if err != nil {
			http.Error(w, "invalid gzip body", http.StatusBadRequest)	// Обработка ошибок чтения
			return
		}
		if err := r.Body.Close(); err != nil {	// Закрытие оригинального body
			http.Error(w, "invalid gzip body", http.StatusBadRequest)
			return
		}

		clone := r.WithContext(r.Context())	// Клонирование запроса (поверхностное)
		clone.Body = io.NopCloser(bytes.NewReader(payload))	// Замена body распакованными данными
		clone.ContentLength = int64(len(payload))	// Обновление Content-Length до размера распакованных данных
		if clone.Header != nil {	// Проверка существования заголовков
			clone.Header.Del("Content-Encoding")	// Удаление заголовка Content-Encoding
		}
		next.ServeHTTP(w, clone)	// Передача модифицированного запроса
	})
}`
		},
		uz: {
			title: 'GZIP requestlarni avtomatik ochish',
			description: `Gzip bilan siqilgan request bodylarini avtomatik ochuvchi **DecompressGZIP** middleware ni amalga oshiring.

**Talablar:**
1. \`DecompressGZIP(next http.Handler) http.Handler\` funksiyasini yarating
2. Content-Encoding headerini "gzip" uchun tekshiring
3. Agar gzip bo'lmasa, ochishni o'tkazing
4. gzip.Reader yarating va bodyni oching
5. Bodyni ochilgan ma'lumotlar bilan almashtiring
6. Ochishdan keyin Content-Encoding headerini o'chiring
7. Content-Length ni ochilgan hajmga yangilang
8. Noto'g'ri gzip ma'lumotlarida 400 qaytaring
9. nil handlerni ishlang

**Misol:**
\`\`\`go
handler := DecompressGZIP(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    body, _ := io.ReadAll(r.Body)
    fmt.Fprintf(w, "Decompressed: %s", body)
}))

// Gzip bilan siqilgan body va Content-Encoding: gzip bilan request
// Handler ochilgan bodyni oladi
\`\`\`

**Cheklovlar:**
- Content-Encoding headerini tekshirishi kerak (katta-kichik harflarni inobatga olmasdan)
- gzip.Reader xatolarini to'g'ri ishlashi kerak
- Ochishdan keyin Content-Encoding ni o'chirishi kerak`,
			hint1: `Ochuvchi reader yaratish uchun gzip.NewReader(r.Body) dan foydalaning. Avval Content-Encoding headerini tekshiring.`,
			hint2: `Barcha ochilgan ma'lumotlarni o'qing, asl bodyni yoping, io.NopCloser(bytes.NewReader(payload)) bilan yangi body yarating.`,
			whyItMatters: `DecompressGZIP handlerlarda o'zgartirish kiritmasdan bandwidthni kamaytirib, API performansini yaxshilab, shaffof siqish qo'llab-quvvatlashni ta'minlaydi.

**Nima uchun Decompress GZIP:**
- **Bandwidth tejash:** Network transferni 60-90% ga kamaytirish
- **Performans:** Sekin ulanishlar orqali tez yuklash
- **Shaffoflik:** Handlerlar oddiy ma'lumotlar bilan ishlaydi
- **Mijoz qo'llab-quvvatlashi:** Ko'p HTTP mijozlar avtomatik siqishni qo'llab-quvvatlaydi

**Ishlab chiqarish patterni:**
\`\`\`go
// To'liq siqish stacki
func CompressionStack(next http.Handler) http.Handler {
    return Chain(
        DecompressGZIP,	// Kiruvchi requestlarni ochish
        CompressResponse,	// Chiquvchi responselarni siqish
    )(next)
}

// Content turiga qarab tanlab ochish
func SmartDecompression(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        contentType := r.Header.Get("Content-Type")

	// Faqat siqilishi mumkin bo'lgan kontentni ochish
        compressible := []string{
            "application/json",
            "application/xml",
            "text/",
        }

        shouldDecompress := false
        for _, ct := range compressible {
            if strings.Contains(contentType, ct) {
                shouldDecompress = true
                break
            }
        }

        if shouldDecompress && r.Header.Get("Content-Encoding") == "gzip" {
            DecompressGZIP(next).ServeHTTP(w, r)
        } else {
            next.ServeHTTP(w, r)
        }
    })
}

// Ochish metrikalarini loglash
func DecompressionMetrics(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if r.Header.Get("Content-Encoding") != "gzip" {
            next.ServeHTTP(w, r)
            return
        }

        originalSize := r.ContentLength

	// Ochish
        handler := DecompressGZIP(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            decompressedSize := r.ContentLength

	// Siqish koeffitsientini loglash
            if originalSize > 0 {
                ratio := float64(decompressedSize) / float64(originalSize)
                log.Printf("GZIP: %d → %d bytes (%.2fx)", originalSize, decompressedSize, ratio)

                metrics.RecordHistogram("http_gzip_compression_ratio", ratio, map[string]string{
                    "path": r.URL.Path,
                })
            }

            next.ServeHTTP(w, r)
        }))

        handler.ServeHTTP(w, r)
    })
}

// Xavfsizlik: Decompression bomb himoyasi
func SafeDecompression(maxSize int64) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            if r.Header.Get("Content-Encoding") != "gzip" {
                next.ServeHTTP(w, r)
                return
            }

            reader, err := gzip.NewReader(r.Body)
            if err != nil {
                http.Error(w, "invalid gzip", http.StatusBadRequest)
                return
            }
            defer reader.Close()

            limitedReader := io.LimitReader(reader, maxSize)
            payload, err := io.ReadAll(limitedReader)
            if err != nil {
                http.Error(w, "decompression failed", http.StatusBadRequest)
                return
            }

            if int64(len(payload)) == maxSize {
                http.Error(w, "decompressed size exceeds limit", http.StatusRequestEntityTooLarge)
                return
            }

            r.Body.Close()
            clone := r.WithContext(r.Context())
            clone.Body = io.NopCloser(bytes.NewReader(payload))
            clone.ContentLength = int64(len(payload))
            clone.Header.Del("Content-Encoding")

            next.ServeHTTP(w, clone)
        })
    }
}

// Ko'p practixsh qo'llab-quvvatlash (gzip, deflate, br)
func AutoDecompress(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        encoding := r.Header.Get("Content-Encoding")

        switch strings.ToLower(encoding) {
        case "gzip":
            DecompressGZIP(next).ServeHTTP(w, r)
        case "deflate":
            DecompressDeflate(next).ServeHTTP(w, r)
        case "br":
            DecompressBrotli(next).ServeHTTP(w, r)
        default:
            next.ServeHTTP(w, r)
        }
    })
}
\`\`\`

**Amaliy foydalari:**
- **API Performansi:** Katta payloadlarni tezroq yuklash
- **Xarajatlarni tejash:** Bandwidth xarajatlarini 60-90% ga kamaytirish
- **Mobil qulay:** Sekin ulanishlarda yaxshiroq performans
- **Shaffoflik:** Handlerlar oddiy ma'lumotlarni oladi

**GZIP eng yaxshi amaliyotlari:**
- **Encoding tekshirish:** Har doim Content-Encoding headerini tekshiring
- **Xatolarni ishlash:** Noto'g'ri gzip ma'lumotlari uchun 400 qaytaring
- **Xavfsizlik:** Decompression bomblardan himoya (hajm cheklash)
- **Content-Length:** Ochilgan hajmga yangilang
- **Headerni o'chirish:** Ochishdan keyin Content-Encoding ni o'chiring

**Siqish koeffitsientlari:**
- **JSON:** 60-80% kamaytirish
- **XML:** 70-85% kamaytirish
- **HTML:** 50-70% kamaytirish
- **Matn:** 50-75% kamaytirish
- **Binary:** 10-30% kamaytirish

**Siqish koeffitsientlari:**
- **JSON:** 60-80% kamaytirish
- **XML:** 70-85% kamaytirish
- **HTML:** 50-70% kamaytirish
- **Matn:** 50-75% kamaytirish
- **Binary:** 10-30% kamaytirish

**Xavfsizlik mulohazalari:**
- **Decompression Bombs:** Kichik siqilgan ma'lumotlar → ulkan ochilgan ma'lumotlar
- **Xotira tugashi:** Ochilgan hajmni cheklang
- **CPU DoS:** Ochish vaqtini cheklang
- **Tekshirish:** Gzip yaxlitligini tekshiring

**Umumiy foydalanish stsenariylari:**
- **API Performance:** Katta payloadlarni tezroq yuklash
- **Cost Savings:** Bandwidth xarajatlarini 60-90% ga kamaytirish
- **Mobile Friendly:** Sekin ulanishlarda yaxshiroq performans
- **Transparent:** Handlerlar oddiy ma'lumotlarni oladi

DecompressGZIP bo'lmasa, handlerlar encodingni qo'lda tekshirishi va ochishi kerak, bu kodning takrorlanishi va o'tkazilgan optimizatsiyalarga olib keladi.`,
			solutionCode: `package httpx

import (
	"bytes"
	"compress/gzip"
	"io"
	"net/http"
	"strings"
)

func DecompressGZIP(next http.Handler) http.Handler {
	if next == nil {	// nil next handlerni ishlash
		return http.HandlerFunc(func(http.ResponseWriter, *http.Request) {})
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.EqualFold(r.Header.Get("Content-Encoding"), "gzip") {	// gzip practixnganligini tekshirish (katta-kichik harflarni inobatga olmasdan)
			next.ServeHTTP(w, r)	// gzip emas, o'tkazish
			return
		}
		reader, err := gzip.NewReader(r.Body)	// gzip reader yaratish
		if err != nil {
			http.Error(w, "invalid gzip body", http.StatusBadRequest)	// Noto'g'ri gzip ni ishlash
			return
		}
		defer reader.Close()	// gzip readerni yopish

		payload, err := io.ReadAll(reader)	// Ochilgan ma'lumotlarni o'qish
		if err != nil {
			http.Error(w, "invalid gzip body", http.StatusBadRequest)	// O'qish xatolarini ishlash
			return
		}
		if err := r.Body.Close(); err != nil {	// Asl bodyni yopish
			http.Error(w, "invalid gzip body", http.StatusBadRequest)
			return
		}

		clone := r.WithContext(r.Context())	// Requestni klonlash (yuzaki)
		clone.Body = io.NopCloser(bytes.NewReader(payload))	// Bodyni ochilgan ma'lumotlar bilan almashtirish
		clone.ContentLength = int64(len(payload))	// Content-Length ni ochilgan hajmga yangilash
		if clone.Header != nil {	// Headerlar mavjudligini tekshirish
			clone.Header.Del("Content-Encoding")	// Content-Encoding headerini o'chirish
		}
		next.ServeHTTP(w, clone)	// O'zgartirilgan requestni o'tkazish
	})
}`
		}
	}
};

export default task;
