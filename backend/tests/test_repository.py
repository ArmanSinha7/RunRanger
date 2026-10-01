from __future__ import annotations

from pathlib import Path
import pytest

from app.db import Database
from app.schemas.run import RunCreate, RunUpdate
from app.services.run_repository import RunRepository


@pytest.fixture
def repo():
    db = Database(Path(":memory:"))
    return RunRepository(db)


def test_repository_crud_and_stats(repo: RunRepository):
    # Initial stats
    st0 = repo.stats()
    assert st0.total_runs == 0
    assert not any(b.earned for b in st0.badges)

    # Create run
    r1 = repo.create(
        RunCreate(
            mission_title="Morning Grass Run",
            activity="running",
            difficulty="moderate",
            goal="nature",
            environment="park",
            planned_minutes=30,
            duration_sec=1800,
            distance_km=5.2,
            checkpoints_total=3,
            checkpoints_done=3,
            finished_early=False,
            feeling="great",
            note="Spotted two squirrels and blooming flowers",
            reflection="Great job maintaining rhythm.",
            mode="demo",
            mission={},
        )
    )
    assert r1.id is not None
    assert r1.mission_title == "Morning Grass Run"

