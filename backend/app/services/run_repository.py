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

    def get(self, run_id: int) -> Run | None:
        with self.db.connect() as c:
            row = c.execute("SELECT * FROM runs WHERE id = ?", (run_id,)).fetchone()
        return _row_to_run(row) if row else None

    def list(self, limit: int = 50) -> list[Run]:
        with self.db.connect() as c:
            rows = c.execute("SELECT * FROM runs ORDER BY created_at DESC, id DESC LIMIT ?", (limit,)).fetchall()
        return [_row_to_run(r) for r in rows]

    def update(self, run_id: int, patch: RunUpdate) -> Run | None:
        fields = patch.model_dump(exclude_none=True)
        if fields:
            sets = ", ".join(f"{k} = ?" for k in fields)
            with self.db.connect() as c:
                c.execute(f"UPDATE runs SET {sets} WHERE id = ?", (*fields.values(), run_id))
        return self.get(run_id)

    def delete(self, run_id: int) -> bool:
        with self.db.connect() as c:
            return c.execute("DELETE FROM runs WHERE id = ?", (run_id,)).rowcount > 0

    def delete_all(self) -> int:
        with self.db.connect() as c:
            return c.execute("DELETE FROM runs").rowcount

    def history_summary(self, n: int = 5) -> str:
        runs = self.list(n)
        if not runs:
            return "none yet"
        parts = []
        for r in runs:
            parts.append(
                f"{r.activity} {round(r.duration_sec / 60)} min, {r.distance_km:.1f} km, {r.difficulty}, "
                f"{r.checkpoints_done}/{r.checkpoints_total} checkpoints, felt {r.feeling or 'unrated'}"
                + (", stopped early" if r.finished_early else "")
            )
        return "; ".join(parts)

    # ---------- export ----------
    def export_json(self) -> str:
        return json.dumps([r.model_dump() for r in self.list(100000)], indent=2)

    def export_csv(self) -> str:
        buf = io.StringIO()
        w = csv.writer(buf)
        w.writerow(COLUMNS)
        for r in self.list(100000):
            d = r.model_dump()
            w.writerow([d[k] for k in COLUMNS])
        return buf.getvalue()

    # ---------- progression ----------
    def stats(self, today: date | None = None) -> Stats:
        today = today or date.today()
        runs = self.list(100000)
        days = sorted({datetime.fromisoformat(r.created_at).date() for r in runs})

