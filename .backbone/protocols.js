#!/usr/bin/env node

/**
 * BACKBONE V9 - PROTOCOL AUTOMATION
 * 
 * Three-word protocol system for managing workspace state:
 * - "update"   → Push latest working state to GitHub
 * - "reload"   → Pull latest from GitHub and verify
 * - "handover" → Generate complete handover package
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const WORKSPACE = '/home/claude/backbone-v9';

function exec(cmd, silent = false) {
  try {
    const output = execSync(cmd, { cwd: WORKSPACE, encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout };
  }
}

function runQAGate() {
  console.log('\n🔍 Running QA Gate...');
  const result = exec('node qa/qa_gate.js', true);
  if (!result.success || result.output.includes('QA_FAIL')) {
    console.log('❌ QA Gate FAILED');
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
  if (!statusResult.output?.trim()) {
    console.log('✓ No changes - workspace up to date');
    return;
  }
  
  const timestamp = new Date().toISOString();
  writeFileSync('/tmp/commit-msg.txt', `Auto-update: QA-validated state\n\nTimestamp: ${timestamp}`);
  exec('git commit -F /tmp/commit-msg.txt');
  
  console.log('\n🚀 Pushing to GitHub...');
  exec('git push origin master');
  
  const commit = exec('git rev-parse HEAD', true).output.trim();
  console.log(`\n✅ UPDATE COMPLETE\nCommit: ${commit.substring(0, 7)}\n`);
}

async function protocolReload() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  BACKBONE V9 - RELOAD PROTOCOL                         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  console.log('📥 Downloading latest...');
  exec('curl -sL https://api.github.com/repos/elliot-backbone/01-27/zipball/master -o /tmp/reload.zip', true);
  exec('rm -rf /tmp/reload && unzip -q /tmp/reload.zip -d /tmp/reload', true);
  
  const extracted = exec('ls /tmp/reload', true).output.trim().split('\n')[0];
  
  console.log('💾 Backing up current workspace...');
  exec(`cp -r ${WORKSPACE} /tmp/backup-${Date.now()}`, true);
  
  console.log('🔄 Replacing workspace...');
  exec(`rm -rf ${WORKSPACE}`);
  exec(`mv /tmp/reload/${extracted} ${WORKSPACE}`);
  
  if (!runQAGate()) {
    console.log('\n❌ RELOAD FAILED: QA gates did not pass\n');
    process.exit(1);
  }
  
  const commit = exec('git rev-parse HEAD', true).output.trim();
  console.log(`\n✅ RELOAD COMPLETE\nCommit: ${commit.substring(0, 7)}\n`);
}

async function protocolHandover() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  BACKBONE V9 - HANDOVER PROTOCOL                       ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  const statusResult = exec('git status --porcelain', true);
  if (statusResult.output?.trim()) {
    console.log('⚠️  Uncommitted changes - running UPDATE first...\n');
    await protocolUpdate();
  }
  
  const commit = exec('git rev-parse HEAD', true).output.trim();
  const commitShort = commit.substring(0, 7);
  
  const handover = `# BACKBONE V9 - HANDOVER PACKAGE

Repository: https://github.com/elliot-backbone/01-27
Commit: ${commitShort}

## Quick Start
\`\`\`bash
curl -sL https://api.github.com/repos/elliot-backbone/01-27/zipball/master -o backbone.zip
unzip backbone.zip && cd elliot-backbone-01-27-*
node qa/qa_gate.js
\`\`\`

## Protocols
- update: node .backbone/protocols.js update
- reload: node .backbone/protocols.js reload
- handover: node .backbone/protocols.js handover
`;
  
  writeFileSync(`${WORKSPACE}/HANDOVER_${commitShort}.md`, handover);
  console.log('✅ Handover generated\n');
  console.log(handover);
}

const command = process.argv[2];
if (command === 'update') await protocolUpdate();
else if (command === 'reload') await protocolReload();
else if (command === 'handover') await protocolHandover();
else console.log('Usage: node .backbone/protocols.js [update|reload|handover]');
