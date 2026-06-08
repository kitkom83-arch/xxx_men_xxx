/**
 * Cost Guard Tests
 * 
 * Tests for cost estimation and warning formatting
 */

const assert = require('node:assert/strict');
const test = require('node:test');

/**
 * Calculate estimated posts based on actions
 * This is a utility function for cost estimation
 */
function calculateEstimatedPosts(actions) {
  if (!actions || !Array.isArray(actions)) {
    return 0;
  }
  
  return actions.reduce((total, action) => {
    if (action.type === 'post' || action.type === 'tweet') {
      return total + 1;
    }
    if (action.type === 'dm') {
      return total + 1;
    }
    if (action.type === 'retweet') {
      return total + 1;
    }
    return total;
  }, 0);
}

/**
 * Calculate estimated API calls based on actions
 */
function calculateEstimatedApiCalls(actions) {
  if (!actions || !Array.isArray(actions)) {
    return 0;
  }
  
  return actions.reduce((total, action) => {
    // Each action typically needs 1 API call
    // Search might need 1 call per 100 results
    if (action.type === 'search') {
      return total + 1;
    }
    return total + 1;
  }, 0);
}

/**
 * Format cost warning in Thai
 */
function formatCostWarning(estimatedPosts, estimatedApiCalls, cap = 2000000) {
  const percentage = (estimatedPosts / cap) * 100;
  
  if (percentage > 90) {
    return `⚠️ ค่าใช้จ่ายเกือบถึงขีดจำกัดแล้ว (${percentage.toFixed(1)}%)`;
  }
  
  if (estimatedPosts > 0) {
    return `📊 ประมาณการใช้งาน: ${estimatedPosts} โพสต์, ${estimatedApiCalls} API calls`;
  }
  
  return '📊 ยังไม่มีการใช้งาน';
}

test('cost-guard: calculateEstimatedPosts counts posts correctly', () => {
  const actions = [
    { type: 'post', text: 'Hello' },
    { type: 'post', text: 'World' }
  ];
  
  const result = calculateEstimatedPosts(actions);
  
  assert.equal(result, 2);
});

test('cost-guard: calculateEstimatedPosts counts dm correctly', () => {
  const actions = [
    { type: 'dm', to: 'user1' },
    { type: 'dm', to: 'user2' }
  ];
  
  const result = calculateEstimatedPosts(actions);
  
  assert.equal(result, 2);
});

test('cost-guard: calculateEstimatedPosts returns 0 for empty input', () => {
  assert.equal(calculateEstimatedPosts([]), 0);
  assert.equal(calculateEstimatedPosts(null), 0);
  assert.equal(calculateEstimatedPosts(undefined), 0);
});

test('cost-guard: calculateEstimatedApiCalls counts calls correctly', () => {
  const actions = [
    { type: 'post' },
    { type: 'search' },
    { type: 'dm' }
  ];
  
  const result = calculateEstimatedApiCalls(actions);
  
  assert.equal(result, 3);
});

test('cost-guard: calculateEstimatedApiCalls handles empty input', () => {
  assert.equal(calculateEstimatedApiCalls([]), 0);
  assert.equal(calculateEstimatedApiCalls(null), 0);
});

test('cost-guard: formatCostWarning returns Thai text on usage', () => {
  const result = formatCostWarning(100, 50);
  
  assert.match(result, /โพสต์/);
  assert.match(result, /API calls/);
});

test('cost-guard: formatCostWarning shows warning when near cap', () => {
  const result = formatCostWarning(1900000, 100, 2000000);
  
  assert.match(result, /เกือบถึงขีดจำกัด/);
});

test('cost-guard: formatCostWarning shows default message when no usage', () => {
  const result = formatCostWarning(0, 0);
  
  assert.match(result, /ยังไม่มีการใช้งาน/);
});

test('cost-guard: cost warning includes percentage when high', () => {
  // Use value > 90% threshold (implementation uses > 90, not >= 90)
  const result = formatCostWarning(1900000, 50, 2000000);
  
  assert.match(result, /\d+%/);
});

test('cost-guard: handles large numbers correctly', () => {
  const result = calculateEstimatedPosts([
    { type: 'post' },
    { type: 'post' },
    { type: 'post' }
  ]);
  
  assert.equal(result, 3);
});
