# Backbone V9 — Stable Checkpoints

## STABLE-001: Backend Integration (Option C)
**Commit:** 5c197fb
**Date:** 2026-01-30
**Tag:** stable-backend-integration

### What's Included
- Standalone API server (port 4000)
- UI proxy layer (port 3000)
- Real engine output (124 actions, 9 companies)
- Action events persistence
- CORS enabled
- 60s cache with invalidation

### Restore Command
```bash
git checkout 5c197fb
```

---

## PRE-SESSION BASELINE
**Commit:** b907aba
**Date:** 2026-01-27
**Tag:** pre-backend-integration

### What's Included
- Mock API endpoints
- UI skeleton (Phase 0.1)
- No backend integration

### Restore Command
```bash
git checkout b907aba
```

---

## Tagging Procedure

To create a permanent tag for rollback:
```bash
git tag -a stable-backend-integration 5c197fb -m "Backend API integration complete"
git push origin stable-backend-integration
```
