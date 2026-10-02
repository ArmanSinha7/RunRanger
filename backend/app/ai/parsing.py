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


class MissionRejected(Exception):
    def __init__(self, errors: list[str]):
        super().__init__("; ".join(errors))
        self.errors = errors


def expected_distance_km(req: MissionRequest) -> float:
    # Warm-up and cooldown are slower: count ~80% of the time at target pace.
    moving_h = (req.duration_min * 0.8) / 60.0
    return round(PACE_KMH[req.activity] * DIFFICULTY_FACTOR[req.difficulty] * moving_h, 1)


def find_unsafe(text: str) -> str | None:
    for rx in _UNSAFE_RE:
        m = rx.search(text)
        if m:
            return m.group(0)
    return None


def parse_mission(raw: str, req: MissionRequest) -> Mission:
    """Decode, validate and sanitise. Raises MissionRejected with fixable errors."""
    try:
        data = loads_lenient(raw)
    except (json.JSONDecodeError, ValueError):
        raise MissionRejected(["Output was not valid JSON."])
    if not isinstance(data, dict):
        raise MissionRejected(["Top level must be a JSON object."])

