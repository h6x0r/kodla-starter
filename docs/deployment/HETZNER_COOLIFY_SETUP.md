# Деплой Practix на Hetzner + Coolify

> Полная инструкция по настройке production-ready окружения

---

## Содержание

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Шаг 1: Создание сервера Hetzner](#шаг-1-создание-сервера-hetzner)
3. [Шаг 2: Установка Coolify](#шаг-2-установка-coolify)
4. [Шаг 3: Настройка домена](#шаг-3-настройка-домена)
5. [Шаг 4: Деплой Practix](#шаг-4-деплой-practix)
6. [Шаг 5: Настройка Judge0](#шаг-5-настройка-judge0)
7. [Шаг 6: Seed базы данных](#шаг-6-seed-базы-данных)
8. [Шаг 7: Мониторинг и бэкапы](#шаг-7-мониторинг-и-бэкапы)
9. [Troubleshooting](#troubleshooting)

---

## Обзор архитектуры

```
┌─────────────────────────────────────────────────────────────┐
│                    Hetzner CX32                             │
│                 4 vCPU, 8 GB RAM, 80 GB SSD                 │
├─────────────────────────────────────────────────────────────┤
│  Coolify (Self-hosted PaaS)                                 │
│  ├── Frontend (React/Vite)     → practix.uz                  │
│  ├── Backend (NestJS)          → api.practix.uz              │
│  ├── PostgreSQL 15             → Internal                   │
│  ├── Redis 7                   → Internal                   │
│  └── Judge0 (privileged)       → Internal                   │
├─────────────────────────────────────────────────────────────┤
│  Cloudflare (DNS + CDN + SSL)                               │
└─────────────────────────────────────────────────────────────┘
```

**Стоимость:** ~€8.35/мес ($9)

---

## Шаг 1: Создание сервера Hetzner

### 1.1 Регистрация

1. Перейти на [hetzner.com/cloud](https://www.hetzner.com/cloud)
2. Создать аккаунт
3. Добавить способ оплаты

### 1.2 Создание сервера через UI

1. **Console** → **Servers** → **Add Server**

2. **Location:** Выбрать ближайший к пользователям
   - `Falkenstein (fsn1)` — Германия, хорошо для СНГ
   - `Helsinki (hel1)` — Финляндия, ещё ближе к России
   - `Ashburn (ash)` — США

3. **Image:** Ubuntu 24.04

4. **Type:** CX32 (€8.35/мес)
   - 4 vCPU (shared)
   - 8 GB RAM
   - 80 GB SSD
   - 20 TB traffic

5. **Networking:**
   - [x] Public IPv4
   - [x] Public IPv6

6. **SSH Keys:** Добавить свой SSH ключ
   ```bash
   # Если нет ключа, создать:
   ssh-keygen -t ed25519 -C "your@email.com"
   cat ~/.ssh/id_ed25519.pub
   # Скопировать и вставить в Hetzner
   ```

7. **Name:** `practix-prod`

8. **Create & Buy Now**

### 1.3 Альтернатива: Создание через CLI

```bash
# Установить hcloud CLI
brew install hcloud

# Авторизоваться
hcloud context create practix
# Ввести API token из Hetzner Console → Security → API Tokens

# Создать сервер
hcloud server create \
  --name practix-prod \
  --type cx32 \
  --image ubuntu-24.04 \
  --location fsn1 \
  --ssh-key your-key-name
```

### 1.4 Подключение к серверу

```bash
# Получить IP из консоли Hetzner или:
hcloud server ip practix-prod

# Подключиться
ssh root@YOUR_SERVER_IP
```

---

## Шаг 2: Установка Coolify

### 2.1 Требования (автоматически на Ubuntu 24.04)

- Docker
- Docker Compose
- curl

### 2.2 Установка Coolify (одна команда)

```bash
# SSH на сервер
ssh root@YOUR_SERVER_IP

# Установить Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Установка займёт 2-5 минут. В конце увидите:

```
Coolify installed successfully!
Access your Coolify instance at: http://YOUR_IP:8000
```

### 2.3 Первичная настройка Coolify

1. Открыть `http://YOUR_SERVER_IP:8000` в браузере

2. Создать админ-аккаунт:
   - Email: your@email.com
   - Password: (сохранить в менеджере паролей!)

3. **Settings** → **Configuration**:
   - Instance URL: `http://YOUR_SERVER_IP:8000` (позже заменим на домен)
   - Instance Name: `Practix Production`

4. **Sources** → **Add Source** → **GitHub**:
   - Авторизовать GitHub App
   - Выбрать репозиторий `practix-starter`

---

## Шаг 3: Настройка домена

### 3.1 DNS записи (Cloudflare рекомендуется)

Добавить в DNS:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | YOUR_SERVER_IP | ✅ Proxied |
| A | `api` | YOUR_SERVER_IP | ✅ Proxied |
| A | `coolify` | YOUR_SERVER_IP | ❌ DNS only |

### 3.2 Настройка Cloudflare (рекомендуется)

1. Добавить сайт в Cloudflare
2. **SSL/TLS** → **Full (strict)**
3. **Speed** → **Optimization**:
   - [x] Auto Minify (JS, CSS, HTML)
   - [x] Brotli
4. **Caching** → **Configuration**:
   - Browser Cache TTL: 1 month

### 3.3 Обновить Coolify URL

1. **Settings** → **Configuration**
2. Instance URL: `https://coolify.practix.uz`
3. Save

---

## Шаг 4: Деплой Practix

### 4.1 Создание проекта

1. **Projects** → **Add Project**
   - Name: `Practix`
   - Description: `Learning platform`

2. **Add Resource** → **Production Environment**

### 4.2 Деплой PostgreSQL

1. **Add Resource** → **Database** → **PostgreSQL**

2. Настройки:
   - Name: `practix-db`
   - Version: `15`
   - Default Database: `practix`
   - Username: `practix`
   - Password: (сгенерировать и сохранить!)

3. **Deploy**

4. Скопировать **Internal URL**:
   ```
   postgresql://practix:PASSWORD@practix-db:5432/practix
   ```

### 4.3 Деплой Redis

1. **Add Resource** → **Database** → **Redis**

2. Настройки:
   - Name: `practix-redis`
   - Version: `7`
   - Password: (сгенерировать и сохранить!)

3. **Deploy**

4. Скопировать **Internal URL**:
   ```
   redis://:PASSWORD@practix-redis:6379
   ```

### 4.4 Деплой Backend

1. **Add Resource** → **Application** → **GitHub**

2. Выбрать репозиторий `practix-starter`

3. **Build Configuration**:
   - Build Pack: `Dockerfile`
   - Base Directory: `/server`
   - Dockerfile: `Dockerfile` (создадим ниже)

4. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=8080

   # Database (из шага 4.2)
   DATABASE_URL=postgresql://practix:PASSWORD@practix-db:5432/practix

   # Redis (из шага 4.3)
   REDIS_URL=redis://:PASSWORD@practix-redis:6379

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_EXPIRES_IN=7d

   # AI (Gemini)
   GEMINI_API_KEY=your-gemini-api-key

   # Judge0 (internal)
   JUDGE0_URL=http://practix-judge0:2358

   # Frontend URL (для CORS)
   FRONTEND_URL=https://practix.uz
   ```

5. **Network**:
   - Port: `8080`
   - Domain: `api.practix.uz`

6. **Health Check**:
   - Path: `/health`
   - Interval: `30`

7. **Deploy**

### 4.5 Деплой Frontend

1. **Add Resource** → **Application** → **GitHub**

2. Выбрать репозиторий `practix-starter`

3. **Build Configuration**:
   - Build Pack: `Dockerfile`
   - Base Directory: `/`
   - Dockerfile: `Dockerfile` (создадим ниже)

4. **Environment Variables** (build-time):
   ```env
   VITE_API_URL=https://api.practix.uz
   VITE_APP_ENV=production
   ```

5. **Network**:
   - Port: `80`
   - Domain: `practix.uz`

6. **Deploy**

---

## Шаг 5: Настройка Judge0

### 5.1 Создание Judge0 сервиса

1. **Add Resource** → **Docker Compose**

2. **Name:** `practix-judge0`

3. **Docker Compose:**
   ```yaml
   services:
     judge0:
       image: ghcr.io/engineer-man/judge0:latest
       container_name: practix-judge0
       restart: unless-stopped
       privileged: true
       ports:
         - "2358:2358"
       volumes:
         - judge0-packages:/judge0/packages
       environment:
         - JUDGE0_RUN_TIMEOUT=10000
         - JUDGE0_COMPILE_TIMEOUT=15000
         - JUDGE0_OUTPUT_MAX_SIZE=65536

   volumes:
     judge0-packages:
   ```

4. **Deploy**

### 5.2 Установка языков в Judge0

```bash
# SSH на сервер
ssh root@YOUR_SERVER_IP

# Найти контейнер Judge0
docker ps | grep judge0

# Установить языки
docker exec -it practix-judge0 judge0 ppman install python
docker exec -it practix-judge0 judge0 ppman install node
docker exec -it practix-judge0 judge0 ppman install typescript
docker exec -it practix-judge0 judge0 ppman install go
docker exec -it practix-judge0 judge0 ppman install java
docker exec -it practix-judge0 judge0 ppman install gcc      # C
docker exec -it practix-judge0 judge0 ppman install g++      # C++
docker exec -it practix-judge0 judge0 ppman install rust

# Проверить установленные языки
docker exec -it practix-judge0 judge0 ppman list
```

### 5.3 Проверка Judge0

```bash
# Тест выполнения кода
curl -X POST http://localhost:2358/api/v2/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "version": "3.10",
    "files": [{"content": "print(\"Hello from Judge0!\")"}]
  }'

# Ожидаемый ответ:
# {"run":{"stdout":"Hello from Judge0!\n","stderr":"","code":0,"signal":null,"output":"Hello from Judge0!\n"}}
```

---

## Шаг 6: Seed базы данных

### 6.1 Через Coolify Terminal

1. Открыть Backend сервис в Coolify
2. **Terminal** вкладка
3. Выполнить:
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

### 6.2 Через SSH

```bash
# SSH на сервер
ssh root@YOUR_SERVER_IP

# Найти контейнер backend
docker ps | grep backend

# Выполнить seed
docker exec -it CONTAINER_ID npm run seed
```

### 6.3 Автоматический seed при деплое

Добавить в `server/Dockerfile`:

```dockerfile
# ... existing build steps ...

# Startup script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
```

Создать `server/docker-entrypoint.sh`:

```bash
#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "Running database seed..."
  npm run seed
fi

echo "Starting application..."
exec "$@"
```

---

## Шаг 7: Мониторинг и бэкапы

### 7.1 Health Checks в Coolify

Backend уже настроен с `/health` endpoint. Coolify автоматически:
- Проверяет health каждые 30 секунд
- Перезапускает при failures
- Показывает статус в UI

### 7.2 Логи

- **Coolify UI**: Каждый сервис → Logs
- **SSH**: `docker logs -f CONTAINER_NAME`

### 7.3 Автоматические бэкапы PostgreSQL

1. **Coolify** → **practix-db** → **Backups**
2. **Enable Scheduled Backups**
3. **Schedule**: `0 3 * * *` (каждый день в 3:00)
4. **Retention**: 7 дней

### 7.4 Внешние бэкапы (рекомендуется)

Добавить в cron на сервере:

```bash
# /etc/cron.d/practix-backup
0 4 * * * root docker exec practix-db pg_dump -U practix practix | gzip > /backups/practix-$(date +\%Y\%m\%d).sql.gz
0 5 * * * root find /backups -name "*.sql.gz" -mtime +7 -delete
```

### 7.5 Мониторинг (опционально)

**Вариант A: Uptime Kuma (self-hosted)**

```bash
# Добавить в Coolify как Docker Compose
services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    volumes:
      - uptime-kuma-data:/app/data
    ports:
      - "3001:3001"
```

**Вариант B: Внешние сервисы**
- [BetterUptime](https://betteruptime.com/) — free tier
- [UptimeRobot](https://uptimerobot.com/) — free tier

---

## Dockerfiles

### server/Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001
USER nestjs

EXPOSE 8080

CMD ["node", "dist/main.js"]
```

### Dockerfile (в корне проекта)

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build arguments for Vite
ARG VITE_API_URL
ARG VITE_APP_ENV=production

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_ENV=$VITE_APP_ENV

# Build
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf (в корне проекта)

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

---

## Troubleshooting

### Проблема: Coolify не доступен

```bash
# Проверить статус
ssh root@YOUR_IP
docker ps | grep coolify

# Перезапустить
cd /data/coolify
docker compose up -d
```

### Проблема: Judge0 не выполняет код

```bash
# Проверить логи
docker logs practix-judge0

# Проверить privileged mode
docker inspect practix-judge0 | grep Privileged
# Должно быть: "Privileged": true

# Проверить установленные языки
docker exec practix-judge0 judge0 ppman list
```

### Проблема: Database connection refused

```bash
# Проверить что PostgreSQL запущен
docker ps | grep practix-db

# Проверить сеть
docker network ls
docker network inspect coolify

# Убедиться что backend в той же сети
```

### Проблема: CORS ошибки

Проверить environment variables:
- Backend: `FRONTEND_URL=https://practix.uz`
- Frontend: `VITE_API_URL=https://api.practix.uz`

### Проблема: SSL не работает

1. Проверить DNS записи (должны указывать на сервер)
2. Cloudflare → SSL → Full (strict)
3. Coolify автоматически получает сертификаты через Let's Encrypt

---

## Чеклист деплоя

- [ ] Сервер Hetzner создан
- [ ] Coolify установлен
- [ ] DNS настроен (Cloudflare)
- [ ] PostgreSQL задеплоен
- [ ] Redis задеплоен
- [ ] Judge0 задеплоен + языки установлены
- [ ] Backend задеплоен + env vars настроены
- [ ] Frontend задеплоен
- [ ] Database migrations выполнены
- [ ] Seed выполнен
- [ ] Health checks работают
- [ ] Бэкапы настроены
- [ ] SSL работает

---

## Полезные команды

```bash
# SSH на сервер
ssh root@YOUR_SERVER_IP

# Все контейнеры
docker ps

# Логи сервиса
docker logs -f CONTAINER_NAME

# Зайти в контейнер
docker exec -it CONTAINER_NAME sh

# Перезапустить контейнер
docker restart CONTAINER_NAME

# Disk usage
df -h
docker system df

# Очистка Docker
docker system prune -a
```

---

## Контакты и поддержка

- **Hetzner Support**: https://console.hetzner.cloud/support
- **Coolify Discord**: https://discord.gg/coolify
- **Coolify Docs**: https://coolify.io/docs

---

*Документ создан: 2026-01-23*
