from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserSettings
from app.schemas.user import UserSettingsSchema
from app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=UserSettingsSchema)
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.patch("", response_model=UserSettingsSchema)
def update_settings(
    settings_in: UserSettingsSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)

    settings.theme = settings_in.theme
    settings.in_app_alerts = settings_in.in_app_alerts
    settings.email_digests = settings_in.email_digests
    settings.push_notifications = settings_in.push_notifications
    settings.start_of_week = settings_in.start_of_week
    if settings_in.preferences:
        settings.preferences = settings_in.preferences

    db.commit()
    db.refresh(settings)
    return settings
