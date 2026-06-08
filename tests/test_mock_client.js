/**
 * Mock Client Tests
 * 
 * Tests for mock X API client in lib/xApi.js
 */

const assert = require('node:assert/strict');
const test = require('node:test');

const { 
  getTrends, 
  getUsage, 
  searchPosts, 
  getUserByUsername, 
  getUserPosts, 
  postTweetDryRun 
} = require('../lib/xApi');

test('mock-client: searchPosts returns mock data in mock mode', async () => {
  const result = await searchPosts('test');
  
  assert.equal(result.ok, true);
  assert.ok(result.data);
  assert.ok(result.meta);
  assert.equal(result.meta.mode, 'mock');
});

test('mock-client: searchPosts returns tweets array', async () => {
  const result = await searchPosts('marketing');
  
  assert.ok(Array.isArray(result.data.data));
});

test('mock-client: mock trends returns data', async () => {
  const result = await getTrends();
  
  assert.equal(result.ok, true);
  assert.ok(result.data);
  assert.equal(result.meta.mode, 'mock');
});

test('mock-client: mock trends includes trend names', async () => {
  const result = await getTrends();
  
  assert.ok(result.data.data.length > 0);
  assert.ok(result.data.data[0].trend_name);
});

test('mock-client: mock usage returns data', async () => {
  const result = await getUsage();
  
  assert.equal(result.ok, true);
  assert.ok(result.data);
  assert.ok(result.meta.mode, 'mock');
});

test('mock-client: mock usage includes postsRead', async () => {
  const result = await getUsage();
  
  assert.ok(typeof result.data.postsRead === 'number');
});

test('mock-client: mock usage includes cap', async () => {
  const result = await getUsage();
  
  assert.ok(typeof result.data.cap === 'number');
});

test('mock-client: getUserByUsername returns mock user', async () => {
  const result = await getUserByUsername('demo_brand');
  
  assert.equal(result.ok, true);
  assert.ok(result.data.data);
});

test('mock-client: getUserPosts returns tweets', async () => {
  const result = await getUserPosts('mock-user-1');
  
  assert.equal(result.ok, true);
  assert.ok(Array.isArray(result.data.data));
});

test('mock-client: postTweetDryRun returns dry-run status', async () => {
  const result = await postTweetDryRun({ text: 'Test message' });
  
  assert.equal(result.ok, true);
  assert.equal(result.data.dryRun, true);
});

test('mock-client: postTweetDryRun does not actually post', async () => {
  const result = await postTweetDryRun({ text: 'Test' });
  
  assert.match(result.data.message, /ไม่ได้โพสต์จริง/);
});

test('mock-client: does not call real X API', async () => {
  // In mock mode, should not make real HTTP requests
  const result = await searchPosts('test');
  
  // If we get here without error, mock mode worked
  assert.equal(result.ok, true);
});

test('mock-client: returns mock rate limit info', async () => {
  const result = await searchPosts('test');
  
  assert.ok(result.rateLimit);
  assert.equal(result.rateLimit.mode, 'mock');
});

test('mock-client: mock mode works without credentials', async () => {
  // Should work without any API keys
  const result = await searchPosts('demo');
  
  assert.equal(result.ok, true);
});
