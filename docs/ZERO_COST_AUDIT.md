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

