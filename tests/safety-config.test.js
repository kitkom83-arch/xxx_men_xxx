/**
 * Safety Configuration Tests
 * 
 * Tests for lib/safety-config.js - Global Safety Switch
 */

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  isRealActionsEnabled,
  isMockMode,
  isDryRunOnly,
  safetyStatusText,
  getSafetyConfig,
  checkActionGate,
} = require('../lib/safety-config');

test('safety-config: isRealActionsEnabled returns false by default', () => {
  // Clear any environment variables
  const cleanEnv = { ...process.env };
  delete cleanEnv.ENABLE_REAL_ACTIONS;
  
  // Default should be false unless explicitly set to "1"
  assert.equal(isRealActionsEnabled({}), false);
  assert.equal(isRealActionsEnabled({ ENABLE_REAL_ACTIONS: '0' }), false);
  assert.equal(isRealActionsEnabled({ ENABLE_REAL_ACTIONS: '' }), false);
  assert.equal(isRealActionsEnabled({ ENABLE_REAL_ACTIONS: undefined }), false);
});

test('safety-config: isRealActionsEnabled returns true only when set to "1"', () => {
  assert.equal(isRealActionsEnabled({ ENABLE_REAL_ACTIONS: '1' }), true);
});

test('safety-config: isMockMode returns true by default', () => {
  // Default should be true (mock mode enabled)
  assert.equal(isMockMode({}), true);
  assert.equal(isMockMode({ MOCK_MODE: '1' }), true);
  assert.equal(isMockMode({ MOCK_MODE: '' }), true);
  assert.equal(isMockMode({ MOCK_MODE: undefined }), true);
});

test('safety-config: isMockMode returns false when set to "0"', () => {
  assert.equal(isMockMode({ MOCK_MODE: '0' }), false);
});

test('safety-config: isDryRunOnly returns true by default', () => {
  // Default should be true (dry-run only)
  assert.equal(isDryRunOnly({}), true);
  assert.equal(isDryRunOnly({ DRY_RUN_ONLY: '1' }), true);
  assert.equal(isDryRunOnly({ DRY_RUN_ONLY: '' }), true);
  assert.equal(isDryRunOnly({ DRY_RUN_ONLY: undefined }), true);
});

test('safety-config: isDryRunOnly returns false when set to "0"', () => {
  assert.equal(isDryRunOnly({ DRY_RUN_ONLY: '0' }), false);
});

test('safety-config: safetyStatusText returns Thai messages', () => {
  // Default safe mode
  const safeText = safetyStatusText({});
  assert.match(safeText, /ปลอดภัย/);
  assert.match(safeText, /ปิดอยู่/);
  
  // Danger mode
  const dangerText = safetyStatusText({ ENABLE_REAL_ACTIONS: '1', MOCK_MODE: '0', DRY_RUN_ONLY: '0' });
  assert.match(dangerText, /อันตราย/);
});

test('safety-config: getSafetyConfig returns configuration object', () => {
  const config = getSafetyConfig({});
  
  assert.equal(typeof config.realActionsEnabled, 'boolean');
  assert.equal(typeof config.mockMode, 'boolean');
  assert.equal(typeof config.dryRunOnly, 'boolean');
  assert.equal(typeof config.statusText, 'string');
});

test('safety-config: checkActionGate blocks action when ENABLE_REAL_ACTIONS is not "1"', () => {
  const gate = checkActionGate('publish_post', {});
  
  assert.equal(gate.shouldExecute, false);
  assert.equal(gate.blockedBy, 'ENABLE_REAL_ACTIONS');
  assert.match(gate.reason, /ปิดอยู่/);
});

test('safety-config: checkActionGate blocks in mock mode', () => {
  const gate = checkActionGate('publish_post', {
    ENABLE_REAL_ACTIONS: '1',
    MOCK_MODE: '1',
  });
  
  assert.equal(gate.shouldExecute, false);
  assert.equal(gate.blockedBy, 'MOCK_MODE');
});

test('safety-config: checkActionGate blocks in dry-run only mode', () => {
  const gate = checkActionGate('publish_post', {
    ENABLE_REAL_ACTIONS: '1',
    MOCK_MODE: '0',
    DRY_RUN_ONLY: '1',
  });
  
  assert.equal(gate.shouldExecute, false);
  assert.equal(gate.blockedBy, 'DRY_RUN_ONLY');
});

test('safety-config: checkActionGate allows execution when all flags allow', () => {
  const gate = checkActionGate('publish_post', {
    ENABLE_REAL_ACTIONS: '1',
    MOCK_MODE: '0',
    DRY_RUN_ONLY: '0',
  });
  
  assert.equal(gate.shouldExecute, true);
  assert.equal(gate.blockedBy, null);
  assert.match(gate.reason, /อนุญาต/);
});

test('safety-config: covers all blocking conditions', () => {
  // Test that the safety system works for all action types
  const actions = [
    'publish_post',
    'delete_post',
    'like_post',
    'unlike_post',
    'retweet_post',
    'follow_user',
    'unfollow_user',
    'send_dm',
    'create_list',
    'upload_media',
  ];
  
  for (const action of actions) {
    const gate = checkActionGate(action, {});
    assert.equal(gate.shouldExecute, false, `Action ${action} should be blocked by default`);
    assert.equal(gate.blockedBy, 'ENABLE_REAL_ACTIONS');
  }
});
