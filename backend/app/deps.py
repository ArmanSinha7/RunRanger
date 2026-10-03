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

