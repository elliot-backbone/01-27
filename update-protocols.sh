#!/bin/bash

cat > .backbone/protocols.js << 'PROTOCOLEOF'
#!/usr/bin/env node

/**
 * BACKBONE V9 - PROTOCOL AUTOMATION
 * 
 * Single-word protocol system:
 * - "status"   → Show current workspace status
 * - "qa"       → Run QA sweep check
 * - "update"   → Push latest working state to GitHub
 * - "reload"   → Pull latest from GitHub and verify
 * - "handover" → Generate complete handover package
 */

import { execSync } from 'child_process';
import { writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function exec(cmd, silent = false) {
  try {
    const output = execSync(cmd, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
    return { success: true, output: output || '' };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || '' };
  }
}

function runQAGate() {
  console.log('🔍 Running QA Gate...');
  const result = exec('node qa/qa_gate.js', true);
  if (!result.success || result.output.includes('QA_FAIL')) {
    console.log('❌ QA Gate FAILED\n' + result.output);
    return false;
  }
  const passed = (result.output.match(/QA GATE: (\d+) passed/)?.[1]) || '0';
  console.log(`✅ QA Gate PASSED: ${passed} gates passing`);
  return true;
}

function countFiles(dir = '.', extensions = ['.js', '.md']) {
  let count = 0;
  try {
    const items = readdirSync(dir);
    for (const item of items) {
      if (item === 'node_modules' || item === '.git') continue;
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        count += countFiles(fullPath, extensions);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        count++;
      }
    }
  } catch (e) {}
  return count;
}

function countLines() {
  const result = exec('find . -type f \\( -name "*.js" -o -name "*.md" \\) ! -path "*/node_modules/*" ! -path "*/.git/*" -exec wc -l {} + 2>/dev/null | tail -1 | awk \'{print $1}\'', true);
  return parseInt(result.output?.trim() || '0');
}

function showProtocolMenu() {
  console.log(`
┌────────────────────────────────────────────────────────┐
│  AVAILABLE PROTOCOLS                                   │
├────────────────────────────────────────────────────────┤
│  node .backbone/protocols.js status    - Show state    │
│  node .backbone/protocols.js qa        - QA sweep      │
│  node .backbone/protocols.js update    - Push latest   │
│  node .backbone/protocols.js reload    - Pull latest   │
│  node .backbone/protocols.js handover  - Package       │
└────────────────────────────────────────────────────────┘
`);
}

async function protocolStatus() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  BACKBONE V9 - STATUS                                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  const commitResult = exec('git rev-parse HEAD 2>/dev/null', true);
  const commit = commitResult.success && commitResult.output ? commitResult.output.trim() : 'unknown';
  const commitShort = commit.substring(0, 7);
  
  const logResult = exec(`git log -1 --format="%s|%an|%ar" 2>/dev/null`, true);
  let subject = 'unknown', author = 'unknown', date = 'unknown';
  if (logResult.success && logResult.output) {
    [subject, author, date] = logResult.output.trim().split('|');
  }
  
  const files = countFiles();
  const lines = countLines();
  
  const statusResult = exec('git status --porcelain', true);
  const hasChanges = statusResult.success && statusResult.output.trim();
  
  const qaResult = exec('node qa/qa_gate.js', true);
  const qaPassed = qaResult.success && !qaResult.output.includes('QA_FAIL');
  const qaCount = qaResult.output?.match(/QA GATE: (\d+) passed/)?.[1] || '?';
  
  console.log(`📊 WORKSPACE STATUS

Commit:    ${commitShort} (${commit})
Message:   ${subject}
Author:    ${author}
Date:      ${date}

Files:     ${files} files
Lines:     ${lines} lines

QA Gates:  ${qaPassed ? '✅' : '❌'} ${qaCount}/6 passing
Changes:   ${hasChanges ? '⚠️  Uncommitted changes' : '✓ Clean'}

Repository: https://github.com/elliot-backbone/01-27/commit/${commit}
`);
  
  showProtocolMenu();
}

async function protocolQA() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  BACKBONE V9 - QA SWEEP                                ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  const result = exec('node qa-sweep.js');
  
  if (result.success) {
    console.log('\n✅ QA SWEEP COMPLETE\n');
    showProtocolMenu();
  }
  
  process.exit(result.success ? 0 : 1);
}

async function protocolUpdate() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  BACKBONE V9 - UPDATE PROTOCOL                         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  if (!runQAGate()) {
    console.log('\n❌ UPDATE ABORTED: QA gates must pass\n');
    showProtocolMenu();
    process.exit(1);
  }
  
  console.log('\n📦 Staging and committing...');
  exec('git add -A');
  
  const statusResult = exec('git status --porcelain', true);
  if (!statusResult.output.trim()) {
    console.log('✓ No changes - workspace up to date\n');
    const commit = exec('git rev-parse HEAD 2>/dev/null', true);
    if (commit.success && commit.output) {
      console.log(`Commit: ${commit.output.trim().substring(0, 7)}\n`);
    }
    showProtocolMenu();
    return;
  }
  
  const timestamp = new Date().toISOString();
  writeFileSync('.git-commit-msg', `Auto-update: QA-validated state\n\nTimestamp: ${timestamp}`);
  exec('git commit -F .git-commit-msg');
  exec('rm .git-commit-msg');
  
  console.log('\n🚀 Pushing to GitHub...');
  const pushResult = exec('git push origin master');
  
  if (!pushResult.success) {
    console.log('❌ Push failed\n');
    showProtocolMenu();
    process.exit(1);
  }
  
  const commitResult = exec('git rev-parse HEAD', true);
  if (commitResult.success && commitResult.output) {
    const commit = commitResult.output.trim();
    console.log(`\n✅ UPDATE COMPLETE\nCommit: ${commit.substring(0, 7)}\n`);
  }
  
  showProtocolMenu();
}

