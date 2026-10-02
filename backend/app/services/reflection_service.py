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


def template_reflection(r: ReflectionRequest) -> ReflectionResponse:
    ratio = r.checkpoints_done / r.checkpoints_total if r.checkpoints_total else 0
    mins = max(1, round(r.duration_sec / 60))
    if r.finished_early:
        text = f"You got outside for {mins} minutes, and that counts. Stopping when your body says so is a skill too."
        nxt = "Next time, try a shorter mission at an easy pace and aim to finish it."
    elif ratio >= 1:
        text = f"You completed every checkpoint in {mins} minutes. Nice, consistent effort."
        nxt = "Next time, add five minutes or step the difficulty up one level."
    else:
        text = f"You spent {mins} minutes outside and completed {r.checkpoints_done} of {r.checkpoints_total} checkpoints."
        nxt = "Next time, try to catch one more checkpoint by keeping the mission in mind."
    if r.feeling == "hard":
        nxt = "Next time, keep the same duration but choose Easy, and let it feel good."
    return ReflectionResponse(mode="demo", reflection=text, next_run=nxt)


class ReflectionService:
    def __init__(self, llm: OllamaClient):
        self.llm = llm

    async def reflect(self, req: ReflectionRequest) -> ReflectionResponse:
        status = await self.llm.status()
        if not (status.running and status.model_installed):
            return template_reflection(req)
        messages = [
            {"role": "system", "content": REFLECTION_SYSTEM},
            {"role": "user", "content": reflection_user_prompt(_facts(req))},
        ]
        for _ in range(2):
            try:
                raw = await self.llm.chat_json(messages, _ReflectionOut.model_json_schema(), temperature=0.6)
                out = _ReflectionOut.model_validate(loads_lenient(raw))
                if find_unsafe(out.reflection + " " + out.next_run):
                    continue
                return ReflectionResponse(mode="ai", model=self.llm.model, reflection=out.reflection, next_run=out.next_run)
            except (OllamaUnavailable, ModelNotInstalled):
                break
            except (ValidationError, ValueError):
                continue
        return template_reflection(req)
