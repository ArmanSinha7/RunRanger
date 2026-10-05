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

