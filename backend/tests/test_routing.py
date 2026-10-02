from __future__ import annotations

import pytest

from app.services.routing import LocalRouteProvider, build_route


@pytest.mark.anyio
async def test_local_geometric_loop_route():
    provider = LocalRouteProvider()
    origin = (40.785091, -73.968285)
    distance_km = 3.5
    style = "loop"
    seed = "test-seed"
    checkpoints = [0.25, 0.5, 0.75]

