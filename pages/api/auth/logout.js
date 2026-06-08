const { apiOk } = require('../../../lib/errors');
const { clearSessionCookie } = require('../../../lib/security');
const { recordAudit } = require('../../../lib/store');

export default async function handler(req, res) {
  clearSessionCookie(res);
  await recordAudit('auth.logout', 'ผู้ดูแลออกจากระบบ', {});
  return apiOk(res, { loggedOut: true });
}
