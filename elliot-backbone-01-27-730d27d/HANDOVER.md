# Backbone V9 — Handover Protocol

**Date:** 2026-01-30
**Commit:** 5c197fb
**Status:** ✅ STABLE

---

## Current State

### What's Working
- Backend API server on port 4000
- UI on port 3000
- 124 ranked actions from 9 portfolio companies
- Real engine output (not mocks)
- Complete/Skip actions persist to `actionEvents.json`
- GitHub synced

### Architecture (Option C)
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   UI (Next.js)  │────▶│   API Server    │────▶│  Engine + Data  │
│   Port 3000     │     │   Port 4000     │     │  raw/sample.json│
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Quick Start

```bash
# Terminal 1 - Backend
cd ~/Desktop/backbone-v9/api && node server.js

# Terminal 2 - UI (new tab: Cmd+T)
cd ~/Desktop/backbone-v9/ui && npm run dev

# Browser
open http://localhost:3000
```

---

## Key Files

| File | Purpose |
|------|---------|
| `api/server.js` | Backend API (port 4000) |
| `api/package.json` | Backend dependencies |
| `ui/pages/api/actions/today.js` | UI proxy to backend |
| `ui/pages/api/actions/[id]/complete.js` | Complete action proxy |
| `ui/pages/api/actions/[id]/skip.js` | Skip action proxy |
| `raw/sample.json` | Portfolio data (9 companies) |
| `raw/actionEvents.json` | Completed/skipped actions log |
| `runtime/engine.js` | Core computation engine |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/actions` | All 124 ranked actions |
| GET | `/api/actions/today` | Top action |
| POST | `/api/actions/:id/complete` | Mark complete |
| POST | `/api/actions/:id/skip` | Skip action |
| GET | `/api/companies` | All 9 companies |
| GET | `/api/meta` | Engine metadata |

---

## Rollback Procedure

### If something breaks:
```bash
cd ~/Desktop/backbone-v9
git stash
git checkout 5c197fb
```

### Reset action events:
```bash
echo "[]" > ~/Desktop/backbone-v9/raw/actionEvents.json
```

### Full reset from GitHub:
```bash
cd ~/Desktop
rm -rf backbone-v9
git clone https://github.com/elliot-backbone/01-27.git backbone-v9
cd backbone-v9
echo "[]" > raw/actionEvents.json
```

---

## Restore in New Claude Session

```
refresh
```

This pulls latest from GitHub and runs QA.

---

## Git History

```
5c197fb - Fix actionEvents.json format
0560090 - Remove .next build files, update gitignore
8d49c52 - Backend API integration (Option C)
b907aba - (original state before this session)
```

---

## Known Issues

1. **Port conflicts:** If port 3000 or 4000 in use, run `killall node`
2. **Lockfile warning:** Ignore the Next.js lockfile warning
3. **actionEvents.json:** Must be `[]` not `{"actionEvents":[]}`

---

## Next Steps (Future Sessions)

- [ ] UI styling improvements
- [ ] Action detail view
- [ ] Company dashboard
- [ ] Authentication
- [ ] Deployment

---

## Contact

Repo: https://github.com/elliot-backbone/01-27
