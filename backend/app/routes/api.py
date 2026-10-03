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


