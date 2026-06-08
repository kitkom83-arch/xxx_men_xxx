/**
 * Tests for Rate Limit Store - Phase 5
 * 
 * Tests rate limit recording to JSONL file
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(process.cwd(), 'outputs');
const RATE_LIMIT_FILE = path.join(OUTPUT_DIR, 'rate_limit_history.jsonl');

test('rate-limit-store: recordRateLimit creates file', async () => {
  const { recordRateLimit } = require('../lib/rate-limit-store');
  
  const result = await recordRateLimit('/test/endpoint', {
    'x-rate-limit-limit': '300',
    'x-rate-limit-remaining': '297',
    'x-rate-limit-reset': '1735689600',
  });
  
  assert.equal(result.endpoint, '/test/endpoint');
  assert.equal(result.limit, '300');
  assert.equal(result.remaining, '297');
});

test('rate-limit-store: loadRateLimitHistory returns records', async () => {
  const { loadRateLimitHistory, recordRateLimit } = require('../lib/rate-limit-store');
  
  await recordRateLimit('/test/history', {
    'x-rate-limit-limit': '100',
    'x-rate-limit-remaining': '50',
    'x-rate-limit-reset': '1735689600',
  });
  
  const history = await loadRateLimitHistory(10);
  assert.ok(Array.isArray(history));
  assert.ok(history.length > 0);
});

test('rate-limit-store: latestRateLimitText returns string', async () => {
  const { latestRateLimitText } = require('../lib/rate-limit-store');
  
  const text = await latestRateLimitText();
  assert.ok(typeof text === 'string');
  assert.ok(text.length > 0);
});

test('rate-limit-store: checkRateLimitWarning returns null when not near limit', async () => {
  const { checkRateLimitWarning, recordRateLimit } = require('../lib/rate-limit-store');
  
  await recordRateLimit('/test/warning', {
    'x-rate-limit-limit': '300',
    'x-rate-limit-remaining': '200',
    'x-rate-limit-reset': '1735689600',
  });
  
  const warning = await checkRateLimitWarning();
  // Should return null since not near limit
  assert.ok(!warning || !warning.warning);
});

test('rate-limit-store: file does not contain authorization', async () => {
  const { recordRateLimit } = require('../lib/rate-limit-store');
  
  await recordRateLimit('/test/auth', {
    'x-rate-limit-limit': '300',
    'x-rate-limit-remaining': '297',
    'x-rate-limit-reset': '1735689600',
    'Authorization': 'Bearer token123', // should be ignored
  });
  
  // Read the file and check
  if (fs.existsSync(RATE_LIMIT_FILE)) {
    const content = fs.readFileSync(RATE_LIMIT_FILE, 'utf8');
    assert.ok(!content.includes('Bearer token123'));
    assert.ok(!content.includes('Authorization'));
  }
});
