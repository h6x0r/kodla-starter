SHELL := /bin/sh
DOCKER_COMPOSE ?= docker compose

.PHONY: migrate-up vet build start start-docker

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
