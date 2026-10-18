from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("")
def health_check():
    has_nvidia = bool(settings.NVIDIA_API_KEY and len(settings.NVIDIA_API_KEY.strip()) > 8)
    return {
        "status": "online",
        "service": "AchieverOS Backend",
        "version": "1.0.0",
        "database": settings.DATABASE_URL.split("://")[0],
        "ai_provider": "nvidia" if has_nvidia else "mock_fallback",
        "chat_model": settings.NVIDIA_CHAT_MODEL,
        "embedding_model": settings.NVIDIA_EMBEDDING_MODEL,
    }
