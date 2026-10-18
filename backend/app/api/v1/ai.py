from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.ai import AITrace
from app.schemas.ai import AIChatRequest, AIChatResponse, AISearchRequest, AISearchResult
from app.agents.orchestrator import CentralOrchestrator
from app.agents.planner import PlannerAgent
from app.agents.goal_coach import GoalCoachAgent
from app.ai.rag.retriever import RAGRetriever
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_assistant(
    request: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    orchestrator = CentralOrchestrator(db, current_user.id)
    result = await orchestrator.orchestrate(request.message)
    return {
        "response": result["response"],
        "agent": result["agent"],
        "actionCard": result.get("actionCard"),
        "conversation_id": request.conversation_id or "session-1",
        "trace_id": result.get("trace_id")
    }

@router.post("/plan-day")
async def plan_day(
    prompt: str = "Plan my day with balanced deep work and breaks",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    planner = PlannerAgent(db, current_user.id)
    return await planner.generate_plan(prompt)

@router.post("/breakdown-goal")
async def breakdown_goal(
    goal_title: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    coach = GoalCoachAgent(db, current_user.id)
    return await coach.breakdown_goal(goal_title)

@router.post("/search", response_model=List[AISearchResult])
async def semantic_search(
    request: AISearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    retriever = RAGRetriever(db, current_user.id)
    await retriever.sync_user_documents()
    results = await retriever.search(request.query, limit=request.limit)
    return results

@router.get("/traces")
def get_traces(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """User-isolated AI observability trace logs"""
    return db.query(AITrace).filter(AITrace.user_id == current_user.id).order_by(AITrace.created_at.desc()).limit(20).all()
