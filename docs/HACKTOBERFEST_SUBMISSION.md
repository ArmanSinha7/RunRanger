# Hacktoberfest 2026 Submission — Week 1: “Touch Grass”

## Project Overview

- **Project Name**: RunRanger
- **Tagline**: An AI running companion designed to get you off your phone.
- **Challenge**: Hacktoberfest 2026 Open-Source AI Challenge (Week 1 Theme: *Touch Grass*)
- **License**: MIT
- **Tech Stack**: Python (FastAPI), React 19, TypeScript, Vite, Tailwind CSS v4, SQLite, Leaflet, Ollama, Gemma 3 4B.

---

## The Concept: "AI That Makes Itself Unnecessary"

Modern tech products are optimized for engagement metrics: maximizing time spent looking at glass screens, scrolling algorithmic feeds, and tapping micro-transactions.

**RunRanger reverses this philosophy completely.**

1. The runner specifies their activity, target duration, terrain, and how they feel today.
2. An open-weight **Gemma 3 4B** model runs locally on their device to craft a bespoke outdoor mission with observation challenges, pacing intervals, and nature checkpoints.
3. The app presents the mission and displays:
   > 🏃 **Your mission has begun. You don't need to stare at this screen. Go run. Touch grass.**
4. The user locks their phone, pockets it, and experiences the physical outdoors with their senses alive.
5. Audio and haptic pulses cue checkpoints without screen interaction.
6. Upon return, Gemma generates a concise on-device reflection and stores it locally in SQLite.

---

## Submission & Judging Demo Guide

### Option A: Complete AI Demo with Local Ollama (Recommended)

1. Start Ollama and pull Gemma 3 4B:
   ```bash
   ollama pull gemma3:4b
   ollama serve
   ```
2. Start RunRanger:
   ```bash
   ./scripts/dev.sh
   ```
3. Open `http://localhost:5173`.
4. The top banner will indicate: **AI Mode: Gemma 3 4B running locally**.
5. Select a run (e.g. 20 min, Nature goal, Park).
6. Click **Generate My Run**. Watch Gemma 3 locally generate the structured JSON mission.
7. Click **Lock Phone & Start** to experience the distraction-free outdoor mode.
8. Use the **Demo 10x Speed** toggle to simulate the timer progression quickly for judging.
9. Click **Finish Run**, select how you felt, and click **Generate AI Post-Run Reflection**.
10. Check the **Dashboard** to see unlocked badges, cumulative mileage, and local JSON/CSV export.

### Option B: Instant Offline Demo Mode (Zero Setup Needed)

If you do not have Ollama installed or are on a lightweight testing machine:
1. Simply run:
   ```bash
   ./scripts/dev.sh
   ```
2. RunRanger automatically detects that Ollama is offline and cleanly operates in **Demo Mode — local sample missions**.
3. It uses deterministic local JSON templates from `data/demo_missions.json` to showcase the entire end-to-end mission, mapping, active tracking, completion, and local SQLite logbook.
4. **Honest Labeling**: It clearly identifies itself as Demo Mode and never pretends an AI generated the content.

---

## Automated Verification

RunRanger includes full test coverage for both backend and frontend:

```bash
./scripts/test.sh
```
- **15 Backend Tests (pytest)**: Tests mission schemas, parsing safety guardrails, demo fallback service, local geometric routing, and SQLite CRUD.
- **4 Frontend Tests (vitest + jsdom)**: Tests landing page rendering, configuration form, mission generation state, and local route mapping.
- **Production Build**: Compiles Vite bundle cleanly in under 200ms.
