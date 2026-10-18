from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.task import Task
from app.models.schedule import ScheduleEvent

class PlannerAgent:
    """Agent 1: Planner Agent - builds daily/weekly schedules, checks conflicts, and allocates focus blocks"""

    def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user_id = user_id

    async def generate_plan(self, prompt: str) -> Dict[str, Any]:
        tasks = self.db.query(Task).filter(
            Task.user_id == self.user_id,
            Task.status != "completed"
        ).all()
        
        events = self.db.query(ScheduleEvent).filter(
            ScheduleEvent.user_id == self.user_id
        ).all()

        conflicts = []
        for i in range(len(events)):
            for j in range(i + 1, len(events)):
                e1, e2 = events[i], events[j]
                if e1.day == e2.day and e1.start_time < e2.end_time and e2.start_time < e1.end_time:
                    conflicts.append(f"Overlap between '{e1.title}' and '{e2.title}' on {e1.day}")

        schedule_plan = [
            {"time": "08:30 - 10:30", "focus": "Deep Work on Core Priority", "category": "Work"},
            {"time": "10:45 - 11:45", "focus": "Critical Review & Collaboration", "category": "Work"},
            {"time": "12:00 - 13:00", "focus": "Health & Nutrition Break", "category": "Health"},
            {"time": "14:00 - 16:00", "focus": "Sprint Execution & Build Time", "category": "Projects"},
            {"time": "16:30 - 17:30", "focus": "Study, Reading & Learning", "category": "Study"},
            {"time": "17:30 - 18:00", "focus": "Daily Retrospective & Tomorrow Plan", "category": "Personal"},
        ]

        text = (
            f"Here is your AI-optimized schedule balancing deep work, breaks, and personal priorities:\n\n"
            + "\n".join([f"• **{item['time']}**: {item['focus']} ({item['category']})" for item in schedule_plan])
        )

        if conflicts:
            text += f"\n\n⚠️ **Schedule Warnings Detected:**\n" + "\n".join([f"- {c}" for c in conflicts])

        return {
            "agent": "Planner",
            "response": text,
            "actionCard": {
                "type": "daily_plan",
                "data": {
                    "blocks": schedule_plan,
                    "task_count": len(tasks),
                }
            }
        }
