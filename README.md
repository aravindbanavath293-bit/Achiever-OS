# AchieverOS — AI-Powered Personal Productivity Operating System

> **Tagline:** Plan Better. Work Consistently. Achieve More.

AchieverOS is a production-quality, responsive productivity web application designed to help students, developers, and professionals organize tasks, maintain daily focus, schedule weekly time blocks, track milestones, build streaks, and leverage an autonomous multi-agent AI assistant.

---

## 🎨 Visual Identity & Design System

The application strictly adheres to the official AchieverOS brand specification:
- **Logo:** Circular navy-blue border, gold crown, gold upward arrow, stylized letter 'A', and ACHIEVER wordmark.
- **Primary Navy:** `#203451`
- **Dark Navy:** `#172942`
- **Achievement Gold:** `#C9A34E`
- **Background Canvas:** `#F8F6F9`
- **Surface Cards:** `#FFFFFF`
- **Subtle Border:** `#E3E0E7`
- **Primary Text:** `#17243A`
- **Secondary Text:** `#667085`
- **Success:** `#4C9B73` | **Warning:** `#E7A23B` | **Danger:** `#D94B50`

---

## 🚀 Application Structure & Pages

1. **Dashboard:** Bento-style dashboard with welcome greeting, daily completion ring, today's prioritized focus list, 7-day streak tracking, active goals, upcoming deadlines, and sticky notes preview.
2. **Tasks:** Comprehensive task management with quick filters (Today, High Priority, Work, etc.), full CRUD, priority indicators (Low, Medium, High, Urgent), subtasks, and category tags.
3. **Daily Planner:** Chronological timeline (07:00 to 22:00), top 3 priorities, daily time blocking, conflict detection warnings, daily focus reflections, and AI daily plan generation.
4. **Weekly Timetable:** 7-column grid (Monday to Sunday) with hourly time blocks, previous/next week navigation, color-coded activities, and conflict avoidance.
5. **Weekly To-Do List:** Two-column weekly layout with distinct pastel color accents per day, completion statistics, inline task editing, and unified data synchronization.
6. **Goals:** Measurable long-term objectives with category badges, milestone roadmaps, progress calculations, and automatic achievement status updates.
7. **Sticky Notes:** Visual ideation canvas with colorful note cards (yellow, blue, pink, orange, green), pin-to-top ordering, search filtering, and adhesive styling.
8. **Progress & Analytics:** Real-time metrics calculated from actual database records, Recharts bar & pie charts, focus time distribution, and a 28-day consistency habit heatmap.
9. **Settings:** Profile details, theme switcher (Light, Dark, System), notification toggles, password updates, and safe account deletion.
10. **AI Productivity Assistant:** Multi-agent assistant powered by NVIDIA Nemotron and local semantic heuristics, providing daily plans, goal breakdowns, and semantic workspace search.
11. **Landing & Auth:** Landing page, Sign In, Sign Up, and Forgot Password flows with instant 1-click demo access.

---

## 🧠 Multi-Agent AI Architecture

AchieverOS implements a multi-agent orchestration architecture:
- **Central Orchestrator:** Validates requests, authenticates user permissions, selects appropriate specialized agents, aggregates results, and logs observability traces.
- **Agent 1 (Planner Agent):** Constructs daily time blocks, balances deep work and rest, and flags schedule overlaps.
- **Agent 2 (Task Intelligence Agent):** Parses natural-language queries into structured task objects with estimated durations and subtasks.
- **Agent 3 (Goal Coach Agent):** Decomposes multi-month goals into actionable milestone steps and monitors velocity.
- **Agent 4 (Knowledge Retrieval Agent):** Executes user-isolated semantic search using vector embeddings across personal notes, tasks, and goals.

---

## 🛠️ Technology Stack

### Frontend
- **React 19 & TypeScript:** Strict typing with clean component separation
- **Vite 8 & Tailwind CSS v4:** Modern `@theme` tokens matching brand colors
- **Lucide React:** Consistent iconography
- **React Router 7:** Responsive layout shell and nested protected routes
- **Recharts:** Responsive charts for productivity analytics
- **React Hot Toast:** Accessible toast alerts

### Backend
- **Python 3.11+ & FastAPI:** High-performance async REST API
- **SQLAlchemy 2.0:** Relational ORM with parameterized queries
- **Pydantic v2:** Input validation and response serialization
- **Passlib (Argon2id/Bcrypt) & Python-Jose:** Cryptographic password hashing and JWT sessions
- **NVIDIA Nemotron Adapter:** Compatible with Nemotron-4-340B chat & Embed-QA-4 models
- **RAG & pgvector:** Vector cosine similarity and tenant isolation

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18+ or v20+)
- Python (v3.10+)
- (Optional) Docker & Docker Compose for PostgreSQL + pgvector

### 1. Frontend Setup
```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The frontend will start at: `http://localhost:5173`

### 2. Backend Setup
```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
The backend API and interactive documentation will be available at:
- API Root: `http://localhost:8000/api/v1`
- Swagger UI Docs: `http://localhost:8000/docs`
- Health Status: `http://localhost:8000/api/v1/health`

### 3. Running with Docker Compose (PostgreSQL + pgvector)
```bash
docker-compose up --build
```

---

## 🧪 Automated Testing

Automated tests cover authentication, task CRUD, multi-agent orchestration, and strict RAG tenant isolation:
```powershell
cd backend
pytest app/tests/ -v
```

---

## 🔐 Demo Credentials
- **Email:** `alex.morgan@example.com`
- **Password:** `password123`
- Or click **"Instant Demo Sign In (1-Click)"** on the login screen.
