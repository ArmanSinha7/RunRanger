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


