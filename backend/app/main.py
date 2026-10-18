import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.models.user import User, UserSettings
from app.models.task import Task
from app.models.goal import Goal
from app.models.note import StickyNote
from app.models.schedule import ScheduleEvent
from app.models.ai import AIConversation, AIMessage, AIDocument, AITrace
from app.core.security import get_password_hash

# API Routers
from app.api.v1 import auth, tasks, goals, schedule, notes, analytics, settings as app_settings, ai, health

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AchieverOS")

def seed_initial_data():
    """Initializes demo account and starter data if fresh database"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "alex.morgan@example.com").first()
        if not user:
            logger.info("Seeding initial AchieverOS demo user and data...")
            user = User(
                id="demo-user",
                email="alex.morgan@example.com",
                name="Alex Morgan",
                hashed_password=get_password_hash("password123"),
                avatar="",
                bio="Productivity enthusiast & Lead Architect"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Settings
            user_settings = UserSettings(user_id=user.id, theme="light")
            db.add(user_settings)

            # Sample tasks
            t1 = Task(
                user_id=user.id,
                title="Finalize Q4 Marketing Strategy",
                category="Work",
                priority="urgent",
                status="todo",
                due_date="2026-10-18",
                due_time="10:00",
                estimated_minutes=90,
                tags=["marketing", "strategy"]
            )
            t2 = Task(
                user_id=user.id,
                title="Review Design System Updates",
                category="Design",
                priority="medium",
                status="todo",
                due_date="2026-10-18",
                due_time="13:30",
                estimated_minutes=30,
                tags=["design"]
            )
            t3 = Task(
                user_id=user.id,
                title="Sync with Engineering Team",
                category="Meeting",
                priority="medium",
                status="completed",
                due_date="2026-10-18",
                due_time="15:00",
                estimated_minutes=60,
                tags=["meeting"]
            )
            db.add_all([t1, t2, t3])

            # Sample goal
            g1 = Goal(
                user_id=user.id,
                title="Master Full-Stack Architecture",
                category="Education",
                target_date="2026-12-31",
                status="in-progress",
                milestones=[
                    {"id": "m-1", "title": "Complete System Design Roadmap", "completed": True},
                    {"id": "m-2", "title": "Deploy Production RAG Agent System", "completed": True},
                    {"id": "m-3", "title": "Pass Advanced Cloud Certification", "completed": False},
                ]
            )
            db.add(g1)

            # Sample notes
            n1 = StickyNote(
                user_id=user.id,
                title="Architecture Principles",
                content="Always preserve user isolation when doing vector search and semantic indexing.",
                color="blue",
                is_pinned=True
            )
            n2 = StickyNote(
                user_id=user.id,
                title="Project Ideas",
                content="Integrate NVIDIA Nemotron for agentic workflow suggestions and automatic daily planning.",
                color="yellow",
                is_pinned=False
            )
            db.add_all([n1, n2])

            db.commit()
            logger.info("Demo data seeding completed successfully.")
    except Exception as e:
        logger.error(f"Error seeding demo data: {e}")
        db.rollback()
    finally:
        db.close()

Base.metadata.create_all(bind=engine)
seed_initial_data()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    logger.info("Database initialized.")
    yield
    # Shutdown
    logger.info("AchieverOS backend shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Personal Productivity Operating System Backend with Multi-Agent Orchestration & pgvector RAG",
    version="1.0.0",
    lifespan=lifespan,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits frontend dev server on all ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API V1 Routers
app.include_router(health.router, prefix=f"{settings.API_V1_STR}/health", tags=["Health"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth"])
app.include_router(tasks.router, prefix=f"{settings.API_V1_STR}/tasks", tags=["Tasks"])
app.include_router(goals.router, prefix=f"{settings.API_V1_STR}/goals", tags=["Goals"])
app.include_router(schedule.router, prefix=f"{settings.API_V1_STR}/schedule", tags=["Schedule"])
app.include_router(notes.router, prefix=f"{settings.API_V1_STR}/notes", tags=["Notes"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Analytics"])
app.include_router(app_settings.router, prefix=f"{settings.API_V1_STR}/settings", tags=["Settings"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["AI Assistant & RAG"])

@app.get("/")
def root():
    return {
        "app": "AchieverOS",
        "tagline": "Plan Better. Work Consistently. Achieve More.",
        "status": "active",
        "docs": "/docs"
    }
