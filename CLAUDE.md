# CLAUDE.md — Backbone V9
> Last: 2026-01-21 | Stable: `backbone-v9-phase0-2026-01-21.zip` | Tests: 11/11 ✓

## Session Protocol

### START (Every Session)
1. `unzip -o /mnt/user-data/uploads/backbone-v9-*.zip -d /home/claude/`
2. `node --experimental-vm-modules tests/unit/derive.test.js`
3. Read this CLAUDE.md
4. Check memory_user_edits for context

### END (Every Session)
1. Run QA (see Commands below)
2. Update WIP section with progress
3. Update Changelog with changes
4. `zip -r backbone-v9-phaseN-$(date +%Y-%m-%d).zip core data tests CLAUDE.md`
5. `cp *.zip /mnt/user-data/outputs/`
6. Update memory_user_edits: version, WIP status
7. **Export for project**: `cp CLAUDE.md /mnt/user-data/outputs/CLAUDE-backbone.md`

### PERSIST TO PROJECT
Upload `/mnt/user-data/outputs/CLAUDE-backbone.md` to "Backbone Dashboard" project knowledge.
This ensures protocol survives context resets.

---

## North Stars
1. Priority emission is the point  2. Health=state, Priority=gap  3. Derived>static  
4. Reactive→Preventative  5. Impact=unlocks  6. Goals=frame  7. "What next?"  
8. MODULAR: <500 lines/file, layers testable independently

## Architecture
```
core/
├── schema/index.js    # Facts-only, validates forbidden fields
├── derive/
│   ├── runway.js      # deriveRunway → {value,confidence,explain}
│   └── health.js      # deriveHealth → GREEN|YELLOW|RED
└── engine.js          # compute(rawData,now) → {companies[],meta}
data/sample.json       # 9 companies, 5 team, 9 investors
tests/unit/derive.test.js
```

## Commands
```bash
# Test
node --experimental-vm-modules tests/unit/derive.test.js

# QA (before zip)
find core -name "*.js" -exec node --check {} \;
wc -l core/**/*.js core/*.js | awk '$1>500{print "FAIL:",$2}'
grep -E '"(health|runway|priority)"' data/sample.json && echo FAIL

# Package
zip -r backbone-v9-phase0-$(date +%Y-%m-%d).zip core data tests CLAUDE.md
cp *.zip /mnt/user-data/outputs/
```

## Schema Rules
- FACTS only: cash, burn, goals[], deals[], asOf, provenance
- NEVER store: health, runway, priority, impact, risk, score
- Every value: asOf + provenance required

## Versioning
`backbone-v{MAJOR}-{PHASE}-{DATE}.zip`  
phase0=foundation, phase1=goals, phase2=issues, phase3=priority

## WIP
- [ ] Phase 1: Goal trajectories
- [ ] Phase 2: Issue detection  
- [ ] Phase 3: Priority computation

## Changelog
- **v9-phase0 (2026-01-21):** Schema + derive(runway,health) + engine + 11 tests + master protocol

## Memory State
```
V9-phase0 stable: 2026-01-21
Files: core/{schema,derive/{runway,health},engine}.js + data/sample.json + tests/
Tests: 11/11 pass | Schema: facts-only
```
