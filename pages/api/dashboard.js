const { requireAdminApi } = require('../../lib/apiAuth');
const { apiOk } = require('../../lib/errors');
const {
  getCredentialPublic,
  getSetupStatus,
  listAudit,
  listDrafts,
  listRateLimits,
  listSearchHistory,
  listUsage,
} = require('../../lib/store');

function buildAnalytics(searchHistory, drafts) {
  const keywordCounts = {};
  for (const item of searchHistory) {
    if (item.type === 'keyword') {
      keywordCounts[item.query] = (keywordCounts[item.query] || 0) + 1;
    }
  }
  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([keyword, count]) => ({ keyword, count }));

  return {
    searches: searchHistory.length,
    drafts: drafts.length,
    topKeywords,
    latestSearches: searchHistory.slice(0, 5),
    dryRunOnly: true,
  };
}

export default async function handler(req, res) {
  const auth = await requireAdminApi(req, res);
  if (!auth) return;

  const [setup, credential, audit, drafts, rateLimits, searchHistory, usage] = await Promise.all([
    getSetupStatus(),
    getCredentialPublic(),
    listAudit(20),
    listDrafts(10),
    listRateLimits(10),
    listSearchHistory(20),
    listUsage(10),
  ]);

  return apiOk(res, {
    setup,
    credential,
    audit,
    drafts,
    rateLimits,
    usage,
    analytics: buildAnalytics(searchHistory, drafts),
  });
}
