from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StickyNoteBase(BaseModel):
    title: Optional[str] = "Untitled Note"
    content: str
    color: str = "yellow"
    is_pinned: bool = False

class StickyNoteCreate(StickyNoteBase):
    pass

class StickyNoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    color: Optional[str] = None
    is_pinned: Optional[bool] = None

class StickyNoteOut(StickyNoteBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
