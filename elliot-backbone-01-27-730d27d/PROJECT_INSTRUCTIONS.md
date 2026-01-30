# Backbone V9 — Claude Operating Protocol

## SINGLE-WORD COMMANDS

### "update"
```bash
node .backbone/protocols.js update
```
**What it does:**
- Runs QA gates (aborts if fail)
- Commits all changes
- Pushes to GitHub
- Updates these instructions
- Outputs commit analytics

**Output:** Commit ID, QA status, file counts

### "reload"
```bash
node .backbone/protocols.js reload
```
**What it does:**
- Downloads latest from GitHub
- Backs up current workspace
- Replaces workspace with latest
- Verifies QA gates
- Rolls back if QA fails

**Output:** Commit ID loaded, QA status, workspace analytics

### "handover"
```bash
node .backbone/protocols.js handover
```
**What it does:**
- Checks for uncommitted changes (runs UPDATE if found)
- Generates complete handover package
- Includes repo URL, commit, quick start
- Ready for ChatGPT handoff

**Output:** Handover markdown with all details

---

## LEGACY TRIGGERS (Still Supported)

### "refresh"
```bash
curl -sL https://api.github.com/repos/elliot-backbone/01-27/zipball/master -o /home/claude/repo.zip
rm -rf /home/claude/backbone-v9
unzip -o /home/claude/repo.zip -d /home/claude/
mv /home/claude/elliot-backbone-01-27-* /home/claude/backbone-v9
node /home/claude/backbone-v9/qa/qa_gate.js
```

### "push"
Output JSON for manual commit:
```json
{"changes": [{"path": "...", "content": "..."}]}
```

### "why"
First principles. No hedging.

---

## PROTOCOL LOCK

FROZEN v2.0 — Changes require explicit "unfreeze protocol" command.

---

## REFERENCE

**Repo:** https://github.com/elliot-backbone/01-27  
**Protocols:** /home/claude/backbone-v9/.backbone/protocols.js
