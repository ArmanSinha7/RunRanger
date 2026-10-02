"""Post-run reflection: Gemma locally, or a clearly-labelled template."""
from __future__ import annotations

from pydantic import BaseModel, Field, ValidationError

from ..ai.ollama import OllamaClient, OllamaUnavailable, ModelNotInstalled, loads_lenient
from ..ai.parsing import find_unsafe
from ..ai.prompts import REFLECTION_SYSTEM, reflection_user_prompt
from ..schemas.run import ReflectionRequest, ReflectionResponse


class _ReflectionOut(BaseModel):
    reflection: str = Field(min_length=10, max_length=320)
    next_run: str = Field(min_length=5, max_length=200)


def _facts(r: ReflectionRequest) -> dict:
    mins = round(r.duration_sec / 60)
    pace = f"{(r.duration_sec / 60) / r.distance_km:.1f} min/km" if r.distance_km >= 0.3 else "not measured"
    return {
        "mission": r.mission_title,
        "activity": r.activity,
        "planned minutes": r.planned_minutes,
        "actual minutes": mins,
        "distance km": round(r.distance_km, 2),
        "pace": pace,
        "checkpoints completed": f"{r.checkpoints_done} of {r.checkpoints_total}",
        "completed challenges": ", ".join(r.completed_challenges) or "none",
        "stopped early": "yes" if r.finished_early else "no",
        "felt": r.feeling,
        "their note": r.note or "(none)",
    }


