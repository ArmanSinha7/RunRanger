# Zero-Cost Audit & Transparency Report

## Why RunRanger Costs ₹0 / $0 to Build, Run, and Demo

Many modern AI projects claim to be "free" while silently requiring an OpenAI credit balance, a Google Cloud Maps API key, or a Supabase tier.

RunRanger was engineered under an uncompromising zero-cost requirement:

| Component | Technology | Cost | Cloud Dependency |
|---|---|---|---|
| **AI Inference** | Ollama + Gemma 3 4B | **₹0** | None (Runs locally on host CPU/GPU/NPU) |
| **Backend API** | FastAPI + Python 3.12 | **₹0** | None (Self-hosted locally) |
| **Database** | SQLite 3 | **₹0** | None (Local file `./data/runranger.db`) |
| **Frontend** | React 19 + Vite + Tailwind | **₹0** | None (Client-side bundle) |
| **Map Rendering** | Leaflet + OpenStreetMap | **₹0** | Public tiles (Free with attribution) |
| **Routing** | Local Geometric Math / OSRM | **₹0** | None for local; free demo server for OSRM |
| **User Accounts** | None (Local-first) | **₹0** | No auth provider needed |

### What is Not in This Repository:
- ❌ No OpenAI / Anthropic / Gemini API tokens.
- ❌ No Google Maps or Mapbox billing accounts.
- ❌ No Firebase / Supabase / AWS accounts.
- ❌ No analytics or telemetry endpoints.
- ❌ No subscription gateways or credit card forms.

---

## What is Truly Free vs. What Has External Usage Limits?

To maintain open-source integrity, we distinguish between **unlimited local resources** and **third-party public community services**.

### 1. 100% Free & Unlimited (On Your Device)
- **Gemma 3 4B via Ollama**: Truly unlimited. Runs on your Apple Silicon / CUDA / CPU hardware. No request limits, no billing caps, no internet connection required.
- **SQLite Database**: Truly unlimited (subject only to local disk space). No row quotas.
- **Local Geometric Loop Routing**: Truly unlimited. Pure math running in Python (`math.cos`, `math.sin`). Never touches the internet.
- **Frontend & Backend Code**: 100% MIT-licensed open source.

### 2. Community Services with Usage Policies (Handled Gracefully)
- **OpenStreetMap Tile Servers**:
  - OpenStreetMap tiles are provided by volunteer donation and community infrastructure ([OSM Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)).
  - *How RunRanger complies*: RunRanger only loads tiles for visual display when the map is actively on screen. It **never** scrapes, bulk-downloads, or caches tiles offline in violation of OSM policies. Proper attribution is permanently visible in the map footer.
- **Public OSRM Demo Server**:
  - The public OSRM endpoint (`router.project-osrm.org`) is provided for testing and demo purposes without an SLA.
  - *How RunRanger complies*: The routing architecture isolates the provider behind an abstraction layer. If the OSRM server is slow, rate-limited, or offline, RunRanger seamlessly defaults to the internal **Local Geometric Loop**, ensuring zero downtime and zero network dependence.
- **No Nominatim Bulk Lookups**:
  - Nominatim has strict 1 req/sec limits. RunRanger deliberately avoids address search autocomplete against Nominatim to protect public infrastructure.
