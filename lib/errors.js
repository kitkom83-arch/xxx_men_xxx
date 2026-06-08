const THAI_ERRORS = {
  400: 'คำขอไม่ถูกต้อง กรุณาตรวจข้อมูลที่ส่งมา',
  401: 'กรุณาเข้าสู่ระบบผู้ดูแลก่อนใช้งาน',
  403: 'ไม่มีสิทธิ์ใช้งานส่วนนี้ หรือ action นี้ถูกล็อกเพื่อความปลอดภัย',
  404: 'ไม่พบข้อมูลที่ต้องการ',
  405: 'เมธอดนี้ไม่รองรับ',
  429: 'เกินขีดจำกัดการเรียกใช้งาน กรุณารอแล้วลองใหม่',
  500: 'เกิดข้อผิดพลาดในระบบหลังบ้าน',
  missingSetup: 'ยังตั้งค่าระบบไม่เสร็จ กรุณาเปิด setup wizard',
  missingCredential: 'ยังไม่ได้ตั้งค่า X credential สำหรับโหมด live-readonly',
  encryptionFailure: 'ไม่สามารถจัดการข้อมูลลับแบบเข้ารหัสได้',
  modeMismatch: 'โหมดการทำงานไม่ตรงกับการตั้งค่าปัจจุบัน',
  forbiddenWrite: 'ระบบนี้อนุญาตเฉพาะ dry-run และไม่ส่ง write action จริงไปยัง X',
  tokenExpired: 'token หมดอายุ กรุณาเชื่อมต่อหรือบันทึก credential ใหม่',
  oauthCallback: 'OAuth callback ไม่ถูกต้อง กรุณาตรวจ callback URL และ state',
};

function apiOk(res, data = {}, meta = {}) {
  return res.status(200).json({ ok: true, data, error: null, meta });
}

function apiError(res, status = 500, message, meta = {}) {
  return res.status(status).json({
    ok: false,
    data: null,
    error: message || THAI_ERRORS[status] || THAI_ERRORS[500],
    meta,
  });
}

function normalizeXError(error) {
  const status = error?.response?.status || error?.status || 500;
  const detail = `${error?.response?.data?.detail || error?.message || ''}`.toLowerCase();
  if (detail.includes('expired')) {
    return { status: status === 500 ? 401 : status, message: THAI_ERRORS.tokenExpired };
  }
  if (detail.includes('oauth') || detail.includes('callback') || detail.includes('state')) {
    return { status: status === 500 ? 400 : status, message: THAI_ERRORS.oauthCallback };
  }
  if (status === 401 || status === 403 || status === 429) {
    return { status, message: THAI_ERRORS[status] };
  }
  return { status, message: THAI_ERRORS[status] || THAI_ERRORS[500] };
}

module.exports = { THAI_ERRORS, apiError, apiOk, normalizeXError };
