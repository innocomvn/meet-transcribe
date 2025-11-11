"""
Meeting management API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from database import get_db, Meeting

router = APIRouter()


class MeetingCreate(BaseModel):
    """Meeting creation schema"""
    title: str
    description: Optional[str] = None
    host_name: str
    settings: Optional[dict] = None


class MeetingResponse(BaseModel):
    """Meeting response schema"""
    id: str
    title: str
    description: Optional[str]
    host_name: str
    status: str
    start_time: datetime
    end_time: Optional[datetime]
    participants: Optional[dict]
    settings: Optional[dict]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.post("/", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
async def create_meeting(
    meeting: MeetingCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new meeting"""
    meeting_id = str(uuid.uuid4())

    new_meeting = Meeting(
        id=meeting_id,
        title=meeting.title,
        description=meeting.description,
        host_name=meeting.host_name,
        status="scheduled",
        settings=meeting.settings or {},
        participants={}
    )

    db.add(new_meeting)
    await db.commit()
    await db.refresh(new_meeting)

    return new_meeting


@router.get("/", response_model=List[MeetingResponse])
async def list_meetings(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List all meetings"""
    result = await db.execute(
        select(Meeting).offset(skip).limit(limit).order_by(Meeting.created_at.desc())
    )
    meetings = result.scalars().all()
    return meetings


@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific meeting"""
    result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id)
    )
    meeting = result.scalar_one_or_none()

    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )

    return meeting


@router.patch("/{meeting_id}/start")
async def start_meeting(
    meeting_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Start a meeting"""
    result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id)
    )
    meeting = result.scalar_one_or_none()

    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )

    meeting.status = "active"
    meeting.start_time = datetime.utcnow()
    await db.commit()

    return {"message": "Meeting started", "meeting_id": meeting_id}


@router.patch("/{meeting_id}/end")
async def end_meeting(
    meeting_id: str,
    db: AsyncSession = Depends(get_db)
):
    """End a meeting"""
    result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id)
    )
    meeting = result.scalar_one_or_none()

    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )

    meeting.status = "ended"
    meeting.end_time = datetime.utcnow()
    await db.commit()

    return {"message": "Meeting ended", "meeting_id": meeting_id}


@router.delete("/{meeting_id}")
async def delete_meeting(
    meeting_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a meeting"""
    result = await db.execute(
        select(Meeting).where(Meeting.id == meeting_id)
    )
    meeting = result.scalar_one_or_none()

    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )

    await db.delete(meeting)
    await db.commit()

    return {"message": "Meeting deleted", "meeting_id": meeting_id}
