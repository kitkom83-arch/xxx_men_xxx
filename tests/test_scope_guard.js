/**
 * Scope Guard Tests
 * 
 * Tests for OAuth scope validation
 */

const assert = require('node:assert/strict');
const test = require('node:test');

/**
 * Required scopes for X API operations
 */
const REQUIRED_SCOPES = [
  'tweet.read',
  'tweet.write',
  'dm.read',
  'users.read',
  'offline.access'
];

/**
 * Check for missing scopes
 */
function checkMissingScopes(grantedScopes) {
  if (!grantedScopes || !Array.isArray(grantedScopes)) {
    return REQUIRED_SCOPES;
  }
  
  return REQUIRED_SCOPES.filter(scope => !grantedScopes.includes(scope));
}

/**
 * Format scope warning in Thai
 */
function formatScopeWarning(missingScopes) {
  if (!missingScopes || missingScopes.length === 0) {
    return '✅ สิทธิ์ครบถ้วน';
  }
  
  return `⚠️ ขาดสิทธิ์: ${missingScopes.join(', ')}`;
}

test('scope-guard: checkMissingScopes returns all required when none granted', () => {
  const missing = checkMissingScopes([]);
  
  assert.equal(missing.length, REQUIRED_SCOPES.length);
});

test('scope-guard: checkMissingScopes returns empty when all granted', () => {
  const missing = checkMissingScopes(REQUIRED_SCOPES);
  
  assert.equal(missing.length, 0);
});

test('scope-guard: checkMissingScopes handles null input', () => {
  const missing = checkMissingScopes(null);
  
  assert.ok(Array.isArray(missing));
});

test('scope-guard: checkMissingScopes handles partial grants', () => {
  const granted = ['tweet.read', 'users.read'];
  const missing = checkMissingScopes(granted);
  
  assert.ok(missing.includes('tweet.write'));
  assert.ok(missing.includes('dm.read'));
  assert.ok(missing.includes('offline.access'));
});

test('scope-guard: formatScopeWarning returns Thai on complete', () => {
  const warning = formatScopeWarning([]);
  
  assert.match(warning, /สิทธิ์ครบถ้วน/);
});

test('scope-guard: formatScopeWarning returns Thai on missing', () => {
  const warning = formatScopeWarning(['tweet.write']);
  
  assert.match(warning, /ขาดสิทธิ์/);
});

test('scope-guard: formatScopeWarning includes missing scope names', () => {
  const warning = formatScopeWarning(['dm.read', 'offline.access']);
  
  assert.match(warning, /dm.read/);
  assert.match(warning, /offline.access/);
});

test('scope-guard: REQUIRED_SCOPES includes tweet.read', () => {
  assert.ok(REQUIRED_SCOPES.includes('tweet.read'));
});

test('scope-guard: REQUIRED_SCOPES includes tweet.write', () => {
  assert.ok(REQUIRED_SCOPES.includes('tweet.write'));
});

test('scope-guard: REQUIRED_SCOPES includes users.read', () => {
  assert.ok(REQUIRED_SCOPES.includes('users.read'));
});

test('scope-guard: REQUIRED_SCOPES includes offline.access', () => {
  assert.ok(REQUIRED_SCOPES.includes('offline.access'));
});
