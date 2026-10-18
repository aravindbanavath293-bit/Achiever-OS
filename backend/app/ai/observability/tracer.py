import time
import uuid
import logging
from sqlalchemy.orm import Session
from app.models.ai import AITrace

logger = logging.getLogger("AchieverOS.AI")

class AIObservabilityTracer:
    """Observability tracer logging agent execution, timings, token usage, and errors"""

    def __init__(self, db: Session, user_id: str, agent_name: str, model: str):
        self.db = db
        self.user_id = user_id
        self.agent_name = agent_name
        self.model = model
        self.trace_id = str(uuid.uuid4())
        self.start_time = time.time()

    def record_success(self, prompt_tokens: int = 0, completion_tokens: int = 0):
        duration_ms = (time.time() - self.start_time) * 1000.0
        trace = AITrace(
            id=self.trace_id,
            user_id=self.user_id,
            agent_name=self.agent_name,
            model=self.model,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            latency_ms=round(duration_ms, 2),
            status="success"
        )
        self.db.add(trace)
        self.db.commit()
        logger.info(f"Agent [{self.agent_name}] completed in {duration_ms:.1f}ms (Tokens: {prompt_tokens + completion_tokens})")

    def record_error(self, error: Exception):
        duration_ms = (time.time() - self.start_time) * 1000.0
        trace = AITrace(
            id=self.trace_id,
            user_id=self.user_id,
            agent_name=self.agent_name,
            model=self.model,
            latency_ms=round(duration_ms, 2),
            status="error",
            error_message=str(error)
        )
        self.db.add(trace)
        self.db.commit()
        logger.error(f"Agent [{self.agent_name}] failed: {error}")
