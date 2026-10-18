import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True, default="")
    category = Column(String(100), default="General", index=True)
    priority = Column(String(20), default="medium", index=True)  # low, medium, high, urgent
    status = Column(String(20), default="todo", index=True)      # todo, in-progress, completed
    due_date = Column(String(20), nullable=False, index=True)    # YYYY-MM-DD
    due_time = Column(String(20), nullable=True)                 # HH:MM
    start_date = Column(String(20), nullable=True)
    scheduled_time = Column(String(20), nullable=True)
    estimated_minutes = Column(Integer, nullable=True, default=30)
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String(50), nullable=True)
    goal_id = Column(String(36), nullable=True, index=True)
    tags = Column(JSON, default=list)
    subtasks = Column(JSON, default=list)  # list of {id, title, completed}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
