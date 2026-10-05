<div align="center">

# 🌲 RunRanger

**An AI running companion designed to get you *off* your phone.**

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest%202026-Touch%20Grass-10b981?style=for-the-badge)](https://hacktoberfest.com)
[![Model](https://img.shields.io/badge/AI-Gemma%203%204B%20(Local)-3b82f6?style=for-the-badge)](https://ollama.com/library/gemma3)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=for-the-badge)](LICENSE)
[![Cost](https://img.shields.io/badge/Cost-₹0%20%2F%20%240%20Zero%20Paid%20APIs-emerald?style=for-the-badge)](#why-runranger-costs-0)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20On--Device-teal?style=for-the-badge)](#privacy-first-design)

<p align="center">
  <b>Local AI • Open Weight • Privacy First • Free</b>
</p>

> *“What if an AI assistant's job was to make itself unnecessary?”*  
> RunRanger uses open-weight AI locally to turn an ordinary run into an outdoor exploration mission — and then explicitly tells you to lock your screen and go outside.

---

</div>

## 🌟 The Philosophy: Touch Grass

Modern fitness apps demand continuous attention: complex dashboards, leaderboards, notifications, and advertising. 

**RunRanger takes the opposite approach:**

1. **Pick Your Run** — Select activity (Running, Jogging, Walking), duration (15m to 60m+), terrain, and how you feel today.
2. **Get Your Mission** — In under 5 seconds, local **Gemma 3 4B** generates a structured outdoor mission with real-world checkpoints (nature observations, mindfulness stops, cadence bursts).
3. **Put Your Phone Away** — Hit **`LOCK PHONE & START`**. Pocket your device. Run with your head up and your senses engaged.
4. **Touch Grass & Reflect** — Audio and haptic pulses cue milestones without screen interaction. Upon return, Gemma produces an on-device reflection and logs your progress locally.

---

## 💸 Why RunRanger Costs ₹0

This project strictly requires **zero paid services** to develop, run, or self-host. There are **no API keys** required anywhere in the codebase.

| Component | Technology | Cost | Cloud Dependency |
|---|---|---|---|
| **AI Inference** | [Ollama](https://ollama.com) + [Gemma 3 4B](https://ollama.com/library/gemma3) | **₹0** | None (Runs locally on host hardware) |
| **Backend API** | [FastAPI](https://fastapi.tiangolo.com) (Python 3.10+) | **₹0** | None (Runs locally on port 8000) |
| **Database** | SQLite 3 (Python stdlib) | **₹0** | None (Local file `./data/runranger.db`) |
| **Frontend** | React 19 + TypeScript + Vite + Tailwind v4 | **₹0** | None (Static build served locally) |
| **Map Rendering** | [Leaflet](https://leafletjs.com) + [OpenStreetMap](https://www.openstreetmap.org) | **₹0** | Community tiles (visible attribution included) |
| **Routing** | Local Geometric Loop / OSRM | **₹0** | Offline trigonometric algorithm / demo OSRM |
| **Authentication** | None (Local-first) | **₹0** | No accounts or cloud auth needed |

### What is Actually Free vs. What Has External Usage Limits?
- **Unlimited Local Features**: Local Gemma 3 inference, SQLite storage, local geometric route calculation, and the React application run 100% locally with zero request caps or charges.
- **Third-Party Open Infrastructure**:
  - **OpenStreetMap Tiles**: Provided by community donation. RunRanger adheres to the [OSM Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/): tiles are rendered only when viewing the map; no bulk tile downloads, scraping, or caching.
  - **OSRM Public Routing Server**: RunRanger isolates routing behind an abstraction layer (`LocalRouteProvider`). If the public OSRM demonstration server is unreachable or rate-limited, RunRanger automatically falls back to the internal geometric loop with zero network requests.
  - **No Nominatim Geocoding Abuse**: RunRanger avoids automatic geocoding queries against Nominatim to protect public servers.

---

## 🔒 Privacy-First Design

Your location is sensitive. **RunRanger never permanently records or uploads your GPS track.**
- GPS coordinates obtained from the browser Geolocation API are used in-memory for the current route session only.
- The local SQLite database logs aggregate summary metrics only (distance, duration, activity, checkpoints completed, and personal notes).
- No telemetry, no analytics, no third-party tracking scripts.
- **Export Anytime**: Download your entire history in JSON or CSV with one click.
- **Delete Anytime**: Purge all local data permanently with one click.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- [Ollama](https://ollama.com) (for local AI mode; demo mode works without Ollama)

### 1. Pull the Gemma 3 4B Model (Recommended)

```bash
ollama pull gemma3:4b
ollama serve
```

### 2. Clone and Start in One Command

```bash
git clone https://github.com/your-username/runranger.git
cd runranger

# Starts both FastAPI and Vite with live reload
./scripts/dev.sh
```

Open **`http://localhost:5173`** in your browser.

---

## 🎭 Dual Operating Modes

RunRanger features an honest fallback architecture:

| Mode | Trigger | Experience |
|---|---|---|
| **AI Mode** | Ollama running with `gemma3:4b` | Live, dynamic mission generation and personalized post-run reflections from local Gemma 3. |
| **Demo Mode** | Ollama not installed or offline | Deterministic, offline sample missions loaded from `data/demo_missions.json`. Clearly labeled as Demo Mode — never pretends to be AI. |