async function protocolReload() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  BACKBONE V9 - RELOAD PROTOCOL                         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  console.log('📥 Downloading latest from GitHub...');
  exec('curl -sL https://api.github.com/repos/elliot-backbone/01-27/zipball/master -o /tmp/backbone-reload.zip', true);
  exec('rm -rf /tmp/backbone-reload', true);
  exec('unzip -q /tmp/backbone-reload.zip -d /tmp/backbone-reload 2>/dev/null', true);
  
  const lsResult = exec('ls /tmp/backbone-reload 2>/dev/null', true);
  if (!lsResult.success || !lsResult.output.trim()) {
    console.log('❌ Failed to extract downloaded archive\n');
    showProtocolMenu();
    process.exit(1);
  }
  
  const extracted = lsResult.output.trim().split('\n')[0];
  const timestamp = Date.now();
  
  console.log('💾 Backing up current workspace...');
  exec(`cp -r . /tmp/backbone-backup-${timestamp}`, true);
  
  console.log('🔄 Replacing workspace...');
  exec('find . -not -path "./.git*" -not -path "." -delete', true);
  exec(`cp -r /tmp/backbone-reload/${extracted}/* .`, true);
  exec(`cp -r /tmp/backbone-reload/${extracted}/.* . 2>/dev/null`, true);
  
  if (!runQAGate()) {
    console.log('\n❌ RELOAD FAILED - Restoring backup...');
    exec('find . -not -path "./.git*" -not -path "." -delete', true);
    exec(`cp -r /tmp/backbone-backup-${timestamp}/* .`, true);
    exec(`rm -rf /tmp/backbone-backup-${timestamp}`, true);
    showProtocolMenu();
    process.exit(1);
  }
  
  const commitResult = exec('git rev-parse HEAD', true);
  if (commitResult.success && commitResult.output) {
    const commit = commitResult.output.trim();
    console.log(`\n✅ RELOAD COMPLETE\nCommit: ${commit.substring(0, 7)}\n`);
  }
  
  exec(`rm -rf /tmp/backbone-reload /tmp/backbone-reload.zip /tmp/backbone-backup-${timestamp}`, true);
  
  showProtocolMenu();
}

async function protocolHandover() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  BACKBONE V9 - HANDOVER PROTOCOL                       ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  const statusResult = exec('git status --porcelain', true);
  if (statusResult.success && statusResult.output.trim()) {
    console.log('⚠️  Uncommitted changes - running UPDATE first...\n');
    await protocolUpdate();
    console.log();
  }
  
  const commitResult = exec('git rev-parse HEAD', true);
  const commit = commitResult.success && commitResult.output ? commitResult.output.trim() : 'unknown';
  const commitShort = commit.substring(0, 7);
  
  const handover = `# BACKBONE V9 - HANDOVER PACKAGE

Repository: https://github.com/elliot-backbone/01-27
Commit: ${commitShort}
Generated: ${new Date().toISOString()}

## Quick Start

\`\`\`bash
curl -sL https://api.github.com/repos/elliot-backbone/01-27/zipball/master -o backbone.zip
unzip backbone.zip && cd elliot-backbone-01-27-*
node qa/qa_gate.js
\`\`\`

## Single-Word Protocols

\`\`\`bash
node .backbone/protocols.js status    # Show workspace status
node .backbone/protocols.js qa        # Run QA sweep
node .backbone/protocols.js update    # Push to GitHub after QA
node .backbone/protocols.js reload    # Pull latest from GitHub
node .backbone/protocols.js handover  # Generate this package
\`\`\`

## Architecture

- **raw/** - Input data layer
- **derive/** - Derived calculations  
- **predict/** - Forward predictions
- **decide/** - Action ranking
- **runtime/** - Execution engine
- **qa/** - Quality gates (6 gates must pass)

## Key Files

- qa/qa_gate.js - Quality gates
- qa-sweep.js - Comprehensive QA sweep
- runtime/main.js - Core engine
- SCHEMA_REFERENCE.md - Complete schema
- generate-qa-data.js - Test data generator

## QA Status

All commits must pass 6/6 QA gates before push.
`;
  
  writeFileSync(`HANDOVER_${commitShort}.md`, handover);
  console.log('✅ Handover generated\n');
  console.log(handover);
  
  showProtocolMenu();
}

const command = process.argv[2]?.toLowerCase();
if (command === 'status') await protocolStatus();
else if (command === 'qa') await protocolQA();
else if (command === 'update') await protocolUpdate();
else if (command === 'reload') await protocolReload();
else if (command === 'handover') await protocolHandover();
else {
  console.log(`
BACKBONE V9 - PROTOCOL AUTOMATION

Usage: node .backbone/protocols.js <command>

Commands:
  status    - Show workspace status
  qa        - Run QA sweep check
  update    - Push to GitHub after QA validation
  reload    - Pull latest from GitHub
  handover  - Generate handover package

Examples:
  node .backbone/protocols.js status
  node .backbone/protocols.js qa
  node .backbone/protocols.js update
`);
  showProtocolMenu();
  process.exit(1);
}
PROTOCOLEOF

chmod +x .backbone/protocols.js
echo "✅ Updated protocols.js with status and qa commands"
