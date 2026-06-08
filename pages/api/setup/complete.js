const { apiError, apiOk } = require('../../../lib/errors');
const { completeSetup } = require('../../../lib/store');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return apiError(res, 405);
  }

  const { username, password, mode = 'mock', credentials = {} } = req.body || {};
  if (!username || !password || password.length < 8) {
    return apiError(res, 400, 'กรุณาระบุ username และ password อย่างน้อย 8 ตัวอักษร');
  }
  if (!['mock', 'live-readonly'].includes(mode)) {
    return apiError(res, 400, 'โหมดต้องเป็น mock หรือ live-readonly เท่านั้น');
  }

  try {
    const status = await completeSetup({ username, password, mode, credentials });
    return apiOk(res, status);
  } catch (error) {
    return apiError(res, 500, 'ตั้งค่าระบบไม่สำเร็จ กรุณาตรวจค่า ENCRYPTION_KEY และ database');
  }
}
