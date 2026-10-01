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

        current = 0
        if days:
            cursor = today if today in days else today - timedelta(days=1)
            day_set = set(days)
            while cursor in day_set:
                current += 1
                cursor -= timedelta(days=1)

        longest_streak, run_len = 0, 0
        for i, d in enumerate(days):
            run_len = run_len + 1 if i and (d - days[i - 1]).days == 1 else 1
            longest_streak = max(longest_streak, run_len)

        week_start = today - timedelta(days=6)
        week = [r for r in runs if datetime.fromisoformat(r.created_at).date() >= week_start]
        challenges = sum(r.checkpoints_done for r in runs)
        total_km = sum(r.distance_km for r in runs)
        longest = max((r.distance_km for r in runs), default=0.0)
        fav = Counter(r.activity for r in runs).most_common(1)
        paced = [r.duration_sec / 60 / r.distance_km for r in runs if r.distance_km >= 1 and r.duration_sec > 0]

        bests: dict[str, float] = {}
        if runs:
            bests["longest_distance_km"] = round(longest, 2)
            bests["longest_duration_min"] = round(max(r.duration_sec for r in runs) / 60, 1)
        if paced:
            bests["fastest_pace_min_per_km"] = round(min(paced), 2)

        environments = {r.environment for r in runs}
        badges = [
            Badge(id="first_run", emoji="🌱", name="First Run", description="Complete your first mission.", earned=len(runs) >= 1),
            Badge(id="five_k", emoji="🏃", name="5K Explorer", description="Cover 5 km in a single outing.", earned=longest >= 5),
            Badge(id="full_mission", emoji="🎯", name="Mission Complete", description="Finish every checkpoint in a mission.",
                  earned=any(r.checkpoints_total and r.checkpoints_done >= r.checkpoints_total for r in runs)),
            Badge(id="touch_grass", emoji="🌳", name="Touch Grass Champion", description="Complete 25 outdoor challenges.", earned=challenges >= 25),
            Badge(id="streak_7", emoji="🔥", name="7-Day Streak", description="Get outside 7 days in a row.", earned=longest_streak >= 7),
            Badge(id="route_explorer", emoji="🗺️", name="Route Explorer", description="Run in 3 different kinds of places.", earned=len(environments) >= 3),
        ]

        return Stats(
            total_runs=len(runs),
            total_distance_km=round(total_km, 2),
            total_active_sec=sum(r.duration_sec for r in runs),
            challenges_completed=challenges,
            longest_run_km=round(longest, 2),
            current_streak_days=current,
            favorite_activity=fav[0][0] if fav else None,
            difficulty_progression=[r.difficulty for r in reversed(runs[:10])],
            this_week=WeekStats(runs=len(week), distance_km=round(sum(r.distance_km for r in week), 2),
                                active_sec=sum(r.duration_sec for r in week)),
            personal_bests=bests,
            badges=badges,
        )
