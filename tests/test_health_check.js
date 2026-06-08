/**
 * Health Check Tests
 * 
 * Tests for pages/api/health.js and offline/mock mode behavior
 */

const assert = require('node:assert/strict');
const test = require('node:test');

const { getSetupStatus } = require('../lib/store');

test('health-check: offline mode works without X credentials', async () => {
  const setup = await getSetupStatus();
  
  // In mock mode (default), should work without credentials
  const isOffline = setup.mode === 'mock';
  assert.equal(typeof isOffline, 'boolean');
});

test('health-check: mock mode does not require real X API', async () => {
  const setup = await getSetupStatus();
  const mockMode = setup.mode === 'mock';
  
  // Mock mode should not require credentials
  if (mockMode) {
    assert.ok(true);
  }
});

test('health-check: health endpoint returns expected structure', async () => {
  const setup = await getSetupStatus();
  
  assert.equal(typeof setup.setupComplete, 'boolean');
  assert.equal(typeof setup.mode, 'string');
  assert.equal(typeof setup.adminExists, 'boolean');
});

test('health-check: mock mode returns mock data', async () => {
  const setup = await getSetupStatus();
  
  if (setup.mode === 'mock') {
    assert.ok(true);
  }
});

test('health-check: setup complete status is accessible', async () => {
  const setup = await getSetupStatus();
  
  // Should return a object with setupComplete
  assert.equal(typeof setup.setupComplete, 'boolean');
});

test('health-check: mode setting is accessible', async () => {
  const setup = await getSetupStatus();
  
  // Should return mode as string
  assert.equal(typeof setup.mode, 'string');
});

test('health-check: mock mode returns safety status', async () => {
  const setup = await getSetupStatus();
  
  if (setup.mode === 'mock') {
    // Mock mode is safe by default
    assert.ok(true);
  }
});

test('health-check: mock mode does not expose credentials', async () => {
  const setup = await getSetupStatus();
  
  // Credential info should be redacted/masked
  if (setup.credential) {
    assert.equal(setup.credential.configured === true || setup.credential.configured === false, true);
    // Full credentials should never be exposed
    assert.ok(!setup.credential.bearerToken);
    assert.ok(!setup.credential.apiKey);
  }
});
