# Contributing to RunRanger

Thank you for your interest in contributing to **RunRanger**! We welcome bug reports, documentation updates, route providers, and enhancements that uphold our core philosophy:

> **Make the user spend LESS time looking at screens, and MORE time outdoors touching grass.**

---

## Guiding Principles

1. **Zero-Cost Commitment**: RunRanger must remain 100% free to build, run, and self-host. Never introduce paid API keys, paid hosting requirements, or proprietary subscriptions.
2. **Open-Weight AI**: All AI features must run locally on the user's machine (Ollama + Gemma 3 4B). Do not route user prompts or location data to commercial cloud AI vendors.
3. **Honest Fallback**: Always maintain the deterministic Demo Mode so judges, contributors, and offline runners can use the app without any mandatory setup.
4. **Distraction-Free UX**: Do not turn RunRanger into a chat-loop or an addictive social feed. UI elements should push users to lock their phone and head outside.
5. **Privacy First**: Never permanently store or transmit user GPS tracks.

---

## Local Development Setup

### Prerequisites

- **Python 3.10+**
- **Node.js 18+ & npm**
- **Ollama** (optional for AI mode; demo mode works without it)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/runranger.git
cd runranger
```

### 2. Setup Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt  # or run ./scripts/dev.sh
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

### 4. Running Locally

You can use the helper script from the project root:

```bash
./scripts/dev.sh
```

Or run each service separately:

- **Backend**: `cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000`
- **Frontend**: `cd frontend && npm run dev`

### 5. Running Tests

Before submitting a Pull Request, verify all tests pass:

```bash
# Run all tests (frontend + backend)
./scripts/test.sh

# Or run separately:
cd backend && pytest
cd frontend && npm test && npm run build
```

---

## Submitting Pull Requests

1. Fork the repository and create your feature branch: `git checkout -b feature/my-new-feature`.
2. Commit your changes with clear, descriptive commit messages.
3. Ensure formatting and tests pass.
4. Open a Pull Request explaining the problem, the solution, and verification steps.
