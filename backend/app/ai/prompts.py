"""Prompt builders. Gemma only ever returns JSON matching our schemas."""
from __future__ import annotations

from ..schemas.mission import MissionRequest

MISSION_SYSTEM = """You are RunRanger, an outdoor running and walking coach whose real job is to get people OFF their phone and outside.
You design one short "mission" for a single outing. The person will read it once, lock their phone, and go.

Rules:
- Write short, vivid, concrete instructions a person can remember without looking at the screen (max ~25 words each).
- Mix checkpoint types to fit the goal: observation, nature, fitness, mindfulness, social, exploration.
- Spread checkpoints across the outing with "at_minute" (minutes from the start, after the warm-up, before the cooldown).
- Match effort to the activity and difficulty. Walking missions must not ask for sprinting.
- Social challenges must be light and optional (a nod, a smile, a wave). Never ask people to approach, follow or photograph strangers.
- SAFETY IS NON-NEGOTIABLE. Never suggest: crossing roads outside crossings, running in traffic, trespassing, private or restricted areas,
  climbing fences/walls/trees, train tracks, water, cliffs, rooftops, construction sites, touching wild animals, or running with eyes closed.
  "Exploration" means choosing a different *safe, public* path.
- Do not mention the app, screens or AI inside checkpoints. The point is to look up.
- No emojis in titles. Output JSON only."""


def checkpoint_count(duration_min: int) -> tuple[int, int]:
    if duration_min <= 15:
        return 2, 3
    if duration_min <= 30:
        return 3, 4
    if duration_min <= 45:
        return 4, 5
    return 5, 6


def mission_user_prompt(req: MissionRequest, expected_km: float, history: str) -> str:
    lo, hi = checkpoint_count(req.duration_min)
    mood = req.mood.strip() or "(not given)"
    return f"""Design a mission.

Activity: {req.activity.value}
Total duration: {req.duration_min} minutes (including warm-up and cooldown)
Difficulty: {req.difficulty.value}
Goal: {req.goal.value.replace('_', ' ')}
Environment: {req.environment.value}
How they feel today: {mood}
Realistic distance for this outing: about {expected_km:.1f} km (use this for estimated_distance_km)
Recent outings (most recent first): {history}

Return between {lo} and {hi} checkpoints with at_minute values between 3 and {max(4, req.duration_min - 3)}.
Pick route_style: "loop" for most runs, "out_and_back" for focused fitness, "wander" for exploration or nature.
The difficulty field must be "{req.difficulty.value}"."""


def correction_prompt(errors: list[str]) -> str:
    joined = "\n".join(f"- {e}" for e in errors[:8])
    return (
        "Your previous JSON was rejected by the validator:\n"
        f"{joined}\n"
        "Return the full corrected mission as JSON only, fixing every problem and keeping it safe."
    )

