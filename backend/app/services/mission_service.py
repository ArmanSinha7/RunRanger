"""Mission generation: Gemma 3 locally when available, honest Demo Mode otherwise."""
from __future__ import annotations

import json
import time
from pathlib import Path

from ..ai.ollama import ModelNotInstalled, OllamaClient, OllamaUnavailable
from ..ai.parsing import MissionRejected, expected_distance_km, parse_mission
from ..ai.prompts import MISSION_SYSTEM, correction_prompt, mission_user_prompt
from ..schemas.mission import Checkpoint, Mission, MissionRequest, MissionResponse, mission_json_schema

DEMO_FILE = Path(__file__).resolve().parent.parent / "data" / "demo_missions.json"
MAX_ATTEMPTS = 3


def load_demo_templates() -> list[dict]:
    return json.loads(DEMO_FILE.read_text(encoding="utf-8"))["missions"]


def demo_mission(req: MissionRequest, templates: list[dict] | None = None) -> Mission:
    """Deterministic: best template for the goal/activity, scaled to the duration."""
    templates = templates or load_demo_templates()

    def score(t: dict) -> tuple[int, int]:
        return (int(req.goal.value in t["goals"]), int(req.activity.value in t["activities"]))

    t = max(templates, key=score)  # max() keeps the first best match: stable
    last = max(4, req.duration_min - 3)
    cps = [
        Checkpoint(
            title=c["title"],
            instruction=c["instruction"],
            type=c["type"],
            at_minute=min(last, max(2, round(c["at"] * req.duration_min))),
        )
        for c in t["checkpoints"]
    ]
    return Mission(
        title=t["title"],
        summary=t["summary"],
        warmup=t["warmup"],
        estimated_distance_km=expected_distance_km(req),
        difficulty=req.difficulty,
        route_style=t["route_style"],
        pre_run_tip=t["pre_run_tip"],
        checkpoints=cps,
        cooldown=t["cooldown"],
        screen_off_message=t["screen_off_message"],
    )


class MissionService:
    def __init__(self, llm: OllamaClient):
        self.llm = llm

    async def generate(self, req: MissionRequest, history: str = "none yet") -> MissionResponse:
        if req.prefer_demo:
            return MissionResponse(mode="demo", mission=demo_mission(req), request=req)

        status = await self.llm.status()
        if not status.running:
            return MissionResponse(
                mode="demo", mission=demo_mission(req), request=req,
                notice="Ollama isn't running, so this is a sample mission. Run `ollama serve` to switch on local AI.",
            )
        if not status.model_installed:
            return MissionResponse(
                mode="demo", mission=demo_mission(req), request=req,
                notice=f"Model {status.model} isn't installed yet. Run `ollama pull {status.model}`.",
            )

