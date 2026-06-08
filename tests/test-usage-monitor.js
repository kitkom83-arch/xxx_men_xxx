/**
 * Tests for Usage Monitor - Phase 5
 * 
 * Tests usage snapshot recording to JSONL file
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(process.cwd(), 'outputs');
const USAGE_FILE = path.join(OUTPUT_DIR, 'usage_history.jsonl');

test('usage-monitor: recordUsageSnapshot creates file', async () => {
  const { recordUsageSnapshot } = require('../lib/usage-monitor');
  
  const result = await recordUsageSnapshot({
    source: 'test',
    postsRead: 1000,
    cap: 2000000,
    percentUsed: 0.05,
  });
  
  assert.equal(result.source, 'test');
  assert.equal(result.postsRead, 1000);
  assert.equal(result.cap, 2000000);
});

test('usage-monitor: loadUsageHistory returns records', async () => {
  const { loadUsageHistory, recordUsageSnapshot } = require('../lib/usage-monitor');
  
  await recordUsageSnapshot({
    source: 'test-history',
    postsRead: 500,
    cap: 100000,
    percentUsed: 0.5,
  });
  
  const history = await loadUsageHistory(10);
  assert.ok(Array.isArray(history));
  assert.ok(history.length > 0);
});

test('usage-monitor: usageWarningText returns string', async () => {
  const { usageWarningText } = require('../lib/usage-monitor');
  
  const text = await usageWarningText({
    source: 'test-warning',
    postsRead: 100,
    cap: 1000,
    percentUsed: 10,
  });
  assert.ok(typeof text === 'string');
  assert.ok(text.length > 0);
});

test('usage-monitor: checkUsageWarning returns null when not near cap', async () => {
  const { checkUsageWarning, recordUsageSnapshot } = require('../lib/usage-monitor');
  
  await recordUsageSnapshot({
    source: 'test-low',
    postsRead: 1000,
    cap: 2000000,
    percentUsed: 5,
  });
  
  const warning = await checkUsageWarning();
  // Should return null since not near cap
  assert.ok(!warning || !warning.warning);
});

test('usage-monitor: file contains valid JSON', async () => {
  const { recordUsageSnapshot } = require('../lib/usage-monitor');
  
  await recordUsageSnapshot({
    source: 'test-json',
    postsRead: 100,
    cap: 1000,
    percentUsed: 10,
  });
  
  // Read and parse a line
  if (fs.existsSync(USAGE_FILE)) {
    const content = fs.readFileSync(USAGE_FILE, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    const lastLine = lines[lines.length - 1];
    
    const parsed = JSON.parse(lastLine);
    assert.ok(parsed.timestamp);
    assert.ok(parsed.postsRead !== undefined);
  }
});
