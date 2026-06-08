const FORBIDDEN_ACTIONS = [
  'post',
  'tweet',
  'dm',
  'direct_message',
  'follow',
  'unfollow',
  'like',
  'retweet',
  'delete',
  'browser_automation',
  'scrape',
];

function isForbiddenAction(action = '') {
  const normalized = String(action).toLowerCase();
  return FORBIDDEN_ACTIONS.some((forbidden) => normalized.includes(forbidden));
}

function assertDryRunAction({ action, dryRun }) {
  if (isForbiddenAction(action) && dryRun !== true) {
    const error = new Error('FORBIDDEN_WRITE_ACTION');
    error.status = 403;
    throw error;
  }
  return true;
}

function buildComposerSafetyPreview(text) {
  const warnings = [];
  if (!text || !text.trim()) {
    warnings.push('กรุณาใส่ข้อความก่อนบันทึก dry-run');
  }
  if (text && text.length > 280) {
    warnings.push('ข้อความยาวกว่า 280 ตัวอักษร ควรย่อก่อนนำไปใช้จริง');
  }
  if (/(dm|follow|unfollow|like|retweet)/i.test(text || '')) {
    warnings.push('พบคำที่เกี่ยวกับ write action ต้องห้าม ระบบจะเก็บเป็น dry-run เท่านั้น');
  }
  return {
    dryRun: true,
    safeToSend: false,
    status: warnings.length ? 'needs_review' : 'dry_run_ready',
    warnings,
  };
}

module.exports = { assertDryRunAction, buildComposerSafetyPreview, isForbiddenAction };
