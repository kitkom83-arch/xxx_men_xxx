const { apiError } = require('./errors');
const { readSession } = require('./security');
const { getSetupStatus } = require('./store');

async function requireAdminApi(req, res) {
  const setup = await getSetupStatus();
  if (!setup.setupComplete) {
    apiError(res, 401, 'ยังตั้งค่าระบบไม่เสร็จ กรุณาเปิด setup wizard', { setupRequired: true });
    return null;
  }

  const session = readSession(req);
  if (!session?.adminId) {
    apiError(res, 401, 'กรุณาเข้าสู่ระบบผู้ดูแลก่อนใช้งาน');
    return null;
  }

  return { session, setup };
}

async function requirePageSession(context) {
  const setup = await getSetupStatus();
  if (!setup.setupComplete) {
    return { redirect: { destination: '/setup', permanent: false } };
  }

  const session = readSession(context.req);
  if (!session?.adminId) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  return { props: { setup, admin: { username: session.username } } };
}

module.exports = { requireAdminApi, requirePageSession };
