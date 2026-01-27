# Backbone V9 — Project Instructions
*Auto-generated: 2026-01-27T21:59:54.304Z*

## Source of Truth
**Repo:** https://github.com/elliot-backbone/01-27
**Branch:** master | **Stable Tag:** v4.6-stable | **Last Commit:** 5fab698 Add auto-generated instructions script

## Refresh Protocol
`git pull && node smoke.js && node qa32.js && node gen-instructions.js`
If QA passes: `git add . && git commit -m "Auto-save" && git push`
If QA fails: `git checkout v4.6-stable`

## QA Status
| Suite | Status |
|-------|--------|
| smoke.js | ✗ FAILED |
| qa32.js | ✗ FAILED |
| qa40.js | ✗ FAILED |
| qa45.js | ✗ FAILED |
| derive_test.js | ✗ FAILED |

## Architecture Layers
L0 /raw — Raw entities + validation
L1 /derive — Pure deterministic derivations
L3 /predict — Issues, trajectories, ripple, calibration
L5 /decide — Action ranking (single surface)
L6 /runtime — Orchestration + IO

## Hard Constraints
1. No stored derivations (forbidden.js enforces)
2. One ranking surface (rankScore only)
3. DAG execution order (graph.js enforces)
4. Files <500 lines
5. No upward layer imports

## Ranking Formula
rankScore = expectedNetImpact - trustPenalty - executionFrictionPenalty + timeCriticalityBoost

## North Stars
NS1: Actions are the product | NS2: Optimize for net value | NS3: Truth before intelligence
NS4: Separation of meaning is sacred | NS5: Architecture enforces doctrine | NS6: ONE ranking surface

*Regenerate with `node gen-instructions.js`*
