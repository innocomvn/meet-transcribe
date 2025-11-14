# Meet Transcribe - Node.js/TypeScript Backend

Backend API cho ứng dụng Meet Transcribe được xây dựng với **NestJS** và **TypeScript**.

## 🚀 Tech Stack

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **TypeORM** - ORM for database
- **SQLite** - Database
- **Socket.IO** - Real-time WebSocket
- **OpenAI/AssemblyAI** - Transcription APIs

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

## 🎮 Running the App

```bash
# Development
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Watch mode
npm run start:debug
```

App will run at: `http://localhost:8000`

## 📖 API Documentation

Once running, visit: `http://localhost:8000/api` for API docs

## 🔧 Configuration

Edit `.env`:

```env
# Server
PORT=8000
NODE_ENV=development

# Database
DATABASE_PATH=./meet-transcribe.db

# Transcription Provider
TRANSCRIPTION_PROVIDER=openai  # or assemblyai
OPENAI_API_KEY=sk-...
ASSEMBLYAI_API_KEY=...

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

## 📁 Project Structure

```
src/
├── main.ts                 # Bootstrap
├── app.module.ts          # Root module
├── meetings/              # Meetings CRUD
├── recordings/            # File uploads & downloads
├── transcriptions/        # Transcripts management
├── minutes/               # Meeting minutes generation
├── transcription/         # Transcription service (OpenAI, AssemblyAI)
├── websocket/             # Real-time WebSocket
└── system/                # System info & health
```

## 🔌 API Endpoints

### Meetings
- `POST /api/meetings` - Create meeting
- `GET /api/meetings` - List meetings
- `GET /api/meetings/:id` - Get meeting
- `PATCH /api/meetings/:id/start` - Start meeting
- `PATCH /api/meetings/:id/end` - End meeting

### Recordings
- `POST /api/recordings/upload/:meetingId` - Upload recording
- `GET /api/recordings/meeting/:meetingId` - Get recordings
- `GET /api/recordings/:id/download` - Download recording

### Transcriptions
- `POST /api/transcriptions` - Create transcript
- `GET /api/transcriptions/meeting/:meetingId` - Get transcripts
- `GET /api/transcriptions/meeting/:meetingId/export` - Export

### Minutes
- `POST /api/minutes/:meetingId` - Generate minutes
- `GET /api/minutes/:meetingId` - Get minutes
- `GET /api/minutes/:meetingId/download` - Download

### System
- `GET /api/system/health` - Health check
- `GET /api/system/info` - System info
- `GET /api/system/transcription/provider` - Current provider

### WebSocket
- `ws://localhost:8000/ws` - WebSocket endpoint
- Events: `join_meeting`, `audio_chunk`, `signaling`, `chat`

## 🎯 Transcription Providers

### OpenAI Whisper API (Recommended for Node.js)
```env
TRANSCRIPTION_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

### AssemblyAI
```env
TRANSCRIPTION_PROVIDER=assemblyai
ASSEMBLYAI_API_KEY=...
```

### Local PhoWhisper
**Note**: PhoWhisper requires Python. For Node.js backend:
- Use Python backend for local transcription
- Or use API providers (OpenAI/AssemblyAI)

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🐳 Docker

```bash
# Build
docker build -t meet-transcribe-node .

# Run
docker run -p 8000:8000 meet-transcribe-node
```

## 🔄 Python Backend vs Node.js Backend

| Feature | Python Backend | Node.js Backend |
|---------|---------------|-----------------|
| Framework | FastAPI | NestJS |
| Language | Python | TypeScript |
| Local Transcription | ✅ PhoWhisper | ❌ Use API |
| API Transcription | ✅ All providers | ✅ OpenAI, AssemblyAI |
| Performance | Good | Excellent |
| Type Safety | Pydantic | TypeScript |

**Recommendation**:
- Use **Python backend** if you need local PhoWhisper transcription
- Use **Node.js backend** if you use API providers and prefer TypeScript

## 📚 Learn More

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [OpenAI API](https://platform.openai.com/docs)
- [AssemblyAI API](https://www.assemblyai.com/docs)

## 🤝 Contributing

Contributions welcome!

## 📄 License

BSD 3-Clause License
