# RunRanger Architecture

RunRanger is built on a simple premise: **AI should get humans away from screens and outdoors into the physical world.**

This document details the system design, components, security boundaries, and data flow.

---

## High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Browser ["Runner's Browser (Mobile / Desktop)"]
        UI["React 19 + Tailwind v4 UI"]
        Map["Leaflet Map (OSM Tiles)"]
        Tracker["Active Run Tracker (Web Audio + Haptics)"]
        Geo["HTML5 Geolocation API (Local In-Memory)"]
    end

    subgraph Host ["Local Host Machine"]
        FastAPI["FastAPI Backend (Port 8000)"]
        RouterService["Routing Service Layer"]
        SafetyFilter["Safety & Regex Guardrails"]
        SQLite[("Local SQLite Database (./data/runranger.db)")]
        Ollama["Ollama Engine (Port 11434)"]
        Gemma["Gemma 3 4B (Open-Weight Model)"]
    end

    subgraph External ["Optional Public Services"]
        OSMTiles["OpenStreetMap Public Tiles (Visual)"]
        OSRMServer["OSRM Routing Server (Optional)"]
    end

    UI -->|JSON REST Requests| FastAPI
    FastAPI -->|Check Health & Inference| Ollama
    Ollama -->|Prompt & Grammar Decoding| Gemma
    FastAPI -->|CRUD Stats & Runs| SQLite
    FastAPI -->|Compute Loop / Snapped Route| RouterService
    RouterService -.->|Road Snapping (Optional)| OSRMServer
    Map -.->|Display Tiles with Attribution| OSMTiles
    SafetyFilter -->|Sanitize Unsafe Output| FastAPI
```

---

## 1. Frontend Architecture

- **Framework**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS v4 with an outdoor adventure dark theme tailored for high outdoor contrast.
- **Mapping**: Leaflet with OpenStreetMap tiles. All tiles carry visible and mandatory attribution (`© OpenStreetMap contributors`).
- **Audio & Haptics**: Uses native Web Audio API synthesized chimes and `navigator.vibrate` for screenless checkpoint cueing.
- **State Management**: Zero heavyweight state libraries; reactive custom hooks (`useRunTracker`, `useGeolocation`) manage run state and local storage caching.

---

## 2. Backend & Data Architecture

- **API Framework**: FastAPI with Python 3.10+ async endpoints.
- **Database**: SQLite through Python's standard library `sqlite3`. Database file is stored locally in `./data/runranger.db`.
- **Privacy Enforcement**:
  - GPS coordinates are used exclusively in-memory to calculate route geometry and are **never** written to SQLite or transmitted to analytics services.
  - The SQLite database records only aggregate run metrics: duration, distance, activity, difficulty, and reflections.

---

## 3. Local AI Engine (Ollama + Gemma 3 4B)

- **Model**: `gemma3:4b` (~3.3 GB download), running locally via Ollama on `http://localhost:11434`.
- **Structured Output**: Ollama's format-constrained decoding ensures Gemma produces structured JSON conforming to `Mission`.
- **Parser & Guardrails**:
  - `loads_lenient`: Handles model responses with or without markdown fences.
  - `find_unsafe`: Regex safety filter scanning for hazardous outdoor instructions (e.g. crossing highways, jaywalking, trespassing, climbing private fences).
  - `apply_guardrails`: Code-enforced distance and checkpoint timing calculations.
- **Retry Mechanism**: If Gemma produces schema violations or hazardous instructions, the backend automatically issues a correction prompt up to 3 attempts.

---

## 4. Routing Isolation Layer

Routing is isolated behind `LocalRouteProvider` and `OsrmRouteProvider`:
- **Local Geometric Loop (`LocalRouteProvider`)**:
  - Computes a multi-point closed polygon or loop route using local trigonometric formulas.
  - Requires **0 network requests** and operates 100% offline.
- **OSRM Provider (`OsrmRouteProvider`)**:
  - Optional road-snapping via open-source OSRM routing.
  - Gracefully falls back to the local geometric loop if the remote network is unavailable.

---

## 5. Honest Fallback: Demo Mode

If Ollama is not installed or running, the backend transparently switches to **Demo Mode**:
- Loads realistic, deterministic sample missions from `data/demo_missions.json`.
- Clearly labelled in the UI as `Demo Mode — local sample missions` (it never pretends an AI generated the content).
- Enables 100% functionality for demonstrations, automated tests, and offline use.
