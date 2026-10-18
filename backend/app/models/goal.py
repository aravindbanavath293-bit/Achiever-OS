import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON
from app.db.session import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True, default="")
    category = Column(String(100), default="Career", index=True)
    target_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    status = Column(String(20), default="in-progress", index=True)  # in-progress, achieved
    milestones = Column(JSON, default=list)  # list of {id, title, completed}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
