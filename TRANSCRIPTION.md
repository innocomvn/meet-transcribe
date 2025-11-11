# Transcription Configuration Guide

Meet Transcribe hỗ trợ nhiều phương pháp transcription (chuyển đổi giọng nói thành văn bản), cho phép bạn lựa chọn giữa **local processing** (PhoWhisper) hoặc **cloud APIs** (OpenAI, AssemblyAI, Google).

## 📋 Mục Lục

- [Tổng Quan Providers](#tổng-quan-providers)
- [Local PhoWhisper](#local-phowhisper)
- [OpenAI Whisper API](#openai-whisper-api)
- [AssemblyAI](#assemblyai)
- [Google Speech-to-Text](#google-speech-to-text)
- [So Sánh Providers](#so-sánh-providers)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)

## 🎯 Tổng Quan Providers

| Provider | Ngôn Ngữ | Chi Phí | Tốc Độ | Độ Chính Xác | Privacy |
|----------|----------|---------|---------|--------------|---------|
| **Local (PhoWhisper)** | Tiếng Việt | Miễn phí | Trung bình | Rất tốt (VI) | ⭐⭐⭐⭐⭐ |
| **OpenAI Whisper API** | 50+ ngôn ngữ | $0.006/phút | Nhanh | Xuất sắc | ⭐⭐⭐ |
| **AssemblyAI** | 50+ ngôn ngữ | $0.00025/giây | Nhanh | Rất tốt | ⭐⭐⭐ |
| **Google Speech** | 125+ ngôn ngữ | $0.006/15s | Rất nhanh | Xuất sắc | ⭐⭐⭐ |

## 🏠 Local PhoWhisper

### Ưu Điểm
- ✅ **Miễn phí** - Không có chi phí API
- ✅ **Privacy** - Dữ liệu không rời khỏi server
- ✅ **Offline** - Hoạt động không cần internet
- ✅ **Tối ưu cho tiếng Việt** - Model được train cho tiếng Việt
- ✅ **Không giới hạn** - Không có rate limits

### Nhược Điểm
- ❌ **Tài nguyên** - Cần GPU/CPU và RAM (2-8GB)
- ❌ **Chậm hơn** - Đặc biệt trên CPU
- ❌ **Chỉ tiếng Việt** - Không hỗ trợ ngôn ngữ khác

### Cấu Hình

```env
# .env
TRANSCRIPTION_PROVIDER=local
TRANSCRIPTION_LANGUAGE=vi
WHISPER_MODEL=vinai/PhoWhisper-small
DEVICE=cpu  # hoặc cuda nếu có GPU
```

### Model Options

| Model | Kích Thước | RAM | WER | Tốc Độ |
|-------|-----------|-----|-----|--------|
| `PhoWhisper-tiny` | 39M | ~1GB | 19.05 | ⭐⭐⭐⭐⭐ |
| `PhoWhisper-base` | 74M | ~2GB | 16.19 | ⭐⭐⭐⭐ |
| `PhoWhisper-small` | 244M | ~3GB | 11.08 | ⭐⭐⭐ (khuyến nghị) |
| `PhoWhisper-medium` | 769M | ~6GB | 8.27 | ⭐⭐ |
| `PhoWhisper-large` | 1.55B | ~12GB | 8.14 | ⭐ |

### Với GPU (CUDA)

```env
DEVICE=cuda
WHISPER_MODEL=vinai/PhoWhisper-medium
```

**Yêu cầu:**
- NVIDIA GPU
- CUDA toolkit
- 4-8GB VRAM

Xem [DOCKER.md - GPU Support](DOCKER.md#using-gpu-cuda) để biết cách setup GPU trong Docker.

## ☁️ OpenAI Whisper API

### Ưu Điểm
- ✅ **Nhanh** - Xử lý trên cloud
- ✅ **Multi-language** - Hỗ trợ 50+ ngôn ngữ
- ✅ **Chính xác cao** - Quality từ OpenAI
- ✅ **Không cần tài nguyên** - Không tốn RAM/CPU local
- ✅ **Auto-detect language** - Tự động nhận diện ngôn ngữ

### Nhược Điểm
- ❌ **Chi phí** - $0.006/phút (~$0.36/giờ)
- ❌ **Internet required** - Cần kết nối internet
- ❌ **Privacy** - Audio được gửi lên OpenAI
- ❌ **Rate limits** - 50 requests/phút

### Cấu Hình

#### 1. Lấy API Key

1. Truy cập https://platform.openai.com/api-keys
2. Tạo API key mới
3. Copy key

#### 2. Configure

```env
# .env
TRANSCRIPTION_PROVIDER=openai
TRANSCRIPTION_LANGUAGE=vi  # hoặc en, auto-detect
OPENAI_API_KEY=sk-proj-...your-key...
```

#### 3. Restart Service

```bash
# Docker
make restart

# Manual
cd backend && python main.py
```

### Pricing

```
Chi phí: $0.006 per minute
Ví dụ:
- Meeting 1 giờ: $0.36
- Meeting 2 giờ: $0.72
- 100 giờ/tháng: $36
```

### Supported Languages

Whisper hỗ trợ 50+ ngôn ngữ:
- Vietnamese (vi)
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- ...và nhiều ngôn ngữ khác

## 🎤 AssemblyAI

### Ưu Điểm
- ✅ **Rất nhanh** - Tốc độ cao
- ✅ **Feature-rich** - Nhiều tính năng (speaker diarization, entity detection)
- ✅ **Multi-language** - 50+ ngôn ngữ
- ✅ **Good accuracy** - Độ chính xác tốt
- ✅ **Không cần tài nguyên local**

### Nhược Điểm
- ❌ **Chi phí** - $0.00025/second (~$0.90/giờ)
- ❌ **Internet required**
- ❌ **Setup phức tạp hơn**

### Cấu Hình

#### 1. Lấy API Key

1. Truy cập https://www.assemblyai.com/
2. Sign up và lấy API key
3. Copy key

#### 2. Configure

```env
# .env
TRANSCRIPTION_PROVIDER=assemblyai
TRANSCRIPTION_LANGUAGE=vi
ASSEMBLYAI_API_KEY=your-assemblyai-key
```

### Pricing

```
Chi phí: $0.00025 per second
Ví dụ:
- Meeting 1 giờ (3600s): $0.90
- Meeting 2 giờ: $1.80
- 100 giờ/tháng: $90
```

### Advanced Features (Future)

AssemblyAI hỗ trợ nhiều features nâng cao:
- **Speaker Diarization** - Phân biệt người nói
- **Entity Detection** - Nhận diện entities (tên, địa điểm, etc.)
- **Content Moderation** - Lọc nội dung không phù hợp
- **Topic Detection** - Phát hiện chủ đề
- **Sentiment Analysis** - Phân tích cảm xúc

(Các features này sẽ được implement trong tương lai)

## 🌐 Google Speech-to-Text

### Status
⚠️ **Not Fully Implemented** - Placeholder chỉ

### Ưu Điểm (Khi implemented)
- ✅ **Rất chính xác** - Google quality
- ✅ **125+ ngôn ngữ**
- ✅ **Feature-rich**

### Cấu Hình (Future)

```env
TRANSCRIPTION_PROVIDER=google
GOOGLE_CREDENTIALS_PATH=/path/to/credentials.json
```

## 📊 So Sánh Providers

### Use Case Recommendations

#### 1. Tiếng Việt, Privacy Quan Trọng
→ **Local PhoWhisper**
```env
TRANSCRIPTION_PROVIDER=local
WHISPER_MODEL=vinai/PhoWhisper-small
```

#### 2. Multi-Language, Cần Nhanh
→ **OpenAI Whisper API**
```env
TRANSCRIPTION_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

#### 3. Production, Budget Cao
→ **AssemblyAI** (nhiều features)
```env
TRANSCRIPTION_PROVIDER=assemblyai
ASSEMBLYAI_API_KEY=...
```

#### 4. Development/Testing
→ **Local PhoWhisper-tiny** (nhanh, ít tài nguyên)
```env
TRANSCRIPTION_PROVIDER=local
WHISPER_MODEL=vinai/PhoWhisper-tiny
```

### Performance Comparison

| Scenario | Provider | Setup | Cost/Hour | Speed | Accuracy |
|----------|----------|-------|-----------|-------|----------|
| **Dev** | Local-tiny | Simple | $0 | Fast | Good |
| **Production (VI)** | Local-small | Moderate | $0 | Medium | Excellent |
| **Production (EN)** | OpenAI | Easy | $0.36 | Fast | Excellent |
| **Enterprise** | AssemblyAI | Easy | $0.90 | Very Fast | Excellent |

## ⚙️ Configuration

### Environment Variables

```env
# Provider Selection
TRANSCRIPTION_PROVIDER=local|openai|assemblyai|google

# Language
TRANSCRIPTION_LANGUAGE=vi|en|es|fr|de|...

# Local PhoWhisper
WHISPER_MODEL=vinai/PhoWhisper-small
DEVICE=cpu|cuda

# OpenAI
OPENAI_API_KEY=sk-...

# AssemblyAI
ASSEMBLYAI_API_KEY=...

# Google
GOOGLE_CREDENTIALS_PATH=/path/to/creds.json
```

### Docker Configuration

#### docker-compose.yml
```yaml
services:
  backend:
    environment:
      - TRANSCRIPTION_PROVIDER=openai
      - OPENAI_API_KEY=${OPENAI_API_KEY}
```

#### .env
```env
OPENAI_API_KEY=sk-...
```

### Runtime Change

**Cách 1: Environment Variable**
```bash
# Change .env
TRANSCRIPTION_PROVIDER=openai

# Restart
make restart
```

**Cách 2: Docker Compose Override**
```bash
docker-compose up -d backend -e TRANSCRIPTION_PROVIDER=openai
```

## 🔌 API Endpoints

### Get Current Provider

```bash
GET /api/system/transcription/provider
```

Response:
```json
{
  "provider": "local",
  "language": "vi",
  "status": "active",
  "model": "vinai/PhoWhisper-small",
  "device": "cpu"
}
```

### List Available Providers

```bash
GET /api/system/transcription/providers
```

Response:
```json
{
  "providers": [
    {
      "id": "local",
      "name": "Local PhoWhisper",
      "description": "Vietnamese ASR model running locally",
      "languages": ["vi"],
      "requires": ["GPU/CPU", "RAM"],
      "pros": ["Privacy", "Offline", "No API costs"],
      "cons": ["Requires resources", "Slower on CPU"]
    },
    {
      "id": "openai",
      "name": "OpenAI Whisper API",
      ...
    }
  ]
}
```

### System Info

```bash
GET /api/system/info
```

Response:
```json
{
  "version": "1.0.0",
  "debug": true,
  "transcription": {
    "provider": "local",
    "language": "vi",
    "model": "vinai/PhoWhisper-small",
    "device": "cpu",
    "cuda_available": false
  }
}
```

## 🔍 Testing & Debugging

### Test Provider Setup

```bash
# Check API
curl http://localhost:8000/api/system/transcription/provider

# Check logs
docker-compose logs backend | grep -i transcription
# hoặc
tail -f meet_transcribe.log | grep -i transcription
```

### Common Issues

#### 1. OpenAI API Key Invalid

**Error:**
```
ValueError: OPENAI_API_KEY not set in environment
```

**Solution:**
```bash
# Check .env
cat .env | grep OPENAI

# Set properly
OPENAI_API_KEY=sk-proj-...
```

#### 2. Local Model Out of Memory

**Error:**
```
RuntimeError: CUDA out of memory
```

**Solution:**
```env
# Use smaller model
WHISPER_MODEL=vinai/PhoWhisper-tiny

# Or use CPU
DEVICE=cpu
```

#### 3. AssemblyAI Timeout

**Error:**
```
AssemblyAI transcription timeout
```

**Solution:**
- Check internet connection
- Verify API key
- Check AssemblyAI status: https://status.assemblyai.com/

## 💡 Best Practices

### 1. Development
```env
TRANSCRIPTION_PROVIDER=local
WHISPER_MODEL=vinai/PhoWhisper-tiny
DEVICE=cpu
```
- Nhanh, ít tài nguyên
- Miễn phí
- Good enough cho testing

### 2. Production (Vietnamese)
```env
TRANSCRIPTION_PROVIDER=local
WHISPER_MODEL=vinai/PhoWhisper-small
DEVICE=cuda  # nếu có GPU
```
- Best accuracy cho tiếng Việt
- Privacy
- No API costs

### 3. Production (Multi-language)
```env
TRANSCRIPTION_PROVIDER=openai
OPENAI_API_KEY=sk-...
TRANSCRIPTION_LANGUAGE=auto
```
- Multi-language support
- Fast and accurate
- Cost: $0.36/hour

### 4. Enterprise
```env
TRANSCRIPTION_PROVIDER=assemblyai
ASSEMBLYAI_API_KEY=...
```
- Advanced features
- Very fast
- Best for scale

## 📚 Additional Resources

- [OpenAI Whisper API Docs](https://platform.openai.com/docs/guides/speech-to-text)
- [AssemblyAI Docs](https://www.assemblyai.com/docs)
- [PhoWhisper Paper](https://openreview.net/pdf?id=qsif2awK2L)
- [Google Speech-to-Text](https://cloud.google.com/speech-to-text)

## 🆘 Support

Nếu gặp vấn đề:

1. Check logs: `make logs-backend`
2. Check provider: `curl http://localhost:8000/api/system/transcription/provider`
3. Test API endpoint: Visit http://localhost:8000/docs
4. Check environment: `cat .env | grep TRANSCRIPTION`
5. Open GitHub issue

---

**Lưu ý:** Chi phí API có thể thay đổi. Kiểm tra pricing tại trang chủ của từng provider.
