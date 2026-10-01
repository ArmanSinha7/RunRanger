"""Local run history (SQLite) and progression. No accounts, no cloud."""
from __future__ import annotations

import csv
import io
import json
from collections import Counter
from datetime import date, datetime, timedelta

from ..db import Database
from ..schemas.run import Badge, Run, RunCreate, RunUpdate, Stats, WeekStats

COLUMNS = [
    "id", "created_at", "mission_title", "activity", "difficulty", "goal", "environment", "planned_minutes",
    "duration_sec", "distance_km", "checkpoints_total", "checkpoints_done", "finished_early", "feeling", "note",
    "reflection", "mode",
]


def _row_to_run(row) -> Run:
    d = dict(row)
    d["finished_early"] = bool(d["finished_early"])
    d["mission"] = json.loads(d.pop("mission_json"))
    return Run(**d)


class RunRepository:
    def __init__(self, db: Database):
        self.db = db

    def create(self, run: RunCreate, now: datetime | None = None) -> Run:
        created = (now or datetime.now()).isoformat(timespec="seconds")
        done = min(run.checkpoints_done, run.checkpoints_total)
        with self.db.connect() as c:
            cur = c.execute(
                """INSERT INTO runs (created_at, mission_title, activity, difficulty, goal, environment, planned_minutes,
                   duration_sec, distance_km, checkpoints_total, checkpoints_done, finished_early, feeling, note,
                   reflection, mode, mission_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (created, run.mission_title, run.activity, run.difficulty, run.goal, run.environment, run.planned_minutes,
                 run.duration_sec, round(run.distance_km, 3), run.checkpoints_total, done, int(run.finished_early),
                 run.feeling, run.note, run.reflection, run.mode, json.dumps(run.mission)),
            )
            new_id = cur.lastrowid
        return self.get(new_id)  # type: ignore[return-value]

