# Backbone V9 — Project Instructions
*Updated: 2026-01-30*

## Source of Truth
**Repo:** https://github.com/elliot-backbone/01-27
**Branch:** master
**Stable Tag:** `stable-backend-integration`
**Current Commit:** 5c197fb

---

## Quick Start

```bash
# Terminal 1 - Backend
cd ~/Desktop/backbone-v9/api && node server.js

# Terminal 2 - UI (Cmd+T)
cd ~/Desktop/backbone-v9/ui && npm run dev

# Browser
open http://localhost:3000
```

---

## Architecture (Option C — Production)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   UI (Next.js)  │────▶│   API Server    │────▶│  Engine + Data  │
│   Port 3000     │     │   Port 4000     │     │  raw/sample.json│
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Layer Structure
| Layer | Path | Purpose |
|-------|------|---------|
| L0 | `/raw` | Raw entities + validation |
| L1-L2 | `/derive` | Pure deterministic derivations |
| L3-L4 | `/predict` | Issues, trajectories, ripple, intro opportunities |
| L5 | `/decide` | Action ranking (single surface) |
| L6 | `/runtime` | Engine orchestration |
| API | `/api` | HTTP server (port 4000) |
| UI | `/ui` | Next.js frontend (port 3000) |

---

## Key Files

| File | Purpose |
|------|---------|
| `api/server.js` | Backend API server |
| `runtime/engine.js` | Core DAG computation engine |
| `raw/sample.json` | Portfolio data (9 companies) |
| `raw/actionEvents.json` | Action completion log (must be `[]`) |
| `ui/pages/index.js` | Main UI component |
| `ui/pages/api/actions/today.js` | Proxy to backend |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/actions` | All 124 ranked actions |
| GET | `/api/actions/today` | Top action |
| GET | `/api/actions/:id` | Specific action |
| POST | `/api/actions/:id/complete` | Mark complete |
| POST | `/api/actions/:id/skip` | Skip action |
| GET | `/api/companies` | All 9 companies |
| GET | `/api/companies/:id` | Specific company |
| GET | `/api/events` | Action events log |
| DELETE | `/api/events` | Clear events (dev) |
| GET | `/api/meta` | Engine metadata |

---

## Claude Session Protocol

### Refresh (start of session)
```
refresh
```
Downloads repo, runs QA, shows status.

### Push (end of session)
Outputs JSON for manual commit if network blocked.

---

## Rollback Procedures

### Quick rollback to stable:
```bash
git checkout stable-backend-integration
```

### Reset action events:
```bash
echo "[]" > ~/Desktop/backbone-v9/raw/actionEvents.json
```

### Full reset:
```bash
cd ~/Desktop
rm -rf backbone-v9
git clone https://github.com/elliot-backbone/01-27.git backbone-v9
echo "[]" > backbone-v9/raw/actionEvents.json
```

---

## Hard Constraints

1. **No stored derivations** — `forbidden.js` enforces
2. **One ranking surface** — `rankScore` only
3. **DAG execution order** — `graph.js` enforces
4. **actionEvents.json** — Must be `[]` array, not object

---

## Ranking Formula

```
rankScore = expectedNetImpact 
          - trustPenalty 
          - executionFrictionPenalty 
          + timeCriticalityBoost
```

---

## North Stars

1. **Actions are the product** — UI shows one action at a time
2. **Optimize for net value** — Ranking by impact
3. **Truth before intelligence** — Real data, no mocks in prod
4. **Separation of meaning is sacred** — Layers don't cross
5. **Architecture enforces doctrine** — QA gates, DAG order
6. **ONE ranking surface** — Single source of priority

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | `killall node` |
| "events.filter is not a function" | `echo "[]" > raw/actionEvents.json` |
| UI can't reach backend | Ensure backend running on 4000 |
| Lockfile warning | Ignore (cosmetic) |

---

## Git History

```
stable-backend-integration (tag)
  ↓
5c197fb - Fix actionEvents.json format
0560090 - Remove .next build files
8d49c52 - Backend API integration (Option C)
b907aba - Pre-integration baseline
```

---

## See Also

- `HANDOVER.md` — Full session context
- `STABLE_CHECKPOINTS.md` — Rollback points
- `api/README.md` — API documentation
