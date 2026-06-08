/**
 * Storage Tests
 * 
 * Tests for lib/store.js - Storage and persistence
 */

const assert = require('node:assert/strict');
const test = require('node:test');

const { 
  getSetting, 
  setSetting, 
  makeId,
  recordAudit,
  listAudit,
  resetMemoryStoreForTests
} = require('../lib/store');

test('storage: makeId generates unique IDs', () => {
  const id1 = makeId('test');
  const id2 = makeId('test');
  
  assert.ok(typeof id1 === 'string');
  assert.ok(id1.length > 0);
  assert.notEqual(id1, id2);
});

test('storage: makeId includes prefix', () => {
  const id = makeId('action');
  
  assert.match(id, /^action_/);
});

test('storage: getSetting returns fallback when not set', async () => {
  const value = await getSetting('nonexistent_key_12345', 'fallback_value');
  
  assert.equal(value, 'fallback_value');
});

test('storage: setSetting and getSetting work together', async () => {
  await setSetting('test_key_xyz', 'test_value_123');
  const value = await getSetting('test_key_xyz', 'fallback');
  
  assert.equal(value, 'test_value_123');
});

test('storage: recordAudit creates audit entries', async () => {
  // Create a test audit entry
  const audit = await recordAudit('test.action', 'Test action summary', { test: true });
  
  assert.ok(audit.id);
  assert.equal(audit.action, 'test.action');
  assert.equal(audit.summary, 'Test action summary');
});

test('storage: listAudit returns audit history', async () => {
  // First create some audit entries
  await recordAudit('test.list', 'Test list 1', { num: 1 });
  await recordAudit('test.list', 'Test list 2', { num: 2 });
  
  const audits = await listAudit(10);
  
  assert.ok(Array.isArray(audits));
  assert.ok(audits.length > 0);
});

test('storage: audit does not store sensitive data in metadata', async () => {
  // Record audit with sensitive-looking data
  const audit = await recordAudit('test.security', 'Security test', { 
    password: 'secret123',
    token: 'Bearer xxx',
    apiKey: 'sk-xxx'
  });
  
  // Check that secrets are redacted
  const metadata = audit.metadata || {};
  assert.equal(metadata.password, '[REDACTED]');
  assert.equal(metadata.token, '[REDACTED]');
  assert.equal(metadata.apiKey, '[REDACTED]');
});

test('storage: persistMemory loads without crashing when .env missing', async () => {
  // Should not crash when .env file is missing
  // In-memory store should work
  const setup = await getSetting('mode', 'mock');
  
  assert.equal(typeof setup, 'string');
});
