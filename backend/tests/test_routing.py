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

    route = await build_route(provider, origin, distance_km, style, seed, checkpoints)
    assert route.provider == "local"
    assert len(route.geometry) > 10
    assert len(route.checkpoints) == 3
    # Check that route loops back close to start
    start_pt = route.geometry[0]
    end_pt = route.geometry[-1]
    assert abs(start_pt[0] - end_pt[0]) < 0.005
    assert abs(start_pt[1] - end_pt[1]) < 0.005
