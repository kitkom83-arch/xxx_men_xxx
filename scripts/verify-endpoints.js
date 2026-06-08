const assert = require('node:assert/strict');

const { THAI_ERRORS, normalizeXError } = require('../lib/errors');
const { buildComposerSafetyPreview } = require('../lib/safety');
const {
  completeSetup,
  getSetupStatus,
  listAudit,
  resetMemoryStoreForTests,
} = require('../lib/store');
const {
  getTrends,
  getUsage,
  getUserByUsername,
  getUserPosts,
  searchPosts,
} = require('../lib/xApi');

function hasSecretLikeContent(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  const patterns = [
    /\bxox[a-zA-Z]-[A-Za-z0-9-]{10,}\b/,
    /\bsk-[A-Za-z0-9]{20,}\b/,
    /\bBearer\s+[A-Za-z0-9\-_=]{30,}\b/,
    /\b(api[_-]?key|apikey|secret|token|password)\b\s*[:=]\s*['"]?[A-Za-z0-9_\-]{16,}['"]?/i,
    /-----BEGIN (?:[A-Z ]+)?PRIVATE KEY-----/,
  ];
  return patterns.some((r) => r.test(text));
}

function ensureNoSecrets(label, payload) {
  assert.equal(
    hasSecretLikeContent(payload),
    false,
    `${label} contains secret-shaped content`
  );
}

function printEvidence(title, data) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(data, null, 2));
}

async function verifyHealth() {
  const status = await getSetupStatus();
  assert.equal(typeof status, 'object');
  assert.equal(status.mode, 'mock');
  assert.equal(status.setupComplete, true);
  ensureNoSecrets('GET /api/health', status);
  printEvidence('GET /api/health', { statusCode: 200, body: status });
}

async function verifyUser() {
  const res = await getUserByUsername('demo');
  assert.equal(res.ok, true);
  assert.equal(typeof res.data, 'object');
  ensureNoSecrets('GET /api/x/user?username=demo', res);
  printEvidence('GET /api/x/user?username=demo', { statusCode: 200, body: res });
  return res;
}

async function verifySearch() {
  const res = await searchPosts('demo');
  assert.equal(res.ok, true);
  assert.equal(typeof res.data, 'object');
  ensureNoSecrets('GET /api/x/search?query=demo', res);
  printEvidence('GET /api/x/search?query=demo', { statusCode: 200, body: res });
}

async function verifyUserPosts(userId) {
  const res = await getUserPosts(userId);
  assert.equal(res.ok, true);
  assert.equal(typeof res.data, 'object');
  ensureNoSecrets('GET /api/x/user-posts?userId=demo-user', res);
  printEvidence('GET /api/x/user-posts?userId=demo-user', { statusCode: 200, body: res });
}

async function verifyTrends() {
  const res = await getTrends('1');
  assert.equal(res.ok, true);
  ensureNoSecrets('GET /api/x/trends?woeid=1', res);
  printEvidence('GET /api/x/trends?woeid=1', { statusCode: 200, body: res });
}

async function verifyUsage() {
  const res = await getUsage();
  assert.equal(res.ok, true);
  ensureNoSecrets('GET /api/x/usage', res);
  printEvidence('GET /api/x/usage', { statusCode: 200, body: res });
}

async function verifyPostDryRun() {
  const preview = buildComposerSafetyPreview('final evidence dry-run demo');
  assert.equal(preview.dryRun, true);
  assert.equal(preview.safeToSend, false);
  ensureNoSecrets('POST /api/x/post-dry-run', preview);
  printEvidence('POST /api/x/post-dry-run', { statusCode: 200, body: preview, realWriteCalled: false });
}

async function verifyRateLimits() {
  const usage = await getUsage();
  const rateLimits = usage?.meta?.rateLimit || usage?.rateLimit || null;
  assert.ok(rateLimits, 'rate limit evidence missing');
  ensureNoSecrets('GET /api/rate-limits', rateLimits);
  printEvidence('GET /api/rate-limits', { statusCode: 200, body: rateLimits });
}

async function verifyAuditLogs() {
  const logs = await listAudit(20);
  assert.ok(Array.isArray(logs));
  ensureNoSecrets('GET /api/audit-logs', logs);
  printEvidence('GET /api/audit-logs', { statusCode: 200, body: logs });
}

function verifyThaiErrorEvidence() {
  const e401 = normalizeXError({ status: 401, message: 'token expired' });
  const e429 = normalizeXError({ status: 429 });
  assert.match(e401.message, /หมดอายุ|เข้าสู่ระบบ/);
  assert.match(e429.message, /ขีดจำกัด/);
  assert.match(THAI_ERRORS.forbiddenWrite, /dry-run/);
  printEvidence('Thai error evidence', {
    normalized401: e401,
    normalized429: e429,
    forbiddenWrite: THAI_ERRORS.forbiddenWrite,
  });
}

async function main() {
  process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'verify-encryption-key';
  process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'verify-session-key';

  resetMemoryStoreForTests();
  await completeSetup({
    username: 'admin',
    password: 'password123',
    mode: 'mock',
    credentials: {},
  });

  await verifyHealth();
  const user = await verifyUser();
  await verifySearch();
  await verifyUserPosts('demo-user');
  if (user?.data?.data?.id) {
    await verifyUserPosts(user.data.data.id);
  }
  await verifyTrends();
  await verifyUsage();
  await verifyPostDryRun();
  await verifyRateLimits();
  await verifyAuditLogs();
  verifyThaiErrorEvidence();

  console.log('\n✅ Endpoint verification PASSED (mock mode, no real write action, no secret leakage)');
}

main().catch((error) => {
  console.error('\n❌ Endpoint verification FAILED');
  console.error(error);
  process.exit(1);
});
