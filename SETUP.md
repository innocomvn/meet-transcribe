# Hướng Dẫn Cài Đặt Chi Tiết - Meet Transcribe

## Yêu Cầu Hệ Thống

### Phần Cứng
- **RAM**: Tối thiểu 4GB (8GB khuyến nghị)
- **CPU**: 2 cores trở lên
- **Disk**: 5GB trống (cho models và recordings)
- **GPU**: Optional (tăng tốc độ transcription)

### Phần Mềm
- **Python**: 3.9, 3.10, hoặc 3.11
- **Node.js**: 18.x hoặc 20.x
- **FFmpeg**: Latest version
- **Browser**: Chrome, Firefox, hoặc Edge (hỗ trợ WebRTC)

## Cài Đặt Chi Tiết

### Bước 1: Chuẩn Bị Môi Trường

#### Windows

```powershell
# Cài Python từ python.org
# Cài Node.js từ nodejs.org

# Cài FFmpeg
# Download từ: https://www.gyan.dev/ffmpeg/builds/
# Extract và thêm vào PATH

# Verify installations
python --version
node --version
ffmpeg -version
```

#### macOS

```bash
# Sử dụng Homebrew
brew install python@3.11
brew install node
brew install ffmpeg

# Verify installations
python3 --version
node --version
ffmpeg -version
```

#### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Python
sudo apt install python3.11 python3.11-venv python3-pip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install FFmpeg
sudo apt install ffmpeg

# Verify installations
python3 --version
node --version
ffmpeg -version
```

### Bước 2: Clone Repository

```bash
git clone <repository-url>
cd meet-transcribe
```

### Bước 3: Setup Backend

#### Tạo Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Cài Đặt Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Lưu ý:** Quá trình này có thể mất 5-10 phút để tải về PyTorch và các dependencies khác.

#### Cài Đặt PyTorch với GPU (Optional)

Nếu có NVIDIA GPU và muốn sử dụng CUDA:

```bash
# Check CUDA version
nvidia-smi

# Install PyTorch with CUDA (example for CUDA 11.8)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

#### Tạo File Cấu Hình

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Database
DATABASE_URL=sqlite+aiosqlite:///./meet_transcribe.db

# Security (Change these!)
SECRET_KEY=your-secure-secret-key-here-change-this
ALGORITHM=HS256

# PhoWhisper Model
# Chọn model phù hợp với RAM của bạn:
# - tiny: ~1GB RAM, fastest
# - base: ~2GB RAM, fast
# - small: ~3GB RAM, balanced (default)
# - medium: ~6GB RAM, better
# - large: ~12GB RAM, best
WHISPER_MODEL=vinai/PhoWhisper-small

# Device: cpu hoặc cuda
DEVICE=cpu

# File Storage
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=524288000

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

#### Tạo Thư Mục Uploads

```bash
mkdir -p uploads/recordings uploads/transcripts uploads/minutes
```

### Bước 4: Setup Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Hoặc sử dụng yarn
yarn install

# Hoặc sử dụng pnpm
pnpm install
```

### Bước 5: Kiểm Tra Cài Đặt

#### Test Backend

```bash
# Activate venv nếu chưa
source venv/bin/activate  # macOS/Linux
# hoặc
venv\Scripts\activate  # Windows

# Chạy backend
cd backend
python main.py
```

Mở browser và truy cập:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

Bạn sẽ thấy:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00",
  "service": "meet-transcribe"
}
```

#### Test Frontend

```bash
# Terminal mới
cd frontend
npm run dev
```

Mở browser và truy cập: http://localhost:3000

## Chạy Ứng Dụng

### Development Mode

#### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # hoặc venv\Scripts\activate trên Windows
python main.py
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Production Build

#### Build Frontend
```bash
cd frontend
npm run build
```

Dist files sẽ ở trong `frontend/dist/`

#### Run Backend in Production
```bash
cd backend
source venv/bin/activate

# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Troubleshooting

### Problem: PyTorch Installation Failed

**Solution:**
```bash
# Try installing CPU-only version first
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

### Problem: PhoWhisper Model Download Slow

**Solution:**
- Mô hình sẽ tự động download khi chạy lần đầu
- PhoWhisper-small: ~1GB
- Đảm bảo kết nối internet ổn định
- Models được cache tại `~/.cache/huggingface/`

### Problem: CUDA Out of Memory

**Solution:**
```env
# Trong .env, đổi sang model nhỏ hơn
WHISPER_MODEL=vinai/PhoWhisper-tiny
# hoặc
WHISPER_MODEL=vinai/PhoWhisper-base

# Hoặc dùng CPU
DEVICE=cpu
```

### Problem: FFmpeg Not Found

**Solution:**
```bash
# Check FFmpeg installation
which ffmpeg  # macOS/Linux
where ffmpeg  # Windows

# Reinstall if needed
# macOS
brew reinstall ffmpeg

# Ubuntu/Debian
sudo apt install --reinstall ffmpeg

# Windows - download và add to PATH
```

### Problem: Camera/Microphone Access Denied

**Solution:**
- Chạy trên HTTPS hoặc localhost
- Check browser permissions
- Allow camera/mic trong browser settings

### Problem: Port Already in Use

**Solution:**
```bash
# Change port trong .env
PORT=8001

# Hoặc kill process on port
# Linux/Mac
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Problem: WebSocket Connection Failed

**Solution:**
- Check CORS settings trong `.env`
- Ensure backend is running
- Check firewall settings
- Verify frontend proxy config in `vite.config.js`

## Tối Ưu Hiệu Suất

### Backend

1. **Sử dụng GPU cho Transcription**
```env
DEVICE=cuda
```

2. **Chọn Model Phù Hợp**
- Development: `PhoWhisper-tiny` hoặc `base`
- Production: `PhoWhisper-small` hoặc `medium`

3. **Tăng Workers**
```bash
gunicorn main:app --workers 8 --worker-class uvicorn.workers.UvicornWorker
```

### Frontend

1. **Production Build**
```bash
npm run build
npm run preview
```

2. **Optimize Bundle Size**
- Already configured in `vite.config.js`
- Tree-shaking enabled
- Code splitting automatic

### Database

1. **Production Database**
```env
# Đổi từ SQLite sang PostgreSQL
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/meetdb
```

## Bảo Mật

### Production Checklist

- [ ] Đổi `SECRET_KEY` trong `.env`
- [ ] Set `DEBUG=False`
- [ ] Cấu hình HTTPS
- [ ] Restrict CORS origins
- [ ] Set up firewall rules
- [ ] Regular backups của database
- [ ] Monitor logs
- [ ] Keep dependencies updated

### Recommended `.env` for Production

```env
DEBUG=False
SECRET_KEY=<long-random-string-at-least-32-chars>
ALLOWED_ORIGINS=https://yourdomain.com
DATABASE_URL=postgresql+asyncpg://...
```

## Next Steps

Sau khi cài đặt thành công:

1. ✅ Tạo meeting đầu tiên
2. ✅ Test recording functionality
3. ✅ Verify transcription works
4. ✅ Generate meeting minutes
5. ✅ Customize UI/branding (nếu cần)

## Support

Nếu gặp vấn đề:

1. Check logs: `meet_transcribe.log`
2. Check browser console
3. Verify all services running
4. Check this SETUP.md
5. Open GitHub issue

---

Happy meeting! 🎉
