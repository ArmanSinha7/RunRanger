from __future__ import annotations

import json
import pytest

from app.ai.parsing import (
    MissionRejected,
    expected_distance_km,
    find_unsafe,
    parse_mission,
)
from app.schemas.mission import Activity, Difficulty, MissionRequest


def test_expected_distance_calculation():
    req_run = MissionRequest(activity=Activity.running, duration_min=30, difficulty=Difficulty.moderate)
    dist = expected_distance_km(req_run)
    assert 3.5 <= dist <= 4.5

    req_walk = MissionRequest(activity=Activity.walking, duration_min=30, difficulty=Difficulty.easy)
    dist_walk = expected_distance_km(req_walk)
    assert 1.5 <= dist_walk <= 2.5


def test_safety_filter_detects_hazards():
    assert find_unsafe("Please cross highway and jump tracks") is not None
    assert find_unsafe("Climb the fence into private property") is not None
    assert find_unsafe("Jog gently through the community park path") is None


def test_parse_mission_valid():
    req = MissionRequest(activity=Activity.running, duration_min=30, difficulty=Difficulty.moderate)
    raw = json.dumps({
        "title": "Park Discovery Loop",
        "summary": "A peaceful 30-minute exploratory run through open green spaces.",
        "warmup": "5 minutes gentle jogging and dynamic stretches",
        "estimated_distance_km": 3.8,
        "difficulty": "moderate",
        "route_style": "loop",
        "pre_run_tip": "Keep your gaze forward and enjoy the surroundings.",
        "checkpoints": [
            {
                "title": "First Oak Tree",
                "instruction": "Spot an old oak tree with distinctive leaves.",
                "type": "nature",
                "at_minute": 8,
            },
            {
                "title": "Stride Acceleration",
                "instruction": "Increase your turnover comfortably for 45 seconds.",
                "type": "fitness",
                "at_minute": 18,
            },
            {
                "title": "Sound Immersion",
                "instruction": "Listen for bird songs or flowing water nearby.",
                "type": "mindfulness",
                "at_minute": 24,
            },
        ],
        "cooldown": "5 minutes leisurely walking",
        "screen_off_message": "Mission locked. Put your phone in your pocket and run.",
    })
    mission = parse_mission(raw, req)
    assert mission.title == "Park Discovery Loop"
    assert len(mission.checkpoints) >= 2


def test_parse_mission_rejects_unsafe():
    req = MissionRequest(activity=Activity.running, duration_min=30, difficulty=Difficulty.moderate)
    raw = json.dumps({
        "title": "Risky Run",
        "summary": "A dangerous mission that tests your luck.",
        "warmup": "5 minutes warm up",
        "estimated_distance_km": 3.8,
        "difficulty": "moderate",
        "route_style": "loop",
        "pre_run_tip": "Run fast",
        "checkpoints": [
            {
                "title": "Cross Highway",
                "instruction": "Sprint across highway into traffic quickly.",
                "type": "fitness",
                "at_minute": 10,
            },
            {
                "title": "Trespass Fence",
                "instruction": "Climb fence into private property now.",
                "type": "exploration",
                "at_minute": 20,
            },
        ],
        "cooldown": "5 minutes walking",
        "screen_off_message": "Put away your phone.",
    })
    with pytest.raises(MissionRejected) as exc:
        parse_mission(raw, req)
    assert "unsafe" in str(exc.value).lower()
