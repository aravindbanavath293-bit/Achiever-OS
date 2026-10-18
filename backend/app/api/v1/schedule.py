from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.schedule import ScheduleEvent, DailyPlan
from app.models.user import User
from app.schemas.schedule import (
    ScheduleEventCreate, ScheduleEventUpdate, ScheduleEventOut,
    DailyPlanCreate, DailyPlanOut
)
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/events", response_model=List[ScheduleEventOut])
def get_events(
    day: Optional[str] = None,
    week_of: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ScheduleEvent).filter(ScheduleEvent.user_id == current_user.id)
    if day:
        query = query.filter(ScheduleEvent.day == day)
    if week_of:
        query = query.filter(ScheduleEvent.week_of == week_of)
    return query.order_by(ScheduleEvent.start_time.asc()).all()

@router.post("/events", response_model=ScheduleEventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: ScheduleEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = ScheduleEvent(user_id=current_user.id, **event_in.dict())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.patch("/events/{event_id}", response_model=ScheduleEventOut)
def update_event(
    event_id: str,
    event_in: ScheduleEventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(ScheduleEvent).filter(ScheduleEvent.id == event_id, ScheduleEvent.user_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = event_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(event, field, val)

    db.commit()
    db.refresh(event)
    return event

@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(ScheduleEvent).filter(ScheduleEvent.id == event_id, ScheduleEvent.user_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(event)
    db.commit()
    return None

@router.get("/daily-plan/{date}", response_model=Optional[DailyPlanOut])
def get_daily_plan(date: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(DailyPlan).filter(DailyPlan.user_id == current_user.id, DailyPlan.date == date).first()

@router.post("/daily-plan", response_model=DailyPlanOut)
def save_daily_plan(plan_in: DailyPlanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(DailyPlan).filter(DailyPlan.user_id == current_user.id, DailyPlan.date == plan_in.date).first()
    if existing:
        existing.top_priorities = plan_in.top_priorities
        existing.time_blocks = plan_in.time_blocks
        existing.notes = plan_in.notes
        db.commit()
        db.refresh(existing)
        return existing
    else:
        plan = DailyPlan(user_id=current_user.id, **plan_in.dict())
        db.add(plan)
        db.commit()
        db.refresh(plan)
        return plan
