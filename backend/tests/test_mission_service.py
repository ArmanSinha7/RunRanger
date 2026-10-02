from __future__ import annotations

import pytest

from app.ai.ollama import OllamaClient
from app.schemas.mission import Activity, Difficulty, Goal, MissionRequest
from app.services.mission_service import MissionService, demo_mission


def test_demo_mission_generation():
    req = MissionRequest(activity=Activity.running, duration_min=30, difficulty=Difficulty.moderate, goal=Goal.nature)
    mission = demo_mission(req)
    assert mission.title
    assert len(mission.checkpoints) >= 2
    assert mission.difficulty == Difficulty.moderate
    assert mission.estimated_distance_km > 0


@pytest.mark.anyio
async def test_mission_service_falls_back_when_ollama_offline():
    # Use valid port that isn't running anything to trigger connection refused
    client = OllamaClient("http://127.0.0.1:19434", "gemma3:4b")
    svc = MissionService(client)
    req = MissionRequest(activity=Activity.walking, duration_min=20)
    resp = await svc.generate(req)
    assert resp.mode == "demo"
    assert resp.notice is not None
    assert "ollama" in resp.notice.lower()
    assert resp.mission.title
