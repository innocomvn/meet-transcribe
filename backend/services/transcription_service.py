"""
Transcription service with support for local (PhoWhisper) and API-based providers
"""

import logging
import torch
import torchaudio
from transformers import pipeline
import numpy as np
import io
import base64
from typing import Optional, Dict, Any
import asyncio

from config import settings
from services.transcription_providers import (
    OpenAIWhisperProvider,
    AssemblyAIProvider,
    GoogleSpeechProvider
)

logger = logging.getLogger(__name__)


class LocalPhoWhisperProvider:
    """Local PhoWhisper model provider"""

    def __init__(self, model_name: str, device: str):
        self.model = None
        self.device = device
        self.model_name = model_name
        self.sample_rate = 16000

    async def initialize(self):
        """Initialize the PhoWhisper model"""
        try:
            logger.info(f"Initializing PhoWhisper model: {self.model_name}")

            # Load model in a separate thread to avoid blocking
            loop = asyncio.get_event_loop()
            self.model = await loop.run_in_executor(
                None,
                lambda: pipeline(
                    "automatic-speech-recognition",
                    model=self.model_name,
                    device=0 if self.device == "cuda" and torch.cuda.is_available() else -1
                )
            )

            logger.info("PhoWhisper model initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize PhoWhisper model: {str(e)}")
            raise

    async def transcribe_chunk(self, audio_data: bytes, language: str = "vi") -> Optional[str]:
        """Transcribe audio chunk using local model"""
        if not self.model:
            logger.warning("PhoWhisper model not initialized")
            return None

        try:
            # Convert to numpy array
            audio_array = np.frombuffer(audio_data, dtype=np.int16)

            # Convert to float32 and normalize
            audio_float = audio_array.astype(np.float32) / 32768.0

            # Skip if audio is too short
            if len(audio_float) < self.sample_rate * 0.5:  # Less than 0.5 seconds
                return None

            # Transcribe in a separate thread
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: self.model(audio_float, return_timestamps=False)
            )

            text = result['text'].strip()

            if text:
                logger.info(f"PhoWhisper transcription: {text[:50]}...")
                return text

            return None

        except Exception as e:
            logger.error(f"Error in PhoWhisper transcription: {str(e)}")
            return None

    async def transcribe_file(self, file_path: str, language: str = "vi") -> Optional[Dict[str, Any]]:
        """Transcribe audio file using local model"""
        if not self.model:
            logger.warning("PhoWhisper model not initialized")
            return None

        try:
            logger.info(f"Transcribing file with PhoWhisper: {file_path}")

            # Load audio file
            waveform, sample_rate = torchaudio.load(file_path)

            # Resample if needed
            if sample_rate != self.sample_rate:
                resampler = torchaudio.transforms.Resample(
                    orig_freq=sample_rate,
                    new_freq=self.sample_rate
                )
                waveform = resampler(waveform)

            # Convert to mono if stereo
            if waveform.shape[0] > 1:
                waveform = torch.mean(waveform, dim=0, keepdim=True)

            # Convert to numpy array
            audio_array = waveform.squeeze().numpy()

            # Transcribe in a separate thread
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: self.model(audio_array, return_timestamps=True)
            )

            logger.info(f"PhoWhisper file transcription complete: {file_path}")
            return result

        except Exception as e:
            logger.error(f"Error in PhoWhisper file transcription: {str(e)}")
            return None

    async def cleanup(self):
        """Cleanup resources"""
        logger.info("Cleaning up PhoWhisper model")
        self.model = None


