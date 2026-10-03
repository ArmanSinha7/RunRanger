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


# ---------- missions ----------
@router.post("/missions", response_model=MissionResponse)
async def create_mission(req: MissionRequest, svc: MissionService = Depends(get_mission_service),
                         runs: RunRepository = Depends(get_runs)) -> MissionResponse:
    return await svc.generate(req, history=runs.history_summary())


# ---------- routing ----------
class RouteRequest(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    distance_km: float = Field(gt=0.2, le=60)
    style: Literal["loop", "out_and_back", "wander"] = "loop"
    seed: str = Field("runranger", max_length=120)
    checkpoint_fractions: list[float] = Field(default_factory=list, max_length=10)
    provider: Literal["osrm", "local"] = "osrm"


class RouteResponse(BaseModel):
    provider: Literal["local", "osrm"]
    geometry: list[tuple[float, float]]
    checkpoints: list[tuple[float, float]]
    distance_km: float
    notice: str | None = None
    streets: list[str] = Field(default_factory=list)


@router.post("/route", response_model=RouteResponse)
async def route(req: RouteRequest, local: LocalRouteProvider = Depends(get_local_router),
                osrm: OsrmRouteProvider = Depends(get_osrm_router)) -> RouteResponse:
    # The start point is used for this computation only; it is never written to disk.
    provider = osrm if req.provider == "osrm" else local
    rt = await build_route(provider, (req.lat, req.lng), req.distance_km, req.style, req.seed,
                           [min(max(f, 0.0), 1.0) for f in req.checkpoint_fractions])
    return RouteResponse(provider=rt.provider, geometry=rt.geometry, checkpoints=rt.checkpoints,
                         distance_km=rt.distance_km, notice=rt.notice, streets=rt.streets)


# ---------- runs ----------
@router.get("/runs", response_model=list[Run])
def list_runs(limit: int = 50, runs: RunRepository = Depends(get_runs)) -> list[Run]:
    return runs.list(min(max(limit, 1), 500))


@router.post("/runs", response_model=Run, status_code=201)
def save_run(run: RunCreate, runs: RunRepository = Depends(get_runs)) -> Run:
    return runs.create(run)


@router.patch("/runs/{run_id}", response_model=Run)
def update_run(run_id: int, patch: RunUpdate, runs: RunRepository = Depends(get_runs)) -> Run:
    r = runs.update(run_id, patch)
    if not r:
        raise HTTPException(404, "Run not found")
    return r


@router.delete("/runs/{run_id}", status_code=204)
def delete_run(run_id: int, runs: RunRepository = Depends(get_runs)) -> Response:
    if not runs.delete(run_id):
        raise HTTPException(404, "Run not found")
    return Response(status_code=204)


