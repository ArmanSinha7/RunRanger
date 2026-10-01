from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

Feeling = Literal["amazing", "great", "good", "okay", "hard"]


class RunCreate(BaseModel):
    mission_title: str = Field(max_length=80)
    activity: str
    difficulty: str
    goal: str
    environment: str
    planned_minutes: int = Field(ge=1, le=600)
    duration_sec: int = Field(ge=0, le=86400)
    distance_km: float = Field(ge=0, le=200)
    checkpoints_total: int = Field(ge=0, le=20)
    checkpoints_done: int = Field(ge=0, le=20)
    finished_early: bool = False
    feeling: Feeling | None = None
    note: str | None = Field(None, max_length=500)
    reflection: str | None = Field(None, max_length=1000)
    mode: Literal["ai", "demo"]
    mission: dict


class Run(RunCreate):
    id: int
    created_at: str


class RunUpdate(BaseModel):
    feeling: Feeling | None = None
    note: str | None = Field(None, max_length=500)
    reflection: str | None = Field(None, max_length=1000)


