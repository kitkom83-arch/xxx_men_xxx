const assert = require('node:assert/strict');

const { buildComposerSafetyPreview } = require('../lib/safety');
const {
  completeSetup,
  getSetupStatus,
  listAudit,
  resetMemoryStoreForTests,
  saveDraft,
} = require('../lib/store');
const { getTrends, getUsage, getUserByUsername, getUserPosts, searchPosts } = require('../lib/xApi');

async function main() {
  process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'smoke-encryption-key';
  process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'smoke-session-key';

  resetMemoryStoreForTests();
  const setup = await completeSetup({
    username: 'admin',
    password: 'password123',
    mode: 'mock',
    credentials: {},
  });
  assert.equal(setup.setupComplete, true);

  const status = await getSetupStatus();
  assert.equal(status.mode, 'mock');

  const search = await searchPosts('campaign');
  assert.equal(search.ok, true);

  const user = await getUserByUsername('demo_brand');
  assert.equal(user.ok, true);

  const posts = await getUserPosts(user.data.data.id);
  assert.equal(posts.ok, true);

  const usage = await getUsage();
  assert.equal(usage.ok, true);

  const trends = await getTrends('1');
  assert.equal(trends.ok, true);

  const safety = buildComposerSafetyPreview('smoke dry-run post');
  assert.equal(safety.dryRun, true);
  await saveDraft({ text: 'smoke dry-run post', payload: { dryRun: true }, safetyStatus: safety.status });

  const audit = await listAudit(10);
  assert.ok(audit.length > 0);

  console.log(JSON.stringify({ ok: true, mode: status.mode, dryRunOnly: true }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
