# Coolify Production Configuration

## Server Access

| Parameter | Value |
|-----------|-------|
| **Server IP** | `5.189.182.153` |
| **SSH** | `ssh root@5.189.182.153` |
| **Coolify Dashboard** | http://5.189.182.153:8000 |

---

## Practix Services

### Frontend
| Parameter | Value |
|-----------|-------|
| **Container** | `nwk0wwo0gw0g0oso0g04gwwc-100418250453` |
| **URL** | https://nwk0wwo0gw0g0oso0g04gwwc.5.189.182.153.sslip.io |
| **Internal Port** | 80 |
| **VITE_API_URL** | https://wsggcg0s80cccw044s4k884c.5.189.182.153.sslip.io |

### Backend
| Parameter | Value |
|-----------|-------|
| **Container** | `wsggcg0s80cccw044s4k884c-100425270004` |
| **URL** | https://wsggcg0s80cccw044s4k884c.5.189.182.153.sslip.io |
| **Internal Port** | 8080 |
| **Database** | `postgresql://kodla:KodlaDB2026Secure@oo8ss0ockw04kcs0sswok8kw:5432/kodla` |
| **Redis** | `redis://default:KodlaRedis2026Secure@vo04w88gkkkw4w8w88skcw40:6379/0` |
| **Judge0** | `http://judge0-judge0-server-1:2358` |

### Database (PostgreSQL)
| Parameter | Value |
|-----------|-------|
| **Container** | `oo8ss0ockw04kcs0sswok8kw` |
| **Internal Port** | 5432 |
| **Database** | `kodla` |
| **User** | `kodla` |
| **Password** | `KodlaDB2026Secure` |

### Redis
| Parameter | Value |
|-----------|-------|
| **Container** | `vo04w88gkkkw4w8w88skcw40` |
| **Internal Port** | 6379 |
| **Password** | `KodlaRedis2026Secure` |

### Judge0 (Code Execution)
| Parameter | Value |
|-----------|-------|
| **Server Container** | `judge0-judge0-server-1` |
| **Workers Container** | `judge0-judge0-workers-1` |
| **DB Container** | `judge0-judge0-db-1` |
| **Redis Container** | `judge0-judge0-redis-1` |
| **External Port** | 2358 |
| **Internal URL** | `http://judge0-judge0-server-1:2358` |

---

## Other Projects on Server

### Kodla (Legacy)
| Parameter | Value |
|-----------|-------|
| **Frontend** | `kodla-frontend` (port 3000) |
| **Backend** | `kodla-backend` (port 8081) |

---

## Quick Commands

```bash
# SSH to server
ssh root@5.189.182.153

# Check all containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check Practix backend logs
docker logs wsggcg0s80cccw044s4k884c-100425270004 --tail 100 -f

# Check Practix frontend logs
docker logs nwk0wwo0gw0g0oso0g04gwwc-100418250453 --tail 100 -f

# Check Judge0 logs
docker logs judge0-judge0-server-1 --tail 100 -f

# Check Judge0 workers
docker logs judge0-judge0-workers-1 --tail 100 -f

# Test Judge0 health
curl http://localhost:2358/languages

# Test backend health
curl https://wsggcg0s80cccw044s4k884c.5.189.182.153.sslip.io/health

# Restart Practix backend
docker restart wsggcg0s80cccw044s4k884c-100425270004

# Restart Practix frontend
docker restart nwk0wwo0gw0g0oso0g04gwwc-100418250453
```

---

## E2E Testing on Production

```bash
# Run E2E tests against production
E2E_BASE_URL=https://nwk0wwo0gw0g0oso0g04gwwc.5.189.182.153.sslip.io \
E2E_API_URL=https://wsggcg0s80cccw044s4k884c.5.189.182.153.sslip.io \
E2E_TIER=QUICK \
npx playwright test e2e/tests/task-validation/go-tasks.spec.ts

# Full validation
E2E_BASE_URL=https://nwk0wwo0gw0g0oso0g04gwwc.5.189.182.153.sslip.io \
E2E_API_URL=https://wsggcg0s80cccw044s4k884c.5.189.182.153.sslip.io \
E2E_TIER=FULL \
npx playwright test e2e/tests/task-validation/
```

---

## Network Configuration

**IMPORTANT:** Backend must be connected to `judge0_default` network to access Judge0!

```bash
# Connect backend to Judge0 network (required after container restart)
docker network connect judge0_default wsggcg0s80cccw044s4k884c-100425270004

# Verify connection
docker exec wsggcg0s80cccw044s4k884c-100425270004 curl -s http://judge0-judge0-server-1:2358/languages | head -3
```

### Networks
| Network | Purpose |
|---------|---------|
| `coolify` | Coolify managed services (frontend, backend, db, redis) |
| `judge0_default` | Judge0 services (server, workers, db, redis) |

---

## Notes

- All Coolify services use `coolify` network
- Judge0 uses separate `judge0_default` network
- Backend must be manually connected to `judge0_default` after restart
- sslip.io provides automatic SSL certificates via Let's Encrypt
- Frontend uses VITE_API_URL env var set at build time in Coolify

---

*Last updated: 2026-02-03*
