# BACKBONE V9 PHASE 4.6 — CERTIFIED

## Status
- **Phase**: 4.6 CERTIFIED ✓
- **QA Gate**: 6/6 ✓
- **Pipeline**: Working (9 companies, 10 actions)

## Architecture
```
/raw       L0 — Raw entities + validation
/derive    L1 — Pure deterministic derivations
/predict   L3 — Issues, trajectories, ripple
/decide    L5 — Action ranking (single rankScore surface)
/runtime   L6 — Orchestration + IO
/qa        —  Canonical QA gate
```

## Commands
```bash
node runtime/main.js           # "What should I do next?"
node runtime/main.js --debug   # Full engine output
node qa/qa_gate.js             # QA Gate (standalone)
```

## North Stars
1. Actions are the product
2. Optimize for net value creation
3. Truth before intelligence (no stored derivations)
4. Separation of meaning is sacred
5. Architecture enforces doctrine
6. ONE ranking surface (rankScore)

## Phase 4.6 Features
- IntroOutcome ledger + calibration
- Followup auto-generation (deduplicated)
- Single ranking surface enforced
- Layer import rules enforced
- Action events schema
