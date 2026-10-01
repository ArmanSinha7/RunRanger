from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.schemas.mission import (
    Activity,
    Checkpoint,
    CheckpointType,
    Difficulty,
    Environment,
    Goal,
    Mission,
    MissionRequest,
    RouteStyle,
)


def test_checkpoint_sort_validator():
    cps = [
        Checkpoint(title="C2", instruction="Look at trees", type=CheckpointType.nature, at_minute=15),
        Checkpoint(title="C1", instruction="Warmup strides", type=CheckpointType.fitness, at_minute=5),
        Checkpoint(title="C3", instruction="Deep breath", type=CheckpointType.mindfulness, at_minute=25),
    ]
    mission = Mission(
        title="Test Mission",
        summary="A test summary of good length",
        warmup="5 min jogging",
        estimated_distance_km=3.5,
        difficulty=Difficulty.moderate,
        route_style=RouteStyle.loop,
        pre_run_tip="Hydrate and check your laces",
        checkpoints=cps,
        cooldown="5 min walking",
        screen_off_message="Lock screen and go.",
    )
    # Ensure checkpoints are automatically sorted by at_minute
    assert [c.at_minute for c in mission.checkpoints] == [5, 15, 25]


def test_mission_validation_rejects_empty():
    with pytest.raises(ValidationError):
        Mission(
            title="",
            summary="short",
            warmup="",
            estimated_distance_km=-1,
            difficulty=Difficulty.easy,
            route_style=RouteStyle.loop,
            pre_run_tip="",
            checkpoints=[],
            cooldown="",
            screen_off_message="",
        )


def test_mission_request_defaults():
    req = MissionRequest()
    assert req.activity == Activity.running
    assert req.duration_min == 30
    assert req.difficulty == Difficulty.moderate
    assert req.goal == Goal.exploration
    assert req.environment == Environment.anywhere
    assert req.prefer_demo is False
