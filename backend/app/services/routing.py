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


def path_length_km(pts: list[LatLng]) -> float:
    return sum(haversine_km(pts[i], pts[i + 1]) for i in range(len(pts) - 1))


def point_along(pts: list[LatLng], fraction: float) -> LatLng:
    if not pts:
        return (0.0, 0.0)
    if len(pts) == 1:
        return pts[0]
    total = path_length_km(pts)
    target = max(0.0, min(1.0, fraction)) * total
    acc = 0.0
    for i in range(len(pts) - 1):
        seg = haversine_km(pts[i], pts[i + 1])
        if acc + seg >= target and seg > 0:
            t = (target - acc) / seg
            return (
                pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t,
                pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t,
            )
        acc += seg
    return pts[-1]


def _rng(seed: str) -> random.Random:
    return random.Random(int(hashlib.sha256(seed.encode()).hexdigest()[:12], 16))


class LocalRouteProvider:
    """Generates an orthogonal grid-aligned route for offline use without crossing buildings diagonally."""

    async def route(self, start: LatLng, distance_km: float, style: str, seed: str) -> Route:
        rng = _rng(seed)
        heading = rng.choice([0.0, math.pi / 2, math.pi, 3 * math.pi / 2])

        if style == "out_and_back":
            half = distance_km / 2.0
            steps = 10
            step_len = half / steps
            pts = [start]
            curr = start
            for _ in range(steps):
                curr = offset(curr, step_len, heading)
                pts.append(curr)
            # Retrace back
            geometry = pts + pts[-2::-1]
        else:
            # Orthogonal rectangular block loop following standard grid blocks
            side = max(0.15, distance_km / 4.6)
            pts = [start]
            curr = start
            steps_per_side = 6
            step_len = side / steps_per_side
            for d_heading in [heading, heading + math.pi / 2, heading + math.pi, heading + 3 * math.pi / 2]:
                for _ in range(steps_per_side):
                    curr = offset(curr, step_len, d_heading)
                    pts.append(curr)
            # Ensure exact close back to start
            pts[-1] = start
            geometry = pts

        return Route(
            provider="local",
            geometry=geometry,
            distance_km=round(path_length_km(geometry), 2),
            notice="Offline grid route. Connect to network or run OSRM to snap to exact pedestrian streets and paths.",
            streets=["Local Walking Paths"],
        )


class OsrmRouteProvider:
    """Snaps running missions to real streets, footpaths, and designated pedestrian paths."""

    def __init__(
        self,
        base_url: str,
        fallback: LocalRouteProvider,
        transport: httpx.AsyncBaseTransport | None = None,
    ):
        self.base_url = base_url.rstrip("/")
        self.fallback = fallback
        self._transport = transport

    async def _fetch_candidate(
        self,
        client: httpx.AsyncClient,
        wps: list[LatLng],
    ) -> Route | None:
        coords = ";".join(f"{lng:.6f},{lat:.6f}" for lat, lng in wps)
        url = f"{self.base_url}/route/v1/foot/{coords}"
        try:
            r = await client.get(
                url,
                params={"overview": "full", "geometries": "geojson", "steps": "true"},
            )
            if r.status_code != 200:
                return None
            data = r.json()
            if data.get("code") != "Ok" or not data.get("routes"):
                return None
            rt = data["routes"][0]
            coords_raw = rt.get("geometry", {}).get("coordinates", [])
            if not coords_raw:
                return None
            geometry = [(lat, lng) for lng, lat in coords_raw]

            # Extract unique, clean street and path names
            streets: list[str] = []
            for leg in rt.get("legs", []):
                for step in leg.get("steps", []):
                    name = step.get("name")
                    if name and name.strip() and name.strip() not in streets:
                        streets.append(name.strip())

            actual_km = round(rt["distance"] / 1000.0, 2)
            return Route(
                provider="osrm",
                geometry=geometry,
                distance_km=actual_km,
                notice="Route strictly snapped to pedestrian roads, footpaths, and sidewalks (OSRM).",
                streets=streets[:8],
            )
        except Exception:
            return None

