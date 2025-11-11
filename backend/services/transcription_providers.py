"""
API-based transcription providers
"""

import logging
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import asyncio
import base64
import io
import httpx

logger = logging.getLogger(__name__)


class TranscriptionProvider(ABC):
    """Base class for transcription providers"""

    @abstractmethod
    async def transcribe_audio_chunk(self, audio_data: bytes, language: str = "vi") -> Optional[str]:
        """Transcribe audio chunk"""
        pass

    @abstractmethod
    async def transcribe_file(self, file_path: str, language: str = "vi") -> Optional[Dict[str, Any]]:
        """Transcribe audio file"""
        pass


class OpenAIWhisperProvider(TranscriptionProvider):
    """OpenAI Whisper API provider"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = "https://api.openai.com/v1/audio/transcriptions"
        self.model = "whisper-1"

    async def transcribe_audio_chunk(self, audio_data: bytes, language: str = "vi") -> Optional[str]:
        """Transcribe audio chunk using OpenAI Whisper API"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                files = {
                    'file': ('audio.wav', audio_data, 'audio/wav'),
                    'model': (None, self.model),
                    'language': (None, language if language != "vi" else "vi"),
                    'response_format': (None, 'text')
                }

                headers = {
                    'Authorization': f'Bearer {self.api_key}'
                }

                response = await client.post(
                    self.api_url,
                    files=files,
                    headers=headers
                )

                if response.status_code == 200:
                    text = response.text.strip()
                    logger.info(f"OpenAI transcription: {text[:50]}...")
                    return text
                else:
                    logger.error(f"OpenAI API error: {response.status_code} - {response.text}")
                    return None

        except Exception as e:
            logger.error(f"Error in OpenAI transcription: {str(e)}")
            return None

    async def transcribe_file(self, file_path: str, language: str = "vi") -> Optional[Dict[str, Any]]:
        """Transcribe audio file using OpenAI Whisper API"""
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                with open(file_path, 'rb') as audio_file:
                    files = {
                        'file': (file_path, audio_file, 'audio/wav'),
                        'model': (None, self.model),
                        'language': (None, language if language != "vi" else "vi"),
                        'response_format': (None, 'verbose_json'),
                        'timestamp_granularities': (None, 'segment')
                    }

                    headers = {
                        'Authorization': f'Bearer {self.api_key}'
                    }

                    response = await client.post(
                        self.api_url,
                        files=files,
                        headers=headers
                    )

                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"OpenAI file transcription complete: {file_path}")
                    return result
                else:
                    logger.error(f"OpenAI API error: {response.status_code} - {response.text}")
                    return None

        except Exception as e:
            logger.error(f"Error in OpenAI file transcription: {str(e)}")
            return None


