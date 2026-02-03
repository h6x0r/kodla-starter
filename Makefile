SHELL := /bin/sh
DOCKER_COMPOSE ?= docker compose

.PHONY: migrate-up vet build start start-docker db-reset db-seed db-migrate db-studio db-refresh \
        start-all stop-all clean clean-deep disk clean-cache judge0-status judge0-langs

migrate-up:
	cd server && npx prisma migrate deploy

vet:
	npm run build
	cd server && npm run build

build:
	$(DOCKER_COMPOSE) build

start:
	@echo "Starting frontend (Vite) and backend (Nest) locally..."
	@set -e; \
	trap "exit" INT TERM; \
	trap "kill 0" EXIT; \
	( cd server && npm run start:dev ) & \
	npm run dev

start-docker:
	$(DOCKER_COMPOSE) up --build

# Database commands for Docker environment
db-reset:
	@echo "🗑️  Resetting database in Docker..."
	cd server && npx prisma migrate reset --force --skip-seed

db-seed:
	@echo "🌱 Seeding database in Docker..."
	cd server && npm run seed

db-migrate:
	@echo "📊 Running migrations in Docker..."
	cd server && npx prisma migrate deploy

db-studio:
	@echo "🎨 Opening Prisma Studio..."
	cd server && npx prisma studio

# Combined command: reset DB and seed
db-refresh: db-reset db-seed
	@echo "✅ Database refreshed successfully!"

# ============================================================================
# Full Stack Commands
# ============================================================================

# Start everything
start-all:
	@echo "🚀 Starting full stack..."
	$(DOCKER_COMPOSE) up --build -d
	@echo "✅ Full stack is running!"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:8080"
	@echo "   Judge0:   http://localhost:2358"

# Stop everything
stop-all:
	@echo "🛑 Stopping all services..."
	$(DOCKER_COMPOSE) down
	@echo "✅ All services stopped"

# ============================================================================
# Docker Cleanup & Maintenance
# ============================================================================

# Quick cleanup (safe, removes only unused)
clean:
	@echo "🧹 Quick Docker cleanup..."
	docker system prune -f
	@echo "✅ Cleanup complete!"
	@docker system df

# Deep cleanup (removes everything unused including volumes)
clean-deep:
	@echo "⚠️  Deep Docker cleanup (includes unused volumes)..."
	docker system prune -af --volumes
	@echo "✅ Deep cleanup complete!"
	@docker system df

# Show Docker disk usage
disk:
	@echo "📊 Docker Disk Usage:"
	@docker system df
	@echo ""
	@echo "🖼️  Top 5 largest images:"
	@docker images --format "{{.Size}}\t{{.Repository}}:{{.Tag}}" | sort -hr | head -5

# Clean build cache only
clean-cache:
	@echo "🗑️  Cleaning build cache..."
	docker builder prune -af
	@echo "✅ Build cache cleared!"

# ============================================================================
# Judge0 Management
# ============================================================================

# Check Judge0 status
judge0-status:
	@echo "🔍 Judge0 Status:"
	@curl -s http://localhost:2358/about 2>/dev/null && echo "  ✅ Running" || echo "  ❌ Not running"

# List available Judge0 languages
judge0-langs:
	@echo "📋 Available Judge0 languages:"
	@curl -s http://localhost:2358/languages | python3 -c "import sys,json; [print(f'  {l[\"id\"]}: {l[\"name\"]}') for l in json.load(sys.stdin)]" 2>/dev/null || echo "❌ Judge0 not running"
