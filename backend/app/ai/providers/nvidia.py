import httpx
import logging
from typing import List, Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class NvidiaProvider:
    """NVIDIA Nemotron chat completion and embedding client"""

    def __init__(self):
        self.api_key = settings.NVIDIA_API_KEY
        self.base_url = settings.NVIDIA_BASE_URL.rstrip('/')
        self.chat_model = settings.NVIDIA_CHAT_MODEL
        self.embedding_model = settings.NVIDIA_EMBEDDING_MODEL
        self.timeout = 25.0

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 8)

    async def generate_chat(self, messages: List[Dict[str, str]], temperature: float = 0.2) -> Dict[str, Any]:
        """Calls NVIDIA Nemotron chat completion endpoint"""
        if not self.is_configured:
            raise ValueError("NVIDIA_API_KEY not configured")

        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        payload = {
            "model": self.chat_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": 1024,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return {
                "content": data["choices"][0]["message"]["content"],
                "usage": data.get("usage", {}),
                "model": self.chat_model,
            }

    async def get_embedding(self, text: str) -> List[float]:
        """Calls NVIDIA Nemotron embedding endpoint"""
        if not self.is_configured:
            raise ValueError("NVIDIA_API_KEY not configured")

        url = f"{self.base_url}/embeddings"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.embedding_model,
            "input": [text],
            "input_type": "query",
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["data"][0]["embedding"]
