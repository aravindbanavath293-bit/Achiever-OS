from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.ai import AIDocument
from app.models.task import Task
from app.models.note import StickyNote
from app.models.goal import Goal
from app.ai.rag.embeddings import cosine_similarity
from app.ai.providers.nvidia import NvidiaProvider
from app.ai.providers.mock import MockProvider

class RAGRetriever:
    """User-isolated semantic search and knowledge retrieval pipeline"""

    def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user_id = user_id
        self.nvidia = NvidiaProvider()
        self.mock = MockProvider()

    async def get_embedding(self, text: str) -> List[float]:
        if self.nvidia.is_configured:
            try:
                return await self.nvidia.get_embedding(text)
            except Exception:
                pass
        return await self.mock.get_embedding(text)

    async def sync_user_documents(self):
        """Indexes user tasks, sticky notes, and goals into AIDocument records"""
        # Tasks
        tasks = self.db.query(Task).filter(Task.user_id == self.user_id).all()
        for t in tasks:
            existing = self.db.query(AIDocument).filter(
                AIDocument.user_id == self.user_id,
                AIDocument.entity_type == "task",
                AIDocument.entity_id == t.id
            ).first()
            content = f"{t.title}. {t.description or ''}. Category: {t.category}. Priority: {t.priority}."
            if not existing:
                emb = await self.get_embedding(content)
                doc = AIDocument(
                    user_id=self.user_id,
                    entity_type="task",
                    entity_id=t.id,
                    title=t.title,
                    content=content,
                    embedding=emb
                )
                self.db.add(doc)

        # Notes
        notes = self.db.query(StickyNote).filter(StickyNote.user_id == self.user_id).all()
        for n in notes:
            existing = self.db.query(AIDocument).filter(
                AIDocument.user_id == self.user_id,
                AIDocument.entity_type == "note",
                AIDocument.entity_id == n.id
            ).first()
            content = f"{n.title}: {n.content}"
            if not existing:
                emb = await self.get_embedding(content)
                doc = AIDocument(
                    user_id=self.user_id,
                    entity_type="note",
                    entity_id=n.id,
                    title=n.title,
                    content=content,
                    embedding=emb
                )
                self.db.add(doc)

        # Goals
        goals = self.db.query(Goal).filter(Goal.user_id == self.user_id).all()
        for g in goals:
            existing = self.db.query(AIDocument).filter(
                AIDocument.user_id == self.user_id,
                AIDocument.entity_type == "goal",
                AIDocument.entity_id == g.id
            ).first()
            content = f"Goal: {g.title}. {g.description or ''}. Target date: {g.target_date}. Category: {g.category}."
            if not existing:
                emb = await self.get_embedding(content)
                doc = AIDocument(
                    user_id=self.user_id,
                    entity_type="goal",
                    entity_id=g.id,
                    title=g.title,
                    content=content,
                    embedding=emb
                )
                self.db.add(doc)

        self.db.commit()

    async def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Semantic search strictly isolated to the requesting user"""
        query_vec = await self.get_embedding(query)
        
        # Strictly query only this user's records
        docs = self.db.query(AIDocument).filter(AIDocument.user_id == self.user_id).all()

        scored = []
        for doc in docs:
            score = 0.0
            if doc.embedding:
                score = cosine_similarity(query_vec, doc.embedding)
            # Add small lexical bonus if keyword matches directly
            if query.lower() in doc.content.lower() or query.lower() in doc.title.lower():
                score += 0.25

            scored.append({
                "entity_type": doc.entity_type,
                "entity_id": doc.entity_id,
                "title": doc.title,
                "snippet": doc.content[:180] + ("..." if len(doc.content) > 180 else ""),
                "score": round(score, 3)
            })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:limit]
