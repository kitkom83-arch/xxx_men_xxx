const { apiError, apiOk } = require('../../../lib/errors');
const { setSessionCookie, verifyPassword } = require('../../../lib/security');
const { findAdminByUsername, recordAudit } = require('../../../lib/store');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return apiError(res, 405);
  }

  const { username, password } = req.body || {};
  const admin = username ? await findAdminByUsername(username) : null;
  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    return apiError(res, 401, 'username หรือ password ไม่ถูกต้อง');
  }

  setSessionCookie(res, { adminId: admin.id, username: admin.username });
  await recordAudit('auth.login', 'ผู้ดูแลเข้าสู่ระบบสำเร็จ', { username: admin.username });
  return apiOk(res, { username: admin.username });
}
