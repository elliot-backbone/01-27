# Backbone V9 — Claude Operating Protocol

## TRIGGER → RESPONSE

### "save"

**Step 1: Verify GitHub state**
```bash
cd ~/Desktop/01-27-STABLE-LATEST-* && git log -1 --pretty=format:"Commit: %h%nDate: %ai%nMessage: %s" && echo -e "\n" && git status
```

Claude checks:
- Commit timestamp (must be recent)
- No failures in commit message
- Working tree clean

If issues detected → report to user, stop

**Step 2: Create ChatGPT archive**
```bash
cd ~/Desktop && \
TIMESTAMP=$(date +%Y%m%d-%H%M%S) && \
git clone https://github.com/elliot-backbone/01-27.git "backbone-$TIMESTAMP" && \
cd "backbone-$TIMESTAMP" && \
zip -r "../backbone-chatgpt-$TIMESTAMP.zip" . && \
echo "Archive: ~/Desktop/backbone-chatgpt-$TIMESTAMP.zip"
```

Claude delivers zip download link

**Step 3: Generate handover**

Claude produces markdown document:
- Changes implemented (with file paths)
- QA proofs (gate output)
- Architecture state
- Next recommended actions
- Context for ChatGPT continuation

### "why"

First principles explanation. No hedging.

### Pushback/confusion from user

Dig deeper. Challenge assumptions. Ask clarifying questions.

---

## HARD CONSTRAINTS

**NEVER:**
- Add preamble/postamble to trigger responses
- Store derived fields in raw JSON
- Import upward (L1→L3) or from /runtime
- Use parallel ranking fields (priority/urgency/impact separate from rankScore)

**ALWAYS:**
- Compute derivations at runtime only
- Single ranking surface: `rankScore`
- Files <500 lines
- QA gates enforce doctrine

**FORBIDDEN RAW FIELDS:**
`runway, health, priority, impact, urgency, risk, score, tier, band, label, progressPct, coverage, expectedValue, conversionProb, onTrack, projectedDate, velocity, issues, priorities, actions, rippleScore, rankScore, rankComponents, trustPenalty, executionFrictionPenalty, timeCriticalityBoost, calibratedProbability, introducerPrior, pathTypePrior, targetTypePrior, successRate, followupFor, daysSinceSent`

---

## PRE-SHIP LITMUS

All YES or don't ship:
1. Creates/improves Actions?
2. Optimizes for net value creation?
3. Preserves raw vs derived truth?
4. Respects semantic boundaries?
5. Enforced by architecture/QA?
6. Uses single ranking surface?

---

## NORTH STARS

1. Actions are the product
2. Optimize for net value creation
3. Truth before intelligence (raw sacred, derived computed)
4. Separation of meaning is sacred
5. Architecture enforces doctrine
6. ONE ranking surface

---

## ARCHITECTURE

**Layers (DAG-enforced):**
- **L0 /raw** — Entities + validation
- **L1 /derive** — Pure deterministic derivations
- **L3 /predict** — Issues, trajectories, Bayesian calibration
- **L5 /decide** — Action ranking (rankScore only)
- **L6 /runtime** — Orchestration + IO (nothing imports from here)
- **/qa** — Canonical QA gate

**Ranking Formula:**
```javascript
rankScore = expectedNetImpact - trustPenalty - executionFrictionPenalty + timeCriticalityBoost
expectedNetImpact = (upside × combinedProb) + leverage - (downside × failProb) - effort - timePen
combinedProb = executionProbability × probabilityOfSuccess
```

---

## TERMINOLOGY

| Use | Not |
|-----|-----|
| rankScore | priority, score |
| Action | task, todo |
| Raw vs Derived | (derived = runtime only) |
| context window | memory |
| semantic drift | conversation degradation |
| transcript | chat history |

---

## METADATA

**Phase:** 4.5.2 CERTIFIED  
**Repo:** https://github.com/elliot-backbone/01-27  
**Workspace:** `~/Desktop/01-27-STABLE-LATEST-[YYYYMMDD-HHMMSS]/`  
**QA:** 6/6 gates passing (11 skipped without runtime data)  
**Mission:** VC deal flow optimization. Actions ranked by single surface (rankScore).

---

## WORKING PATTERNS

- Direct communication, architecture-first
- North Stars trump convenience
- "Good enough" exists; "technically correct" is floor
- Catch problems early, iterate over perfection

---

*Last updated: 2026-01-28 (Phase 4.5.2 certified)*
