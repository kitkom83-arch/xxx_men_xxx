const { apiOk } = require('../../lib/errors');
const { getSetupStatus } = require('../../lib/store');

export default async function handler(req, res) {
  const setup = await getSetupStatus();
  return apiOk(res, {
    service: 'X API Marketing Control Center',
    status: 'ok',
    mode: setup.mode,
    setupComplete: setup.setupComplete,
    dryRunOnly: true,
  });
}
