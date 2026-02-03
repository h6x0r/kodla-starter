# Деплой Practix на Contabo + Coolify

> Полная инструкция по настройке production-ready окружения на Contabo VPS

---

## Содержание

1. [Почему Contabo](#почему-contabo)
2. [Шаг 1: Создание VPS](#шаг-1-создание-vps)
3. [Шаг 2: Первичная настройка сервера](#шаг-2-первичная-настройка-сервера)
4. [Шаг 3: Установка Coolify](#шаг-3-установка-coolify)
5. [Шаг 4: Настройка домена](#шаг-4-настройка-домена)
6. [Шаг 5: Деплой Practix](#шаг-5-деплой-practix)
7. [Шаг 6: Настройка Judge0](#шаг-6-настройка-judge0)
8. [Шаг 7: Seed базы данных](#шаг-7-seed-базы-данных)
9. [Шаг 8: Мониторинг и бэкапы](#шаг-8-мониторинг-и-бэкапы)
10. [Оптимизация Contabo](#оптимизация-contabo)
11. [Troubleshooting](#troubleshooting)

---

## Почему Contabo

### Преимущества

| Критерий | Contabo | Hetzner | DigitalOcean |
|----------|---------|---------|--------------|
| **8GB RAM** | €5.99 | €8.35 | $48 |
| **Верификация** | ✅ Только карта | ❌ Паспорт | ✅ Только карта |
| **Privileged Docker** | ✅ Да | ✅ Да | ✅ Да |
| **Traffic** | 32 TB | 20 TB | 4 TB |

### Недостатки (и как с ними жить)

| Проблема | Решение |
|----------|---------|
| Oversubscribed CPU | Выбрать план с запасом |
| Медленная поддержка | Self-service, документация |
| Нет API/CLI | Ручное создание через UI |
| Сеть иногда нестабильна | Cloudflare как прокси |

### Рекомендуемые планы для Practix

| План | vCPU | RAM | SSD | Цена | Для кого |
|------|------|-----|-----|------|----------|
| **VPS S** | 4 | 8 GB | 50 GB | €5.99 | MVP, до 500 users |
| **VPS M** | 6 | 16 GB | 100 GB | €9.99 | Production, до 2358 users |
| **VPS L** | 8 | 30 GB | 200 GB | €14.99 | Scale, 2358+ users |

---

## Шаг 1: Создание VPS

### 1.1 Регистрация

1. Перейти на [contabo.com](https://contabo.com/en/vps/)
2. **Sign Up** → Создать аккаунт
3. Подтвердить email

### 1.2 Заказ VPS

1. **Products** → **VPS** → выбрать план (рекомендую **VPS S** или **VPS M**)

2. **Configure:**

   **Region:**
   - `European Union (Germany)` — лучше для СНГ
   - `United States (Central)` — если пользователи в США
   - `United States (East)`
   - `Singapore` — для Азии

   **Storage Type:**
   - `NVMe` — быстрее (рекомендую)
   - `SSD` — дешевле

   **Image:**
   - `Ubuntu 24.04` (рекомендую)
   - или `Ubuntu 22.04`

   **Networking:**
   - [x] 1 IPv4 Address (включено)
   - [ ] Additional IPv4 ($3/мес) — не нужно
   - [x] IPv6 /64 (включено)

   **Login Credentials:**
   - `Password` — установить надёжный пароль
   - или `SSH Key` — вставить публичный ключ (рекомендую)

   ```bash
   # Если нет SSH ключа:
   ssh-keygen -t ed25519 -C "your@email.com"
   cat ~/.ssh/id_ed25519.pub
   # Скопировать и вставить
   ```

   **Add-ons:**
   - [ ] Backup — можно включить позже
   - [ ] Monitoring — не нужно, используем своё

3. **Checkout:**
   - Выбрать период оплаты (месяц/год)
   - Оплатить картой

4. **Ожидание:**
   - Создание VPS: 5-15 минут
   - Email с данными для входа

### 1.3 Получение доступа

После создания придёт email с:
- IP адрес сервера
- Root пароль (если не указали SSH key)

```bash
# Подключение
ssh root@YOUR_SERVER_IP

# Если спрашивает пароль — ввести из email
```

---

## Шаг 2: Первичная настройка сервера

### 2.1 Обновление системы

```bash
# SSH на сервер
ssh root@YOUR_SERVER_IP

# Обновить пакеты
apt update && apt upgrade -y

# Установить базовые утилиты
apt install -y curl wget git htop nano ufw
```

### 2.2 Настройка Firewall

```bash
# Базовые правила
ufw default deny incoming
ufw default allow outgoing

# SSH
ufw allow 22/tcp

# HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Coolify UI (временно, потом закроем)
ufw allow 8000/tcp

# Включить firewall
ufw enable

# Проверить
ufw status
```

### 2.3 Создание пользователя (опционально, но рекомендуется)

```bash
# Создать пользователя
adduser practix

# Добавить в sudo
usermod -aG sudo practix

# Скопировать SSH ключи
mkdir -p /home/practix/.ssh
cp ~/.ssh/authorized_keys /home/practix/.ssh/
chown -R practix:practix /home/practix/.ssh
chmod 700 /home/practix/.ssh
chmod 600 /home/practix/.ssh/authorized_keys

# Проверить вход
# В новом терминале: ssh practix@YOUR_SERVER_IP
```

### 2.4 Настройка SSH (безопасность)

```bash
# Редактировать конфиг
nano /etc/ssh/sshd_config

# Изменить:
PermitRootLogin no          # Запретить root login (после создания пользователя)
PasswordAuthentication no   # Только SSH ключи
PubkeyAuthentication yes

# Перезапустить SSH
systemctl restart sshd
```

### 2.5 Настройка Swap (важно для Contabo!)

Contabo может иметь агрессивный overcommit, swap поможет:

```bash
# Проверить текущий swap
free -h

# Создать swap 4GB
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Сделать постоянным
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Настроить swappiness (меньше = реже использует swap)
echo 'vm.swappiness=10' >> /etc/sysctl.conf
sysctl -p

# Проверить
free -h
```

---

## Шаг 3: Установка Coolify

### 3.1 Установка Docker (если не установлен)

```bash
# Проверить
docker --version

# Если не установлен:
curl -fsSL https://get.docker.com | sh

# Добавить пользователя в docker группу
usermod -aG docker $USER
```

### 3.2 Установка Coolify

```bash
# Одна команда
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Установка займёт 3-5 минут. В конце:

```
Congratulations! Coolify is installed! 🎉
Please visit http://YOUR_IP:8000 to get started.
```

### 3.3 Первичная настройка Coolify

1. Открыть `http://YOUR_SERVER_IP:8000`

2. Создать админ-аккаунт:
   - Name: Admin
   - Email: your@email.com
   - Password: (сохранить!)

3. **Settings** → **Configuration**:
   - Instance URL: `http://YOUR_SERVER_IP:8000`
   - Instance Name: `Practix Production`

4. **Sources** → **Add Source** → **GitHub**:
   - Нажать "Register GitHub App"
   - Авторизовать приложение
   - Выбрать репозитории для доступа

---

## Шаг 4: Настройка домена

### 4.1 DNS записи

Добавить в DNS провайдере (Cloudflare рекомендуется):

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | YOUR_SERVER_IP | ✅ Proxied |
| A | `api` | YOUR_SERVER_IP | ✅ Proxied |
| A | `coolify` | YOUR_SERVER_IP | ❌ DNS only |

### 4.2 Cloudflare настройки (рекомендуется)

Cloudflare поможет с нестабильной сетью Contabo:

1. **SSL/TLS** → `Full (strict)`

2. **Speed** → **Optimization**:
   - [x] Auto Minify
   - [x] Brotli
   - [x] Early Hints

3. **Caching**:
   - Browser Cache TTL: `1 month`
   - Cache Level: `Standard`

4. **Security**:
   - Security Level: `Medium`
   - Bot Fight Mode: `On`

5. **Network**:
   - [x] WebSockets (для real-time features)

### 4.3 Обновить Coolify

1. **Settings** → **Configuration**
2. Instance URL: `https://coolify.yourdomain.com`
3. Save и перезайти по новому URL

### 4.4 Закрыть порт 8000

После настройки домена:

```bash
ufw delete allow 8000/tcp
```

---

## Шаг 5: Деплой Practix

### 5.1 Создание проекта

1. **Projects** → **Add Project**
   - Name: `Practix`

2. Создать **Production** environment

### 5.2 PostgreSQL

1. **Add Resource** → **Database** → **PostgreSQL**

2. Настройки:
   ```
   Name: practix-postgres
   Version: 15
   Database: practix
   Username: practix
   Password: [Generate & Save!]
   ```

3. **Advanced**:
   - Shared Memory: `256MB` (для Contabo важно)

4. **Deploy**

5. Сохранить Internal URL:
   ```
   postgresql://practix:PASSWORD@practix-postgres:5432/practix
   ```

### 5.3 Redis

1. **Add Resource** → **Database** → **Redis**

2. Настройки:
   ```
   Name: practix-redis
   Version: 7-alpine
   Password: [Generate & Save!]
   ```

3. **Advanced**:
   - Max Memory: `512mb`
   - Max Memory Policy: `allkeys-lru`

4. **Deploy**

5. Сохранить Internal URL:
   ```
   redis://:PASSWORD@practix-redis:6379
   ```

### 5.4 Backend (NestJS)

1. **Add Resource** → **Application** → **GitHub**

2. Выбрать `practix-starter` репозиторий

3. **General**:
   - Name: `practix-backend`
   - Branch: `master`

4. **Build**:
   - Build Pack: `Dockerfile`
   - Base Directory: `/server`
   - Dockerfile Location: `Dockerfile`

5. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=8080

   # Database
   DATABASE_URL=postgresql://practix:PASSWORD@practix-postgres:5432/practix

   # Redis
   REDIS_URL=redis://:PASSWORD@practix-redis:6379

   # JWT (generate secure key!)
   JWT_SECRET=your-super-secret-key-at-least-32-characters-long
   JWT_EXPIRES_IN=7d

   # AI Tutor
   GEMINI_API_KEY=your-gemini-api-key

   # Judge0
   JUDGE0_URL=http://practix-judge0:2358

   # CORS
   FRONTEND_URL=https://practix.uz

   # Optional: Payments
   PAYME_MERCHANT_ID=
   PAYME_SECRET_KEY=
   CLICK_MERCHANT_ID=
   CLICK_SERVICE_ID=
   CLICK_SECRET_KEY=
   ```

6. **Network**:
   - Port: `8080`
   - Domain: `api.practix.uz`

7. **Health Check**:
   - Path: `/health`
   - Interval: `30`
   - Timeout: `10`
   - Retries: `3`

8. **Resources** (важно для Contabo!):
   - CPU Limit: `2` (не давать съедать всё)
   - Memory Limit: `2GB`

9. **Deploy**

### 5.5 Frontend (React/Vite)

1. **Add Resource** → **Application** → **GitHub**

2. Выбрать `practix-starter` репозиторий

3. **General**:
   - Name: `practix-frontend`
   - Branch: `master`

4. **Build**:
   - Build Pack: `Dockerfile`
   - Base Directory: `/`
   - Dockerfile Location: `Dockerfile`

5. **Build Arguments**:
   ```
   VITE_API_URL=https://api.practix.uz
   VITE_APP_ENV=production
   ```

6. **Network**:
   - Port: `80`
   - Domain: `practix.uz`

7. **Resources**:
   - CPU Limit: `0.5`
   - Memory Limit: `512MB`

8. **Deploy**

---

## Шаг 6: Настройка Judge0

### 6.1 Создание Judge0 сервиса

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
       deploy:
         resources:
           limits:
             cpus: '2'
             memory: 2G
           reservations:
             cpus: '0.5'
             memory: 512M

   volumes:
     judge0-packages:
   ```

4. **Deploy**

### 6.2 Установка языков

```bash
# SSH на сервер
ssh root@YOUR_SERVER_IP

# Найти контейнер
docker ps | grep judge0

# Установить языки (один за одним, чтобы не перегружать)
docker exec practix-judge0 judge0 ppman install python
docker exec practix-judge0 judge0 ppman install node
docker exec practix-judge0 judge0 ppman install typescript
docker exec practix-judge0 judge0 ppman install go
docker exec practix-judge0 judge0 ppman install java
docker exec practix-judge0 judge0 ppman install gcc
docker exec practix-judge0 judge0 ppman install g++
docker exec practix-judge0 judge0 ppman install rust

# Проверить
docker exec practix-judge0 judge0 ppman list
```

### 6.3 Тест Judge0

```bash
curl -X POST http://localhost:2358/api/v2/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "version": "3.10",
    "files": [{"content": "print(sum(range(100)))"}]
  }'
```

Ожидаемый ответ:
```json
{"run":{"stdout":"4950\n","stderr":"","code":0}}
```

---

## Шаг 7: Seed базы данных

### 7.1 Через Coolify Terminal

1. Backend service → **Terminal**
2. Выполнить:
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

### 7.2 Через SSH

```bash
ssh root@YOUR_SERVER_IP

# Найти backend контейнер
docker ps | grep backend

# Выполнить миграции и seed
docker exec -it CONTAINER_ID sh -c "npx prisma migrate deploy && npm run seed"
```

### 7.3 Проверка

```bash
# Проверить что курсы загрузились
curl https://api.practix.uz/courses | jq '.length'
# Должно быть ~21
```

---

## Шаг 8: Мониторинг и бэкапы

### 8.1 Базовый мониторинг

```bash
# Установить на сервер
apt install -y htop iotop

# Мониторинг в реальном времени
htop

# Диск I/O
iotop
```

### 8.2 Бэкапы PostgreSQL

**Вариант A: Через Coolify**

1. **practix-postgres** → **Backups**
2. Enable Scheduled Backups
3. Schedule: `0 3 * * *` (3:00 AM daily)
4. Retention: 7 days

**Вариант B: Ручной скрипт**

```bash
# Создать директорию для бэкапов
mkdir -p /backups

# Создать скрипт
cat > /usr/local/bin/backup-practix.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backups

# PostgreSQL backup
docker exec practix-postgres pg_dump -U practix practix | gzip > $BACKUP_DIR/practix_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: practix_$DATE.sql.gz"
EOF

chmod +x /usr/local/bin/backup-practix.sh

# Добавить в cron
echo "0 3 * * * root /usr/local/bin/backup-practix.sh" >> /etc/crontab
```

### 8.3 Uptime мониторинг

**Рекомендую BetterUptime (бесплатный tier):**

1. Зарегистрироваться на [betteruptime.com](https://betteruptime.com)
2. Add monitor:
   - URL: `https://api.practix.uz/health`
   - Check frequency: 1 minute
3. Настроить уведомления (email/Telegram)

---

## Оптимизация Contabo

### 9.1 Оптимизация Docker

```bash
# Настройки Docker daemon
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

# Перезапустить Docker
systemctl restart docker
```

### 9.2 Настройка ядра

```bash
# Оптимизации для веб-сервера
cat >> /etc/sysctl.conf << 'EOF'

# Network
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 5
net.ipv4.tcp_keepalive_intvl = 15

# Memory
vm.swappiness = 10
vm.dirty_ratio = 60
vm.dirty_background_ratio = 2

# File descriptors
fs.file-max = 2097152
EOF

sysctl -p
```

### 9.3 Лимиты системы

```bash
# Увеличить лимиты
cat >> /etc/security/limits.conf << 'EOF'
* soft nofile 65535
* hard nofile 65535
* soft nproc 65535
* hard nproc 65535
EOF
```

### 9.4 Очистка Docker (регулярно)

```bash
# Добавить в cron
cat >> /etc/crontab << 'EOF'
0 4 * * 0 root docker system prune -af --volumes
EOF
```

---

## Troubleshooting

### Проблема: Сервер медленный

```bash
# Проверить нагрузку
htop

# Если CPU высокий — возможно oversubscribed
# Решение: upgrade план или оптимизировать приложение

# Проверить диск
iostat -x 1

# Проверить память
free -h
```

### Проблема: Docker container killed (OOM)

```bash
# Проверить логи
dmesg | grep -i oom

# Увеличить swap
fallocate -l 8G /swapfile2
mkswap /swapfile2
swapon /swapfile2

# Уменьшить лимиты контейнеров в Coolify
```

### Проблема: Judge0 не работает

```bash
# Проверить статус
docker ps | grep judge0
docker logs practix-judge0

# Проверить privileged mode
docker inspect practix-judge0 | grep -i privileged
# Должно быть true

# Перезапустить
docker restart practix-judge0
```

### Проблема: Сеть нестабильна

Cloudflare помогает:

1. Включить **Always Online**
2. Включить **Argo Smart Routing** (платно, но помогает)
3. Использовать **Page Rules** для кэширования статики

### Проблема: Coolify не обновляет деплой

```bash
# SSH на сервер
cd /data/coolify

# Перезапустить Coolify
docker compose down
docker compose up -d

# Очистить кэш
docker builder prune -af
```

### Проблема: Database connection timeout

```bash
# Проверить PostgreSQL
docker logs practix-postgres

# Увеличить connections в Coolify:
# practix-postgres → Variables → POSTGRES_MAX_CONNECTIONS=200
```

---

## Чеклист деплоя

- [ ] VPS создан на Contabo
- [ ] Система обновлена, swap настроен
- [ ] Firewall настроен (UFW)
- [ ] Coolify установлен
- [ ] DNS настроен (Cloudflare)
- [ ] SSL работает
- [ ] PostgreSQL задеплоен
- [ ] Redis задеплоен
- [ ] Judge0 задеплоен + языки установлены
- [ ] Backend задеплоен с env vars
- [ ] Frontend задеплоен
- [ ] Миграции выполнены
- [ ] Seed выполнен
- [ ] Health check работает
- [ ] Бэкапы настроены
- [ ] Мониторинг настроен

---

## Полезные команды

```bash
# Статус всех контейнеров
docker ps -a

# Логи сервиса
docker logs -f --tail 100 CONTAINER_NAME

# Зайти в контейнер
docker exec -it CONTAINER_NAME sh

# Использование ресурсов
docker stats

# Очистка
docker system prune -af

# Перезапуск Coolify
cd /data/coolify && docker compose restart
```

---

## Стоимость

| Компонент | Цена |
|-----------|------|
| Contabo VPS S | €5.99/мес |
| Cloudflare | Бесплатно |
| BetterUptime | Бесплатно |
| **Итого** | **€5.99/мес (~$6.50)** |

При росте — upgrade до VPS M (€9.99) или VPS L (€14.99).

---

*Документ создан: 2026-01-23*
