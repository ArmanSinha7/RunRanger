from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class Activity(str, Enum):
    running = "running"
    walking = "walking"
    jogging = "jogging"


