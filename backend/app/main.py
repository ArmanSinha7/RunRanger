"""RunRanger API. Runs entirely on your machine."""
from __future__ import annotations

import logging
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import PROJECT_DIR, settings
from .routes.api import router

log = logging.getLogger("runranger")

app = FastAPI(title="RunRanger", version="0.1.0", description="Local, open-weight AI running missions.")
app.add_middleware(CORSMiddleware, allow_origins=list(settings.cors_origins), allow_methods=["*"], allow_headers=["*"])
app.include_router(router)


@app.exception_handler(Exception)
async def friendly_errors(request: Request, exc: Exception) -> JSONResponse:
    # Never leak stack traces to the UI.
    log.exception("Unhandled error on %s", request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Something went wrong on the local server. Please try again."})


# Serve the built frontend (frontend/dist) if present, so `./scripts/start.sh --prod` is one process.
DIST = Path(PROJECT_DIR / "frontend" / "dist")
if DIST.is_dir():
    app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa(full_path: str):
        candidate = DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(DIST / "index.html")
