# Makefile for Meet Transcribe

.PHONY: help build up down logs clean restart dev prod

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development commands
dev: ## Start development environment
	docker-compose up -d
	@echo "Development environment started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

build: ## Build Docker images
	docker-compose build

up: ## Start containers
	docker-compose up -d

down: ## Stop containers
	docker-compose down

logs: ## View logs
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

restart: ## Restart containers
	docker-compose restart

clean: ## Stop and remove containers, networks, volumes
	docker-compose down -v
	@echo "Cleaned up development environment"

# Production commands
prod-build: ## Build production images
	docker-compose -f docker-compose.prod.yml build

prod-up: ## Start production environment
	docker-compose -f docker-compose.prod.yml up -d
	@echo "Production environment started!"
	@echo "Application: http://localhost"

prod-down: ## Stop production environment
	docker-compose -f docker-compose.prod.yml down

prod-logs: ## View production logs
	docker-compose -f docker-compose.prod.yml logs -f

prod-restart: ## Restart production containers
	docker-compose -f docker-compose.prod.yml restart

prod-clean: ## Clean production environment
	docker-compose -f docker-compose.prod.yml down -v

# Database commands
db-backup: ## Backup database
	docker-compose exec backend python -c "import shutil; shutil.copy('meet_transcribe.db', 'meet_transcribe_backup.db')"
	@echo "Database backed up to meet_transcribe_backup.db"

# Utility commands
shell-backend: ## Open shell in backend container
	docker-compose exec backend /bin/bash

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend /bin/sh

ps: ## Show running containers
	docker-compose ps

stats: ## Show container stats
	docker stats

prune: ## Remove unused Docker resources
	docker system prune -af
	docker volume prune -f

# Quick start
quickstart: build dev ## Quick start development environment
	@echo "Quick start complete!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8000"
	@echo "Run 'make logs' to view logs"
