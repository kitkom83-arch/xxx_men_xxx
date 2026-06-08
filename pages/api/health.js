const { apiOk } = require('../../lib/errors');
const { getSetupStatus } = require('../../lib/store');
const { isMockMode, isDryRunOnly, isRealActionsEnabled, safetyStatusText } = require('../../lib/safety-config');

export default async function handler(req, res) {
  const setup = await getSetupStatus();
  const mockMode = await isMockMode();
  const dryRunOnly = await isDryRunOnly();
  const realActionsEnabled = await isRealActionsEnabled();
  
  return apiOk(res, {
    service: 'X API Marketing Control Center',
    status: 'ok',
    mode: setup.mode,
    mockMode,
    setupComplete: setup.setupComplete,
    dryRunOnly,
    realActionsEnabled,
    safetyStatus: safetyStatusText(),
    note: mockMode 
      ? 'ข้อมูลนี้เป็นข้อมูลจำลอง ใช้ทดสอบได้โดยไม่ต้องมี X credential'
      : dryRunOnly 
        ? 'โหมด Dry-run: ไม่โพสต์จริง' 
        : realActionsEnabled 
          ? 'โหมดจริง: มีความเสี่ยง!' 
          : 'โหมดปลอดภัย',
  });
}
