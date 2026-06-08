const assert = require('node:assert/strict');
const test = require('node:test');

const { THAI_ERRORS, normalizeXError } = require('../lib/errors');
const { encryptJson, decryptJson, redactSecrets, hashPassword, verifyPassword } = require('../lib/security');
const { assertDryRunAction, buildComposerSafetyPreview, isForbiddenAction } = require('../lib/safety');
const { resetMemoryStoreForTests, completeSetup, getSetupStatus, saveCredentials, getCredentialPublic } = require('../lib/store');
const { getTrends, getUsage, getUserByUsername, searchPosts } = require('../lib/xApi');

process.env.ENCRYPTION_KEY = 'unit-test-encryption-key';
process.env.SESSION_SECRET = 'unit-test-session-secret';

test('encrypts and decrypts JSON without exposing plaintext in envelope', () => {
  const payload = { bearerToken: 'token-for-test-only', apiSecret: 'secret-for-test-only' };
  const envelope = encryptJson(payload);
  assert.notEqual(JSON.stringify(envelope).includes(payload.bearerToken), true);
  assert.deepEqual(decryptJson(envelope), payload);
});

test('redacts secret-shaped fields recursively', () => {
  const redacted = redactSecrets({
    nested: { bearerToken: 'abc123456789012345678901234' },
    normal: 'visible',
  });
  assert.equal(redacted.nested.bearerToken, '[REDACTED]');
  assert.equal(redacted.normal, 'visible');
});

test('password hashing verifies correct password only', () => {
  const hash = hashPassword('strong-password');
  assert.equal(verifyPassword('strong-password', hash), true);
  assert.equal(verifyPassword('wrong-password', hash), false);
});

test('safety guard blocks forbidden live write actions', () => {
  assert.equal(isForbiddenAction('send dm'), true);
  assert.throws(() => assertDryRunAction({ action: 'post tweet', dryRun: false }));
  assert.equal(assertDryRunAction({ action: 'post tweet', dryRun: true }), true);
});

test('composer preview is always dry-run and never safe to send directly', () => {
  const preview = buildComposerSafetyPreview('hello campaign');
  assert.equal(preview.dryRun, true);
  assert.equal(preview.safeToSend, false);
});

test('store setup defaults to mock and credential public view is redacted', async () => {
  resetMemoryStoreForTests();
  const setup = await completeSetup({
    username: 'admin',
    password: 'password123',
    mode: 'mock',
    credentials: {},
  });
  assert.equal(setup.setupComplete, true);
  assert.equal(setup.mode, 'mock');

  await saveCredentials({
    mode: 'live-readonly',
    credentials: { bearerToken: 'unit-test-token-placeholder' },
  });
  const credential = await getCredentialPublic();
  assert.equal(credential.configured, true);
  assert.notEqual(credential.maskedLabel.includes('test-token-only'), true);
});

test('mock X adapter returns read data and usage without real credentials', async () => {
  resetMemoryStoreForTests();
  await completeSetup({ username: 'admin', password: 'password123', mode: 'mock', credentials: {} });
  const search = await searchPosts('campaign');
  const user = await getUserByUsername('demo_brand');
  const usage = await getUsage();
  const trends = await getTrends('1');
  assert.equal(search.ok, true);
  assert.equal(user.ok, true);
  assert.equal(usage.ok, true);
  assert.equal(trends.ok, true);
  assert.equal(search.meta.mode, 'mock');
});

test('Thai error catalog includes required operational states', () => {
  assert.match(THAI_ERRORS[401], /เข้าสู่ระบบ/);
  assert.match(THAI_ERRORS.forbiddenWrite, /dry-run/);
  assert.match(THAI_ERRORS.missingCredential, /credential/);
  assert.match(THAI_ERRORS.tokenExpired, /หมดอายุ/);
  assert.match(THAI_ERRORS.oauthCallback, /callback/);
  assert.match(normalizeXError({ status: 429 }).message, /ขีดจำกัด/);
  assert.match(normalizeXError({ status: 401, message: 'token expired' }).message, /หมดอายุ/);
  assert.match(normalizeXError({ status: 400, message: 'oauth callback state mismatch' }).message, /OAuth callback/);
});
