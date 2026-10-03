from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field

from ..ai.ollama import OllamaClient
from ..deps import (get_llm, get_local_router, get_mission_service, get_osrm_router, get_reflection_service,
                    get_runs)
from ..schemas.mission import MissionRequest, MissionResponse
from ..schemas.run import ReflectionRequest, ReflectionResponse, Run, RunCreate, RunUpdate, Stats
from ..services.mission_service import MissionService
from ..services.reflection_service import ReflectionService
from ..services.routing import LocalRouteProvider, OsrmRouteProvider, build_route
from ..services.run_repository import RunRepository

router = APIRouter(prefix="/api")


# ---------- health ----------
class Health(BaseModel):
    ok: bool = True
    mode: Literal["ai", "demo"]
    ollama_running: bool
    model: str
    model_installed: bool
    message: str


@router.get("/health", response_model=Health)
async def health(llm: OllamaClient = Depends(get_llm)) -> Health:
    s = await llm.status()
    if s.running and s.model_installed:
        msg = f"AI Mode: {s.model} is running locally through Ollama."
    elif s.running:
        msg = f"Ollama is running, but {s.model} isn't installed. Run: ollama pull {s.model}"
    else:
        msg = "Ollama isn't running. Install it from ollama.com, then run: ollama serve"
    return Health(mode="ai" if s.running and s.model_installed else "demo", ollama_running=s.running,
                  model=s.model, model_installed=s.model_installed, message=msg)

