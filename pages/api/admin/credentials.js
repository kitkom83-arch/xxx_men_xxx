const { requireAdminApi } = require('../../../lib/apiAuth');
const { apiError, apiOk } = require('../../../lib/errors');
const { deleteCredentials, getCredentialPublic, recordAudit, saveCredentials, setSetting } = require('../../../lib/store');

export default async function handler(req, res) {
  const auth = await requireAdminApi(req, res);
  if (!auth) return;

  if (req.method === 'GET') {
    return apiOk(res, await getCredentialPublic());
  }

  if (req.method === 'DELETE') {
    const credential = await deleteCredentials();
    await setSetting('mode', 'mock');
    await recordAudit('credentials.delete', 'ลบ X credential และสลับกลับเป็น demo mode', {});
    return apiOk(res, credential, { mode: 'mock' });
  }

  if (req.method !== 'POST') {
    return apiError(res, 405);
  }

  const { mode = 'mock', credentials = {} } = req.body || {};
  if (!['mock', 'live-readonly'].includes(mode)) {
    return apiError(res, 400, 'โหมดต้องเป็น mock หรือ live-readonly เท่านั้น');
  }

  try {
    const credential = await saveCredentials({ mode, credentials });
    await setSetting('mode', mode);
    await recordAudit('credentials.save', 'บันทึก X credential แบบ encrypted ฝั่ง server', {
      mode,
      configuredFields: Object.keys(credentials).filter((key) => Boolean(credentials[key])),
    });
    return apiOk(res, credential, { mode });
  } catch (error) {
    return apiError(res, 500, 'ไม่สามารถเข้ารหัสหรือบันทึก credential ได้');
  }
}
