"""Never trust model output blindly.

Model JSON -> lenient decode -> Pydantic schema -> safety filter -> deterministic guardrails.
Anything that fails produces human-readable errors that are fed back to Gemma for a retry.
"""
from __future__ import annotations

import json
import re

from pydantic import ValidationError

from ..schemas.mission import Activity, Difficulty, Mission, MissionRequest
from .ollama import loads_lenient
from .prompts import checkpoint_count

# Average moving speed (km/h) by activity, scaled by difficulty.
PACE_KMH = {Activity.walking: 5.0, Activity.jogging: 7.5, Activity.running: 9.5}
DIFFICULTY_FACTOR = {Difficulty.easy: 0.85, Difficulty.moderate: 1.0, Difficulty.challenging: 1.15}

UNSAFE_PATTERNS = [
    r"\bcross(ing)?\b.{0,20}\b(road|street|highway|tracks?|traffic)\b",
    r"\bjaywalk",
    r"\btrespass",
    r"\bprivate (property|land|road|garden)",
    r"\brestricted\b",
    r"\bclimb(ing)?\b.{0,15}\b(fence|wall|tree|gate|roof|building)",
    r"\b(train|railway|rail) ?(tracks?|line)\b",
    r"\bhighway\b",
    r"\bin(to)? (the )?traffic\b",
    r"\bjump (over|off|across)\b",
    r"\b(construction site|rooftop|cliff|ledge)\b",
    r"\b(swim|wade)\b",
    r"\beyes closed\b|\bclose your eyes\b",
    r"\b(follow|chase)\b.{0,15}\b(someone|stranger|person|runner|people)\b",
    r"\bphotograph(ing)?\b.{0,15}\b(stranger|people|person|someone)\b",
    r"\b(pet|touch|feed)\b.{0,15}\b(stray|wild|dog|animal)s?\b",
    r"\bsprint\b.{0,30}\b(downhill|in the dark)\b",
]
_UNSAFE_RE = [re.compile(p, re.IGNORECASE) for p in UNSAFE_PATTERNS]

