"""
Transcription service using PhoWhisper for Vietnamese speech recognition
"""

import logging
import torch
import torchaudio
from transformers import pipeline
import numpy as np
import io
import base64
from typing import Optional
import asyncio

from config import settings

logger = logging.getLogger(__name__)


class TranscriptionService:
    """Service for transcribing audio using PhoWhisper"""

    def __init__(self):
        self.model = None
        self.device = settings.DEVICE
        self.model_name = settings.WHISPER_MODEL
        self.sample_rate = 16000
        self.buffer = {}  # Store audio buffers per meeting

    async def initialize(self):
        """Initialize the transcription model"""
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
            logger.error(f"Failed to initialize transcription model: {str(e)}")
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
        if not self.model:
            logger.warning("Transcription model not initialized")
            return None

        try:
            # Decode base64 audio data
            audio_bytes = base64.b64decode(audio_data)

            # Convert to numpy array
            audio_array = np.frombuffer(audio_bytes, dtype=np.int16)

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
                logger.info(f"Transcribed text for meeting {meeting_id}: {text[:50]}...")
                return text

            return None

        except Exception as e:
            logger.error(f"Error transcribing audio chunk: {str(e)}")
            return None

    async def transcribe_file(self, file_path: str) -> Optional[dict]:
        """
        Transcribe an audio file

        Args:
            file_path: Path to audio file

        Returns:
            Dictionary with transcription result
        """
        if not self.model:
            logger.warning("Transcription model not initialized")
            return None

        try:
            logger.info(f"Transcribing file: {file_path}")

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

            logger.info(f"File transcription complete: {file_path}")
            return result

        except Exception as e:
            logger.error(f"Error transcribing file: {str(e)}")
            return None

    async def cleanup(self):
        """Cleanup resources"""
        logger.info("Cleaning up transcription service")
        self.model = None
        self.buffer.clear()
