"""
Database configuration and models
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, DateTime, Text, Integer, Boolean, JSON
from datetime import datetime
from typing import Optional, Dict, Any

from config import settings

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


class Base(DeclarativeBase):
    """Base class for all models"""
    pass


class Meeting(Base):
    """Meeting model"""
    __tablename__ = "meetings"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    host_name: Mapped[str] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(20), default="scheduled")  # scheduled, active, ended
    start_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    participants: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    settings: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Recording(Base):
    """Recording model"""
    __tablename__ = "recordings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    meeting_id: Mapped[str] = mapped_column(String(50))
    file_path: Mapped[str] = mapped_column(String(500))
    file_name: Mapped[str] = mapped_column(String(200))
    file_size: Mapped[int] = mapped_column(Integer)
    duration: Mapped[Optional[float]] = mapped_column(nullable=True)
    format: Mapped[str] = mapped_column(String(20))  # webm, mp4, etc.
    type: Mapped[str] = mapped_column(String(20))  # screen, audio, video
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Transcript(Base):
    """Transcript model"""
    __tablename__ = "transcripts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    meeting_id: Mapped[str] = mapped_column(String(50))
    text: Mapped[str] = mapped_column(Text)
    speaker: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    confidence: Mapped[Optional[float]] = mapped_column(nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="vi")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class MeetingMinutes(Base):
    """Meeting minutes model"""
    __tablename__ = "meeting_minutes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    meeting_id: Mapped[str] = mapped_column(String(50), unique=True)
    summary: Mapped[str] = mapped_column(Text)
    key_points: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    action_items: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    decisions: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    participants: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    format: Mapped[str] = mapped_column(String(20), default="pdf")  # pdf, docx, md
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


async def get_db():
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
