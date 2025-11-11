"""
System and configuration API endpoints
"""

from fastapi import APIRouter, Depends
from typing import Dict, Any

router = APIRouter()


@router.get("/transcription/provider")
async def get_transcription_provider() -> Dict[str, Any]:
    """Get information about the current transcription provider"""
    from main import transcription_service

    if transcription_service:
        return transcription_service.get_provider_info()
    else:
        return {
            "provider": "unknown",
            "status": "not_initialized"
        }


@router.get("/transcription/providers")
async def list_transcription_providers() -> Dict[str, Any]:
    """List all available transcription providers"""
    return {
        "providers": [
            {
                "id": "local",
                "name": "Local PhoWhisper",
                "description": "Vietnamese ASR model running locally",
                "languages": ["vi"],
                "requires": ["GPU/CPU", "RAM (2-8GB depending on model)"],
                "pros": ["Privacy", "Offline", "No API costs"],
                "cons": ["Requires resources", "Slower on CPU"]
            },
            {
                "id": "openai",
                "name": "OpenAI Whisper API",
                "description": "Cloud-based Whisper API from OpenAI",
                "languages": ["vi", "en", "multilingual"],
                "requires": ["OPENAI_API_KEY"],
                "pros": ["Fast", "Accurate", "Multi-language", "No local resources"],
                "cons": ["API costs", "Requires internet", "Privacy concerns"]
            },
            {
                "id": "assemblyai",
                "name": "AssemblyAI",
                "description": "Cloud-based speech recognition API",
                "languages": ["vi", "en", "multilingual"],
                "requires": ["ASSEMBLYAI_API_KEY"],
                "pros": ["Fast", "Feature-rich", "Good accuracy"],
                "cons": ["API costs", "Requires internet"]
            },
            {
                "id": "google",
                "name": "Google Speech-to-Text",
                "description": "Google Cloud Speech API",
                "languages": ["vi", "en", "multilingual"],
                "requires": ["GOOGLE_CREDENTIALS_PATH"],
                "pros": ["Very accurate", "Multi-language", "Google quality"],
                "cons": ["API costs", "Complex setup", "Not fully implemented"]
            }
        ],
        "current": None  # Will be filled by get_transcription_provider
    }


@router.get("/system/info")
async def get_system_info() -> Dict[str, Any]:
    """Get system information"""
    from config import settings
    import torch

    info = {
        "version": "1.0.0",
        "debug": settings.DEBUG,
        "transcription": {
            "provider": settings.TRANSCRIPTION_PROVIDER,
            "language": settings.TRANSCRIPTION_LANGUAGE
        }
    }

    # Add local model info if using local
    if settings.TRANSCRIPTION_PROVIDER == "local":
        info["transcription"]["model"] = settings.WHISPER_MODEL
        info["transcription"]["device"] = settings.DEVICE
        info["transcription"]["cuda_available"] = torch.cuda.is_available()

    return info
