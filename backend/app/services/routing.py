"""Routing service: road and trail snapped routes using open-source OSRM, with offline local fallback.

- OsrmRouteProvider (Default):
  Snaps waypoints to real streets, sidewalks, and pedestrian paths using OSRM's foot profile.
  Avoids crossing through buildings, private property, or off-road hazards.
  Extracts the real street names along the route.
- LocalRouteProvider (Offline Fallback):
  Generates a rectangular/grid-based block route when offline, avoiding diagonal building slicing.
"""
from __future__ import annotations

import asyncio
import hashlib
import math
import random
from dataclasses import dataclass, field
from typing import Literal, Protocol

import httpx

EARTH_R_KM = 6371.0
LatLng = tuple[float, float]


@dataclass
class Route:
    provider: Literal["local", "osrm"]
    geometry: list[LatLng]
    distance_km: float
    notice: str | None = None
    checkpoints: list[LatLng] = field(default_factory=list)
    streets: list[str] = field(default_factory=list)

