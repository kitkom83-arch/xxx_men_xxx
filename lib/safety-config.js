/**
 * Safety Configuration - Global Action Switch
 * 
 * Phase 1: Global Safety Switch for Real X Actions
 * 
 * Default behavior:
 * - ENABLE_REAL_ACTIONS: 0 (disabled) - must be explicitly set to "1" to enable
 * - MOCK_MODE: 1 (enabled by default)  
 * - DRY_RUN_ONLY: 1 (enabled by default)
 * 
 * This ensures all real X write actions are disabled by default.
 */

const getEnv = (name, fallback) => process.env[name] || fallback;

/**
 * Check if real X actions are enabled
 * @param {string} env - Optional custom env object for testing
 * @returns {boolean} true only if ENABLE_REAL_ACTIONS === "1"
 */
function isRealActionsEnabled(env = null) {
  const source = env || process.env;
  const value = source.ENABLE_REAL_ACTIONS;
  // Must be exactly "1" to enable - any other value means disabled
  return value === '1';
}

/**
 * Check if mock mode is enabled
 * @param {string} env - Optional custom env object for testing
 * @returns {boolean} true unless MOCK_MODE === "0"
 */
function isMockMode(env = null) {
  const source = env || process.env;
  const value = source.MOCK_MODE;
  // Default to 1 (mock mode enabled) unless explicitly set to "0"
  return value !== '0';
}

/**
 * Check if dry-run only mode is enforced
 * @param {string} env - Optional custom env object for testing
 * @returns {boolean} true unless DRY_RUN_ONLY === "0"
 */
function isDryRunOnly(env = null) {
  const source = env || process.env;
  const value = source.DRY_RUN_ONLY;
  // Default to 1 (dry-run only) unless explicitly set to "0"
  return value !== '0';
}

/**
 * Get safety status text in Thai
 * @param {string} env - Optional custom env object for testing
 * @returns {string} Thai status message
 */
function safetyStatusText(env = null) {
  const realEnabled = isRealActionsEnabled(env);
  const mockMode = isMockMode(env);
  const dryRunOnly = isDryRunOnly(env);
  
  const parts = [];
  
  if (realEnabled) {
    parts.push('[⚠️] โหมดอันตราย: เปิด Action จริงแล้ว');
  } else {
    parts.push('[🔒] โหมดปลอดภัย: Action จริงปิดอยู่');
  }
  
  if (mockMode) {
    parts.push('[🧪] โหมดทดลอง: ไม่ยิง X API จริง');
  }
  
  if (dryRunOnly) {
    parts.push('[📝] Dry-run only: ไม่โพสต์จริง');
  }
  
  return parts.join(' | ');
}

/**
 * Get current safety configuration summary
 * @param {string} env - Optional custom env object for testing
 * @returns {object} Configuration object
 */
function getSafetyConfig(env = null) {
  return {
    realActionsEnabled: isRealActionsEnabled(env),
    mockMode: isMockMode(env),
    dryRunOnly: isDryRunOnly(env),
    statusText: safetyStatusText(env),
  };
}

/**
 * Check if an action should be executed or queued
 * @param {string} actionName - Name of the action
 * @param {object} env - Optional custom env object for testing
 * @returns {object} { shouldExecute: boolean, reason: string }
 */
function checkActionGate(actionName, env = null) {
  const realEnabled = isRealActionsEnabled(env);
  const mockMode = isMockMode(env);
  const dryRunOnly = isDryRunOnly(env);
  
  // If any safety flag blocks real actions, queue instead of execute
  if (!realEnabled) {
    return {
      shouldExecute: false,
      reason: `Action "${actionName}" ถูกปิดอยู่ - ENABLE_REAL_ACTIONS ต้องตั้งเป็น "1" จึงจะเรียกได้`,
      blockedBy: 'ENABLE_REAL_ACTIONS',
    };
  }
  
  if (mockMode) {
    return {
      shouldExecute: false,
      reason: `Action "${actionName}" ถูกบล็อกในโหมดทดลอง - ต้องตั้ง MOCK_MODE=0`,
      blockedBy: 'MOCK_MODE',
    };
  }
  
  if (dryRunOnly) {
    return {
      shouldExecute: false,
      reason: `Action "${actionName}" ถูกบล็อกในโหมด dry-run - ต้องตั้ง DRY_RUN_ONLY=0`,
      blockedBy: 'DRY_RUN_ONLY',
    };
  }
  
  return {
    shouldExecute: true,
    reason: `Action "${actionName}" อนุญาตให้ทำจริง`,
    blockedBy: null,
  };
}

module.exports = {
  isRealActionsEnabled,
  isMockMode,
  isDryRunOnly,
  safetyStatusText,
  getSafetyConfig,
  checkActionGate,
  getEnv,
};
