const assert = require('node:assert/strict');

const {
  completeSetup,
  resetMemoryStoreForTests,
  getSetupStatus,
} = require('../lib/store');
const { THAI_ERRORS, normalizeXError } = require('../lib/errors');
const { buildComposerSafetyPreview } = require('../lib/safety');
const {
  getUserByUsername,
  getUserPosts,
  searchPosts,
  getUsage,
  getTrends,
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
  assert.equal(hasSecretLikeContent(payload), false, `${label} contains secret-like content`);
}

function logResult(name, pass, details = {}) {
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${name}`);
  if (Object.keys(details).length) {
    console.log(JSON.stringify(details, null, 2));
  }
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

  const setup = await getSetupStatus();
  assert.equal(setup.mode, 'mock');
  assert.equal(setup.setupComplete, true);
  ensureNoSecrets('setup status', setup);
  logResult('happy-path: setup status', true, setup);

  const searchOk = await searchPosts('demo');
  assert.equal(searchOk.ok, true);
  ensureNoSecrets('search', searchOk);
  logResult('happy-path: search', true);

  const userOk = await getUserByUsername('demo_brand');
  assert.equal(userOk.ok, true);
  ensureNoSecrets('user', userOk);
  logResult('happy-path: user by username', true);

  const postsOk = await getUserPosts('demo-user');
  assert.equal(postsOk.ok, true);
  ensureNoSecrets('user posts', postsOk);
  logResult('happy-path: user posts', true);

  const trendsOk = await getTrends('1');
  assert.equal(trendsOk.ok, true);
  ensureNoSecrets('trends', trendsOk);
  logResult('happy-path: trends', true);

  const usageOk = await getUsage();
  assert.equal(usageOk.ok, true);
  ensureNoSecrets('usage', usageOk);
  logResult('happy-path: usage', true);

  const missingInput = await searchPosts('');
  assert.equal(typeof missingInput.ok, 'boolean');
  ensureNoSecrets('missing input search', missingInput);
  logResult('edge-case: missing input', true, { ok: missingInput.ok });

  const invalidInput = await getUserPosts('###');
  assert.equal(typeof invalidInput.ok, 'boolean');
  ensureNoSecrets('invalid input user-posts', invalidInput);
  logResult('edge-case: invalid input', true, { ok: invalidInput.ok });

  const unauthMsg = THAI_ERRORS[401];
  assert.match(unauthMsg, /กรุณาเข้าสู่ระบบ/);
  logResult('edge-case: unauthenticated thai error', true, { message: unauthMsg });

  const th401 = normalizeXError({ status: 401, message: 'token expired' });
  const th429 = normalizeXError({ status: 429, message: 'rate limited' });
  assert.match(th401.message, /หมดอายุ|เข้าสู่ระบบ/);
  assert.match(th429.message, /ขีดจำกัด/);
  logResult('edge-case: thai error normalization', true, { th401, th429 });

  const dryRun = buildComposerSafetyPreview('dry-run only test');
  assert.equal(dryRun.dryRun, true);
  assert.equal(dryRun.safeToSend, false);
  ensureNoSecrets('composer dry run', dryRun);
  logResult('safety: no real write action', true, { dryRun });

  console.log('\n✅ verify:endpoints:thorough PASSED');
}

main().catch((error) => {
  console.error('\n❌ verify:endpoints:thorough FAILED');
  console.error(error);
  process.exit(1);
});
