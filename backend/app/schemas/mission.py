from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class Activity(str, Enum):
    running = "running"
    walking = "walking"
    jogging = "jogging"


class Difficulty(str, Enum):
    easy = "easy"
    moderate = "moderate"
    challenging = "challenging"


class Goal(str, Enum):
    fitness = "fitness"
    exploration = "exploration"
    nature = "nature"
    stress_relief = "stress_relief"
    adventure = "adventure"
    random = "random"


class Environment(str, Enum):
    campus = "campus"
    park = "park"
    neighborhood = "neighborhood"
    trail = "trail"
    anywhere = "anywhere"


class CheckpointType(str, Enum):
    observation = "observation"
    fitness = "fitness"
    nature = "nature"
    mindfulness = "mindfulness"
    social = "social"
    exploration = "exploration"


class RouteStyle(str, Enum):
    loop = "loop"
    out_and_back = "out_and_back"
    wander = "wander"


class MissionRequest(BaseModel):
    activity: Activity = Activity.running
    duration_min: int = Field(30, ge=5, le=180)
    difficulty: Difficulty = Difficulty.moderate
    goal: Goal = Goal.exploration
    environment: Environment = Environment.anywhere
    mood: str = Field("", max_length=200)
    prefer_demo: bool = False


class Checkpoint(BaseModel):
    title: str = Field(min_length=2, max_length=60)
    instruction: str = Field(min_length=8, max_length=220)
    type: CheckpointType
    at_minute: int = Field(ge=0, le=180)


class Mission(BaseModel):
    """What Gemma must produce. Validated before anything reaches the UI."""

    title: str = Field(min_length=3, max_length=60)
    summary: str = Field(min_length=10, max_length=240)
    warmup: str = Field(min_length=5, max_length=140)
    estimated_distance_km: float = Field(gt=0, le=60)
    difficulty: Difficulty
    route_style: RouteStyle
    pre_run_tip: str = Field(min_length=5, max_length=200)
    checkpoints: list[Checkpoint] = Field(min_length=2, max_length=8)
    cooldown: str = Field(min_length=5, max_length=140)
    screen_off_message: str = Field(min_length=5, max_length=140)

    @field_validator("checkpoints")
    @classmethod
    def sort_checkpoints(cls, v: list[Checkpoint]) -> list[Checkpoint]:
        return sorted(v, key=lambda c: c.at_minute)


MissionMode = Literal["ai", "demo"]


