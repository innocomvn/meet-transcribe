"""
Main FastAPI application for Meet Transcribe
Video meeting app with recording and transcription
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn
import os
from datetime import datetime
from typing import List, Optional
import json
import logging

from config import settings
from database import engine, Base, get_db
from routers import meetings, recordings, transcriptions, minutes
from services.websocket_manager import ConnectionManager
from services.transcription_service import TranscriptionService

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('meet_transcribe.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Global instances
manager = ConnectionManager()
transcription_service = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for the application"""
    global transcription_service

    # Startup
    logger.info("Starting Meet Transcribe application...")

    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Create upload directories
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "recordings"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "transcripts"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "minutes"), exist_ok=True)

    # Initialize transcription service
    transcription_service = TranscriptionService()
    await transcription_service.initialize()

    logger.info("Application startup complete")

    yield

    # Shutdown
    logger.info("Shutting down Meet Transcribe application...")
    if transcription_service:
        await transcription_service.cleanup()
    logger.info("Application shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="Meet Transcribe",
    description="Video meeting app with recording, transcription, and meeting minutes generation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(meetings.router, prefix="/api/meetings", tags=["meetings"])
app.include_router(recordings.router, prefix="/api/recordings", tags=["recordings"])
app.include_router(transcriptions.router, prefix="/api/transcriptions", tags=["transcriptions"])
app.include_router(minutes.router, prefix="/api/minutes", tags=["minutes"])

# Mount static files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Meet Transcribe API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "meet-transcribe"
    }


@app.websocket("/ws/{meeting_id}")
async def websocket_endpoint(websocket: WebSocket, meeting_id: str):
    """
    WebSocket endpoint for real-time communication during meetings
    Handles video/audio streaming, transcription, and signaling
    """
    await manager.connect(websocket, meeting_id)
    logger.info(f"Client connected to meeting {meeting_id}")

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            message_type = message.get("type")

            if message_type == "audio_chunk":
                # Process audio for transcription
                audio_data = message.get("audio")
                if audio_data and transcription_service:
                    transcript = await transcription_service.transcribe_chunk(
                        audio_data,
                        meeting_id
                    )
                    if transcript:
                        # Broadcast transcript to all participants
                        await manager.broadcast(meeting_id, {
                            "type": "transcript",
                            "text": transcript,
                            "timestamp": datetime.utcnow().isoformat(),
                            "meeting_id": meeting_id
                        })

            elif message_type == "signaling":
                # WebRTC signaling (offer/answer/ice candidates)
                await manager.broadcast(meeting_id, message, exclude=websocket)

            elif message_type == "chat":
                # Chat message
                await manager.broadcast(meeting_id, {
                    "type": "chat",
                    "message": message.get("message"),
                    "sender": message.get("sender"),
                    "timestamp": datetime.utcnow().isoformat()
                })

            elif message_type == "recording_control":
                # Recording start/stop control
                action = message.get("action")
                await manager.broadcast(meeting_id, {
                    "type": "recording_status",
                    "action": action,
                    "timestamp": datetime.utcnow().isoformat()
                })

            else:
                # Broadcast other messages to all participants
                await manager.broadcast(meeting_id, message, exclude=websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket, meeting_id)
        logger.info(f"Client disconnected from meeting {meeting_id}")
        await manager.broadcast(meeting_id, {
            "type": "user_left",
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"WebSocket error in meeting {meeting_id}: {str(e)}")
        manager.disconnect(websocket, meeting_id)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
