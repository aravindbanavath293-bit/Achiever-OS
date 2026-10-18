from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class SubtaskSchema(BaseModel):
    id: str
    title: str
    completed: bool = False

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = ""
    category: str = "General"
    priority: str = "medium"  # low, medium, high, urgent
    status: str = "todo"      # todo, in-progress, completed
    due_date: str             # YYYY-MM-DD
    due_time: Optional[str] = None
    start_date: Optional[str] = None
    scheduled_time: Optional[str] = None
    estimated_minutes: Optional[int] = 30
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None
    goal_id: Optional[str] = None
    tags: List[str] = []
    subtasks: List[Dict[str, Any]] = []

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None
    due_time: Optional[str] = None
    start_date: Optional[str] = None
    scheduled_time: Optional[str] = None
    estimated_minutes: Optional[int] = None
    is_recurring: Optional[bool] = None
    recurrence_pattern: Optional[str] = None
    goal_id: Optional[str] = None
    tags: Optional[List[str]] = None
    subtasks: Optional[List[Dict[str, Any]]] = None

class TaskOut(TaskBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
