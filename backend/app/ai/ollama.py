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


@dataclass
class OllamaStatus:
    running: bool
    model: str
    model_installed: bool
    installed_models: list[str]


class OllamaClient:
    def __init__(self, base_url: str, model: str, timeout_s: float = 120.0, transport: httpx.AsyncBaseTransport | None = None):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout_s = timeout_s
        self._transport = transport  # injectable for tests

    def _client(self, timeout: float) -> httpx.AsyncClient:
        return httpx.AsyncClient(base_url=self.base_url, timeout=timeout, transport=self._transport)

    async def status(self) -> OllamaStatus:
        try:
            async with self._client(3.0) as c:
                r = await c.get("/api/tags")
                r.raise_for_status()
                names = [m.get("name", "") for m in r.json().get("models", [])]
        except (httpx.HTTPError, ValueError):
            return OllamaStatus(False, self.model, False, [])
        installed = any(n == self.model or n == f"{self.model}:latest" for n in names)
        return OllamaStatus(True, self.model, installed, names)

    async def chat_raw(self, messages: list[dict[str, str]], schema: dict[str, Any] | None = None, temperature: float = 0.7) -> str:
        """Returns the assistant message content (a JSON string when schema is given)."""
        payload: dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature},
        }
        if schema is not None:
            payload["format"] = schema  # Ollama structured outputs: constrained decoding
        try:
            async with self._client(self.timeout_s) as c:
                r = await c.post("/api/chat", json=payload)
        except httpx.HTTPError as e:
            raise OllamaUnavailable(str(e)) from e
        if r.status_code == 404 and "not found" in r.text.lower():
            raise ModelNotInstalled(self.model)
        if r.status_code >= 400:
            raise OllamaUnavailable(f"HTTP {r.status_code}")
        try:
            return r.json()["message"]["content"]
        except (ValueError, KeyError) as e:
            raise OllamaUnavailable("Unexpected response from Ollama") from e

