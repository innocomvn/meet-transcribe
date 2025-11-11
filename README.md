# Meet Transcribe - Video Meeting App với Ghi Âm & Phiên Âm Tự Động

**Meet Transcribe** là ứng dụng họp video online/offline hoàn chỉnh với các tính năng:
- ✅ Họp video trực tuyến với WebRTC
- ✅ Ghi màn hình và âm thanh chất lượng cao
- ✅ Phiên âm tiếng Việt tự động real-time (sử dụng PhoWhisper)
- ✅ Ghi log cuộc họp và transcript
- ✅ Tạo biên bản cuộc họp tự động (PDF, DOCX, Markdown)
- ✅ Chat trong cuộc họp
- ✅ Hỗ trợ làm việc offline

## 📋 Mục Lục

- [Tính năng](#tính-năng)
- [Công nghệ](#công-nghệ)
- [Cài đặt](#cài-đặt)
- [Sử dụng](#sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [API Documentation](#api-documentation)
- [PhoWhisper](#phowhisper)

## 🚀 Tính Năng

### 1. Họp Video Trực Tuyến
- Video conferencing với WebRTC
- Hỗ trợ nhiều người tham gia
- Bật/tắt camera và microphone
- Chia sẻ màn hình

### 2. Ghi Âm & Ghi Màn Hình
- Ghi màn hình với chất lượng cao
- Ghi âm đồng thời
- Lưu trữ tự động
- Tải về định dạng WebM

### 3. Phiên Âm Tự Động
- Sử dụng PhoWhisper cho tiếng Việt
- Phiên âm real-time trong cuộc họp
- Hiển thị độ tin cậy của phiên âm
- Export transcript (TXT, JSON, SRT)

### 4. Biên Bản Cuộc Họp
- Tự động phân tích và tạo biên bản
- Trích xuất điểm chính, quyết định, nhiệm vụ
- Export nhiều định dạng (PDF, DOCX, MD)
- Tóm tắt thông minh

### 5. Các Tính Năng Khác
- Chat trong cuộc họp
- Lịch sử cuộc họp
- Tìm kiếm và quản lý recordings
- Responsive UI với Tailwind CSS

## 🛠 Công Nghệ

### Backend
- **FastAPI** - Web framework hiện đại cho Python
- **SQLAlchemy** - ORM cho database
- **WebSocket** - Real-time communication
- **PhoWhisper** - Vietnamese ASR model
- **PyTorch** - Deep learning framework
- **ReportLab & python-docx** - Document generation

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **WebRTC** - Video conferencing
- **RecordRTC** - Recording
- **Axios** - HTTP client

## 📦 Cài Đặt

### 🐳 Quick Start với Docker (Khuyến nghị)

**Cách nhanh nhất để chạy ứng dụng:**

```bash
# Clone repository
git clone <repository-url>
cd meet-transcribe

# Copy environment file
cp .env.example .env

# Start với Docker
make quickstart

# Hoặc sử dụng docker-compose trực tiếp
docker-compose up -d
```

✅ **Xong!** Truy cập:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs

📖 **Chi tiết**: Xem [DOCKER.md](DOCKER.md) để biết thêm về Docker deployment

---

### 💻 Cài Đặt Thủ Công (Manual Setup)

#### Yêu Cầu
- Python 3.9+
- Node.js 18+
- FFmpeg (cho xử lý audio/video)

#### 1. Clone Repository
```bash
git clone <repository-url>
cd meet-transcribe
```

#### 2. Cài Đặt Backend

```bash
# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc
venv\Scripts\activate  # Windows

# Cài đặt dependencies
pip install -r requirements.txt

# Copy file cấu hình
cp .env.example .env

# Chỉnh sửa .env file với cấu hình của bạn
```

#### 3. Cài Đặt Frontend

```bash
cd frontend
npm install
```

📖 **Chi tiết**: Xem [SETUP.md](SETUP.md) để biết hướng dẫn cài đặt chi tiết

## 🎮 Sử Dụng

### 🐳 Với Docker

```bash
# Development
make dev           # Start
make logs          # View logs
make down          # Stop

# Production
make prod-build    # Build
make prod-up       # Deploy
make prod-logs     # Logs

# Xem thêm commands
make help
```

### 💻 Thủ Công

#### Chạy Backend

```bash
# Từ thư mục gốc
cd backend
python main.py
```

Backend sẽ chạy tại: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

#### Chạy Frontend

```bash
# Terminal mới
cd frontend
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

### Sử Dụng Ứng Dụng

1. **Tạo Cuộc Họp Mới**
   - Truy cập trang chủ
   - Điền thông tin cuộc họp
   - Click "Tạo Cuộc Họp"

2. **Tham Gia Cuộc Họp**
   - Nhập Meeting ID
   - Click "Tham Gia Cuộc Họp"
   - Cho phép truy cập camera/microphone

3. **Trong Cuộc Họp**
   - Bật/tắt mic, camera
   - Chia sẻ màn hình
   - Bắt đầu ghi bằng nút Record
   - Xem transcript real-time
   - Chat với người tham gia

4. **Sau Cuộc Họp**
   - Xem lịch sử cuộc họp
   - Tải về recordings
   - Tạo biên bản cuộc họp
   - Export transcript

## 📁 Cấu Trúc Dự Án

```
meet-transcribe/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration
│   ├── database.py             # Database models
│   ├── routers/                # API endpoints
│   │   ├── meetings.py
│   │   ├── recordings.py
│   │   ├── transcriptions.py
│   │   └── minutes.py
│   └── services/               # Business logic
│       ├── transcription_service.py
│       ├── websocket_manager.py
│       └── minutes_generator.py
├── frontend/
│   ├── src/
│   │   ├── pages/              # React pages
│   │   │   ├── Home.jsx
│   │   │   ├── MeetingRoom.jsx
│   │   │   ├── MeetingHistory.jsx
│   │   │   └── MeetingDetails.jsx
│   │   ├── components/         # React components
│   │   │   ├── VideoGrid.jsx
│   │   │   ├── TranscriptPanel.jsx
│   │   │   ├── ChatPanel.jsx
│   │   │   └── RecordingControls.jsx
│   │   └── hooks/              # Custom hooks
│   │       ├── useWebRTC.js
│   │       ├── useRecording.js
│   │       └── useWebSocket.js
│   ├── package.json
│   └── vite.config.js
├── requirements.txt            # Python dependencies
├── .env.example                # Environment template
├── .gitignore
└── README.md
```

## 🔌 API Documentation

### Meetings API

#### Tạo cuộc họp mới
```
POST /api/meetings/
Body: {
  "title": "Meeting Title",
  "description": "Description",
  "host_name": "Host Name"
}
```

#### Lấy danh sách cuộc họp
```
GET /api/meetings/
```

#### Lấy thông tin cuộc họp
```
GET /api/meetings/{meeting_id}
```

#### Bắt đầu cuộc họp
```
PATCH /api/meetings/{meeting_id}/start
```

#### Kết thúc cuộc họp
```
PATCH /api/meetings/{meeting_id}/end
```

### Recordings API

#### Upload recording
```
POST /api/recordings/upload/{meeting_id}
```

#### Lấy recordings của meeting
```
GET /api/recordings/meeting/{meeting_id}
```

#### Tải recording
```
GET /api/recordings/{recording_id}/download
```

### Transcriptions API

#### Tạo transcript entry
```
POST /api/transcriptions/
```

#### Lấy transcripts của meeting
```
GET /api/transcriptions/meeting/{meeting_id}
```

#### Export transcript
```
GET /api/transcriptions/meeting/{meeting_id}/export?format=txt|json|srt
```

### Minutes API

#### Tạo biên bản cuộc họp
```
POST /api/minutes/{meeting_id}?format=pdf|docx|md
```

#### Lấy biên bản
```
GET /api/minutes/{meeting_id}
```

#### Tải biên bản
```
GET /api/minutes/{meeting_id}/download
```

### WebSocket

#### Kết nối
```
WS /ws/{meeting_id}
```

#### Message Types
- `audio_chunk` - Gửi audio để phiên âm
- `transcript` - Nhận transcript real-time
- `chat` - Gửi/nhận chat messages
- `signaling` - WebRTC signaling
- `recording_control` - Điều khiển recording

## 🎯 Transcription: Multiple Providers

Meet Transcribe hỗ trợ **nhiều phương pháp transcription**, cho phép bạn lựa chọn giữa local processing và cloud APIs:

### Providers Available

| Provider | Ngôn Ngữ | Chi Phí | Tốc Độ | Use Case |
|----------|----------|---------|---------|----------|
| **Local (PhoWhisper)** | Tiếng Việt | Miễn phí | Trung bình | Privacy, Offline, VI only |
| **OpenAI Whisper API** | 50+ languages | $0.006/phút | Nhanh | Multi-language, Accuracy |
| **AssemblyAI** | 50+ languages | $0.00025/giây | Rất nhanh | Advanced features |
| **Google Speech** | 125+ languages | $0.006/15s | Rất nhanh | Enterprise (future) |

### Quick Setup

#### Local PhoWhisper (Default)
```env
TRANSCRIPTION_PROVIDER=local
WHISPER_MODEL=vinai/PhoWhisper-small
DEVICE=cpu  # hoặc cuda
```

#### OpenAI Whisper API
```env
TRANSCRIPTION_PROVIDER=openai
OPENAI_API_KEY=sk-proj-your-key
TRANSCRIPTION_LANGUAGE=vi  # hoặc en, es, etc.
```

#### AssemblyAI
```env
TRANSCRIPTION_PROVIDER=assemblyai
ASSEMBLYAI_API_KEY=your-key
TRANSCRIPTION_LANGUAGE=vi
```

### PhoWhisper Models (Local Provider)

| Model | Parameters | RAM | WER | Tốc Độ |
|-------|-----------|-----|-----|--------|
| `PhoWhisper-tiny` | 39M | ~1GB | 19.05 | ⭐⭐⭐⭐⭐ |
| `PhoWhisper-base` | 74M | ~2GB | 16.19 | ⭐⭐⭐⭐ |
| `PhoWhisper-small` | 244M | ~3GB | 11.08 | ⭐⭐⭐ (default) |
| `PhoWhisper-medium` | 769M | ~6GB | 8.27 | ⭐⭐ |
| `PhoWhisper-large` | 1.55B | ~12GB | 8.14 | ⭐ |

📖 **Chi tiết**: Xem [TRANSCRIPTION.md](TRANSCRIPTION.md) để biết thêm về:
- So sánh providers chi tiết
- Pricing & performance
- Setup instructions
- Best practices
- API endpoints

### PhoWhisper Citation

Nếu sử dụng PhoWhisper, vui lòng cite paper:

```bibtex
@inproceedings{PhoWhisper,
  title     = {{PhoWhisper: Automatic Speech Recognition for Vietnamese}},
  author    = {Thanh-Thien Le and Linh The Nguyen and Dat Quoc Nguyen},
  booktitle = {Proceedings of the ICLR 2024 Tiny Papers track},
  year      = {2024}
}
```

## 🔧 Cấu Hình

### Environment Variables

Xem file `.env.example` cho danh sách đầy đủ. Các biến quan trọng:

```env
# Server
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Database
DATABASE_URL=sqlite+aiosqlite:///./meet_transcribe.db

# PhoWhisper
WHISPER_MODEL=vinai/PhoWhisper-small
DEVICE=cpu

# File Storage
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=524288000

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

## 🐛 Troubleshooting

### Lỗi Camera/Microphone
- Kiểm tra quyền truy cập trong browser
- Đảm bảo HTTPS hoặc localhost

### Lỗi PhoWhisper
- Kiểm tra PyTorch đã cài đúng
- Đảm bảo có đủ RAM (tối thiểu 4GB cho model small)
- Thử model nhỏ hơn nếu bị OOM

### Lỗi Recording
- Kiểm tra FFmpeg đã cài đặt
- Đảm bảo quyền truy cập màn hình
- Kiểm tra dung lượng đĩa

## 🐳 Docker Deployment

Ứng dụng đã được hoàn toàn dockerized với:
- ✅ Multi-stage builds cho production
- ✅ Development và production configs riêng biệt
- ✅ Nginx reverse proxy
- ✅ Volume persistence cho uploads và models
- ✅ Health checks
- ✅ Resource limits
- ✅ Makefile commands tiện lợi

Xem [DOCKER.md](DOCKER.md) để biết chi tiết về:
- Quick start với Docker
- Development setup
- Production deployment
- SSL/HTTPS configuration
- GPU support
- Scaling & monitoring
- Backup & restore

## 📝 TODO

- [ ] Hỗ trợ nhiều ngôn ngữ
- [ ] Speaker diarization (phân biệt người nói)
- [ ] Integration với Zoom/Google Meet
- [ ] Mobile app
- [ ] Cloud deployment guide
- [x] Docker support ✅

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the BSD 3-Clause License - see the LICENSE file for details.

PhoWhisper is developed by VinAI Research and licensed under BSD 3-Clause License.

## 👥 Authors

- Meet Transcribe Application - [Your Name]
- PhoWhisper Model - VinAI Research Team

## 🙏 Acknowledgments

- [PhoWhisper](https://github.com/VinAIResearch/PhoWhisper) by VinAI Research
- [OpenAI Whisper](https://github.com/openai/whisper)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)

---

**Lưu ý:** Đây là phiên bản đầu tiên. Vui lòng báo cáo bugs và góp ý để cải thiện!
