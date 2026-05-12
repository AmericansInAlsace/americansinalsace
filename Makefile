# Makefile for the Americans in Alsace Project
# Provides shortcuts for common Docker and testing operations.

# --- Configuration ---
# Default service for shell and logs. Override with `make shell SERVICE=db`
SERVICE ?= web
# Default test suite. Override with `make test SUITE=unit`
SUITE ?= all
# Default environment file for staging
ENV_FILE ?= .env

# --- Path Logic ---
# Determine the test path and coverage directory based on the SUITE variable.
TEST_PATH :=
REPORTS_DIR := ./coverage
ifeq ($(SUITE),unit)
	TEST_PATH := tests/unit
	REPORTS_DIR := ./coverage/unit
endif
ifeq ($(SUITE),integration)
	TEST_PATH := tests/integration
	REPORTS_DIR := ./coverage/integration
endif
ifeq ($(SUITE),ui)
	TEST_PATH := tests/ui
	REPORTS_DIR := ./coverage/ui
endif

# --- Phony Targets ---
# Declare all targets as .PHONY to prevent conflicts with files of the same name.
.PHONY: help build rebuild start stop shell logs test coverage gen-secret setup-env db-up migrate seed seed-dev build-staging deploy-staging check-env

# --- Help Target ---
help:
	@echo "Usage: make [target] [VARIABLE=value]"
	@echo ""
	@echo "Docker Environment:"
	@echo "  start             - Start all services in the background."
	@echo "  stop              - Stop and remove all services."
	@echo "  rebuild           - Rebuild service images and restart."
	@echo "  shell [SERVICE=web] - Access a shell inside a container."
	@echo "  logs [SERVICE=web]  - Follow logs for a service."
	@echo "  seed-dev          - Seed the database with development mock data (requires DB up)"
	@echo ""
	@echo "Staging Deployment (Raspberry Pi):"
	@echo "  setup-env         - Create .env from .env.development.local and generate NEXTAUTH_SECRET"
	@echo "  deploy-staging    - Run the entire staging deployment pipeline (Production seed)"
	@echo "  db-up             - Start the Postgres database container (for staging)"
	@echo "  migrate           - Run Prisma migrations"
	@echo "  seed              - Seed the database with CORE production data only"
	@echo "  build-staging     - Build the Next.js app for staging"
	@echo ""
	@echo "Utility:"
	@echo "  gen-secret        - Generate a NextAuth secret and append to .env"
	@echo ""
	@echo "Testing & Coverage:"
	@echo "  test [SUITE=all]   - Run tests. SUITE can be 'unit', 'integration', 'ui', or 'all'."
	@echo "  coverage [SUITE=all] - Run tests with coverage. Report is saved in a separate directory per suite."

# --- Docker Targets ---
build:
	@echo "Building Docker images..."
	docker compose build

rebuild:
	@echo "Rebuilding Docker images and restarting services..."
	docker compose up --build -d

start:
	@echo "Starting all services in detached mode..."
	docker compose up -d

stop:
	@echo "Stopping and removing all services..."
	docker compose down

shell:
	@echo "Accessing shell in service: $(SERVICE)..."
	docker compose exec $(SERVICE) /bin/sh

logs:
	@echo "Following logs for service: $(SERVICE)..."
	docker compose logs -f $(SERVICE)

# --- Staging Deployment Targets ---
setup-env:
	@if [ ! -f .env ]; then \
		echo "Creating .env from .env.development.local..."; \
		cp .env.development.local .env; \
		$(MAKE) gen-secret; \
		echo "!!! IMPORTANT: Edit .env and change DATABASE_URL to localhost:5432 !!!"; \
	else \
		echo ".env already exists."; \
	fi

check-env:
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "ERROR: $(ENV_FILE) not found. Run 'make setup-env' first."; \
		exit 1; \
	fi

deploy-staging: check-env db-up migrate seed build-staging
	@echo "--- Staging Deployment Complete ---"
	@echo "Run 'pm2 restart aia-staging' if the app is already running."

db-up:
	@echo "--- Starting Database ---"
	npm run db:up

migrate:
	@echo "--- Running Migrations ---"
	/bin/bash -c "set -a; [ -f $(ENV_FILE) ] && source $(ENV_FILE); set +a && npm run db:migrate"

seed:
	@echo "--- Seeding Database (CORE Data) ---"
	/bin/bash -c "set -a; [ -f $(ENV_FILE) ] && source $(ENV_FILE); set +a && npm run db:seed"

seed-dev:
	@echo "--- Seeding Database (DEV Mock Data) ---"
	/bin/bash -c "set -a; [ -f $(ENV_FILE) ] && source $(ENV_FILE); set +a && npm run db:seed:dev"

build-staging:
	@echo "--- Building Next.js (Optimized for Pi 3B) ---"
	/bin/bash -c "set -a; [ -f $(ENV_FILE) ] && source $(ENV_FILE); set +a && npm run build:staging"

# --- Testing & Coverage Targets ---
test:
	@echo "Running tests for suite: $(SUITE)"
	npm test -- $(TEST_PATH)

coverage:
	@echo "Running coverage for suite: $(SUITE)"
	@echo "Report will be generated in: $(REPORTS_DIR)"
	npm test -- $(TEST_PATH) --coverage --coverage.reportsDirectory=$(REPORTS_DIR)

# --- Utility Targets ---
gen-secret:
	@echo "Generating NEXTAUTH_SECRET..."
	@echo "NEXTAUTH_SECRET=\"$$(openssl rand -base64 32)\"" >> .env
	@echo "Secret appended to .env"
