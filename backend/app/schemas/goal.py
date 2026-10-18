from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class MilestoneSchema(BaseModel):
    id: str
    title: str
    completed: bool = False

class GoalBase(BaseModel):
    title: str
    description: Optional[str] = ""
    category: str = "Career"
    target_date: str
    status: str = "in-progress"
    milestones: List[Dict[str, Any]] = []

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    target_date: Optional[str] = None
    status: Optional[str] = None
    milestones: Optional[List[Dict[str, Any]]] = None

class GoalOut(GoalBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
