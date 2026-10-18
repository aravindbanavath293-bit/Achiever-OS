import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text
from app.db.session import Base

class StickyNote(Base):
    __tablename__ = "sticky_notes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), index=True, nullable=False)
    title = Column(String(255), default="Untitled Note")
    content = Column(Text, nullable=False)
    color = Column(String(20), default="yellow")  # yellow, blue, pink, orange, green
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
