# Backbone V9 — Project Instructions
*Auto-generated: 2026-01-27T21:56:02.418Z*

---

## Source of Truth
**Repo:** https://github.com/elliot-backbone/01-27  
**Branch:** master  
**Stable Tag:** v4.6-stable  
**Last Commit:** 7c49bdc Add gitignore for sensitive data

---

## "Refresh" Protocol
When user says "refresh":
1. `git pull`
2. `node smoke.js && node qa32.js`
3. `node gen-instructions.js`
4. If QA passes + changes exist → `git add . && git commit -m "Auto-save: QA passed" && git push`
5. If QA fails → `git checkout v4.6-stable`

---

## QA Status
| Suite | Status |
|-------|--------|
| smoke.js | ✗ FAILED |
| qa32.js | ✗ FAILED |
| qa40.js | ✗ FAILED |
| qa45.js | ✗ FAILED |
| derive_test.js | ✗ FAILED |

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
runway, health, priority, impact, urgency, risk, score, tier, band, label, progressPct, coverage, expectedValue, convictionProb, onTrack, projectedDate, velocity, issues, priorities, actions, rippleScore, rankScore, rankComponents, trustPenalty, executionFrictionPenalty, timeCriticalityBoost, calibratedProbability, introducerPrior, pathTypePrior, targetTypePrior, successRate, followupFor, daysSinceSent
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

*Do not edit manually. Regenerate with `node gen-instructions.js`*
