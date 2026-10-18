from datetime import datetime, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.goal import Goal

class GoalCoachAgent:
    """Agent 3: Goal Coach Agent - breaks goals into milestones, suggests achievable timelines, identifies stalled progress"""

    def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user_id = user_id

    async def breakdown_goal(self, prompt: str) -> Dict[str, Any]:
        target_date = (datetime.utcnow() + timedelta(days=60)).strftime("%Y-%m-%d")

        milestones = [
            "Phase 1: Foundation & Core Concepts Mastery",
            "Phase 2: Structured Practical Application & Building",
            "Phase 3: Integration, Testing & Refactoring",
            "Phase 4: Capstone Execution & Final Review",
        ]

        text = (
            f"🎯 **Goal Architecture Proposal**:\n\n"
            f"I have mapped out a 4-phase milestone trajectory for your goal:\n\n"
            + "\n".join([f"{i+1}. **{m}**" for i, m in enumerate(milestones)])
            + f"\n\n**Target Completion:** {target_date}\n"
            f"Would you like me to initialize this goal in your active tracker?"
        )

        return {
            "agent": "Goal Coach",
            "response": text,
            "actionCard": {
                "type": "create_goal",
                "data": {
                    "title": prompt.replace("Break down", "").replace("goal", "").strip().capitalize() or "Quarterly Master Goal",
                    "category": "Education",
                    "target_date": target_date,
                    "milestones": milestones,
                }
            }
        }
