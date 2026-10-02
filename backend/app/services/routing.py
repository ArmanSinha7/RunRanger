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

    async def route(self, start: LatLng, distance_km: float, style: str, seed: str) -> Route:
        rng = _rng(seed)

        # 1. Snap start coordinate to nearest walkable road
        snapped_start = start
        try:
            nearest_url = f"{self.base_url}/nearest/v1/foot/{start[1]:.6f},{start[0]:.6f}"
            async with httpx.AsyncClient(timeout=4.0, transport=self._transport) as c:
                nr = await c.get(nearest_url)
                if nr.status_code == 200:
                    ndata = nr.json()
                    if ndata.get("code") == "Ok" and ndata.get("waypoints"):
                        loc = ndata["waypoints"][0]["location"]
                        snapped_start = (loc[1], loc[0])
        except Exception:
            snapped_start = start

        # 2. Formulate 3 diverse directional candidate waypoint sets
        base_h = rng.uniform(0, 2 * math.pi)
        candidate_headings = [
            base_h,
            (base_h + 1.57) % (2 * math.pi),
            (base_h + 3.14) % (2 * math.pi),
        ]

        candidate_wps: list[list[LatLng]] = []
        for heading in candidate_headings:
            if style == "out_and_back":
                out_dist = max(0.2, (distance_km / 2.0) / 1.35)
                turnaround = offset(snapped_start, out_dist, heading)
                candidate_wps.append([snapped_start, turnaround, snapped_start])
            elif style == "wander":
                r = max(0.15, distance_km / 7.5)
                p1 = offset(snapped_start, r, heading)
                p2 = offset(p1, r * 1.1, heading + 1.8)
                p3 = offset(p2, r * 0.9, heading + 3.4)
                candidate_wps.append([snapped_start, p1, p2, p3, snapped_start])
            else:
                # Standard Loop: 3-point closed triangle around start
                r = max(0.12, distance_km / 8.5)
                p1 = offset(snapped_start, r, heading)
                p2 = offset(snapped_start, r, heading + 2.094)
                candidate_wps.append([snapped_start, p1, p2, snapped_start])

        # 3. Query candidates in parallel
        try:
            async with httpx.AsyncClient(
                timeout=7.0,
                transport=self._transport,
                headers={"User-Agent": "RunRanger/0.1 (open-source; github)"},
            ) as client:
                tasks = [
                    self._fetch_candidate(client, wps)
                    for wps in candidate_wps
                ]
                results = await asyncio.gather(*tasks, return_exceptions=True)

            valid_routes: list[Route] = [
                r for r in results if isinstance(r, Route) and len(r.geometry) >= 5
            ]
            if valid_routes:
                # Pick the route whose real road distance is closest to requested distance
                best_route = min(valid_routes, key=lambda r: abs(r.distance_km - distance_km))
                return best_route
        except Exception:
            pass

        # If OSRM fails or times out, fall back safely to local orthogonal grid
        fallback_route = await self.fallback.route(snapped_start, distance_km, style, seed)
        fallback_route.notice = "Online road router unavailable; showing local pedestrian estimation."
        return fallback_route

