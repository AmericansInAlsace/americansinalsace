# Makefile for the Americans in Alsace Project
# Provides shortcuts for common Docker and testing operations.

# --- Configuration ---
# Default service for shell and logs. Override with `make shell SERVICE=db`
SERVICE ?= web
# Default test suite. Override with `make test SUITE=unit`
SUITE ?= all

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
.PHONY: help build rebuild start stop shell logs test coverage

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

# --- Testing & Coverage Targets ---
test:
	@echo "Running tests for suite: $(SUITE)"
	npm test -- $(TEST_PATH)

coverage:
	@echo "Running coverage for suite: $(SUITE)"
	@echo "Report will be generated in: $(REPORTS_DIR)"
	npm test -- $(TEST_PATH) --coverage --coverage.reportsDirectory=$(REPORTS_DIR)
