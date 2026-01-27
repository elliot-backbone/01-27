# Backbone V9 — Project Instructions

## Source of Truth
**Repo:** `https://github.com/elliot-backbone/01-27`  
**Stable Tag:** `v4.6-stable`

---

## "Refresh" Protocol
When user says "refresh":
1. `cd ~/Desktop && LATEST=$(ls -dt 01-27-* 2>/dev/null | head -1) && cd "$LATEST" || { echo "No repo found"; exit 1; }`
2. `git pull`
3. `node qa/qa_gate.js`
4. If QA passes + changes exist → `git add . && git commit -m "Auto-save: QA passed" && git push`
5. If QA fails → `git checkout v4.6-stable`
6. If push succeeds → `cd ~/Desktop && git clone https://github.com/elliot-backbone/01-27.git "01-27-STABLE-LATEST-$(date +%Y%m%d-%H%M%S)"`
7. Regenerate this instruction block from CLAUDE.md + repo state

---

## Current Phase: 4.6 CERTIFIED ✓
| Gate | Status |
|------|--------|
| Layer imports | ✓ |
| No stored derivations | ✓ |
| DAG integrity | ✓ |
| Actions have rankScore | ✓ |
| Sorting by rankScore | ✓ |
| Deterministic ranking | ✓ |
| IntroOutcome schema | ✓ |
| Single ranking surface | ✓ |
| Followup deduplication | ✓ |
| Action events load | ✓ |
| Action event schema | ✓ |
| Action event timestamps | ✓ |
| Unique event IDs | ✓ |
| Referential integrity | ✓ |
| No derived keys in events | ✓ |
| Determinism with events | ✓ |
| Append-only structure | ✓ |

---

## Architecture Layers (Enforced)
```
L0  /raw       Raw entities + validation
L1  /derive    Pure deterministic derivations
L3  /predict   Issues, trajectories, ripple, calibration
L5  /decide    Action ranking only (single surface)
L6  /runtime   Orchestration + IO (nothing imports from here)
--  /qa        Canonical QA gate
```

---

## Hard Constraints
1. **No stored derivations** — forbidden.js enforces
2. **One ranking surface** — `rankScore` only
3. **DAG execution order** — graph.js enforces
4. **Files <500 lines** — QA enforces
5. **Layer imports** — no upward, nothing from /runtime

---

## Forbidden Fields in JSON
```
runway, health, priority, impact, urgency, risk, score, tier, band,
label, progressPct, coverage, expectedValue, conversionProb, onTrack,
projectedDate, velocity, issues, priorities, actions, rippleScore,
rankScore, rankComponents, trustPenalty, executionFrictionPenalty,
timeCriticalityBoost, calibratedProbability, introducerPrior,
pathTypePrior, targetTypePrior, successRate, followupFor, daysSinceSent
```

---

## Ranking Formula (Single Surface)
```
rankScore = expectedNetImpact - trustPenalty - executionFrictionPenalty + timeCriticalityBoost

expectedNetImpact = (upside × combinedProb) + leverage - (downside × failProb) - effort - timePen
combinedProb = executionProbability × probabilityOfSuccess
```

---

## Terminology Lock
**ALLOWED:** Raw, Derived, Health, Issue, Resolution, Priority, Action, Ripple, PreIssue, GoalTrajectory, Impact, Leverage, IntroOutcome, Calibration, Followup, RankScore

**BANNED:** Focus, Tier, Generic Score, Expected Value, Conversion Probability, Fear, Urgency Score

---

## North Stars (Hard Constraints)
| # | Constraint |
|---|------------|
| NS1 | Actions are the product |
| NS2 | Optimize for net value creation |
| NS3 | Truth before intelligence (no stored derivations) |
| NS4 | Separation of meaning is sacred |
| NS5 | Architecture enforces doctrine |
| NS6 | ONE ranking surface |

---

## Protocol Litmus Test
Before any change:
1. Does it create or improve Actions?
2. Does it optimize for net value creation?
3. Does it preserve raw vs derived truth?
4. Does it respect semantic boundaries?
5. Is it enforced by architecture and QA?
6. Does it use the single ranking surface?

All must be **yes** or change does not ship.

---

*Auto-generated from repo state @ v4.6-stable. Do not edit manually.*
