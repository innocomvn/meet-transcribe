"""
Transcription API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from pydantic import BaseModel
from datetime import datetime

from database import get_db, Transcript

router = APIRouter()


class TranscriptCreate(BaseModel):
    """Transcript creation schema"""
    meeting_id: str
    text: str
    speaker: str | None = None
    confidence: float | None = None
    language: str = "vi"


class TranscriptResponse(BaseModel):
    """Transcript response schema"""
    id: int
    meeting_id: str
    text: str
    speaker: str | None
    timestamp: datetime
    confidence: float | None
    language: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/", response_model=TranscriptResponse, status_code=status.HTTP_201_CREATED)
async def create_transcript(
    transcript: TranscriptCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new transcript entry"""
    new_transcript = Transcript(
        meeting_id=transcript.meeting_id,
        text=transcript.text,
        speaker=transcript.speaker,
        confidence=transcript.confidence,
        language=transcript.language
    )

    db.add(new_transcript)
    await db.commit()
    await db.refresh(new_transcript)

    return new_transcript


@router.get("/meeting/{meeting_id}", response_model=List[TranscriptResponse])
async def get_meeting_transcripts(
    meeting_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get all transcripts for a meeting"""
    result = await db.execute(
        select(Transcript)
        .where(Transcript.meeting_id == meeting_id)
        .order_by(Transcript.timestamp.asc())
    )
    transcripts = result.scalars().all()
    return transcripts


@router.get("/meeting/{meeting_id}/export")
async def export_transcript(
    meeting_id: str,
    format: str = "txt",
    db: AsyncSession = Depends(get_db)
):
    """Export meeting transcript in various formats"""
    result = await db.execute(
        select(Transcript)
        .where(Transcript.meeting_id == meeting_id)
        .order_by(Transcript.timestamp.asc())
    )
    transcripts = result.scalars().all()

    if not transcripts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No transcripts found for this meeting"
        )

    if format == "txt":
        content = "\n\n".join([
            f"[{t.timestamp.strftime('%H:%M:%S')}] {t.speaker or 'Unknown'}: {t.text}"
            for t in transcripts
        ])
        return {"format": "txt", "content": content}

    elif format == "json":
        return {
            "format": "json",
            "transcripts": [
                {
                    "timestamp": t.timestamp.isoformat(),
                    "speaker": t.speaker,
                    "text": t.text,
                    "confidence": t.confidence
                }
                for t in transcripts
            ]
        }

    elif format == "srt":
        # Subtitle format
        srt_content = []
        for idx, t in enumerate(transcripts, 1):
            start_time = t.timestamp.strftime("%H:%M:%S,000")
            # Estimate end time (3 seconds per entry)
            end_time = (t.timestamp).strftime("%H:%M:%S,000")
            srt_content.append(f"{idx}\n{start_time} --> {end_time}\n{t.text}\n")

        return {"format": "srt", "content": "\n".join(srt_content)}

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported format. Use 'txt', 'json', or 'srt'"
        )


@router.delete("/{transcript_id}")
async def delete_transcript(
    transcript_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a transcript entry"""
    result = await db.execute(
        select(Transcript).where(Transcript.id == transcript_id)
    )
    transcript = result.scalar_one_or_none()

    if not transcript:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcript not found"
        )

    await db.delete(transcript)
    await db.commit()

    return {"message": "Transcript deleted", "transcript_id": transcript_id}
