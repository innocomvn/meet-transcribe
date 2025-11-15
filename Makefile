# Makefile for Meet Transcribe

.PHONY: help build up down logs clean restart dev prod

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development commands - Python Backend (default)
dev: ## Start development environment (Python backend)
	docker-compose up -d
	@echo "Development environment started (Python Backend)!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"

# Development commands - Node.js Backend
dev-node: ## Start development environment (Node.js backend)
	docker-compose -f docker-compose.node.yml up -d
	@echo "Development environment started (Node.js Backend)!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/api"

build: ## Build Docker images (Python backend)
	docker-compose build

build-node: ## Build Docker images (Node.js backend)
	docker-compose -f docker-compose.node.yml build

up: ## Start containers (Python backend)
	docker-compose up -d

up-node: ## Start containers (Node.js backend)
	docker-compose -f docker-compose.node.yml up -d

down: ## Stop containers (Python backend)
	docker-compose down

down-node: ## Stop containers (Node.js backend)
	docker-compose -f docker-compose.node.yml down

logs: ## View logs (Python backend)
	docker-compose logs -f

logs-node: ## View logs (Node.js backend)
	docker-compose -f docker-compose.node.yml logs -f

logs-backend: ## View backend logs (Python)
	docker-compose logs -f backend

logs-backend-node: ## View backend logs (Node.js)
	docker-compose -f docker-compose.node.yml logs -f backend-node

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

restart: ## Restart containers (Python backend)
	docker-compose restart

restart-node: ## Restart containers (Node.js backend)
	docker-compose -f docker-compose.node.yml restart

clean: ## Stop and remove containers, networks, volumes (Python)
	docker-compose down -v
	@echo "Cleaned up development environment (Python)"

clean-node: ## Stop and remove containers, networks, volumes (Node.js)
	docker-compose -f docker-compose.node.yml down -v
	@echo "Cleaned up development environment (Node.js)"

# Production commands - Python Backend
prod-build: ## Build production images (Python backend)
	docker-compose -f docker-compose.prod.yml build

prod-up: ## Start production environment (Python backend)
	docker-compose -f docker-compose.prod.yml up -d
	@echo "Production environment started (Python Backend)!"
	@echo "Application: http://localhost"

prod-down: ## Stop production environment (Python backend)
	docker-compose -f docker-compose.prod.yml down

prod-logs: ## View production logs (Python backend)
	docker-compose -f docker-compose.prod.yml logs -f

prod-restart: ## Restart production containers (Python backend)
	docker-compose -f docker-compose.prod.yml restart

prod-clean: ## Clean production environment (Python backend)
	docker-compose -f docker-compose.prod.yml down -v

# Production commands - Node.js Backend
prod-build-node: ## Build production images (Node.js backend)
	docker-compose -f docker-compose.node.prod.yml build

prod-up-node: ## Start production environment (Node.js backend)
	docker-compose -f docker-compose.node.prod.yml up -d
	@echo "Production environment started (Node.js Backend)!"
	@echo "Application: http://localhost"

prod-down-node: ## Stop production environment (Node.js backend)
	docker-compose -f docker-compose.node.prod.yml down

prod-logs-node: ## View production logs (Node.js backend)
	docker-compose -f docker-compose.node.prod.yml logs -f

prod-restart-node: ## Restart production containers (Node.js backend)
	docker-compose -f docker-compose.node.prod.yml restart

prod-clean-node: ## Clean production environment (Node.js backend)
	docker-compose -f docker-compose.node.prod.yml down -v

# Database commands
db-backup: ## Backup database
	docker-compose exec backend python -c "import shutil; shutil.copy('meet_transcribe.db', 'meet_transcribe_backup.db')"
	@echo "Database backed up to meet_transcribe_backup.db"

# Utility commands
shell-backend: ## Open shell in backend container (Python)
	docker-compose exec backend /bin/bash

shell-backend-node: ## Open shell in backend container (Node.js)
	docker-compose -f docker-compose.node.yml exec backend-node /bin/sh

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend /bin/sh

ps: ## Show running containers
	docker-compose ps

ps-node: ## Show running containers (Node.js)
	docker-compose -f docker-compose.node.yml ps

stats: ## Show container stats
	docker stats

prune: ## Remove unused Docker resources
	docker system prune -af
	docker volume prune -f

# Quick start
quickstart: build dev ## Quick start development environment (Python backend)
	@echo "Quick start complete (Python Backend)!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8000"
	@echo "Run 'make logs' to view logs"

quickstart-node: build-node dev-node ## Quick start development environment (Node.js backend)
	@echo "Quick start complete (Node.js Backend)!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8000"
	@echo "Run 'make logs-node' to view logs"
