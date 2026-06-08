module.exports = {
  testDir: './tests/e2e',
  use: {
    baseURL: process.env.APP_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
};
