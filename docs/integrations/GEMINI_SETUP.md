# Google Gemini 2.0 Flash: Полное руководство по настройке

> Обновлено: 2026-01-17

---

## Содержание

1. [Обзор Gemini API](#обзор-gemini-api)
2. [Получение API ключа](#получение-api-ключа)
3. [Тарифы и лимиты](#тарифы-и-лимиты)
4. [Интеграция в Practix](#интеграция-в-practix)
5. [Мониторинг использования](#мониторинг-использования)
6. [Troubleshooting](#troubleshooting)

---

## Обзор Gemini API

**Gemini** — семейство мультимодальных AI моделей от Google DeepMind.

### Модели Gemini (2026)

| Модель | Контекст | Скорость | Цена (input) | Цена (output) | Назначение |
|--------|----------|----------|--------------|---------------|------------|
| **Gemini 2.0 Flash** | 1M tokens | Быстрая | $0.075/1M | $0.30/1M | Production, высокая нагрузка |
| Gemini 2.0 Pro | 2M tokens | Средняя | $1.25/1M | $5.00/1M | Сложные задачи |
| Gemini 1.5 Flash | 1M tokens | Быстрая | $0.075/1M | $0.30/1M | Legacy |
| Gemini 1.5 Pro | 2M tokens | Средняя | $1.25/1M | $5.00/1M | Legacy |

### Почему Gemini 2.0 Flash для Practix

- **Низкая стоимость** — $0.075/1M input tokens (в 16 раз дешевле GPT-4)
- **Высокая скорость** — отклик < 1 сек для типичных запросов
- **Большой контекст** — 1M tokens (задача + код + история чата)
- **Мультимодальность** — понимает код, текст, изображения
- **Free tier** — 15 RPM бесплатно для разработки

---

## Получение API ключа

### Шаг 1: Создание Google Cloud аккаунта

1. Перейдите на [console.cloud.google.com](https://console.cloud.google.com/)
2. Войдите с Google аккаунтом или создайте новый
3. Примите условия использования

### Шаг 2: Создание проекта

1. В верхней панели нажмите **Select a project** → **New Project**
2. Введите название проекта: `practix-production`
3. Выберите организацию (опционально)
4. Нажмите **Create**

```
┌─────────────────────────────────────┐
│ New Project                         │
├─────────────────────────────────────┤
│ Project name: practix-production      │
│ Project ID: practix-production-xxxxx  │
│ Location: No organization           │
│                                     │
│ [Create]                            │
└─────────────────────────────────────┘
```

### Шаг 3: Включение Gemini API

**Вариант A: Через Google AI Studio (Рекомендуется)**

1. Перейдите на [aistudio.google.com](https://aistudio.google.com/)
2. Войдите с тем же Google аккаунтом
3. Нажмите **Get API key** в левом меню
4. Нажмите **Create API key**
5. Выберите проект `practix-production`
6. Скопируйте ключ (начинается с `AIza...`)

**Вариант B: Через Google Cloud Console**

1. Перейдите в [console.cloud.google.com](https://console.cloud.google.com/)
2. Выберите проект `practix-production`
3. Перейдите в **APIs & Services** → **Library**
4. Найдите **Generative Language API**
5. Нажмите **Enable**
6. Перейдите в **APIs & Services** → **Credentials**
7. Нажмите **Create Credentials** → **API Key**
8. Скопируйте ключ

### Шаг 4: Настройка ограничений ключа (Production)

Для production окружения **обязательно** ограничьте ключ:

1. В разделе Credentials нажмите на созданный ключ
2. В секции **API restrictions**:
   - Выберите **Restrict key**
   - Отметьте только **Generative Language API**
3. В секции **Application restrictions** (опционально):
   - **IP addresses** — укажите IP вашего сервера
   - Или **HTTP referrers** — укажите домен
4. Нажмите **Save**

```
┌─────────────────────────────────────────────────┐
│ API Key Settings                                │
├─────────────────────────────────────────────────┤
│ Name: practix-production-key                      │
│                                                 │
│ Application restrictions:                       │
│ ○ None                                          │
│ ● IP addresses                                  │
│   [185.xxx.xxx.xxx]  (your server IP)          │
│                                                 │
│ API restrictions:                               │
│ ○ Don't restrict key                            │
│ ● Restrict key                                  │
│   ☑ Generative Language API                    │
│                                                 │
│ [Save]                                          │
└─────────────────────────────────────────────────┘
```

### Шаг 5: Настройка биллинга

Для production нагрузки нужен платный план:

1. Перейдите в **Billing** в Google Cloud Console
2. Нажмите **Link a billing account**
3. Создайте новый billing account или выберите существующий
4. Добавьте способ оплаты (карта)
5. Установите бюджетные алерты:
   - **Budgets & alerts** → **Create budget**
   - Установите лимит (например, $50/месяц)
   - Настройте email уведомления на 50%, 80%, 100%

---

## Тарифы и лимиты

### Free Tier (AI Studio)

| Лимит | Значение |
|-------|----------|
| Requests per minute (RPM) | 15 |
| Tokens per minute (TPM) | 1,000,000 |
| Requests per day (RPD) | 1,500 |
| Цена | Бесплатно |

**Подходит для:** Разработка, тестирование, малая нагрузка

### Pay-as-you-go (Cloud)

| Модель | Input | Output | Контекст |
|--------|-------|--------|----------|
| Gemini 2.0 Flash | $0.075/1M | $0.30/1M | < 128K |
| Gemini 2.0 Flash | $0.15/1M | $0.60/1M | > 128K |
| Gemini 2.0 Pro | $1.25/1M | $5.00/1M | < 128K |
| Gemini 2.0 Pro | $2.50/1M | $10.00/1M | > 128K |

### Rate Limits (Pay-as-you-go)

| Tier | RPM | TPM | RPD |
|------|-----|-----|-----|
| Free | 15 | 1M | 1,500 |
| Tier 1 ($0+) | 1,000 | 4M | Unlimited |
| Tier 2 ($250+) | 2,000 | 4M | Unlimited |

### Расчёт для Practix

**Предположения:**
- 1000 активных пользователей/день
- 10 AI запросов на пользователя в среднем
- ~500 tokens на запрос (input + output)

**Расчёт:**
```
Daily requests: 1000 × 10 = 10,000 запросов
Daily tokens: 10,000 × 500 = 5,000,000 tokens
Monthly tokens: 5M × 30 = 150,000,000 tokens

Input cost: 100M × $0.075/1M = $7.50
Output cost: 50M × $0.30/1M = $15.00
Monthly total: ~$22.50
```

**Вывод:** Gemini 2.0 Flash очень экономичен даже при большой нагрузке.

---

## Интеграция в Practix

### Конфигурация

#### 1. Environment переменные

```bash
# .env (development)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# docker-compose.yml (production)
environment:
  GEMINI_API_KEY: ${GEMINI_API_KEY}
```

#### 2. Файлы конфигурации

**`server/src/ai/ai.config.ts`**
```typescript
// Модель можно изменить без перезапуска
export const DEFAULT_AI_MODEL = 'gemini-2.0-flash';

// Лимиты по подпискам
export const AI_DAILY_LIMITS = {
  FREE: 5,
  COURSE_SUBSCRIPTION: 30,
  GLOBAL_PREMIUM: 100,
  PROMPT_ENGINEERING: 100,
};
```

### Использование в коде

**AI Tutor Service (`ai.service.ts`):**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const result = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  generationConfig: {
    maxOutputTokens: 500,
    temperature: 0.7,
  },
});
```

**Roadmap Generation (`roadmaps.service.ts`):**
```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: {
    responseMimeType: 'application/json',
  }
});
```

### Проверка работы

```bash
# Проверить что ключ настроен
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts":[{"text": "Hello, say hi in one word"}]}]
  }'

# Ожидаемый ответ
{
  "candidates": [{
    "content": {
      "parts": [{"text": "Hi!"}],
      "role": "model"
    }
  }]
}
```

---

## Мониторинг использования

### Google Cloud Console

1. Перейдите в **APIs & Services** → **Generative Language API**
2. Вкладка **Metrics** показывает:
   - Requests/sec
   - Errors
   - Latency (p50, p95, p99)
   - Quota usage

### Настройка алертов

1. **Cloud Monitoring** → **Alerting** → **Create Policy**
2. Выберите метрику: `serviceruntime.googleapis.com/api/request_count`
3. Условие: > 10,000 запросов за 5 минут
4. Уведомление: Email, Slack, PagerDuty

### Practix Admin Dashboard

В админ панели (`/admin`) есть секция **AI Usage**:
- Daily usage by user tier
- Average requests per user
- Error rates
- Response times

---

## Troubleshooting

### Ошибка: `API key not valid`

```
Error: API key not valid. Please pass a valid API key.
```

**Причины:**
1. Ключ скопирован неправильно (пробелы, переносы)
2. Ключ отозван или удалён
3. API не включён для проекта

**Решение:**
```bash
# Проверить ключ
echo $GEMINI_API_KEY | cat -A  # Не должно быть ^M или пробелов

# Создать новый ключ через AI Studio
```

### Ошибка: `Quota exceeded`

```
Error: Resource has been exhausted (e.g. check quota).
```

**Причины:**
1. Превышен лимит RPM/TPM/RPD
2. Бесплатный tier исчерпан

**Решение:**
1. Подождите 1 минуту (RPM reset)
2. Включите биллинг для Pay-as-you-go
3. Запросите увеличение квоты

### Ошибка: `Model not found`

```
Error: models/gemini-2.0-flash is not found
```

**Причины:**
1. Модель ещё не доступна в вашем регионе
2. Опечатка в названии модели

**Решение:**
```typescript
// Проверить доступные модели
const models = await genAI.listModels();
console.log(models);

// Использовать fallback
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash'  // Fallback
});
```

### Ошибка: `Safety settings blocked`

```
Error: Response was blocked due to SAFETY
```

**Причины:**
- Контент заблокирован safety фильтрами

**Решение:**
```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_ONLY_HIGH',
    },
  ],
});
```

### Высокая латентность

**Симптомы:** Ответы > 3 секунд

**Причины:**
1. Большой промпт (много tokens)
2. Высокий `maxOutputTokens`
3. Сетевая задержка

**Решение:**
```typescript
// Оптимизировать конфиг
generationConfig: {
  maxOutputTokens: 256,  // Уменьшить
  temperature: 0.7,
  topP: 0.9,
}

// Использовать streaming для UX
const result = await model.generateContentStream(prompt);
for await (const chunk of result.stream) {
  console.log(chunk.text());
}
```

---

## Полезные ссылки

| Ресурс | URL |
|--------|-----|
| AI Studio | [aistudio.google.com](https://aistudio.google.com/) |
| Cloud Console | [console.cloud.google.com](https://console.cloud.google.com/) |
| API Документация | [ai.google.dev/docs](https://ai.google.dev/docs) |
| Pricing | [ai.google.dev/pricing](https://ai.google.dev/pricing) |
| SDK (npm) | [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) |
| Status Page | [status.cloud.google.com](https://status.cloud.google.com/) |

---

## Чеклист для Production

- [ ] API ключ создан через Google Cloud (не AI Studio для prod)
- [ ] Ключ ограничен по IP и API
- [ ] Биллинг настроен и привязана карта
- [ ] Бюджетные алерты настроены ($50, $100)
- [ ] Rate limiting на уровне приложения (Practix уже делает)
- [ ] Мониторинг в Cloud Console настроен
- [ ] Fallback модель определена (gemini-1.5-flash)
- [ ] Error handling и retry logic реализованы

---

*Документ обновлён: 2026-01-17*
