# Docker Deployment Guide - Meet Transcribe

Hướng dẫn chi tiết để chạy Meet Transcribe với Docker.

## 📋 Mục Lục

- [Yêu cầu](#yêu-cầu)
- [Quick Start](#quick-start)
- [Development](#development)
- [Production](#production)
- [Makefile Commands](#makefile-commands)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Advanced Topics](#advanced-topics)

## 🔧 Yêu Cầu

- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **RAM**: Tối thiểu 4GB (8GB khuyến nghị)
- **Disk**: 10GB trống (cho images và volumes)

### Cài Đặt Docker

#### Linux
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get install docker-compose-plugin
```

#### macOS
```bash
# Sử dụng Docker Desktop
brew install --cask docker
```

#### Windows
- Download và cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Verify Installation
```bash
docker --version
docker-compose --version
```

## 🚀 Quick Start

> **📝 Chọn Backend:** Meet Transcribe hỗ trợ 2 backends:
> - **Python Backend** (mặc định) - Hỗ trợ local transcription với PhoWhisper
> - **Node.js Backend** - Sử dụng API transcription (OpenAI/AssemblyAI)
>
> Xem [README.md - Backend Options](README.md#backend-options) để biết thêm chi tiết.

### Quick Start - Python Backend (Default)

**Cách 1: Sử dụng Makefile (Khuyến nghị)**

```bash
# Clone repository
git clone <repository-url>
cd meet-transcribe

# Copy environment file
cp .env.example .env

# Start development environment
make quickstart

# View logs
make logs
```

**Cách 2: Sử dụng Docker Compose Trực Tiếp**

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

✅ **Truy cập:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

### Quick Start - Node.js Backend

**Cách 1: Sử dụng Makefile (Khuyến nghị)**

```bash
# Clone repository
git clone <repository-url>
cd meet-transcribe

# Copy và config environment
cp backend-node/.env.example backend-node/.env
# Edit backend-node/.env và thêm OPENAI_API_KEY hoặc ASSEMBLYAI_API_KEY

# Start development environment
make quickstart-node

# View logs
make logs-node
```

**Cách 2: Sử dụng Docker Compose Trực Tiếp**

```bash
# Setup environment
cp backend-node/.env.example backend-node/.env
# Edit backend-node/.env

# Build images
docker-compose -f docker-compose.node.yml build

# Start services
docker-compose -f docker-compose.node.yml up -d

# View logs
docker-compose -f docker-compose.node.yml logs -f
```

✅ **Truy cập:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api

## 💻 Development

### Start Development Environment

```bash
# Using Makefile
make dev

# Or using docker-compose
docker-compose up -d
```

### View Logs

```bash
# All services
make logs

# Backend only
make logs-backend

# Frontend only
make logs-frontend
```

### Restart Services

```bash
make restart
```

### Stop Services

```bash
make down
```

### Clean Up (Remove volumes)

```bash
make clean
```

## 🏭 Production

### 1. Chuẩn Bị

#### Tạo Production Environment File
```bash
cp .env.production .env.production.local
```

#### Chỉnh sửa `.env.production.local`:
```env
# IMPORTANT: Change these!
SECRET_KEY=your-super-secret-key-here-at-least-32-characters
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional: Use better model
WHISPER_MODEL=vinai/PhoWhisper-medium

# If you have GPU
DEVICE=cuda
```

### 2. Build và Deploy

```bash
# Build production images
make prod-build

# Start production environment
make prod-up

# View logs
make prod-logs
```

### 3. Production Access

Ứng dụng sẽ chạy tại:
- **HTTP**: http://your-server-ip
- **HTTPS**: (Cần cấu hình SSL - xem bên dưới)

### 4. Stop Production

```bash
make prod-down
```

## 📝 Makefile Commands

### Development Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make dev` | Start development environment |
| `make build` | Build Docker images |
| `make up` | Start containers |
| `make down` | Stop containers |
| `make logs` | View all logs |
| `make logs-backend` | View backend logs |
| `make logs-frontend` | View frontend logs |
| `make restart` | Restart containers |
| `make clean` | Clean up (remove volumes) |

### Production Commands

| Command | Description |
|---------|-------------|
| `make prod-build` | Build production images |
| `make prod-up` | Start production |
| `make prod-down` | Stop production |
| `make prod-logs` | View production logs |
| `make prod-restart` | Restart production |
| `make prod-clean` | Clean production environment |

### Utility Commands

| Command | Description |
|---------|-------------|
| `make shell-backend` | Open shell in backend |
| `make shell-frontend` | Open shell in frontend |
| `make ps` | Show running containers |
| `make stats` | Show container stats |
| `make db-backup` | Backup database |
| `make prune` | Remove unused Docker resources |

### Quick Start

| Command | Description |
|---------|-------------|
| `make quickstart` | Build and start dev environment |

## ⚙️ Configuration

### Docker Compose Files

#### `docker-compose.yml` - Development
- Hot-reload enabled
- Volume mounts for code
- Debug mode ON
- Port 3000 (frontend), 8000 (backend)

#### `docker-compose.prod.yml` - Production
- Multi-stage builds
- Optimized images
- Nginx as reverse proxy
- Resource limits
- Health checks
- Debug mode OFF
- Port 80 (HTTP), 443 (HTTPS)

### Environment Variables

#### Backend `.env`
```env
HOST=0.0.0.0
PORT=8000
DEBUG=True
DATABASE_URL=sqlite+aiosqlite:///./meet_transcribe.db
WHISPER_MODEL=vinai/PhoWhisper-small
DEVICE=cpu
UPLOAD_DIR=/app/uploads
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

#### Production `.env.production`
```env
DEBUG=False
SECRET_KEY=change-this-to-a-long-random-secret-key
WHISPER_MODEL=vinai/PhoWhisper-medium
ALLOWED_ORIGINS=https://yourdomain.com
```

### Volumes

| Volume | Purpose | Location |
|--------|---------|----------|
| `backend-uploads` | Meeting recordings and files | `/app/uploads` |
| `backend-models` | Cached AI models | `/root/.cache/huggingface` |
| `backend-logs` | Application logs (prod) | `/app/logs` |
| `nginx-logs` | Nginx logs (prod) | `/var/log/nginx` |

### Ports

| Service | Development | Production |
|---------|------------|------------|
| Frontend | 3000 | 80, 443 |
| Backend | 8000 | (internal) |

## 🐛 Troubleshooting

### Problem: Port already in use

**Solution:**
```bash
# Find and kill process
# Linux/Mac
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:8000 | xargs kill -9

# Or change ports in docker-compose.yml
```

### Problem: Out of memory

**Solution:**
```bash
# Check memory usage
make stats

# Use smaller model in .env
WHISPER_MODEL=vinai/PhoWhisper-tiny

# Increase Docker memory limit
# Docker Desktop -> Settings -> Resources -> Memory
```

### Problem: PhoWhisper model download slow

**Solution:**
```bash
# Models are cached in volume
# First run will be slow (downloading ~1GB)
# Subsequent runs will be fast

# Check download progress
make logs-backend
```

### Problem: Container won't start

**Solution:**
```bash
# Check logs
make logs

# Rebuild images
make down
make build
make up

# Check container status
make ps
docker-compose ps -a
```

### Problem: Can't connect to backend from frontend

**Solution:**
```bash
# Check network
docker network ls
docker network inspect meet-transcribe_meet-transcribe-network

# Verify backend is running
docker-compose exec backend curl http://localhost:8000/health

# Check CORS settings in .env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Problem: WebSocket connection failed

**Solution:**
```bash
# In development, WebSocket connects to ws://localhost:8000
# Make sure backend is accessible

# In production, check nginx.conf WebSocket proxy
```

### Problem: Database locked

**Solution:**
```bash
# Stop all containers
make down

# Remove database volume
docker volume rm meet-transcribe_backend-db

# Restart
make up
```

## 🚀 Advanced Topics

### Using GPU (CUDA)

#### 1. Install NVIDIA Container Toolkit

```bash
# Ubuntu/Debian
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update
sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker
```

#### 2. Update Dockerfile

In `backend/Dockerfile`, change base image:
```dockerfile
FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04
```

#### 3. Update docker-compose.yml

```yaml
services:
  backend:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

#### 4. Update .env

```env
DEVICE=cuda
```

### SSL/HTTPS Setup

#### Using Let's Encrypt (Certbot)

1. **Get SSL certificates:**
```bash
# Install certbot
sudo apt-get install certbot

# Get certificates
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

2. **Update docker-compose.prod.yml:**
```yaml
services:
  frontend:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
```

3. **Update nginx.conf:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # ... rest of config
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### PostgreSQL Database

#### 1. Update docker-compose.prod.yml:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: meetdb
      POSTGRES_USER: meetuser
      POSTGRES_PASSWORD: securepassword
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - meet-transcribe-network

  backend:
    environment:
      - DATABASE_URL=postgresql+asyncpg://meetuser:securepassword@postgres:5432/meetdb
    depends_on:
      - postgres

volumes:
  postgres-data:
```

#### 2. Update requirements.txt:

```txt
asyncpg==0.29.0
```

### Scaling

#### Horizontal Scaling (Multiple Backend Instances)

```yaml
services:
  backend:
    deploy:
      replicas: 3

  nginx:
    # Add load balancing
```

### Monitoring

#### Docker Stats
```bash
make stats
```

#### Container Logs
```bash
# Real-time logs
make logs

# Last 100 lines
docker-compose logs --tail=100
```

#### Health Checks
```bash
# Check backend health
curl http://localhost:8000/health

# Check all containers
docker-compose ps
```

### Backup & Restore

#### Backup
```bash
# Database
make db-backup

# Uploads
docker run --rm -v meet-transcribe_backend-uploads:/data -v $(pwd):/backup \
  alpine tar czf /backup/uploads-backup.tar.gz -C /data .

# Models (optional - can be re-downloaded)
docker run --rm -v meet-transcribe_backend-models:/data -v $(pwd):/backup \
  alpine tar czf /backup/models-backup.tar.gz -C /data .
```

#### Restore
```bash
# Database
docker cp meet_transcribe_backup.db meet-transcribe-backend:/app/meet_transcribe.db

# Uploads
docker run --rm -v meet-transcribe_backend-uploads:/data -v $(pwd):/backup \
  alpine tar xzf /backup/uploads-backup.tar.gz -C /data
```

### CI/CD Integration

#### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build images
        run: docker-compose -f docker-compose.prod.yml build

      - name: Push to registry
        run: |
          docker login -u ${{ secrets.DOCKER_USERNAME }} -p ${{ secrets.DOCKER_PASSWORD }}
          docker-compose -f docker-compose.prod.yml push

      - name: Deploy
        run: |
          ssh user@server 'cd meet-transcribe && docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d'
```

## 📊 Performance Tuning

### Backend
- Use `PhoWhisper-tiny` or `base` for faster transcription
- Enable GPU for better performance
- Increase workers in production

### Frontend
- Already optimized with multi-stage build
- Gzip compression enabled in nginx
- Static assets cached

### Database
- Use PostgreSQL for production
- Enable connection pooling
- Regular backups

## 🔒 Security Best Practices

1. **Change default secrets**
   ```bash
   # Generate secure key
   openssl rand -hex 32
   ```

2. **Use environment-specific configs**
   - Never commit `.env.production` with real values
   - Use secrets management (Docker secrets, Vault, etc.)

3. **Update CORS origins**
   ```env
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

4. **Enable HTTPS in production**
   - Use Let's Encrypt certificates
   - Redirect HTTP to HTTPS

5. **Regular updates**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

6. **Limit resources**
   - Set memory and CPU limits in docker-compose.prod.yml
   - Monitor resource usage

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI in Docker](https://fastapi.tiangolo.com/deployment/docker/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## Need Help?

- Check logs: `make logs`
- View container status: `make ps`
- Check health: `curl http://localhost:8000/health`
- Open issue on GitHub

Happy Dockerizing! 🐳
