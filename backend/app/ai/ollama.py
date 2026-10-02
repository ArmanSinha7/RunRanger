"""Async client for a local Ollama server.

All AI in RunRanger goes through this file, and it only ever talks to the
Ollama URL in config (default http://localhost:11434). There is no cloud
fallback: if Ollama is down, the app switches to clearly-labelled Demo Mode.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

import httpx


class OllamaUnavailable(Exception):
    """Ollama isn't running / reachable."""


class ModelNotInstalled(Exception):
    """Ollama is running but the configured model hasn't been pulled."""


