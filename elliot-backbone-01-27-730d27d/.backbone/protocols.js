#!/usr/bin/env node

/**
 * BACKBONE V9 - PROTOCOL AUTOMATION
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

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

async function protocolUpdate() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  BACKBONE V9 - UPDATE PROTOCOL                         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  if (!runQAGate()) {
    console.log('\n❌ UPDATE ABORTED: QA gates must pass\n');
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
    process.exit(1);
  }
  
  const commitResult = exec('git rev-parse HEAD', true);
  if (commitResult.success && commitResult.output) {
    const commit = commitResult.output.trim();
    console.log(`\n✅ UPDATE COMPLETE\nCommit: ${commit.substring(0, 7)}\n`);
  }
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
    process.exit(1);
  }
  
  const commitResult = exec('git rev-parse HEAD', true);
  if (commitResult.success && commitResult.output) {
    const commit = commitResult.output.trim();
    console.log(`\n✅ RELOAD COMPLETE\nCommit: ${commit.substring(0, 7)}\n`);
  }
  
  exec(`rm -rf /tmp/backbone-reload /tmp/backbone-reload.zip /tmp/backbone-backup-${timestamp}`, true);
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
- **qa/** - Quality gates (11 gates must pass)

## Key Files

- qa/qa_gate.js - Quality gates
- runtime/main.js - Core engine
- SCHEMA_REFERENCE.md - Complete schema
- generate-qa-data.js - Test data generator

## QA Status

All commits must pass 11/11 QA gates before push.
`;
  
  writeFileSync(`HANDOVER_${commitShort}.md`, handover);
  console.log('✅ Handover generated\n');
  console.log(handover);
}

const command = process.argv[2];
if (command === 'update') await protocolUpdate();
else if (command === 'reload') await protocolReload();
else if (command === 'handover') await protocolHandover();
else {
  console.log('Usage: node .backbone/protocols.js [update|reload|handover]');
  process.exit(1);
}
