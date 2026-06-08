const { requireAdminApi } = require('../../../lib/apiAuth');
const { apiError, apiOk } = require('../../../lib/errors');
const { assertDryRunAction, buildComposerSafetyPreview } = require('../../../lib/safety');
const { recordAudit, saveDraft } = require('../../../lib/store');

export default async function handler(req, res) {
  const auth = await requireAdminApi(req, res);
  if (!auth) return;

  if (req.method !== 'POST') {
    return apiError(res, 405);
  }

  const payload = req.body || {};
  const text = String(payload.text || '').trim();
  if (payload.dryRun === false) {
    return apiError(res, 403, 'ระบบนี้อนุญาตเฉพาะ dry-run และไม่โพสต์จริง');
  }
  try {
    assertDryRunAction({ action: 'post', dryRun: true });
  } catch (error) {
    return apiError(res, 403, 'ระบบนี้อนุญาตเฉพาะ dry-run และไม่โพสต์จริง');
  }

  const safety = buildComposerSafetyPreview(text);
  if (!text) {
    return apiError(res, 400, 'กรุณาใส่ข้อความก่อนบันทึก dry-run', { safety });
  }

  const draft = await saveDraft({
    text,
    payload: { ...payload, dryRun: true },
    safetyStatus: safety.status,
  });
  await recordAudit('composer.dry_run', 'บันทึกร่างโพสต์แบบ dry-run โดยไม่ส่งไปยัง X', {
    dryRun: true,
    draftId: draft.id,
    safetyStatus: safety.status,
  });

  return apiOk(res, { draft, safety, dryRun: true }, { mode: auth.setup.mode });
}
