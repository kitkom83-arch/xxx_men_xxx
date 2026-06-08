const { requireAdminApi } = require('../../../lib/apiAuth');
const { apiError } = require('../../../lib/errors');
const { getUsage } = require('../../../lib/xApi');

export default async function handler(req, res) {
  const auth = await requireAdminApi(req, res);
  if (!auth) return;

  if (req.method !== 'GET') {
    return apiError(res, 405);
  }

  const result = await getUsage();
  return res.status(result.ok ? 200 : result.status || 500).json({
    ok: Boolean(result.ok),
    data: result.data || null,
    error: result.error || null,
    meta: { ...(result.meta || {}), rateLimit: result.rateLimit || null },
  });
}
