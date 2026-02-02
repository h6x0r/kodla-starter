# Сравнительный анализ платформ для деплоя Practix

> Обновлено: 2026-01-17

---

## Содержание

1. [Требования Practix](#требования-practix)
2. [Обзор платформ](#обзор-платформ)
3. [Детальное сравнение](#детальное-сравнение)
4. [Railway](#railway)
5. [Render](#render)
6. [Fly.io](#flyio)
7. [DigitalOcean App Platform](#digitalocean-app-platform)
8. [Heroku](#heroku)
9. [AWS (ECS/EKS)](#aws-ecseks)
10. [VPS (Hetzner/Contabo)](#vps-hetznercontabo)
11. [Итоговая таблица](#итоговая-таблица)
12. [Рекомендация для Practix](#рекомендация-для-practix)

---

## Требования Practix

### Архитектура приложения

```
┌─────────────────────────────────────────────────────────┐
│                      Practix Stack                        │
├─────────────────────────────────────────────────────────┤
│  Frontend (React/Vite)     │  Static files + SPA       │
│  Backend (NestJS)          │  API + WebSocket          │
│  PostgreSQL 15             │  Primary database         │
│  Redis 7                   │  Cache + BullMQ           │
│  Piston (Docker)           │  Code execution (critical)│
└─────────────────────────────────────────────────────────┘
```

### Технические требования

| Параметр | Минимум | Рекомендуется | Production |
|----------|---------|---------------|------------|
| **RAM** | 2 GB | 4 GB | 8 GB |
| **CPU** | 1 vCPU | 2 vCPU | 4 vCPU |
| **Storage** | 10 GB | 20 GB | 50 GB SSD |
| **Bandwidth** | 100 GB/мес | 500 GB/мес | 1 TB/мес |
| **PostgreSQL** | 1 GB RAM | 2 GB RAM | 4 GB RAM |
| **Redis** | 256 MB | 512 MB | 1 GB |

### Критические требования

| Требование | Важность | Описание |
|------------|----------|----------|
| **Docker support** | CRITICAL | Piston требует Docker с privileged mode |
| **Persistent storage** | CRITICAL | PostgreSQL + Redis data |
| **Custom domains** | HIGH | SSL/TLS для production |
| **Environment variables** | HIGH | Secrets management |
| **Горизонтальное масштабирование** | MEDIUM | Для 1000+ concurrent users |
| **Узбекистан/СНГ latency** | MEDIUM | < 100ms желательно |

### Расчёт нагрузки

**Сценарий: 1000 DAU (Daily Active Users)**

```
Code executions: 1000 users × 20 runs/day = 20,000 runs/day
                 = ~0.23 runs/sec average
                 = ~2-3 runs/sec peak

API requests:    1000 users × 100 req/day = 100,000 req/day
                 = ~1.15 req/sec average
                 = ~10-15 req/sec peak

Database:        ~50 writes/sec peak (submissions, progress)
                 ~200 reads/sec peak

Redis:           ~500 ops/sec (cache + queue)
```

---

## Обзор платформ

### Категории

| Категория | Платформы | Характеристика |
|-----------|-----------|----------------|
| **PaaS (managed)** | Railway, Render, Heroku | Простой деплой, меньше контроля |
| **Container PaaS** | Fly.io, DigitalOcean App | Docker-native, больше гибкости |
| **Cloud (IaaS)** | AWS, GCP, Azure | Максимальный контроль, сложность |
| **VPS** | Hetzner, Contabo, Vultr | Дёшево, полный контроль |

---

## Детальное сравнение

## Railway

### Обзор
Railway — современный PaaS с отличным DX и поддержкой Docker.

### Плюсы
- Отличный UI/UX для деплоя
- Нативная поддержка Docker, PostgreSQL, Redis
- Автоматический деплой из GitHub
- Preview environments для PR
- Простое масштабирование
- Щедрый free tier ($5/месяц credits)

### Минусы
- **Docker privileged mode НЕ поддерживается** — Piston не будет работать
- Ограниченные регионы (US, EU)
- Дороже VPS при высокой нагрузке
- Нет выделенных ресурсов (shared)

### Pricing (2026)

| Plan | RAM | vCPU | Storage | Цена |
|------|-----|------|---------|------|
| Hobby | 8 GB shared | 8 shared | 100 GB | $5/месяц |
| Pro | 32 GB | 32 vCPU | 500 GB | $20/месяц + usage |
| Team | Custom | Custom | Custom | From $20/user |

**Usage-based:**
- RAM: $0.000231/GB/min
- CPU: $0.000463/vCPU/min
- Egress: $0.10/GB

### Вердикт для Practix
❌ **НЕ ПОДХОДИТ** — нет privileged Docker для Piston

---

## Render

### Обзор
Render — PaaS с фокусом на простоту и zero-config.

### Плюсы
- Очень простой деплой
- Managed PostgreSQL и Redis
- Бесплатный SSL
- Автоскейлинг
- Preview environments
- Cron jobs

### Минусы
- **Docker privileged mode НЕ поддерживается**
- Free tier засыпает после 15 мин неактивности
- Только US/EU регионы
- Медленный cold start на free tier

### Pricing (2026)

| Service | Free | Starter | Standard | Pro |
|---------|------|---------|----------|-----|
| Web Service | 750 hrs | $7/мес | $25/мес | $85/мес |
| PostgreSQL | - | $7/мес | $25/мес | $95/мес |
| Redis | - | $10/мес | $40/мес | $150/мес |

**Practix estimate:** $7 + $25 + $10 = **$42/месяц** минимум

### Вердикт для Practix
❌ **НЕ ПОДХОДИТ** — нет privileged Docker для Piston

---

## Fly.io

### Обзор
Fly.io — container-first платформа с глобальной edge сетью.

### Плюсы
- Docker-native с Firecracker VMs
- **Поддержка privileged containers** (через machines API)
- Глобальные регионы (включая Сингапур, Индию — ближе к СНГ)
- Отличная latency
- Volumes для persistent storage
- Built-in Postgres и Redis (Upstash)
- Pay-as-you-go pricing

### Минусы
- Более сложная настройка чем Railway
- CLI-ориентированный workflow
- Документация местами устаревшая
- Нет managed Piston — нужно самому

### Pricing (2026)

| Resource | Free Allowance | Price |
|----------|----------------|-------|
| Shared CPU 1x | 3 VMs | $1.94/мес per VM |
| Shared CPU 2x | - | $3.88/мес per VM |
| Dedicated 1x | - | $29/мес per VM |
| RAM | 256 MB free | $0.00000193/MB/sec |
| Storage | 3 GB free | $0.15/GB/мес |
| Outbound | Unlimited | - |

**Practix estimate (shared):**
- Frontend: $1.94 (1x shared)
- Backend: $3.88 (2x shared)
- Piston: $7.76 (4x shared) — needs more CPU
- Postgres (Fly): $10/мес
- Redis (Upstash): $5/мес

**Total: ~$30/месяц**

### Вердикт для Practix
⚠️ **ВОЗМОЖНО** — privileged mode доступен, но требует ручной настройки

---

## DigitalOcean App Platform

### Обзор
App Platform — managed PaaS от DigitalOcean.

### Плюсы
- Простота использования
- Managed PostgreSQL и Redis
- Хорошие регионы (Сингапур, Франкфурт)
- Интеграция с DO Droplets
- Preview apps

### Минусы
- **Docker privileged mode НЕ поддерживается** на App Platform
- Можно комбинировать с Droplet для Piston
- Дороже чем bare Droplets

### Pricing (2026)

| Tier | RAM | vCPU | Цена |
|------|-----|------|------|
| Basic | 512 MB | 1 shared | $5/мес |
| Professional | 1 GB | 1 | $12/мес |
| Professional | 2 GB | 1 | $25/мес |

**Add-ons:**
- Managed PostgreSQL: from $12/мес
- Managed Redis: from $12/мес

### Альтернатива: App Platform + Droplet

```
┌────────────────────────────────────────────┐
│  App Platform                              │
│  ├── Frontend (static) - $3/мес           │
│  └── Backend (container) - $12/мес        │
├────────────────────────────────────────────┤
│  Managed PostgreSQL - $15/мес             │
│  Managed Redis - $12/мес                   │
├────────────────────────────────────────────┤
│  Droplet (для Piston) - $12/мес           │
│  2 GB RAM, 1 vCPU                          │
└────────────────────────────────────────────┘
Total: ~$54/месяц
```

### Вердикт для Practix
⚠️ **ВОЗМОЖНО** — требует гибридный подход (App Platform + Droplet)

---

## Heroku

### Обзор
Heroku — классический PaaS, пионер в индустрии.

### Плюсы
- Зрелая платформа
- Огромная экосистема add-ons
- Хорошая документация
- Review apps для PR

### Минусы
- **Docker privileged mode НЕ поддерживается**
- Существенно подорожал после удаления free tier
- Устаревший стек
- Только US и EU регионы
- Дорогой при масштабировании

### Pricing (2026)

| Dyno | RAM | Цена |
|------|-----|------|
| Basic | 512 MB | $7/мес |
| Standard 1x | 512 MB | $25/мес |
| Standard 2x | 1 GB | $50/мес |
| Performance M | 2.5 GB | $250/мес |

**Add-ons:**
- Heroku Postgres Mini: $5/мес
- Heroku Redis Mini: $3/мес

**Practix estimate:** $25 + $25 + $15 + $15 = **$80/месяц** (без Piston!)

### Вердикт для Practix
❌ **НЕ ПОДХОДИТ** — дорого, нет privileged Docker

---

## AWS (ECS/EKS)

### Обзор
AWS предлагает полный контроль через ECS (Elastic Container Service) или EKS (Kubernetes).

### Плюсы
- Максимальная гибкость
- **Privileged containers поддерживаются**
- Глобальные регионы
- Enterprise-grade reliability
- Managed services (RDS, ElastiCache)
- Автоскейлинг

### Минусы
- Высокая сложность
- Требует DevOps экспертизу
- Непредсказуемые расходы
- Сложный биллинг
- Overkill для малых проектов

### Pricing (примерный)

**ECS Fargate (serverless containers):**

| Resource | On-Demand | Spot |
|----------|-----------|------|
| vCPU | $0.04048/час | $0.0121/час |
| RAM | $0.004445/GB/час | $0.00133/GB/час |

**Managed services:**
- RDS PostgreSQL (db.t3.micro): ~$15/мес
- ElastiCache Redis (cache.t3.micro): ~$12/мес
- ALB: ~$16/мес + traffic

**Practix estimate (ECS Fargate):**
```
Frontend (0.25 vCPU, 512MB):     $7/мес
Backend (0.5 vCPU, 1GB):         $18/мес
Piston (1 vCPU, 2GB):            $40/мес
RDS PostgreSQL:                   $25/мес
ElastiCache Redis:                $15/мес
ALB + NAT Gateway:                $30/мес
────────────────────────────────────────
Total:                           ~$135/месяц
```

### Вердикт для Practix
⚠️ **ВОЗМОЖНО** — работает, но дорого и сложно для текущего масштаба

---

## VPS (Hetzner/Contabo)

### Обзор
Bare metal VPS с полным контролем — самый гибкий и дешёвый вариант.

### Hetzner (Германия, Финляндия, США)

| Server | vCPU | RAM | SSD | Traffic | Цена |
|--------|------|-----|-----|---------|------|
| CX22 | 2 | 4 GB | 40 GB | 20 TB | €4.35/мес |
| CX32 | 4 | 8 GB | 80 GB | 20 TB | €8.35/мес |
| CX42 | 8 | 16 GB | 160 GB | 20 TB | €16.35/мес |
| CPX31 | 4 | 8 GB | 160 GB | 20 TB | €14.76/мес |

**Плюсы Hetzner:**
- Отличное соотношение цена/качество
- Дата-центры в Европе (низкая latency для СНГ)
- Стабильная сеть
- Volumes для дополнительного хранилища

**Минусы:**
- Нужно самому настраивать всё
- Нет managed services
- Manual scaling

### Contabo (Германия, США)

| Server | vCPU | RAM | SSD | Traffic | Цена |
|--------|------|-----|-----|---------|------|
| VPS S | 4 | 8 GB | 50 GB | 32 TB | €5.99/мес |
| VPS M | 6 | 16 GB | 100 GB | 32 TB | €9.99/мес |
| VPS L | 8 | 30 GB | 200 GB | 32 TB | €14.99/мес |

**Плюсы Contabo:**
- Очень дёшево за ресурсы
- Много RAM/CPU за цену
- Большой bandwidth

**Минусы:**
- Oversubscribed (shared resources)
- Поддержка медленная
- Менее стабильно чем Hetzner

### Setup для Practix на VPS

```bash
# Один сервер Hetzner CX32 (€8.35/мес)
# 4 vCPU, 8 GB RAM, 80 GB SSD

# Docker Compose с всеми сервисами:
# - Frontend (nginx)
# - Backend (NestJS)
# - PostgreSQL
# - Redis
# - Piston (privileged!)

# SSL через Let's Encrypt + Caddy/Nginx
```

**Total VPS cost: €8.35/мес (~$9)**

### Масштабирование VPS

```
Stage 1 (0-1000 users): 1 × CX32 = €8.35/мес
Stage 2 (1000-5000):    2 × CX32 + DB separately = €25/мес
Stage 3 (5000-10000):   Load balancer + 3 app + DB = €50/мес
```

### Вердикт для Practix
✅ **ЛУЧШИЙ ВАРИАНТ** — дёшево, полный контроль, privileged Docker работает

---

## Итоговая таблица

| Платформа | Privileged Docker | Цена/мес | Сложность | Регионы | Рекомендация |
|-----------|-------------------|----------|-----------|---------|--------------|
| **Railway** | ❌ | $30-50 | Низкая | US, EU | ❌ Нет |
| **Render** | ❌ | $40-60 | Низкая | US, EU | ❌ Нет |
| **Fly.io** | ⚠️ Частично | $30-50 | Средняя | Global | ⚠️ Возможно |
| **DO App** | ❌ (с Droplet ⚠️) | $50-70 | Низкая | Global | ⚠️ Возможно |
| **Heroku** | ❌ | $80-120 | Низкая | US, EU | ❌ Нет |
| **AWS ECS** | ✅ | $100-150 | Высокая | Global | ⚠️ Overkill |
| **Hetzner VPS** | ✅ | €8-20 | Средняя | EU, US | ✅ **Лучший** |
| **Contabo VPS** | ✅ | €6-15 | Средняя | EU, US | ✅ Бюджетный |

---

## Рекомендация для Practix

### Финальный вердикт: Hetzner VPS

**Причины:**

1. **Privileged Docker** — Piston требует privileged mode, который недоступен на managed PaaS
2. **Цена** — €8.35/мес vs $50-150 на managed платформах
3. **Производительность** — Dedicated ресурсы лучше shared
4. **Latency для СНГ** — Германия/Финляндия ближе чем US
5. **Контроль** — Полный контроль над конфигурацией
6. **Масштабирование** — Легко добавить серверы по мере роста

### Рекомендуемая конфигурация

#### Stage 1: MVP/Early (0-1000 users)

```
┌─────────────────────────────────────────────┐
│  Hetzner CX32 (€8.35/мес)                  │
│  4 vCPU, 8 GB RAM, 80 GB SSD               │
│  Location: Falkenstein (DE) или Helsinki   │
├─────────────────────────────────────────────┤
│  Docker Compose:                            │
│  ├── Frontend (nginx)                       │
│  ├── Backend (NestJS)                       │
│  ├── PostgreSQL 15                          │
│  ├── Redis 7                                │
│  └── Piston (privileged)                    │
├─────────────────────────────────────────────┤
│  + Hetzner Volume (€4.60/мес за 50GB)      │
│  + Cloudflare (free) для CDN               │
│  + Let's Encrypt SSL                        │
└─────────────────────────────────────────────┘
Total: ~€13/мес ($14)
```

#### Stage 2: Growth (1000-5000 users)

```
┌──────────────────────────────────────────────────────────┐
│  App Server: CX32 × 2 (€16.70/мес)                      │
│  ├── Frontend + Backend                                  │
│  └── Load balanced via Hetzner LB (€5.39/мес)          │
├──────────────────────────────────────────────────────────┤
│  DB Server: CX32 (€8.35/мес)                            │
│  └── PostgreSQL + Redis                                  │
├──────────────────────────────────────────────────────────┤
│  Piston Server: CPX31 (€14.76/мес)                      │
│  └── Dedicated for code execution                        │
├──────────────────────────────────────────────────────────┤
│  + Hetzner Volumes × 2 (€9.20/мес)                      │
│  + Automated backups (€2/мес)                            │
└──────────────────────────────────────────────────────────┘
Total: ~€56/мес ($60)
```

#### Stage 3: Scale (5000+ users)

```
┌──────────────────────────────────────────────────────────┐
│  Frontend: Cloudflare Pages (free)                       │
│  Static hosting with global CDN                          │
├──────────────────────────────────────────────────────────┤
│  Backend: CX42 × 3 + LB (€55/мес)                       │
│  NestJS with horizontal scaling                          │
├──────────────────────────────────────────────────────────┤
│  Database: Dedicated CPX41 (€28/мес)                    │
│  PostgreSQL 15 with replication                          │
├──────────────────────────────────────────────────────────┤
│  Redis: CX22 (€4.35/мес)                                │
│  Dedicated cache + queue                                 │
├──────────────────────────────────────────────────────────┤
│  Piston Cluster: CPX31 × 2 (€29.52/мес)                 │
│  Load balanced code execution                            │
├──────────────────────────────────────────────────────────┤
│  + Managed backups, monitoring                           │
└──────────────────────────────────────────────────────────┘
Total: ~€120/мес ($130)
```

### Альтернатива: Hybrid подход

Если хотите managed services для DB:

```
┌─────────────────────────────────────────────────────────┐
│  Hetzner VPS (CX32) - Backend + Piston - €8.35/мес    │
├─────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL) - Free tier или $25/мес         │
├─────────────────────────────────────────────────────────┤
│  Upstash Redis - Free tier или $10/мес                 │
├─────────────────────────────────────────────────────────┤
│  Cloudflare Pages - Frontend - Free                     │
└─────────────────────────────────────────────────────────┘
Total: €8.35 + $0-35 = ~$10-45/мес
```

---

## Миграция на Hetzner

### Quick Start

```bash
# 1. Создать сервер через CLI
hcloud server create \
  --name practix-prod \
  --type cx32 \
  --image docker-ce \
  --location fsn1 \
  --ssh-key your-key

# 2. SSH на сервер
ssh root@YOUR_IP

# 3. Clone и запустить
git clone https://github.com/your-org/practix.git
cd practix

# 4. Настроить .env
cp .env.example .env
nano .env  # Заполнить GEMINI_API_KEY, etc.

# 5. Запустить
docker compose up -d

# 6. Настроить домен + SSL
# (Caddy или nginx + certbot)
```

### Автоматизация

Рекомендуется использовать:
- **Terraform** — для инфраструктуры
- **Ansible** — для конфигурации
- **GitHub Actions** — для CI/CD
- **Watchtower** — для auto-update containers

---

## Заключение

| Критерий | Выбор | Обоснование |
|----------|-------|-------------|
| **Стоимость** | Hetzner | €8-20/мес vs $50-150 |
| **Privileged Docker** | Hetzner/VPS | PaaS не поддерживают |
| **Простота** | Fly.io | Если готовы без Piston |
| **Enterprise** | AWS ECS | Если бюджет не ограничен |

**Для Practix рекомендуется Hetzner VPS** — оптимальное соотношение цены, гибкости и производительности. Privileged Docker для Piston работает из коробки.

---

*Документ обновлён: 2026-01-17*