class TranscriptionService:
    """
    Unified transcription service supporting multiple providers:
    - local: PhoWhisper (Vietnamese ASR model)
    - openai: OpenAI Whisper API
    - assemblyai: AssemblyAI
    - google: Google Speech-to-Text (future)
    """

    def __init__(self):
        self.provider_type = settings.TRANSCRIPTION_PROVIDER
        self.provider = None
        self.buffer = {}  # Store audio buffers per meeting
        self.language = settings.TRANSCRIPTION_LANGUAGE

    async def initialize(self):
        """Initialize the selected transcription provider"""
        try:
            logger.info(f"Initializing transcription provider: {self.provider_type}")

            if self.provider_type == "local":
                # Local PhoWhisper
                self.provider = LocalPhoWhisperProvider(
                    model_name=settings.WHISPER_MODEL,
                    device=settings.DEVICE
                )
                await self.provider.initialize()

            elif self.provider_type == "openai":
                # OpenAI Whisper API
                if not settings.OPENAI_API_KEY:
                    raise ValueError("OPENAI_API_KEY not set in environment")
                self.provider = OpenAIWhisperProvider(api_key=settings.OPENAI_API_KEY)
                logger.info("OpenAI Whisper API provider initialized")

            elif self.provider_type == "assemblyai":
                # AssemblyAI
                if not settings.ASSEMBLYAI_API_KEY:
                    raise ValueError("ASSEMBLYAI_API_KEY not set in environment")
                self.provider = AssemblyAIProvider(api_key=settings.ASSEMBLYAI_API_KEY)
                logger.info("AssemblyAI provider initialized")

            elif self.provider_type == "google":
                # Google Speech-to-Text
                if not settings.GOOGLE_CREDENTIALS_PATH:
                    raise ValueError("GOOGLE_CREDENTIALS_PATH not set in environment")
                self.provider = GoogleSpeechProvider(
                    credentials_path=settings.GOOGLE_CREDENTIALS_PATH
                )
                logger.info("Google Speech provider initialized (not fully implemented)")

            else:
                raise ValueError(f"Unknown transcription provider: {self.provider_type}")

            logger.info(f"Transcription service initialized with provider: {self.provider_type}")

        except Exception as e:
            logger.error(f"Failed to initialize transcription service: {str(e)}")
            raise

    async def transcribe_chunk(self, audio_data: str, meeting_id: str) -> Optional[str]:
        """
        Transcribe an audio chunk

        Args:
            audio_data: Base64 encoded audio data
            meeting_id: Meeting ID for buffering

        Returns:
            Transcribed text or None if transcription failed
        """
        if not self.provider:
            logger.warning("Transcription provider not initialized")
            return None

        try:
            # Decode base64 audio data
            audio_bytes = base64.b64decode(audio_data)

            # Use the provider to transcribe
            text = await self.provider.transcribe_chunk(audio_bytes, language=self.language)

            if text:
                logger.info(f"Transcribed text for meeting {meeting_id}: {text[:50]}...")
                return text

            return None

        except Exception as e:
            logger.error(f"Error transcribing audio chunk: {str(e)}")
            return None

    async def transcribe_file(self, file_path: str, language: str = None) -> Optional[Dict[str, Any]]:
        """
        Transcribe an audio file

        Args:
            file_path: Path to audio file
            language: Language code (overrides default)

        Returns:
            Dictionary with transcription result
        """
        if not self.provider:
            logger.warning("Transcription provider not initialized")
            return None

        try:
            lang = language or self.language
            logger.info(f"Transcribing file: {file_path} with language: {lang}")

            result = await self.provider.transcribe_file(file_path, language=lang)

            if result:
                logger.info(f"File transcription complete: {file_path}")

            return result

        except Exception as e:
            logger.error(f"Error transcribing file: {str(e)}")
            return None

    def get_provider_info(self) -> Dict[str, Any]:
        """Get information about the current provider"""
        info = {
            "provider": self.provider_type,
            "language": self.language,
            "status": "active" if self.provider else "inactive"
        }

        if self.provider_type == "local" and hasattr(self.provider, 'model_name'):
            info["model"] = self.provider.model_name
            info["device"] = self.provider.device

        return info

    async def cleanup(self):
        """Cleanup resources"""
        logger.info("Cleaning up transcription service")

        if self.provider and hasattr(self.provider, 'cleanup'):
            await self.provider.cleanup()

        self.provider = None
        self.buffer.clear()
