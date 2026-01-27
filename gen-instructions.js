// gen-instructions.js
// Auto-generates project instructions from repo state
// Run: node gen-instructions.js

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

function getGitInfo() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const lastCommit = execSync('git log -1 --format="%h %s"', { encoding: 'utf8' }).trim();
    const tags = execSync('git tag --sort=-creatordate', { encoding: 'utf8' }).trim().split('\n');
    const stableTag = tags.find(t => t.includes('stable')) || 'none';
    return { branch, lastCommit, stableTag };
  } catch {
    return { branch: 'unknown', lastCommit: 'unknown', stableTag: 'unknown' };
  }
}

function getQAStatus() {
  const suites = [
    { name: 'smoke.js', cmd: 'node smoke.js' },
    { name: 'qa32.js', cmd: 'node qa32.js' },
    { name: 'qa40.js', cmd: 'node qa40.js' },
    { name: 'qa45.js', cmd: 'node --experimental-vm-modules qa45.js' },
    { name: 'derive_test.js', cmd: 'node --experimental-vm-modules derive_test.js' }
  ];
  
  const results = [];
  for (const suite of suites) {
    try {
      const output = execSync(suite.cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
      const match = output.match(/(\d+)\/(\d+)/);
      results.push({ name: suite.name, status: match ? `${match[1]}/${match[2]} ✓` : '✓' });
    } catch {
      results.push({ name: suite.name, status: '✗ FAILED' });
    }
  }
  return results;
}

function getForbiddenFields() {
  try {
    const forbidden = readFileSync('./forbidden.js', 'utf8');
    const match = forbidden.match(/\[([^\]]+)\]/s);
    if (match) {
      return match[1].replace(/['"]/g, '').split(',').map(s => s.trim()).filter(Boolean);
    }
  } catch {}
  return [
    'runway', 'health', 'priority', 'impact', 'urgency', 'risk', 'score', 'tier', 'band',
    'label', 'progressPct', 'coverage', 'expectedValue', 'convictionProb', 'onTrack',
    'projectedDate', 'velocity', 'issues', 'priorities', 'actions', 'rippleScore',
    'rankScore', 'rankComponents', 'trustPenalty', 'executionFrictionPenalty',
    'timeCriticalityBoost', 'calibratedProbability', 'introducerPrior',
    'pathTypePrior', 'targetTypePrior', 'successRate', 'followupFor', 'daysSinceSent'
  ];
}

function generate() {
  const git = getGitInfo();
  const qa = getQAStatus();
  const forbidden = getForbiddenFields();
  const timestamp = new Date().toISOString();
  
  const qaTable = qa.map(r => `| ${r.name} | ${r.status} |`).join('\n');
  const forbiddenStr = forbidden.join(', ');
  
  const instructions = `# Backbone V9 — Project Instructions
*Auto-generated: ${timestamp}*

---

## Source of Truth
**Repo:** https://github.com/elliot-backbone/01-27  
**Branch:** ${git.branch}  
**Stable Tag:** ${git.stableTag}  
**Last Commit:** ${git.lastCommit}

---

## "Refresh" Protocol
When user says "refresh":
1. \`git pull\`
2. \`node smoke.js && node qa32.js\`
3. \`node gen-instructions.js\`
4. If QA passes + changes exist → \`git add . && git commit -m "Auto-save: QA passed" && git push\`
5. If QA fails → \`git checkout ${git.stableTag}\`

---

## QA Status
| Suite | Status |
|-------|--------|
${qaTable}

---

## Architecture Layers (Enforced)
\`\`\`
L0  /raw       Raw entities + validation
L1  /derive    Pure deterministic derivations
L3  /predict   Issues, trajectories, ripple, calibration
L5  /decide    Action ranking only (single surface)
L6  /runtime   Orchestration + IO (nothing imports from here)
--  /qa        Canonical QA gate
\`\`\`

---

## Hard Constraints
1. **No stored derivations** — forbidden.js enforces
2. **One ranking surface** — \`rankScore\` only
3. **DAG execution order** — graph.js enforces
4. **Files <500 lines** — QA enforces
5. **Layer imports** — no upward, nothing from /runtime

---

## Forbidden Fields in JSON
\`\`\`
${forbiddenStr}
\`\`\`

---

## Ranking Formula (Single Surface)
\`\`\`
rankScore = expectedNetImpact - trustPenalty - executionFrictionPenalty + timeCriticalityBoost

expectedNetImpact = (upside × combinedProb) + leverage - (downside × failProb) - effort - timePen
combinedProb = executionProbability × probabilityOfSuccess
\`\`\`

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

*Do not edit manually. Regenerate with \`node gen-instructions.js\`*
`;

  writeFileSync('INSTRUCTIONS.md', instructions);
  console.log('✓ Generated INSTRUCTIONS.md');
  console.log('  Branch: ' + git.branch);
  console.log('  Stable Tag: ' + git.stableTag);
  console.log('  QA Results:');
  qa.forEach(r => console.log('    ' + r.name + ': ' + r.status));
}

generate();
