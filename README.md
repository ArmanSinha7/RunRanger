<div align="center">

# 🌲 RunRanger

**An AI running companion designed to get you off your phone.**

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest%202026-Touch%20Grass-10b981?style=for-the-badge)](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)
[![AI Model](https://img.shields.io/badge/AI-Gemma%203%204B%20%2B%20Ollama-3b82f6?style=for-the-badge)](https://ollama.com/library/gemma3)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=for-the-badge)](LICENSE)
[![No Paid AI API Required](https://img.shields.io/badge/AI%20API-No%20Paid%20Key%20Required-10b981?style=for-the-badge)](#technology-stack)

**Local-first AI · Open-weight model · Privacy-aware design · Open source**

*What if an AI assistant's job was to make itself unnecessary?*

RunRanger turns an ordinary run or walk into an outdoor exploration mission, then encourages you to pocket your phone and pay attention to the world around you.

</div>

---

## 🌱 The idea: Touch grass

Many digital products are designed to keep people looking at their screens. RunRanger takes the opposite approach: use AI to prepare a real-world activity, then step away from the app.

1. **Create a mission.** Choose running, jogging, or walking; set a duration, difficulty, goal, environment, and optional mood.
2. **Get an outdoor plan.** Gemma 3 4B can generate structured checkpoints such as nature observations, mindfulness prompts, exploration tasks, and suitable fitness challenges.
3. **Enter Focus/Pocket Mode.** Review your mission and next checkpoint, then put your phone away. The in-app focus overlay is designed to encourage less screen interaction; it is not an operating-system lock.
4. **Reflect after the outing.** Review your session, generate a post-run reflection when local AI is available, and save your activity in a local logbook.

**The goal isn't to spend more time using RunRanger. It's to spend more time not needing it.**

## ✨ Features

- **Personalized outdoor missions:** Activity, duration, difficulty, goal, environment, and mood inform the mission prompt.
- **Local AI generation:** Gemma 3 4B runs through Ollama on the configured host. The same setup can generate post-run reflections.
- **Output validation and safety checks:** Mission output is parsed against typed schemas and checked for potentially unsafe instructions. Rejected output can be sent back for correction, with a bounded retry count.
- **Honest Demo Mode:** If Ollama or the configured model is unavailable, RunRanger can use deterministic sample missions and template reflections. Demo content is labelled instead of being presented as AI-generated.
- **Route planning:** Uses OSRM for street-oriented routes by default, with a local geometric routing fallback. You can also use the local provider where available in the route controls.
- **Focus/Pocket Mode:** A dedicated low-distraction overlay, optional dim mode, and audio/haptic feedback for supported browser interactions.
- **Run logbook and dashboard:** Save session summaries, view progress and badges, and export history as CSV or JSON.
- **Local storage by default:** No account is required. Run summaries are stored in SQLite on the machine running the backend.
- **Open-source and self-hostable:** MIT-licensed, with no mandatory paid AI API or subscription.

> **Current limitation:** Run duration is timed, but the displayed distance is an estimate derived from the planned mission and elapsed time, not a measurement of the distance actually travelled by continuously tracking GPS movement. Route distance describes the proposed route, not verified completed mileage.

## 🧰 Technology stack

| Area | Technology | Purpose |
|---|---|---|
| AI model | [Gemma 3 4B](https://ollama.com/library/gemma3) + [Ollama](https://ollama.com) | Local mission generation and post-run reflections |
| Backend | Python, [FastAPI](https://fastapi.tiangolo.com), Pydantic | API, validation, safety checks, and application services |
| Database | SQLite | Local run history and progress |
| Frontend | React 19, TypeScript, [Vite](https://vite.dev), Tailwind CSS v4 | Responsive user interface |
| Maps | [Leaflet](https://leafletjs.com), [OpenStreetMap](https://www.openstreetmap.org) | Map display |
| Routing | [OSRM](https://project-osrm.org) plus local geometric fallback | Route generation |
| Tests | Pytest, Vitest, TypeScript/Vite build | Backend, frontend, and build verification |

## 🚀 Run locally

### Prerequisites

- Python 3.10 or newer
- Node.js 20.19+ or 22.12+ (required by the Vite version used in this project)
- npm
- [Ollama](https://ollama.com) for local AI mode; optional for Demo Mode

### 1. Clone the repository

~~~bash
git clone https://github.com/ArmanSinha7/RunRanger.git
cd RunRanger
~~~

### 2. (Recommended) Get Gemma 3 4B ready

Download the model:

~~~bash
ollama pull gemma3:4b
~~~

Make sure Ollama is running. If it isn't already running as a background service, start it in a separate terminal:

~~~bash
ollama serve
~~~

The default model endpoint is <code>http://localhost:11434</code>. If Ollama is not installed, running, or has not downloaded the model, you can still start RunRanger in Demo Mode.

### 3. Start the app

From the repository root:

~~~bash
./scripts/dev.sh
~~~

The development script creates the backend virtual environment if needed, installs backend dependencies, installs frontend dependencies when <code>node_modules</code> is missing, and starts the development servers.

Open **http://localhost:5173**.

- Frontend: <code>http://localhost:5173</code>
- Backend API: <code>http://localhost:8000</code>
- Interactive API docs: <code>http://localhost:8000/docs</code>

Keep the development terminal open while using the app. Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to stop the development servers.

### Demo Mode

Ollama is optional if you only want to explore the application. Run the same development command without a working local model. The app should detect that AI is unavailable and use its labelled Demo Mode with sample missions and template reflections.

**Network note:** Demo missions and local route generation do not require a paid service, but the map displays OpenStreetMap tiles from a public tile service. Those tiles may not load without a network connection.

## 🐳 Run with Docker

Docker builds the frontend and runs the FastAPI application on port <code>8000</code>.

~~~bash
docker compose up --build
~~~

Then open **http://localhost:8000**.

For local AI mode, install Ollama on the host machine, download <code>gemma3:4b</code>, and keep Ollama running. The Compose configuration points the container to the host's Ollama service. Without an available model, RunRanger can use Demo Mode.

RunRanger stores its SQLite database in a Docker-managed volume named <code>runranger-data</code>, so the database can persist when the container is recreated. Use <code>docker compose down</code> to stop the service.

## 🧪 Run the tests

From the repository root, set up dependencies if you haven't already:

~~~bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cd ../frontend
npm install

cd ..
./scripts/test.sh
~~~

The test script runs the backend Pytest suite, the frontend Vitest suite, and a frontend production build check.

## 🔐 Privacy and external services

RunRanger is designed to keep AI inference and saved run history local by default. However, **local-first does not mean every feature is completely offline or that location data is never sent to a third party**.

- **AI requests:** In the standard local setup, mission generation and AI reflections go to Ollama at <code>http://localhost:11434</code> on the configured host. You can change the endpoint using <code>OLLAMA_URL</code>; if you point it at another machine, requests go to that machine.
- **Run history:** The backend saves session summaries, notes, reflections, and mission details in its local SQLite database. The application does not need a user account or its own analytics/telemetry service.
- **Location and routing:** Browser location is used to plan a route. The default routing flow uses the configured OSRM service (the public OSRM demo server by default), so route coordinates and derived waypoints are sent to that service to calculate a route. The local geometric routing provider avoids that routing request but generates an approximate route rather than mapping exact streets.
- **Map tiles:** The browser requests map tiles from OpenStreetMap's public tile infrastructure when the map is displayed. These requests necessarily contact the tile service.
- **GPS history:** RunRanger does not persist a continuous GPS track in the run-history database. That is different from saying that no coordinates ever leave the device: the remote OSRM route-planning flow described above uses location coordinates.
- **Review before you go:** Routes and generated checkpoints are suggestions, not a guarantee of safe or accessible paths. Check the route yourself, follow local rules, and stay aware of traffic and your surroundings.

RunRanger follows the [OpenStreetMap Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/). Do not bulk-download, scrape, or prefetch public map tiles.

### Configuration

The backend supports these environment variables:

| Variable | Default | Purpose |
|---|---|---|
| <code>OLLAMA_URL</code> | <code>http://localhost:11434</code> | Ollama endpoint |
| <code>OLLAMA_MODEL</code> | <code>gemma3:4b</code> | Model tag to use |
| <code>OLLAMA_TIMEOUT_S</code> | <code>120</code> | AI request timeout in seconds |
| <code>RUNRANGER_DB</code> | Project root's <code>data/runranger.db</code> | SQLite database path |
| <code>OSRM_URL</code> | <code>https://router.project-osrm.org</code> | OSRM endpoint used for road-oriented routing |
| <code>CORS_ORIGINS</code> | Local Vite origins | Allowed frontend origins for the backend |

## 🗂️ Project structure

~~~text
RunRanger/
├── frontend/                  # React, TypeScript, UI, hooks, tests
│   └── src/
│       ├── components/        # Map, checkpoint, focus overlay, navigation
│       ├── pages/             # Mission setup, active run, post-run, dashboard
│       ├── hooks/             # Geolocation and run timer/state
│       ├── services/          # API client and browser-side storage
│       ├── types/              # TypeScript data models
│       └── utils/             # Formatting, sound and haptic helpers
├── backend/                   # FastAPI application
│   └── app/
│       ├── ai/                # Ollama client, prompts, parsing and guardrails
│       ├── routes/            # API endpoints
│       ├── schemas/           # Validated request/response models
│       ├── services/          # Missions, reflections, routing and run history
│       ├── data/              # Demo mission templates
│       ├── config.py
│       └── main.py
├── data/                      # Local database directory; generated database is ignored
├── docs/                      # Architecture, cost audit and challenge guide
├── scripts/                   # Development, startup and test scripts
├── docker-compose.yml
├── Dockerfile
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── LICENSE
└── README.md
~~~

## 🤝 Contributing

Contributions are welcome, especially bug reports, documentation improvements, better routing providers, accessibility improvements, tests, and enhancements to outdoor missions.

Before proposing a feature, please keep the project's principles in mind:

1. **Keep the core experience free** — no mandatory paid APIs, subscriptions, or billing accounts.
2. **Prefer open-weight, local AI** — don't silently route prompts or location data to a commercial cloud AI provider.
3. **Keep Demo Mode honest** — sample content must be labelled as sample content.
4. **Prioritize safe outdoor use** — don't encourage dangerous routes, risky physical challenges, or unnecessary screen interaction.
5. **Protect location privacy** — never store or transmit a continuous GPS track without a clear need and explicit disclosure.

Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup and pull request guidance.

## 📚 Project documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Zero-Cost Audit](docs/ZERO_COST_AUDIT.md)
- [Hacktoberfest Week 1 Submission Guide](docs/HACKTOBERFEST_SUBMISSION.md)
- [Security Policy](SECURITY.md)
- [MIT License](LICENSE)

## 📜 License

RunRanger is released under the [MIT License](LICENSE). OpenStreetMap data is © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

---

<div align="center">

**Built for Hacktoberfest 2026 · Week 1: Touch Grass 🌱**

*Go outside. Breathe fresh air. Put the screen away.*

</div>