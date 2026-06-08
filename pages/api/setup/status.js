const { apiOk } = require('../../../lib/errors');
const { getSetupStatus } = require('../../../lib/store');

export default async function handler(req, res) {
  const status = await getSetupStatus();
  return apiOk(res, status);
}
