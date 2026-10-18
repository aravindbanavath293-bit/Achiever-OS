from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None

class UserOut(UserBase):
    id: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class UserSettingsSchema(BaseModel):
    theme: str = "light"
    in_app_alerts: bool = True
    email_digests: bool = False
    push_notifications: bool = True
    start_of_week: str = "monday"
    preferences: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
