import math
from typing import List, Dict, Any

class MockProvider:
    """Intelligent heuristic fallback provider for local testing and zero-key development"""

    def __init__(self):
        self.model = "achieveros/mock-nemotron-fallback"
        self.embedding_dim = 128

    async def generate_chat(self, messages: List[Dict[str, str]], context: str = "") -> Dict[str, Any]:
        user_msg = messages[-1]["content"] if messages else ""
        return {
            "content": f"[Nemotron Assistant Fallback]\nProcessed query: '{user_msg}'\nContext: {context[:200]}",
            "usage": {"prompt_tokens": len(user_msg.split()), "completion_tokens": 40},
            "model": self.model,
        }

    async def get_embedding(self, text: str) -> List[float]:
        """Generates deterministic pseudo-embedding based on character frequencies for semantic cosine comparison"""
        vec = [0.0] * self.embedding_dim
        for i, char in enumerate(text.lower()):
            idx = (ord(char) * (i + 1)) % self.embedding_dim
            vec[idx] += 1.0
        
        # Normalize
        norm = math.sqrt(sum(v * v for v in vec)) or 1.0
        return [v / norm for v in vec]
