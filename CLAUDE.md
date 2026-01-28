# Backbone V9 — Reference

**Repo:** https://github.com/elliot-backbone/01-27  
**Phase:** 4.6 CERTIFIED

---

## Architecture Layers
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

## Forbidden Fields in Raw JSON
```
runway, health, priority, impact, urgency, risk, score, tier, band,
label, progressPct, coverage, expectedValue, conversionProb, onTrack,
projectedDate, velocity, issues, priorities, actions, rippleScore,
rankScore, rankComponents, trustPenalty, executionFrictionPenalty,
timeCriticalityBoost, calibratedProbability, introducerPrior,
pathTypePrior, targetTypePrior, successRate, followupFor, daysSinceSent
```

---

## Ranking Formula
```
rankScore = expectedNetImpact - trustPenalty - executionFrictionPenalty + timeCriticalityBoost

expectedNetImpact = (upside × combinedProb) + leverage - (downside × failProb) - effort - timePen
combinedProb = executionProbability × probabilityOfSuccess
```

---

## North Stars
| # | Constraint |
|---|------------|
| NS1 | Actions are the product |
| NS2 | Optimize for net value creation |
| NS3 | Truth before intelligence (no stored derivations) |
| NS4 | Separation of meaning is sacred |
| NS5 | Architecture enforces doctrine |
| NS6 | ONE ranking surface |

---

## Terminology
**Use:** Raw, Derived, Health, Issue, Resolution, Action, Ripple, PreIssue, GoalTrajectory, Impact, Leverage, IntroOutcome, Calibration, Followup, RankScore

**Avoid:** Focus, Tier, Generic Score, Expected Value, Conversion Probability, Fear, Urgency Score

---

## Pre-Ship Litmus
All YES or don't ship:
1. Creates or improves Actions?
2. Optimizes for net value creation?
3. Preserves raw vs derived truth?
4. Respects semantic boundaries?
5. Enforced by architecture/QA?
6. Uses single ranking surface?

---

## QA Gates (Phase 4.6)
| Gate | Check |
|------|-------|
| 1 | Layer imports respect boundaries |
| 2 | No stored derivations in raw |
| 3 | DAG integrity |
| 4 | Actions have rankScore |
| 5 | Sorting by rankScore only |
| 6 | Deterministic ranking |
| 7 | IntroOutcome schema valid |
| 8 | Single ranking surface |
| 9 | Followup deduplication |
| A | Action events load |
| B | Action event schema |
| C | Action event timestamps |
| D | Unique event IDs |
| E | Referential integrity |
| F | No derived keys in events |
| G | Determinism with events |
| H | Append-only structure |
