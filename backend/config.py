"""
Configuration settings for Meet Transcribe
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./meet_transcribe.db"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # AI Services
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    # Transcription Configuration
    # Provider options: "local", "openai", "assemblyai", "google"
    TRANSCRIPTION_PROVIDER: str = "local"
    TRANSCRIPTION_LANGUAGE: str = "vi"  # Language code (vi, en, etc.)

    # Local PhoWhisper Configuration (when TRANSCRIPTION_PROVIDER="local")
    WHISPER_MODEL: str = "vinai/PhoWhisper-small"
    DEVICE: str = "cpu"

    # OpenAI Whisper API (when TRANSCRIPTION_PROVIDER="openai")
    # OPENAI_API_KEY is required

    # AssemblyAI API (when TRANSCRIPTION_PROVIDER="assemblyai")
    ASSEMBLYAI_API_KEY: str = ""

    # Google Speech-to-Text (when TRANSCRIPTION_PROVIDER="google")
    GOOGLE_CREDENTIALS_PATH: str = ""

    # File Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 524288000  # 500MB

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
