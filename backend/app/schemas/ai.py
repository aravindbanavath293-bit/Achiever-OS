from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class AIChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    stream: bool = False

class AIChatResponse(BaseModel):
    response: str
    agent: str
    actionCard: Optional[Dict[str, Any]] = None
    conversation_id: Optional[str] = None
    trace_id: Optional[str] = None

class AISearchRequest(BaseModel):
    query: str
    limit: int = 5

class AISearchResult(BaseModel):
    entity_type: str
    entity_id: str
    title: str
    snippet: str
    score: float
