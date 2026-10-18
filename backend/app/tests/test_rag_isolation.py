import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_user_data_isolation():
    u1_email = f"user1_{uuid.uuid4().hex[:8]}@test.com"
    u2_email = f"user2_{uuid.uuid4().hex[:8]}@test.com"

    # User 1 registers
    u1_res = client.post("/api/v1/auth/register", json={
        "email": u1_email,
        "name": "User One",
        "password": "SecretPassword123!"
    })
    assert u1_res.status_code == 200, u1_res.text
    u1_token = u1_res.json()["access_token"]
    u1_headers = {"Authorization": f"Bearer {u1_token}"}

    # User 2 registers
    u2_res = client.post("/api/v1/auth/register", json={
        "email": u2_email,
        "name": "User Two",
        "password": "SecretPassword123!"
    })
    assert u2_res.status_code == 200, u2_res.text
    u2_token = u2_res.json()["access_token"]
    u2_headers = {"Authorization": f"Bearer {u2_token}"}

    # User 1 creates a private note
    client.post("/api/v1/notes", headers=u1_headers, json={
        "title": "User 1 Secret Project",
        "content": "Confidential blueprint only for User 1",
        "color": "pink"
    })

    # User 2 performs semantic search
    search_res = client.post("/api/v1/ai/search", headers=u2_headers, json={
        "query": "User 1 Secret Project"
    })
    assert search_res.status_code == 200
    results = search_res.json()

    # User 2 must NOT see User 1's secret note in search results
    for item in results:
        assert "User 1 Secret Project" not in item["title"]
        assert "Confidential blueprint" not in item["snippet"]

    # User 1 performs search and DOES see their note
    u1_search_res = client.post("/api/v1/ai/search", headers=u1_headers, json={
        "query": "User 1 Secret Project"
    })
    assert u1_search_res.status_code == 200
    u1_results = u1_search_res.json()
    assert any("User 1 Secret Project" in item["title"] for item in u1_results)
