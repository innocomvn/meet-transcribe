"""
Meeting minutes generation API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import os

from database import get_db, MeetingMinutes, Transcript, Meeting
from services.minutes_generator import MinutesGenerator

router = APIRouter()
minutes_generator = MinutesGenerator()


class MinutesResponse(BaseModel):
    """Meeting minutes response schema"""
    id: int
    meeting_id: str
    summary: str
    key_points: dict | None
    action_items: dict | None
    decisions: dict | None
    participants: dict | None
    file_path: str | None
    format: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.post("/{meeting_id}", response_model=MinutesResponse, status_code=status.HTTP_201_CREATED)
async def generate_minutes(
    meeting_id: str,
    format: str = "pdf",
    db: AsyncSession = Depends(get_db)
):
    """Generate meeting minutes for a meeting"""

    # Get meeting
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id)
    )
    meeting = meeting_result.scalar_one_or_none()

    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )

    # Get transcripts
    transcript_result = await db.execute(
        select(Transcript)
        .where(Transcript.meeting_id == meeting_id)
        .order_by(Transcript.timestamp.asc())
    )
    transcripts = transcript_result.scalars().all()

    if not transcripts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No transcripts found for this meeting"
        )

    # Check if minutes already exist
    existing_result = await db.execute(
        select(MeetingMinutes).where(MeetingMinutes.meeting_id == meeting_id)
    )
    existing_minutes = existing_result.scalar_one_or_none()

    # Generate minutes
    minutes_data = await minutes_generator.generate(
        meeting=meeting,
        transcripts=transcripts,
        format=format
    )

    if existing_minutes:
        # Update existing
        existing_minutes.summary = minutes_data["summary"]
        existing_minutes.key_points = minutes_data.get("key_points")
        existing_minutes.action_items = minutes_data.get("action_items")
        existing_minutes.decisions = minutes_data.get("decisions")
        existing_minutes.participants = minutes_data.get("participants")
        existing_minutes.file_path = minutes_data.get("file_path")
        existing_minutes.format = format
        existing_minutes.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(existing_minutes)
        return existing_minutes
    else:
        # Create new
        new_minutes = MeetingMinutes(
            meeting_id=meeting_id,
            summary=minutes_data["summary"],
            key_points=minutes_data.get("key_points"),
            action_items=minutes_data.get("action_items"),
            decisions=minutes_data.get("decisions"),
            participants=minutes_data.get("participants"),
            file_path=minutes_data.get("file_path"),
            format=format
        )

        db.add(new_minutes)
        await db.commit()
        await db.refresh(new_minutes)
        return new_minutes


@router.get("/{meeting_id}", response_model=MinutesResponse)
async def get_minutes(
    meeting_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get meeting minutes for a meeting"""
    result = await db.execute(
        select(MeetingMinutes).where(MeetingMinutes.meeting_id == meeting_id)
    )
    minutes = result.scalar_one_or_none()

    if not minutes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting minutes not found"
        )

    return minutes


@router.get("/{meeting_id}/download")
async def download_minutes(
    meeting_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Download meeting minutes file"""
    result = await db.execute(
        select(MeetingMinutes).where(MeetingMinutes.meeting_id == meeting_id)
    )
    minutes = result.scalar_one_or_none()

    if not minutes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting minutes not found"
        )

    if not minutes.file_path or not os.path.exists(minutes.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting minutes file not found"
        )

    return FileResponse(
        path=minutes.file_path,
        filename=f"meeting_minutes_{meeting_id}.{minutes.format}",
        media_type="application/octet-stream"
    )


@router.delete("/{meeting_id}")
async def delete_minutes(
    meeting_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete meeting minutes"""
    result = await db.execute(
        select(MeetingMinutes).where(MeetingMinutes.meeting_id == meeting_id)
    )
    minutes = result.scalar_one_or_none()

    if not minutes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting minutes not found"
        )

    # Delete file if exists
    if minutes.file_path and os.path.exists(minutes.file_path):
        os.remove(minutes.file_path)

    await db.delete(minutes)
    await db.commit()

    return {"message": "Meeting minutes deleted", "meeting_id": meeting_id}
