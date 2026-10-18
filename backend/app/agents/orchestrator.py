import logging
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.agents.planner import PlannerAgent
from app.agents.task_intelligence import TaskIntelligenceAgent
from app.agents.goal_coach import GoalCoachAgent
from app.agents.knowledge_retrieval import KnowledgeRetrievalAgent
from app.ai.observability.tracer import AIObservabilityTracer
from app.core.config import settings

logger = logging.getLogger("AchieverOS.Orchestrator")

class CentralOrchestrator:
    """Central AI Orchestration layer routing queries to specialized agents with observability tracing"""

    def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user_id = user_id
        self.planner = PlannerAgent(db, user_id)
        self.task_agent = TaskIntelligenceAgent(db, user_id)
        self.goal_coach = GoalCoachAgent(db, user_id)
        self.knowledge_agent = KnowledgeRetrievalAgent(db, user_id)

    async def orchestrate(self, prompt: str) -> Dict[str, Any]:
        p_lower = prompt.lower()
        selected_agent_name = "Central Orchestrator"

        greeting_words = ["hi", "hello", "hey", "hiii", "hiya", "howdy", "sup", "good morning", "good afternoon", "good evening", "who are you", "what can you do", "help"]
        is_greeting = any(p_lower == w or p_lower.startswith(w + " ") or p_lower.startswith(w + "!") or p_lower.startswith(w + ",") for w in greeting_words)

        # Routing logic
        if is_greeting and not any(k in p_lower for k in ["task", "plan", "goal", "schedule", "remind", "todo", "deadline"]):
            selected_agent_name = "AchieverOS AI Agent"
            async def greeting_coro():
                return {
                    "agent": "AchieverOS AI Agent",
                    "response": (
                        "Hello! I am your AchieverOS AI Agent. I'm here to help you stay focused, organized, and productive.\n\n"
                        "Here is what I can do for you:\n"
                        "• **Plan Your Day:** Try asking *'Plan my day around today's deadlines'*\n"
                        "• **Break Down Goals:** Try *'Break down learning TypeScript into a 4-week goal'*\n"
                        "• **Manage Tasks:** Try *'Add task: Review the quarterly roadmap tomorrow morning'*\n"
                        "• **Search Notes:** Try *'Search my notes for architecture ideas'*\n\n"
                        "How can I assist you right now?"
                    ),
                    "actionCard": None
                }
            agent_coro = greeting_coro()
        elif any(w in p_lower for w in ["plan my day", "daily plan", "schedule", "timetable", "time block"]):
            selected_agent_name = "Planner"
            agent_coro = self.planner.generate_plan(prompt)
        elif any(w in p_lower for w in ["goal", "milestone", "roadmap", "break down"]):
            selected_agent_name = "Goal Coach"
            agent_coro = self.goal_coach.breakdown_goal(prompt)
        elif any(w in p_lower for w in ["search", "find", "note", "where did i", "what notes"]):
            selected_agent_name = "Knowledge Retrieval"
            agent_coro = self.knowledge_agent.retrieve_and_synthesize(prompt)
        else:
            selected_agent_name = "Task Intelligence"
            agent_coro = self.task_agent.parse_and_prioritize(prompt)

        tracer = AIObservabilityTracer(
            self.db,
            user_id=self.user_id,
            agent_name=selected_agent_name,
            model=settings.NVIDIA_CHAT_MODEL or "nemotron-4-340b"
        )

        try:
            result = await agent_coro
            tracer.record_success(prompt_tokens=len(prompt.split()), completion_tokens=len(result["response"].split()))
            result["trace_id"] = tracer.trace_id
            return result
        except Exception as e:
            tracer.record_error(e)
            logger.error(f"Orchestration failure: {e}")
            return {
                "agent": "Orchestrator Fallback",
                "response": f"Encountered an issue processing query through {selected_agent_name}: {str(e)}",
                "actionCard": None,
                "trace_id": tracer.trace_id
            }
