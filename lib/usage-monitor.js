/**
 * Usage Monitor - Phase 5
 * 
 * Records usage snapshots to JSONL file for monitoring.
 * Helps track API usage to prevent hitting caps.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(process.cwd(), 'outputs');
const USAGE_FILE = path.join(OUTPUT_DIR, 'usage_history.jsonl');

// Ensure output directory exists
function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

/**
 * Record usage snapshot
 * @param {object} payload - Usage data from API
 */
async function recordUsageSnapshot(payload = {}) {
  ensureOutputDir();
  
  // Extract key usage metrics
  const usageData = {
    timestamp: new Date().toISOString(),
    source: payload.source || 'unknown',
    postsRead: payload.postsRead || payload.projectUsage || 0,
    cap: payload.cap || null,
    percentUsed: payload.percentUsed || calculatePercent(payload),
    periodStart: payload.periodStart || null,
    periodEnd: payload.percentUsed || null,
  };
  
  // Append to JSONL file
  const line = JSON.stringify(usageData) + '\n';
  fs.appendFileSync(USAGE_FILE, line);
  
  return usageData;
}

/**
 * Calculate percent used
 */
function calculatePercent(payload) {
  const used = payload.postsRead || payload.projectUsage || 0;
  const cap = payload.cap || 1;
  return (used / cap) * 100;
}

/**
 * Load usage history
 * @param {number} limit - Maximum number of records to return
 */
async function loadUsageHistory(limit = 100) {
  ensureOutputDir();
  
  if (!fs.existsSync(USAGE_FILE)) {
    return [];
  }
  
  const content = fs.readFileSync(USAGE_FILE, 'utf8');
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
 * Get formatted warning text based on usage
 * @param {object} payload - Current usage payload
 */
async function usageWarningText(payload = {}) {
  await recordUsageSnapshot(payload);
  
  const history = await loadUsageHistory(1);
  
  if (!history || history.length === 0) {
    return 'ยังไม่มีข้อมูล usage';
  }
  
  const latest = history[0];
  const percent = Number(latest.percentUsed);
  
  let text = `Usage ล่าสุด:\n`;
  text += `อ่านไปแล้ว: ${latest.postsRead}\n`;
  text += `Cap: ${latest.cap}\n`;
  text += `ใช้ไป: ${percent.toFixed(2)}%`;
  
  // Add warning if high usage
  if (percent > 80) {
    text += '\n\n⚠️ ใกล้ถึง cap แล้ว! ควรหยุดพักหรืออัปเกรดเป็น paid plan';
  } else if (percent > 50) {
    text += '\n\n⚠️ ใช้ไปเกินครึ่งแล้ว ระวังการใช้งาน';
  }
  
  return text;
}

/**
 * Check if usage is near cap
 * @returns {object} Warning info if near cap
 */
async function checkUsageWarning() {
  const history = await loadUsageHistory(1);
  
  if (!history || history.length === 0) {
    return null;
  }
  
  const latest = history[0];
  const percent = Number(latest.percentUsed);
  
  // Warning if more than 90% used
  if (percent > 90) {
    return {
      warning: true,
      message: '⚠️ ใกล้ถึง cap แล้ว! ควรอัปเกรดเป็น paid plan',
      postsRead: latest.postsRead,
      cap: latest.cap,
      percentUsed: percent,
    };
  }
  
  return null;
}

module.exports = {
  recordUsageSnapshot,
  loadUsageHistory,
  usageWarningText,
  checkUsageWarning,
};
