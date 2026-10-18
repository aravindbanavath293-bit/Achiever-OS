from datetime import datetime, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.task import Task

class TaskIntelligenceAgent:
    """Agent 2: Task Intelligence Agent - parses natural-language tasks, priorities, duration, subtasks"""

    def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user_id = user_id

    async def parse_and_prioritize(self, prompt: str) -> Dict[str, Any]:
        p_lower = prompt.lower()

        # Priority inference
        priority = "medium"
        if any(w in p_lower for w in ["urgent", "asap", "immediately", "critical", "emergency"]):
            priority = "urgent"
        elif any(w in p_lower for w in ["important", "high priority", "deadline"]):
            priority = "high"
        elif any(w in p_lower for w in ["low", "whenever", "someday", "trivial"]):
            priority = "low"

        # Category inference
        category = "Work"
        if any(w in p_lower for w in ["study", "exam", "course", "read", "book", "lecture"]):
            category = "Study"
        elif any(w in p_lower for w in ["gym", "workout", "run", "diet", "doctor", "health"]):
            category = "Health"
        elif any(w in p_lower for w in ["tax", "invoice", "bank", "finance", "budget"]):
            category = "Finance"
        elif any(w in p_lower for w in ["buy", "call", "personal", "clean", "home"]):
            category = "Personal"

        # Date inference
        today = datetime.utcnow()
        due_date = today.strftime("%Y-%m-%d")
        if "tomorrow" in p_lower:
            due_date = (today + timedelta(days=1)).strftime("%Y-%m-%d")
        elif "next week" in p_lower:
            due_date = (today + timedelta(days=7)).strftime("%Y-%m-%d")

        # Clean title
        title = prompt.strip()
        for prefix in ["create a task to", "add a task to", "remind me to", "task:", "todo:"]:
            if title.lower().startswith(prefix):
                title = title[len(prefix):].strip()

        # Generate subtasks if prompt asks for breaking down
        subtasks = []
        if any(w in p_lower for w in ["steps", "break down", "subtasks", "decompose"]):
            subtasks = [
                {"id": "st-1", "title": "Requirements and scope breakdown", "completed": False},
                {"id": "st-2", "title": "Execute core implementation", "completed": False},
                {"id": "st-3", "title": "Verification and review", "completed": False},
            ]

        response_text = (
            f"I have interpreted your task:\n\n"
            f"• **Title:** {title.capitalize()}\n"
            f"• **Priority:** {priority.upper()}\n"
            f"• **Category:** {category}\n"
            f"• **Target Date:** {due_date}\n"
        )
        if subtasks:
            response_text += f"\n**Suggested Subtasks:**\n" + "\n".join([f"- {st['title']}" for st in subtasks])

        return {
            "agent": "Task Intelligence",
            "response": response_text,
            "actionCard": {
                "type": "create_task",
                "data": {
                    "title": title.capitalize(),
                    "category": category,
                    "priority": priority,
                    "due_date": due_date,
                    "subtasks": subtasks,
                }
            }
        }
