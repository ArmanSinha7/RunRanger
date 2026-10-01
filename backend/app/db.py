"""Tiny SQLite layer (stdlib only). The database file lives in ./data on your machine."""
from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

SCHEMA = """
CREATE TABLE IF NOT EXISTS runs (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at           TEXT    NOT NULL,
    mission_title        TEXT    NOT NULL,
    activity             TEXT    NOT NULL,
    difficulty           TEXT    NOT NULL,
    goal                 TEXT    NOT NULL,
    environment          TEXT    NOT NULL,
    planned_minutes      INTEGER NOT NULL,
    duration_sec         INTEGER NOT NULL,
    distance_km          REAL    NOT NULL,
    checkpoints_total    INTEGER NOT NULL,
    checkpoints_done     INTEGER NOT NULL,
    finished_early       INTEGER NOT NULL DEFAULT 0,
    feeling              TEXT,
    note                 TEXT,
    reflection           TEXT,
    mode                 TEXT    NOT NULL,
    mission_json         TEXT    NOT NULL
);
"""
# Note: no GPS track and no coordinates are stored. Only the distance number.


class Database:
    def __init__(self, path: Path):
        self.path = Path(path)
        if str(self.path) != ":memory:":
            self.path.parent.mkdir(parents=True, exist_ok=True)
        self._memory_conn: sqlite3.Connection | None = None
        with self.connect() as conn:
            conn.executescript(SCHEMA)

