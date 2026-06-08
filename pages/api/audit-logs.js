const { requireAdminApi } = require('../../lib/apiAuth');
const { apiError, apiOk } = require('../../lib/errors');
const { listAudit } = require('../../lib/store');

export default async function handler(req, res) {
  const auth = await requireAdminApi(req, res);
  if (!auth) return;

  if (req.method !== 'GET') {
    return apiError(res, 405);
  }

  return apiOk(res, { audit: await listAudit(50) });
}
