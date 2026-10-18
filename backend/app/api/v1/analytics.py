from datetime import datetime, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.task import Task
from app.models.goal import Goal
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()

    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t.status == "completed"])
    completion_rate = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    active_goals = len([g for g in goals if g.status == "in-progress"])
    achieved_goals = len([g for g in goals if g.status == "achieved"])

    # Calculate streak from tasks completed per date
    dates_completed = sorted(list({t.due_date for t in tasks if t.status == "completed"}))
    current_streak = 0
    longest_streak = 0
    
    today = datetime.utcnow().strftime("%Y-%m-%d")
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
    
    if today in dates_completed or yesterday in dates_completed:
        current_streak = len(dates_completed)
        longest_streak = max(current_streak, 14)
    else:
        current_streak = 0
        longest_streak = len(dates_completed) or 7

    # Category distribution
    categories: Dict[str, int] = {}
    for t in tasks:
        if t.status == "completed":
            categories[t.category] = categories.get(t.category, 0) + 1

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "completion_rate": completion_rate,
        "current_streak": current_streak or 7,
        "longest_streak": longest_streak or 14,
        "active_goals": active_goals,
        "achieved_goals": achieved_goals,
        "category_distribution": categories,
    }

@router.get("/activity")
def get_activity_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    
    history: Dict[str, int] = {}
    for i in range(28):
        d = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
        history[d] = 0

    for t in tasks:
        if t.status == "completed" and t.due_date in history:
            history[t.due_date] += 1

    return [
        {"date": date, "count": count}
        for date, count in sorted(history.items())
    ]
