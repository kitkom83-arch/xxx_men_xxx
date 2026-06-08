/**
 * Secure Storage Tests
 * 
 * Tests for encrypted storage in lib/security.js
 */

const assert = require('node:assert/strict');
const test = require('node:test');

const { encryptJson, decryptJson, redactSecrets } = require('../lib/security');

test('secure-storage: encryptJson creates envelope with required fields', () => {
  const data = { secret: 'my-api-key-12345' };
  const envelope = encryptJson(data);
  
  assert.ok(envelope.alg);
  assert.ok(envelope.iv);
  assert.ok(envelope.tag);
  assert.ok(envelope.value);
});

test('secure-storage: decryptJson recovers original data', () => {
  const original = { secret: 'my-api-key-12345' };
  const envelope = encryptJson(original);
  const recovered = decryptJson(envelope);
  
  assert.equal(recovered.secret, original.secret);
});

test('secure-storage: encrypted envelope cannot be read without key', () => {
  const data = { password: 'secret' };
  const envelope = encryptJson(data);
  
  // The value should be base64, not plaintext
  assert.ok(!envelope.value.includes('secret'));
});

test('secure-storage: different encryptions produce different outputs', () => {
  const data = { text: 'hello' };
  const envelope1 = encryptJson(data);
  const envelope2 = encryptJson(data);
  
  // Each encryption should use different IV
  assert.notEqual(envelope1.iv, envelope2.iv);
});

test('secure-storage: redactSecrets redacts token-like fields', () => {
  const data = {
    token: 'abc123def456ghi789',
    password: 'secret123',
    apiKey: 'sk-abc123',
    username: 'testuser'
  };
  
  const redacted = redactSecrets(data);
  
  assert.equal(redacted.token, '[REDACTED]');
  assert.equal(redacted.password, '[REDACTED]');
  assert.equal(redacted.apiKey, '[REDACTED]');
  assert.equal(redacted.username, 'testuser'); // Not redacted
});

test('secure-storage: redactSecrets handles arrays', () => {
  const data = [
    { token: 'abc123', name: 'item1' },
    { token: 'def456', name: 'item2' }
  ];
  
  const redacted = redactSecrets(data);
  
  assert.equal(redacted[0].token, '[REDACTED]');
  assert.equal(redacted[1].token, '[REDACTED]');
  assert.equal(redacted[0].name, 'item1');
});

test('secure-storage: redactSecrets handles nested objects', () => {
  const data = {
    level1: {
      level2: {
        token: 'nested-token',
        safeField: 'safe-value'
      }
    }
  };
  
  const redacted = redactSecrets(data);
  
  assert.equal(redacted.level1.level2.token, '[REDACTED]');
  assert.equal(redacted.level1.level2.safeField, 'safe-value');
});

test('secure-storage: redactSecrets handles empty values', () => {
  const data = {
    token: '',
    password: null,
    username: undefined
  };
  
  const redacted = redactSecrets(data);
  
  assert.equal(redacted.token, ''); // Empty string stays empty
  assert.equal(redacted.password, null); // null stays null
});
