import { runQAGate } from './qa/qa_gate.js';
import { readFileSync } from 'fs';

const dataFile = process.argv[2] || 'test-data.json';

console.log(`Loading ${dataFile}...`);
const rawData = JSON.parse(readFileSync(dataFile, 'utf8'));

console.log('Running QA Gate on generated data...\n');

runQAGate({
  rawData,
  actionEvents: rawData.actionEvents?.actionEvents,
  introOutcomes: rawData.introOutcomes
}).then(result => {
  if (result.failed === 0) {
    console.log('\n✓ Generated data is QA-valid!');
  } else {
    console.log('\n✗ Generated data has QA violations');
    process.exit(1);
  }
}).catch(err => {
  console.error('QA Gate error:', err);
  process.exit(1);
});
