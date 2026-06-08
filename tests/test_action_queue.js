/**
 * Action Queue Tests
 * 
 * Tests for action queuing and audit
 */

const assert = require('node:assert/strict');
const test = require('node:test');

const { makeId, recordAudit, listAudit } = require('../lib/store');
const { redactSecrets } = require('../lib/security');

/**
 * Queue an action and return action ID
 */
function queueAction(actionType, payload = {}) {
  return {
    actionId: makeId(actionType),
    actionType,
    payload,
    queuedAt: new Date().toISOString(),
    status: 'queued'
  };
}

/**
 * Load queued actions from audit log
 */
async function loadActions() {
  const audits = await listAudit(50);
  return audits.filter(a => a.status === 'queued');
}

test('action-queue: queueAction creates action with ID', () => {
  const action = queueAction('post', { text: 'Hello' });
  
  assert.ok(action.actionId);
  assert.equal(action.actionType, 'post');
  assert.equal(action.status, 'queued');
});

test('action-queue: queueAction generates unique IDs', () => {
  const action1 = queueAction('post');
  const action2 = queueAction('post');
  
  assert.notEqual(action1.actionId, action2.actionId);
});

test('action-queue: action ID includes action type prefix', () => {
  const action = queueAction('dm');
  
  assert.match(action.actionId, /^dm_/);
});

test('action-queue: audit does not store token/secret', async () => {
  const audit = await recordAudit('test.queue', 'Testing queue', {
    bearerToken: 'secret-token-123',
    apiSecret: 'api-secret-xyz',
    action: 'queue test'
  });
  
  const metadata = audit.metadata || {};
  
  // Secrets should be redacted
  assert.equal(metadata.bearerToken, '[REDACTED]');
  assert.equal(metadata.apiSecret, '[REDACTED]');
});

test('action-queue: loadActions reads from audit log', async () => {
  // First create some queued actions
  await recordAudit('action.queue', 'Queued post', { status: 'queued' });
  await recordAudit('action.queue', 'Queued dm', { status: 'queued' });
  
  const actions = await loadActions();
  
  assert.ok(Array.isArray(actions));
});

test('action-queue: queueAction stores payload', () => {
  const payload = { text: 'Test message', media: ['img1.jpg'] };
  const action = queueAction('post', payload);
  
  assert.deepEqual(action.payload, payload);
});

test('action-queue: queueAction includes timestamp', () => {
  const action = queueAction('post');
  
  assert.ok(action.queuedAt);
  assert.match(action.queuedAt, /\d{4}-\d{2}-\d{2}T/);
});

test('action-queue: audit entry has required fields', async () => {
  const audit = await recordAudit('test.required', 'Test required fields');
  
  assert.ok(audit.id);
  assert.ok(audit.action);
  assert.ok(audit.summary);
  assert.ok(audit.createdAt);
});

test('action-queue: redactSecrets prevents token leakage', () => {
  const data = {
    action: 'post',
    bearerToken: 'AAAAbbbCCC',
    apiKey: 'DDDDeeeFFF'
  };
  
  const redacted = redactSecrets(data);
  
  assert.equal(redacted.bearerToken, '[REDACTED]');
  assert.equal(redacted.apiKey, '[REDACTED]');
  assert.equal(redacted.action, 'post'); // Non-secret kept
});
