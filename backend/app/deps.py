"""Dependency wiring. Kept in one place so tests can override it."""
from __future__ import annotations

from functools import lru_cache

from .ai.ollama import OllamaClient
from .config import settings
from .db import Database
from .services.mission_service import MissionService
from .services.reflection_service import ReflectionService
from .services.routing import LocalRouteProvider, OsrmRouteProvider
from .services.run_repository import RunRepository


@lru_cache
def get_llm() -> OllamaClient:
    return OllamaClient(settings.ollama_url, settings.ollama_model, settings.ollama_timeout_s)


@lru_cache
def get_db() -> Database:
    return Database(settings.db_path)


def get_runs() -> RunRepository:
    return RunRepository(get_db())


def get_mission_service() -> MissionService:
    return MissionService(get_llm())


def get_reflection_service() -> ReflectionService:
    return ReflectionService(get_llm())


@lru_cache
def get_local_router() -> LocalRouteProvider:
    return LocalRouteProvider()


def get_osrm_router() -> OsrmRouteProvider:
    return OsrmRouteProvider(settings.osrm_url, get_local_router())
