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


