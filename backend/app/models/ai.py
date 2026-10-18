import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON, Float, Integer
from app.db.session import Base

class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), index=True, nullable=False)
    title = Column(String(255), default="Productivity Session")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), index=True, nullable=False)
    user_id = Column(String(36), index=True, nullable=False)
    sender = Column(String(20), nullable=False)  # user, assistant
    agent_name = Column(String(50), nullable=True)  # Planner, Task Intelligence, Goal Coach, Knowledge Retrieval, Orchestrator
    text = Column(Text, nullable=False)
    action_payload = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AIDocument(Base):
    """Searchable content record with vector embeddings for RAG and semantic search"""
    __tablename__ = "ai_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), index=True, nullable=False)
    entity_type = Column(String(50), index=True, nullable=False)  # task, note, goal, event
    entity_id = Column(String(36), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=True)  # vector representation (compatible with SQLite JSON & pgvector)
    model = Column(String(100), default="nvidia/embed-qa-4")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AITrace(Base):
    """Observability trace record logging tokens, latency, agent routing, and provider status"""
    __tablename__ = "ai_traces"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), index=True, nullable=False)
    agent_name = Column(String(50), nullable=False)
    model = Column(String(100), nullable=False)
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    latency_ms = Column(Float, default=0.0)
    status = Column(String(20), default="success")  # success, error, fallback
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
