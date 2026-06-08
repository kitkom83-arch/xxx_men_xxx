/**
 * Rate Limit Store - Phase 5
 * 
 * Records rate limit data to JSONL file for monitoring.
 * Does NOT store Authorization headers or tokens.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(process.cwd(), 'outputs');
const RATE_LIMIT_FILE = path.join(OUTPUT_DIR, 'rate_limit_history.jsonl');

// Ensure output directory exists
function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

/**
 * Record rate limit data from API response
 * @param {string} endpoint - API endpoint path
 * @param {object} headers - Response headers (will be filtered)
 */
async function recordRateLimit(endpoint, headers = {}) {
  ensureOutputDir();
  
  // Extract only rate limit related headers - NO authorization
  const rateLimitData = {
    timestamp: new Date().toISOString(),
    endpoint: endpoint,
    limit: headers['x-rate-limit-limit'] || headers['x-rate-limit-limit'] || null,
    remaining: headers['x-rate-limit-remaining'] || null,
    reset: headers['x-rate-limit-reset'] || null,
    resetAt: headers['x-rate-limit-reset'] 
      ? new Date(Number(headers['x-rate-limit-reset']) * 1000).toISOString()
      : null,
  };
  
  // Append to JSONL file
  const line = JSON.stringify(rateLimitData) + '\n';
  fs.appendFileSync(RATE_LIMIT_FILE, line);
  
  return rateLimitData;
}

/**
 * Load rate limit history
 * @param {number} limit - Maximum number of records to return
 */
async function loadRateLimitHistory(limit = 100) {
  ensureOutputDir();
  
  if (!fs.existsSync(RATE_LIMIT_FILE)) {
    return [];
  }
  
  const content = fs.readFileSync(RATE_LIMIT_FILE, 'utf8');
  const lines = content.trim().split('\n').filter(line => line.trim());
  
  const records = lines
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .reverse(); // newest first
  
  return records.slice(0, limit);
}

/**
 * Get formatted text of latest rate limit
 */
async function latestRateLimitText() {
  const history = await loadRateLimitHistory(1);
  
  if (!history || history.length === 0) {
    return 'ยังไม่มีข้อมูล rate limit';
  }
  
  const latest = history[0];
  const remaining = latest.remaining;
  const limit = latest.limit;
  const resetAt = latest.resetAt;
  
  let text = `Rate Limit ล่าสุด: ${latest.endpoint}\n`;
  text += `ใช้ไปแล้ว: ${limit - remaining}/${limit}\n`;
  text += `เหลือ: ${remaining}\n`;
  text += `รีเซ็ต: ${resetAt}`;
  
  return text;
}

/**
 * Check if rate limit is near exhaustion
 * @returns {object} Warning info if near limit
 */
async function checkRateLimitWarning() {
  const history = await loadRateLimitHistory(1);
  
  if (!history || history.length === 0) {
    return null;
  }
  
  const latest = history[0];
  const remaining = Number(latest.remaining);
  const limit = Number(latest.limit);
  
  // Warning if less than 10% remaining
  if (limit > 0 && remaining / limit < 0.1) {
    return {
      warning: true,
      message: '⚠️ Rate Limit ใกล้หมดแล้ว! กรุณารอรีเซ็ตก่อนใช้งานต่อ',
      remaining,
      limit,
      resetAt: latest.resetAt,
    };
  }
  
  return null;
}

module.exports = {
  recordRateLimit,
  loadRateLimitHistory,
  latestRateLimitText,
  checkRateLimitWarning,
};