class AssemblyAIProvider(TranscriptionProvider):
    """AssemblyAI transcription provider"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.upload_url = "https://api.assemblyai.com/v2/upload"
        self.transcript_url = "https://api.assemblyai.com/v2/transcript"

    async def transcribe_audio_chunk(self, audio_data: bytes, language: str = "vi") -> Optional[str]:
        """
        AssemblyAI doesn't support real-time chunk transcription in the same way
        This method uploads and transcribes the chunk
        """
        try:
            # Upload audio
            upload_response = await self._upload_audio(audio_data)
            if not upload_response:
                return None

            upload_url = upload_response.get('upload_url')

            # Create transcription
            async with httpx.AsyncClient(timeout=60.0) as client:
                headers = {
                    'authorization': self.api_key,
                    'content-type': 'application/json'
                }

                data = {
                    'audio_url': upload_url,
                    'language_code': 'vi' if language == 'vi' else 'en'
                }

                response = await client.post(
                    self.transcript_url,
                    json=data,
                    headers=headers
                )

                if response.status_code == 200:
                    transcript_id = response.json()['id']

                    # Poll for completion
                    text = await self._poll_transcript(transcript_id)
                    if text:
                        logger.info(f"AssemblyAI transcription: {text[:50]}...")
                    return text
                else:
                    logger.error(f"AssemblyAI API error: {response.status_code}")
                    return None

        except Exception as e:
            logger.error(f"Error in AssemblyAI transcription: {str(e)}")
            return None

    async def transcribe_file(self, file_path: str, language: str = "vi") -> Optional[Dict[str, Any]]:
        """Transcribe audio file using AssemblyAI"""
        try:
            # Upload file
            with open(file_path, 'rb') as f:
                audio_data = f.read()

            upload_response = await self._upload_audio(audio_data)
            if not upload_response:
                return None

            upload_url = upload_response.get('upload_url')

            # Create transcription with more options
            async with httpx.AsyncClient(timeout=120.0) as client:
                headers = {
                    'authorization': self.api_key,
                    'content-type': 'application/json'
                }

                data = {
                    'audio_url': upload_url,
                    'language_code': 'vi' if language == 'vi' else 'en',
                    'punctuate': True,
                    'format_text': True,
                }

                response = await client.post(
                    self.transcript_url,
                    json=data,
                    headers=headers
                )

                if response.status_code == 200:
                    transcript_id = response.json()['id']

                    # Poll for completion and get full result
                    result = await self._poll_transcript_full(transcript_id)
                    if result:
                        logger.info(f"AssemblyAI file transcription complete: {file_path}")
                    return result
                else:
                    logger.error(f"AssemblyAI API error: {response.status_code}")
                    return None

        except Exception as e:
            logger.error(f"Error in AssemblyAI file transcription: {str(e)}")
            return None

    async def _upload_audio(self, audio_data: bytes) -> Optional[Dict[str, Any]]:
        """Upload audio to AssemblyAI"""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                headers = {
                    'authorization': self.api_key
                }

                response = await client.post(
                    self.upload_url,
                    content=audio_data,
                    headers=headers
                )

                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"AssemblyAI upload error: {response.status_code}")
                    return None

        except Exception as e:
            logger.error(f"Error uploading to AssemblyAI: {str(e)}")
            return None

    async def _poll_transcript(self, transcript_id: str, max_attempts: int = 30) -> Optional[str]:
        """Poll for transcript completion and return text"""
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    'authorization': self.api_key
                }

                for _ in range(max_attempts):
                    response = await client.get(
                        f"{self.transcript_url}/{transcript_id}",
                        headers=headers
                    )

                    if response.status_code == 200:
                        result = response.json()
                        status = result['status']

                        if status == 'completed':
                            return result.get('text')
                        elif status == 'error':
                            logger.error(f"AssemblyAI transcription error: {result.get('error')}")
                            return None

                    await asyncio.sleep(2)

                logger.error("AssemblyAI transcription timeout")
                return None

        except Exception as e:
            logger.error(f"Error polling AssemblyAI: {str(e)}")
            return None

    async def _poll_transcript_full(self, transcript_id: str, max_attempts: int = 60) -> Optional[Dict[str, Any]]:
        """Poll for transcript completion and return full result"""
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    'authorization': self.api_key
                }

                for _ in range(max_attempts):
                    response = await client.get(
                        f"{self.transcript_url}/{transcript_id}",
                        headers=headers
                    )

                    if response.status_code == 200:
                        result = response.json()
                        status = result['status']

                        if status == 'completed':
                            return result
                        elif status == 'error':
                            logger.error(f"AssemblyAI transcription error: {result.get('error')}")
                            return None

                    await asyncio.sleep(2)

                logger.error("AssemblyAI transcription timeout")
                return None

        except Exception as e:
            logger.error(f"Error polling AssemblyAI: {str(e)}")
            return None


class GoogleSpeechProvider(TranscriptionProvider):
    """Google Speech-to-Text provider (placeholder for future implementation)"""

    def __init__(self, credentials_path: str):
        self.credentials_path = credentials_path
        logger.warning("Google Speech provider not fully implemented yet")

    async def transcribe_audio_chunk(self, audio_data: bytes, language: str = "vi") -> Optional[str]:
        logger.warning("Google Speech transcription not implemented")
        return None

    async def transcribe_file(self, file_path: str, language: str = "vi") -> Optional[Dict[str, Any]]:
        logger.warning("Google Speech file transcription not implemented")
        return None
