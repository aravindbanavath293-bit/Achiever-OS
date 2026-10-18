import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_task_lifecycle():
    # Login to get token
    login_res = client.post("/api/v1/auth/login", json={
        "email": "alex.morgan@example.com",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Task
    create_res = client.post("/api/v1/tasks", headers=headers, json={
        "title": "Automated Test Task",
        "description": "Testing full-stack persistence",
        "category": "Testing",
        "priority": "high",
        "status": "todo",
        "due_date": "2026-10-20"
    })
    assert create_res.status_code == 201
    task_data = create_res.json()
    task_id = task_data["id"]
    assert task_data["title"] == "Automated Test Task"

    # 2. Toggle Task
    toggle_res = client.post(f"/api/v1/tasks/{task_id}/toggle", headers=headers)
    assert toggle_res.status_code == 200
    assert toggle_res.json()["status"] == "completed"

    # 3. Delete Task
    delete_res = client.delete(f"/api/v1/tasks/{task_id}", headers=headers)
    assert delete_res.status_code == 204
