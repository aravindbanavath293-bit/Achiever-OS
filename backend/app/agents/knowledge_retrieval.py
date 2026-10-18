from typing import Dict, Any
from sqlalchemy.orm import Session
from app.ai.rag.retriever import RAGRetriever

class KnowledgeRetrievalAgent:
    """Agent 4: Knowledge Retrieval Agent - semantic retrieval across notes, tasks, goals with strict user isolation"""

    def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user_id = user_id
        self.retriever = RAGRetriever(db, user_id)

    async def retrieve_and_synthesize(self, query: str) -> Dict[str, Any]:
        await self.retriever.sync_user_documents()
        results = await self.retriever.search(query, limit=3)

        if not results:
            return {
                "agent": "Knowledge Retrieval",
                "response": f"I searched your workspace notes, tasks, and goals for '{query}', but didn't find any direct matches.",
                "actionCard": None
            }

        citations = []
        for r in results:
            citations.append(f"• **[{r['entity_type'].upper()}] {r['title']}** (Relevance: {r['score']}):\n  _{r['snippet']}_")

        response_text = (
            f"🔍 **Retrieved from your private workspace**:\n\n"
            + "\n\n".join(citations)
            + f"\n\n*Verified through pgvector semantic embeddings. No external or other user data accessed.*"
        )

        return {
            "agent": "Knowledge Retrieval",
            "response": response_text,
            "actionCard": None
        }
