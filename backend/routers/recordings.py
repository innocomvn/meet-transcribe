"""
Recording management API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from pydantic import BaseModel
from datetime import datetime
import os
import aiofiles

from database import get_db, Recording
from config import settings

router = APIRouter()


class RecordingResponse(BaseModel):
    """Recording response schema"""
    id: int
    meeting_id: str
    file_path: str
    file_name: str
    file_size: int
    duration: float | None
    format: str
    type: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/upload/{meeting_id}", response_model=RecordingResponse)
async def upload_recording(
    meeting_id: str,
    file: UploadFile = File(...),
    recording_type: str = "screen",
    db: AsyncSession = Depends(get_db)
):
    """Upload a recording file"""

    # Validate file size
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE} bytes"
        )

    # Create directory if not exists
    recording_dir = os.path.join(settings.UPLOAD_DIR, "recordings", meeting_id)
    os.makedirs(recording_dir, exist_ok=True)

    # Generate unique filename
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"{recording_type}_{timestamp}{file_extension}"
    file_path = os.path.join(recording_dir, file_name)

    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)

    # Create recording record
    recording = Recording(
        meeting_id=meeting_id,
        file_path=file_path,
        file_name=file_name,
        file_size=file_size,
        format=file_extension.lstrip('.'),
        type=recording_type
    )

    db.add(recording)
    await db.commit()
    await db.refresh(recording)

    return recording


@router.get("/meeting/{meeting_id}", response_model=List[RecordingResponse])
async def get_meeting_recordings(
    meeting_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get all recordings for a meeting"""
    result = await db.execute(
        select(Recording).where(Recording.meeting_id == meeting_id)
    )
    recordings = result.scalars().all()
    return recordings


@router.get("/{recording_id}", response_model=RecordingResponse)
async def get_recording(
    recording_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific recording"""
    result = await db.execute(
        select(Recording).where(Recording.id == recording_id)
    )
    recording = result.scalar_one_or_none()

    if not recording:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recording not found"
        )

    return recording


@router.get("/{recording_id}/download")
async def download_recording(
    recording_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Download a recording file"""
    result = await db.execute(
        select(Recording).where(Recording.id == recording_id)
    )
    recording = result.scalar_one_or_none()

    if not recording:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recording not found"
        )

    if not os.path.exists(recording.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recording file not found"
        )

    return FileResponse(
        path=recording.file_path,
        filename=recording.file_name,
        media_type="application/octet-stream"
    )


@router.delete("/{recording_id}")
async def delete_recording(
    recording_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a recording"""
    result = await db.execute(
        select(Recording).where(Recording.id == recording_id)
    )
    recording = result.scalar_one_or_none()

    if not recording:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recording not found"
        )

    # Delete file
    if os.path.exists(recording.file_path):
        os.remove(recording.file_path)

    # Delete database record
    await db.delete(recording)
    await db.commit()

    return {"message": "Recording deleted", "recording_id": recording_id}
