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


class RouteProvider(Protocol):
    async def route(self, start: LatLng, distance_km: float, style: str, seed: str) -> Route: ...


def offset(p: LatLng, dist_km: float, bearing_rad: float) -> LatLng:
    lat1, lon1 = math.radians(p[0]), math.radians(p[1])
    d = dist_km / EARTH_R_KM
    lat2 = math.asin(math.sin(lat1) * math.cos(d) + math.cos(lat1) * math.sin(d) * math.cos(bearing_rad))
    lon2 = lon1 + math.atan2(
        math.sin(bearing_rad) * math.sin(d) * math.cos(lat1),
        math.cos(d) - math.sin(lat1) * math.sin(lat2),
    )
    return (math.degrees(lat2), math.degrees(lon2))


def haversine_km(a: LatLng, b: LatLng) -> float:
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * EARTH_R_KM * math.asin(math.sqrt(h))

