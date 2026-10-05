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

