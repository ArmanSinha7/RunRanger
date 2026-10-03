from __future__ import annotations

from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.db import Database
from app.deps import get_db
from app.main import app


@pytest.fixture
def client():
    # Use in-memory SQLite database for isolated API tests
    test_db = Database(Path(":memory:"))
    app.dependency_overrides[get_db] = lambda: test_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_api_health(client: TestClient):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert data["mode"] in ("ai", "demo")
    assert "model" in data


def test_api_create_mission_prefer_demo(client: TestClient):
    payload = {
        "activity": "running",
        "duration_min": 25,
        "difficulty": "moderate",
        "goal": "nature",
        "environment": "park",
        "mood": "clearing my head",
        "prefer_demo": True,
    }
    res = client.post("/api/missions", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["mode"] == "demo"
    assert data["mission"]["title"]
    assert len(data["mission"]["checkpoints"]) >= 2


