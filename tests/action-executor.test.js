/**
 * Action Executor Tests
 * 
 * Tests for lib/action-executor.js - Gate Middleware for X Actions
 */

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  executeOrQueue,
  executePublishPost,
  executeDeletePost,
  executeLike,
  executeUnlike,
  executeRetweet,
  executeUnretweet,
  executeFollow,
  executeUnfollow,
  executeSendDM,
  executeCreateList,
  executeAddListMember,
  executeRemoveListMember,
  executeMediaUpload,
} = require('../lib/action-executor');

// Mock real callable for testing
async function mockRealPublish(payload) {
  return { id: 'mock-tweet-id', text: payload.text };
}

async function mockRealDelete(payload) {
  return { deleted: true, tweetId: payload.tweetId };
}

async function mockRealLike(payload) {
  return { liked: true, tweetId: payload.tweetId };
}

test('action-executor: executeOrQueue returns queued response when safety blocks', async () => {
  const result = await executeOrQueue(
    'publish_post',
    { text: 'Test tweet' },
    mockRealPublish,
    { auditAction: 'test.post' }
  );
  
  // Should be blocked by default
  assert.equal(result.ok, false);
  assert.equal(result.executed, false);
  assert.equal(result.queued, true);
  assert.match(result.message, /ปิดอยู่/);
});

test('action-executor: executeOrQueue executes when safety allows', async () => {
  // Set environment to allow execution
  const result = await executeOrQueue(
    'publish_post',
    { text: 'Test tweet' },
    mockRealPublish,
    { 
      auditAction: 'test.post',
      env: {
        ENABLE_REAL_ACTIONS: '1',
        MOCK_MODE: '0',
        DRY_RUN_ONLY: '0',
      },
    }
  );
  
  // Should execute when all safety flags allow
  assert.equal(result.ok, true);
  assert.equal(result.executed, true);
  assert.equal(result.queued, false);
  assert.equal(result.data.id, 'mock-tweet-id');
});

test('action-executor: executeOrQueue requires realCallable', async () => {
  // Note: Safety gate is checked first, then realCallable
  // When safety allows but no realCallable provided
  const result = await executeOrQueue(
    'publish_post',
    { text: 'Test tweet' },
    null, // No real callable
    { 
      env: {
        ENABLE_REAL_ACTIONS: '1',
        MOCK_MODE: '0',
        DRY_RUN_ONLY: '0',
      },
    }
  );
  
  assert.equal(result.ok, false);
  assert.equal(result.error, 'NO_REAL_CALLABLE');
});

test('action-executor: executePublishPost queues by default', async () => {
  const result = await executePublishPost({ text: 'Test' }, mockRealPublish);
  
  assert.equal(result.ok, false);
  assert.equal(result.actionName, 'publish_post');
  assert.equal(result.queued, true);
});

test('action-executor: executeDeletePost queues by default', async () => {
  const result = await executeDeletePost('tweet-123', mockRealDelete);
  
  assert.equal(result.ok, false);
  assert.equal(result.actionName, 'delete_post');
});

test('action-executor: executeLike queues by default', async () => {
  const result = await executeLike('tweet-123', mockRealLike);
  
  assert.equal(result.ok, false);
  assert.equal(result.actionName, 'like_post');
});

test('action-executor: executeUnlike queues by default', async () => {
  const result = await executeUnlike('tweet-123', mockRealLike);
  
  assert.equal(result.ok, false);
  assert.equal(result.actionName, 'unlike_post');
});

test('action-executor: executeRetweet queues by default', async () => {
  const result = await executeRetweet('tweet-123', mockRealLike);
  
  assert.equal(result.ok, false);
  assert.equal(result.actionName, 'retweet_post');
});

test('action-executor: executeUnretweet queues by default', async () => {
  const result = await executeUnretweet('tweet-123', mockRealLike);
  
  assert.equal(result.ok, false);
  assert.equal(result.actionName, 'unretweet_post');
});

test('action-executor: executeFollow queues by default', async () => {
  const result = await executeFollow('user-123', mockRealLike);
  
  assert.equal(result.ok, false);
  assert.equal(result.actionName, 'follow_user');
});

test('action-executor: executeUnfollow queues by default', async () => {
  const result = await executeUnfollow('user-123', mockRealLike);
  
  assert.equal(result.ok, false);
  assert.equal(result.actionName, 'unfollow_user');
});

test('action-executor: executeSendDM queues by default', async () => {
  const result = await executeSendDM({ recipientId: 'user-123', text: 'Hello' }, mockRealLike);
  
  assert.equal(result.ok, false);
  assert.equal(result.actionName, 'send_dm');
});

test('action-executor: executeCreateList queues by default', async () => {
  const result = await executeCreateList({ name: 'My List' }, mockRealLike);
  
  assert.equal(result.ok, false);
  assert.equal(result.actionName, 'create_list');
});

test('action-executor: executeAddListMember queues by default', async () => {
  const result = await executeAddListMember({ listId: 'list-123', userId: 'user-456' }, mockRealLike);
  
  assert.equal(result.ok, false);
  assert.equal(result.actionName, 'add_list_member');
});

test('action-executor: executeRemoveListMember queues by default', async () => {
  const result = await executeRemoveListMember({ listId: 'list-123', userId: 'user-456' }, mockRealLike);
  
  assert.equal(result.ok, false);
  assert.equal(result.actionName, 'remove_list_member');
});

test('action-executor: executeMediaUpload queues by default', async () => {
  const result = await executeMediaUpload({ filePath: '/tmp/image.jpg' }, mockRealLike);
  
  assert.equal(result.ok, false);
  assert.equal(result.actionName, 'upload_media');
});

test('action-executor: action returns actionId for tracking', async () => {
  const result = await executePublishPost({ text: 'Test' }, mockRealPublish);
  
  assert.equal(typeof result.actionId, 'string');
  assert.match(result.actionId, /^publish_post_/);
});

test('action-executor: queued response includes safety gate info', async () => {
  const result = await executePublishPost({ text: 'Test' }, mockRealPublish);
  
  assert.equal(typeof result.safetyGate, 'object');
  assert.equal(result.safetyGate.shouldExecute, false);
  assert.equal(result.safetyGate.blockedBy, 'ENABLE_REAL_ACTIONS');
});
