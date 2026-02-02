import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-mock-http-client',
	title: 'Mock HTTP Client',
	difficulty: 'hard',	tags: ['go', 'testing', 'http', 'mocking'],
	estimatedTime: '30m',	isPremium: false,
	youtubeUrl: '',
	description: `Mock HTTP client using **custom RoundTripper** to test HTTP-dependent code without network calls.

**Requirements:**
1. Create \`WeatherService\` that fetches weather from API
2. Implement custom \`RoundTripFunc\` type
3. Create mock that returns predefined HTTP responses
4. Test service without making real HTTP requests
5. Simulate different status codes and responses

**Example:**
\`\`\`go
type RoundTripFunc func(*http.Request) (*http.Response, error)

func (f RoundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
    return f(req)
}
\`\`\`

**Constraints:**
- Use http.Client with custom Transport
- Test 200 OK and error responses
- Verify request URL in mock`,
	initialCode: `package httptest_test

import (
	"io"
	"net/http"
	"strings"
	"testing"
)

type WeatherService struct {
	client *http.Client
	apiURL string
}

func NewWeatherService(client *http.Client, apiURL string) *WeatherService {
	return &WeatherService{client: client, apiURL: apiURL}
}

// TODO: Implement GetTemperature
func (s *WeatherService) GetTemperature(city string) (string, error) {
	// TODO: Implement
}

// TODO: Create RoundTripFunc type
type RoundTripFunc func(*http.Request) (*http.Response, error)

// TODO: Implement RoundTrip method
func (f RoundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	// TODO: Implement
}

// TODO: Write tests with mock HTTP client
func TestWeatherService_GetTemperature(t *testing.T) {
	// TODO: Implement
}`,
	solutionCode: `package httptest_test

import (
	"bytes"
	"errors"
	"io"
	"net/http"
	"strings"
	"testing"
)

type WeatherService struct {
	client *http.Client
	apiURL string
}

func NewWeatherService(client *http.Client, apiURL string) *WeatherService {
	if client == nil {
		client = http.DefaultClient
	}
	return &WeatherService{client: client, apiURL: apiURL}
}

func (s *WeatherService) GetTemperature(city string) (string, error) {
	url := s.apiURL + "?city=" + city
	resp, err := s.client.Get(url)  // Make HTTP request
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {  // Check status
		return "", errors.New("API error")
	}

	body, err := io.ReadAll(resp.Body)  // Read response
	if err != nil {
		return "", err
	}

	return string(body), nil
}

type RoundTripFunc func(*http.Request) (*http.Response, error)

func (f RoundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return f(req)  // Call the function
}

func TestWeatherService_GetTemperature(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		// Create mock HTTP client
		client := &http.Client{
			Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
				// Verify request URL
				if !strings.Contains(req.URL.String(), "city=London") {
					t.Errorf("unexpected URL: %s", req.URL)
				}

				// Return mock response
				return &http.Response{
					StatusCode: http.StatusOK,
					Body:       io.NopCloser(bytes.NewBufferString("25°C")),
					Header:     make(http.Header),
				}, nil
			}),
		}

		service := NewWeatherService(client, "http://api.weather.com")
		temp, err := service.GetTemperature("London")

		// Assert success
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if temp != "25°C" {
			t.Errorf("got %q, want %q", temp, "25°C")
		}
	})

	t.Run("API error", func(t *testing.T) {
		// Mock returns error status
		client := &http.Client{
			Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
				return &http.Response{
					StatusCode: http.StatusInternalServerError,
					Body:       io.NopCloser(bytes.NewBufferString("")),
					Header:     make(http.Header),
				}, nil
			}),
		}

		service := NewWeatherService(client, "http://api.weather.com")
		_, err := service.GetTemperature("Invalid")

		// Assert error
		if err == nil {
			t.Fatal("expected error, got nil")
		}
	})

	t.Run("network error", func(t *testing.T) {
		// Mock returns network error
		client := &http.Client{
			Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
				return nil, errors.New("network error")
			}),
		}

		service := NewWeatherService(client, "http://api.weather.com")
		_, err := service.GetTemperature("London")

		// Assert error
		if err == nil {
			t.Fatal("expected error, got nil")
		}
	})
}`,
			hint1: `http.Client accepts custom Transport. Implement http.RoundTripper interface to intercept requests.`,
			hint2: `Use io.NopCloser(bytes.NewBufferString(...)) to create response body.`,
			testCode: `package httptest_test

import (
	"bytes"
	"errors"
	"io"
	"net/http"
	"strings"
	"testing"
)

func Test1(t *testing.T) {
	client := &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(bytes.NewBufferString("20°C")),
				Header:     make(http.Header),
			}, nil
		}),
	}
	service := NewWeatherService(client, "http://test.com")
	temp, err := service.GetTemperature("Paris")
	if err != nil || temp != "20°C" {
		t.Errorf("expected '20°C', got %q, err=%v", temp, err)
	}
}

func Test2(t *testing.T) {
	client := &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: http.StatusNotFound,
				Body:       io.NopCloser(bytes.NewBufferString("")),
				Header:     make(http.Header),
			}, nil
		}),
	}
	service := NewWeatherService(client, "http://test.com")
	_, err := service.GetTemperature("Unknown")
	if err == nil {
		t.Error("expected error for 404")
	}
}

func Test3(t *testing.T) {
	client := &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
			return nil, errors.New("connection refused")
		}),
	}
	service := NewWeatherService(client, "http://test.com")
	_, err := service.GetTemperature("City")
	if err == nil {
		t.Error("expected network error")
	}
}

func Test4(t *testing.T) {
	var requestedURL string
	client := &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
			requestedURL = req.URL.String()
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(bytes.NewBufferString("15°C")),
				Header:     make(http.Header),
			}, nil
		}),
	}
	service := NewWeatherService(client, "http://api.test.com")
	service.GetTemperature("Berlin")
	if !strings.Contains(requestedURL, "city=Berlin") {
		t.Errorf("URL should contain 'city=Berlin', got %q", requestedURL)
	}
}

func Test5(t *testing.T) {
	client := &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(bytes.NewBufferString("")),
				Header:     make(http.Header),
			}, nil
		}),
	}
	service := NewWeatherService(client, "http://test.com")
	temp, err := service.GetTemperature("Empty")
	if err != nil || temp != "" {
		t.Errorf("expected empty string, got %q", temp)
	}
}

func Test6(t *testing.T) {
	client := &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: http.StatusInternalServerError,
				Body:       io.NopCloser(bytes.NewBufferString("Server Error")),
				Header:     make(http.Header),
			}, nil
		}),
	}
	service := NewWeatherService(client, "http://test.com")
	_, err := service.GetTemperature("City")
	if err == nil {
		t.Error("expected error for 500")
	}
}

func Test7(t *testing.T) {
	service := NewWeatherService(nil, "http://test.com")
	if service.client == nil {
		t.Error("expected default client to be set")
	}
}

func Test8(t *testing.T) {
	callCount := 0
	client := &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
			callCount++
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(bytes.NewBufferString("data")),
				Header:     make(http.Header),
			}, nil
		}),
	}
	service := NewWeatherService(client, "http://test.com")
	service.GetTemperature("A")
	service.GetTemperature("B")
	if callCount != 2 {
		t.Errorf("expected 2 calls, got %d", callCount)
	}
}

func Test9(t *testing.T) {
	client := &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(bytes.NewBufferString("-5°C")),
				Header:     make(http.Header),
			}, nil
		}),
	}
	service := NewWeatherService(client, "http://test.com")
	temp, _ := service.GetTemperature("Moscow")
	if temp != "-5°C" {
		t.Errorf("expected '-5°C', got %q", temp)
	}
}

func Test10(t *testing.T) {
	client := &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
			if req.Method != "GET" {
				t.Errorf("expected GET method, got %s", req.Method)
			}
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(bytes.NewBufferString("OK")),
				Header:     make(http.Header),
			}, nil
		}),
	}
	service := NewWeatherService(client, "http://test.com")
	service.GetTemperature("Test")
}
`,
			whyItMatters: `Mocking HTTP clients enables fast, reliable tests of HTTP-dependent code without network calls.

**Why Mock HTTP:**
- **Speed:** No network latency
- **Reliability:** No flaky tests from API downtime
- **Cost:** No API rate limits or charges
- **Control:** Test error scenarios easily`,
			order: 1,
	translations: {
		ru: {
			title: 'Создание мока HTTP клиента',
			description: `Мокируйте HTTP клиент используя **custom RoundTripper** для тестирования HTTP-зависимого кода без сетевых вызовов.

**Требования:**
1. Создайте \`WeatherService\`, который получает данные о погоде из API
2. Реализуйте пользовательский тип \`RoundTripFunc\`
3. Создайте мок, который возвращает предопределенные HTTP ответы
4. Протестируйте сервис без выполнения реальных HTTP запросов
5. Симулируйте различные коды статуса и ответы

**Пример:**
\`\`\`go
type RoundTripFunc func(*http.Request) (*http.Response, error)

func (f RoundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
    return f(req)
}
\`\`\`

**Ограничения:**
- Используйте http.Client с пользовательским Transport
- Тестируйте ответы 200 OK и ошибочные ответы
- Проверяйте URL запроса в моке`,
			hint1: `http.Client принимает custom Transport. Реализуйте интерфейс http.RoundTripper для перехвата запросов.`,
			hint2: `Используйте io.NopCloser(bytes.NewBufferString(...)) для создания тела ответа.`,
			whyItMatters: `Мокирование HTTP клиентов позволяет создавать быстрые и надежные тесты для HTTP-зависимого кода без сетевых вызовов.

**Почему нужно мокировать HTTP:**
- **Скорость:** Отсутствие задержек сети
- **Надежность:** Отсутствие нестабильных тестов из-за недоступности API
- **Стоимость:** Отсутствие ограничений API или платежей
- **Контроль:** Легкое тестирование сценариев с ошибками`,
			solutionCode: `package httptest_test

import (
	"bytes"
	"errors"
	"io"
	"net/http"
	"strings"
	"testing"
)

type WeatherService struct {
	client *http.Client
	apiURL string
}

func NewWeatherService(client *http.Client, apiURL string) *WeatherService {
	if client == nil {
		client = http.DefaultClient
	}
	return &WeatherService{client: client, apiURL: apiURL}
}

func (s *WeatherService) GetTemperature(city string) (string, error) {
	url := s.apiURL + "?city=" + city
	resp, err := s.client.Get(url)  // Выполнить HTTP запрос
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {  // Проверить статус
		return "", errors.New("API error")
	}

	body, err := io.ReadAll(resp.Body)  // Прочитать ответ
	if err != nil {
		return "", err
	}

	return string(body), nil
}

type RoundTripFunc func(*http.Request) (*http.Response, error)

func (f RoundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return f(req)  // Вызвать функцию
}

func TestWeatherService_GetTemperature(t *testing.T) {
	t.Run("успех", func(t *testing.T) {
		// Создать mock HTTP клиент
		client := &http.Client{
			Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
				// Проверить URL запроса
				if !strings.Contains(req.URL.String(), "city=London") {
					t.Errorf("неожиданный URL: %s", req.URL)
				}

				// Вернуть mock ответ
				return &http.Response{
					StatusCode: http.StatusOK,
					Body:       io.NopCloser(bytes.NewBufferString("25°C")),
					Header:     make(http.Header),
				}, nil
			}),
		}

		service := NewWeatherService(client, "http://api.weather.com")
		temp, err := service.GetTemperature("London")

		// Проверить успех
		if err != nil {
			t.Fatalf("неожиданная ошибка: %v", err)
		}
		if temp != "25°C" {
			t.Errorf("получено %q, ожидается %q", temp, "25°C")
		}
	})

	t.Run("ошибка API", func(t *testing.T) {
		// Mock возвращает статус ошибки
		client := &http.Client{
			Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
				return &http.Response{
					StatusCode: http.StatusInternalServerError,
					Body:       io.NopCloser(bytes.NewBufferString("")),
					Header:     make(http.Header),
				}, nil
			}),
		}

		service := NewWeatherService(client, "http://api.weather.com")
		_, err := service.GetTemperature("Invalid")

		// Проверить ошибку
		if err == nil {
			t.Fatal("ожидается ошибка, получено nil")
		}
	})

	t.Run("сетевая ошибка", func(t *testing.T) {
		// Mock возвращает сетевую ошибку
		client := &http.Client{
			Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
				return nil, errors.New("network error")
			}),
		}

		service := NewWeatherService(client, "http://api.weather.com")
		_, err := service.GetTemperature("London")

		// Проверить ошибку
		if err == nil {
			t.Fatal("ожидается ошибка, получено nil")
		}
	})
}`
		},
		uz: {
			title: `HTTP klient mockini yaratish`,
			description: `Tarmoq chaqiruvlarisiz HTTP ga bog'liq kodni test qilish uchun **custom RoundTripper** dan foydalanib HTTP clientni mock qiling.

**Talablar:**
1. API dan ob-havo ma'lumotlarini oladigan \`WeatherService\` yarating
2. Maxsus \`RoundTripFunc\` turini amalga oshiring
3. Oldindan belgilangan HTTP javoblarini qaytaradigan mock yarating
4. Haqiqiy HTTP so'rovlarsiz servisni test qiling
5. Turli status practixri va javoblarni simulyatsiya qiling

**Misol:**
\`\`\`go
type RoundTripFunc func(*http.Request) (*http.Response, error)

func (f RoundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
    return f(req)
}
\`\`\`

**Cheklovlar:**
- Maxsus Transport bilan http.Client dan foydalaning
- 200 OK va xato javoblarini test qiling
- Mockda so'rov URL ni tekshiring`,
			hint1: `http.Client maxsus Transport ni qabul qiladi. So'rovlarni to'xtatish uchun http.RoundTripper interfeysini amalga oshiring.`,
			hint2: `Javob tanasini yaratish uchun io.NopCloser(bytes.NewBufferString(...)) dan foydalaning.`,
			whyItMatters: `HTTP clientlarni mocking qilish tarmoq chaqiruvlarisiz HTTP ga bog'liq kod uchun tez va ishonchli testlar yaratish imkonini beradi.

**Nima uchun HTTP ni mock qilish kerak:**
- **Tezlik:** Tarmoq kechikishlari yo'q
- **Ishonchlilik:** API ishlamasligi tufayli beqaror testlar yo'q
- **Xarajat:** API cheklovi yoki to'lovlar yo'q
- **Nazorat:** Xato stsenariylarini oson test qilish`,
			solutionCode: `package httptest_test

import (
	"bytes"
	"errors"
	"io"
	"net/http"
	"strings"
	"testing"
)

type WeatherService struct {
	client *http.Client
	apiURL string
}

func NewWeatherService(client *http.Client, apiURL string) *WeatherService {
	if client == nil {
		client = http.DefaultClient
	}
	return &WeatherService{client: client, apiURL: apiURL}
}

func (s *WeatherService) GetTemperature(city string) (string, error) {
	url := s.apiURL + "?city=" + city
	resp, err := s.client.Get(url)  // HTTP so'rov bajarish
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {  // Statusni tekshirish
		return "", errors.New("API error")
	}

	body, err := io.ReadAll(resp.Body)  // Javobni o'qish
	if err != nil {
		return "", err
	}

	return string(body), nil
}

type RoundTripFunc func(*http.Request) (*http.Response, error)

func (f RoundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return f(req)  // Funksiyani chaqirish
}

func TestWeatherService_GetTemperature(t *testing.T) {
	t.Run("muvaffaqiyat", func(t *testing.T) {
		// Mock HTTP client yaratish
		client := &http.Client{
			Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
				// So'rov URL ni tekshirish
				if !strings.Contains(req.URL.String(), "city=London") {
					t.Errorf("kutilmagan URL: %s", req.URL)
				}

				// Mock javobini qaytarish
				return &http.Response{
					StatusCode: http.StatusOK,
					Body:       io.NopCloser(bytes.NewBufferString("25°C")),
					Header:     make(http.Header),
				}, nil
			}),
		}

		service := NewWeatherService(client, "http://api.weather.com")
		temp, err := service.GetTemperature("London")

		// Muvaffaqiyatni tekshirish
		if err != nil {
			t.Fatalf("kutilmagan xato: %v", err)
		}
		if temp != "25°C" {
			t.Errorf("olindi %q, kutilgan %q", temp, "25°C")
		}
	})

	t.Run("API xatosi", func(t *testing.T) {
		// Mock xato statusini qaytaradi
		client := &http.Client{
			Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
				return &http.Response{
					StatusCode: http.StatusInternalServerError,
					Body:       io.NopCloser(bytes.NewBufferString("")),
					Header:     make(http.Header),
				}, nil
			}),
		}

		service := NewWeatherService(client, "http://api.weather.com")
		_, err := service.GetTemperature("Invalid")

		// Xatoni tekshirish
		if err == nil {
			t.Fatal("xato kutilgan, nil olindi")
		}
	})

	t.Run("tarmoq xatosi", func(t *testing.T) {
		// Mock tarmoq xatosini qaytaradi
		client := &http.Client{
			Transport: RoundTripFunc(func(req *http.Request) (*http.Response, error) {
				return nil, errors.New("network error")
			}),
		}

		service := NewWeatherService(client, "http://api.weather.com")
		_, err := service.GetTemperature("London")

		// Xatoni tekshirish
		if err == nil {
			t.Fatal("xato kutilgan, nil olindi")
		}
	})
}`
		}
	}
};

export default task;
