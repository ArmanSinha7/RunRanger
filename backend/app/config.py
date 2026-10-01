"""Runtime configuration. Every setting has a free, local default.

There are deliberately NO API-key settings: RunRanger has no paid or keyed
dependencies. Override values with environment variables if you need to.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_DIR = BACKEND_DIR.parent


@dataclass(frozen=True)
class Settings:
    ollama_url: str = field(default_factory=lambda: os.getenv("OLLAMA_URL", "http://localhost:11434"))
    ollama_model: str = field(default_factory=lambda: os.getenv("OLLAMA_MODEL", "gemma3:4b"))
    ollama_timeout_s: float = field(default_factory=lambda: float(os.getenv("OLLAMA_TIMEOUT_S", "120")))
    db_path: Path = field(
        default_factory=lambda: Path(os.getenv("RUNRANGER_DB", str(PROJECT_DIR / "data" / "runranger.db")))
    )
    # "local" = geometric loop computed on this machine (no network, no location leaves the device).
    # "osrm"  = opt-in road-snapped route from an OSRM server (public demo server by default).
    osrm_url: str = field(default_factory=lambda: os.getenv("OSRM_URL", "https://router.project-osrm.org"))
    cors_origins: tuple[str, ...] = field(
        default_factory=lambda: tuple(
            os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
        )
    )

