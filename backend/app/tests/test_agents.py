import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_multi_agent_orchestration():
    # Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "alex.morgan@example.com",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Test Planner Agent routing
    plan_res = client.post("/api/v1/ai/chat", headers=headers, json={
        "message": "Plan my day with balanced deep work blocks"
    })
    assert plan_res.status_code == 200
    plan_data = plan_res.json()
    assert plan_data["agent"] == "Planner"
    assert "schedule" in plan_data["response"].lower() or "focus" in plan_data["response"].lower()

    # 2. Test Goal Coach Agent routing
    goal_res = client.post("/api/v1/ai/chat", headers=headers, json={
        "message": "Break down learning TypeScript into milestones"
    })
    assert goal_res.status_code == 200
    goal_data = goal_res.json()
    assert goal_data["agent"] == "Goal Coach"
    assert "milestone" in goal_data["response"].lower()

    # 3. Test Task Intelligence Agent routing
    task_res = client.post("/api/v1/ai/chat", headers=headers, json={
        "message": "Remind me to update documentation urgent"
    })
    assert task_res.status_code == 200
    task_data = task_res.json()
    assert task_data["agent"] == "Task Intelligence"
    assert "URGENT" in task_data["response"]
