import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON
from app.db.session import Base

class ScheduleEvent(Base):
    __tablename__ = "schedule_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    day = Column(String(20), nullable=False, index=True)  # monday ... sunday
    start_time = Column(String(10), nullable=False)       # HH:MM
    end_time = Column(String(10), nullable=False)         # HH:MM
    category = Column(String(100), default="Work")
    color = Column(String(50), default="#203451")
    week_of = Column(String(20), nullable=True)          # YYYY-MM-DD
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DailyPlan(Base):
    __tablename__ = "daily_plans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), index=True, nullable=False)
    date = Column(String(20), nullable=False, index=True)  # YYYY-MM-DD
    top_priorities = Column(JSON, default=list)
    time_blocks = Column(JSON, default=list)
    notes = Column(Text, nullable=True, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
