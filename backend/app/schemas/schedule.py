from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ScheduleEventBase(BaseModel):
    title: str
    day: str
    start_time: str
    end_time: str
    category: str = "Work"
    color: str = "#203451"
    week_of: Optional[str] = None

class ScheduleEventCreate(ScheduleEventBase):
    pass

class ScheduleEventUpdate(BaseModel):
    title: Optional[str] = None
    day: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    category: Optional[str] = None
    color: Optional[str] = None
    week_of: Optional[str] = None

class ScheduleEventOut(ScheduleEventBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DailyPlanBase(BaseModel):
    date: str
    top_priorities: List[str] = []
    time_blocks: List[Dict[str, Any]] = []
    notes: Optional[str] = ""

class DailyPlanCreate(DailyPlanBase):
    pass

class DailyPlanOut(DailyPlanBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
