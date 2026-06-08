const { THAI_ERRORS, normalizeXError } = require('./errors');
const {
  getDecryptedCredentials,
  getSetting,
  recordAudit,
  recordRateLimit,
  recordSearch,
  recordUsage,
} = require('./store');

const BASE_URL = 'https://api.x.com/2';

const mockTweets = [
  {
    id: 'mock-1001',
    text: 'เปิดตัวแคมเปญใหม่ด้วย demo mode ที่ไม่แตะ X API จริง',
    author_id: 'mock-user-1',
    public_metrics: { retweet_count: 4, reply_count: 2, like_count: 18, quote_count: 1 },
  },
  {
    id: 'mock-1002',
    text: 'ทีมการตลาดกำลังตรวจ keyword และ rate limit ผ่าน control center',
    author_id: 'mock-user-2',
    public_metrics: { retweet_count: 7, reply_count: 1, like_count: 29, quote_count: 3 },
  },
  {
    id: 'mock-1003',
    text: 'dry-run composer ช่วยตรวจ policy ก่อนนำข้อความไปใช้จริง',
    author_id: 'mock-user-1',
    public_metrics: { retweet_count: 1, reply_count: 0, like_count: 11, quote_count: 0 },
  },
];

const mockUsers = [
  { id: 'mock-user-1', username: 'demo_brand', name: 'Demo Brand', verified: false },
  { id: 'mock-user-2', username: 'market_watch', name: 'Market Watch TH', verified: true },
];

function mockRateLimit(endpoint) {
  return {
    endpoint,
    limit: 300,
    remaining: 297,
    reset: String(Math.floor(Date.now() / 1000) + 900),
    mode: 'mock',
  };
}

async function getMode() {
  return (await getSetting('mode', 'mock')) || 'mock';
}

function summarizeTweets(tweets) {
  const metrics = tweets.reduce(
    (total, tweet) => {
      const item = tweet.public_metrics || {};
      total.likes += item.like_count || 0;
      total.reposts += item.retweet_count || 0;
      total.replies += item.reply_count || 0;
      total.quotes += item.quote_count || 0;
      return total;
    },
    { likes: 0, reposts: 0, replies: 0, quotes: 0 }
  );
  return { count: tweets.length, metrics };
}

async function liveGet(endpoint, params = {}) {
  const axios = require('axios');
  const credentials = await getDecryptedCredentials();
  if (!credentials?.bearerToken) {
    return { ok: false, error: THAI_ERRORS.missingCredential, status: 400, meta: { mode: 'live-readonly' } };
  }

  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params,
      headers: { Authorization: `Bearer ${credentials.bearerToken}` },
      timeout: 15000,
    });
    const rateLimit = {
      endpoint,
      limit: response.headers['x-rate-limit-limit'] || null,
      remaining: response.headers['x-rate-limit-remaining'] || null,
      reset: response.headers['x-rate-limit-reset'] || null,
      mode: 'live-readonly',
    };
    await recordRateLimit(endpoint, rateLimit);
    return { ok: true, data: response.data, rateLimit, meta: { mode: 'live-readonly' } };
  } catch (error) {
    const normalized = normalizeXError(error);
    await recordAudit('x.error', 'X API read-only request ล้มเหลว', {
      endpoint,
      status: normalized.status,
    });
    return {
      ok: false,
      error: normalized.message,
      status: normalized.status,
      rateLimit: null,
      meta: { mode: 'live-readonly' },
    };
  }
}

async function searchPosts(keyword) {
  const mode = await getMode();
  if (mode === 'live-readonly') {
    const result = await liveGet('/tweets/search/recent', {
      query: keyword,
      max_results: 10,
      'tweet.fields': 'created_at,public_metrics,author_id,lang',
    });
    if (result.ok) {
      await recordSearch('keyword', keyword, {
        count: result.data?.data?.length || 0,
        mode,
      });
    }
    return result;
  }

  const filtered = mockTweets.filter((tweet) => {
    const normalized = `${tweet.text} ${keyword}`.toLowerCase();
    return normalized.includes(String(keyword || '').toLowerCase());
  });
  const data = { data: filtered.length ? filtered : mockTweets, meta: { result_count: filtered.length || mockTweets.length } };
  const rateLimit = mockRateLimit('/tweets/search/recent');
  await recordSearch('keyword', keyword, { ...summarizeTweets(data.data), mode: 'mock' });
  await recordRateLimit('/tweets/search/recent', rateLimit);
  return { ok: true, data, rateLimit, meta: { mode: 'mock' } };
}

async function getUserByUsername(username) {
  const mode = await getMode();
  if (mode === 'live-readonly') {
    const result = await liveGet(`/users/by/username/${encodeURIComponent(username)}`, {
      'user.fields': 'created_at,description,public_metrics,verified',
    });
    if (result.ok) {
      await recordSearch('user', username, { count: result.data?.data ? 1 : 0, mode });
    }
    return result;
  }

  const user =
    mockUsers.find((item) => item.username.toLowerCase() === String(username || '').toLowerCase()) ||
    mockUsers[0];
  const data = { data: user };
  const rateLimit = mockRateLimit('/users/by/username/:username');
  await recordSearch('user', username, { count: 1, mode: 'mock' });
  await recordRateLimit('/users/by/username/:username', rateLimit);
  return { ok: true, data, rateLimit, meta: { mode: 'mock' } };
}

async function getUserPosts(userId) {
  const mode = await getMode();
  if (mode === 'live-readonly') {
    const result = await liveGet(`/users/${encodeURIComponent(userId)}/tweets`, {
      max_results: 10,
      'tweet.fields': 'created_at,public_metrics,author_id,lang',
    });
    if (result.ok) {
      await recordSearch('user-posts', userId, { count: result.data?.data?.length || 0, mode });
    }
    return result;
  }

  const tweets = mockTweets.filter((tweet) => tweet.author_id === userId);
  const data = { data: tweets.length ? tweets : mockTweets };
  const rateLimit = mockRateLimit('/users/:id/tweets');
  await recordSearch('user-posts', userId, { ...summarizeTweets(data.data), mode: 'mock' });
  await recordRateLimit('/users/:id/tweets', rateLimit);
  return { ok: true, data, rateLimit, meta: { mode: 'mock' } };
}

async function getUsage() {
  const mode = await getMode();
  if (mode === 'live-readonly') {
    const result = await liveGet('/usage/tweets', {});
    if (result.ok) {
      await recordUsage('live-readonly', result.data || {});
    }
    return result;
  }

  const data = {
    postsRead: 1284,
    cap: 2000000,
    percentUsed: 0.0642,
    source: 'mock',
    note: 'ข้อมูลจำลองสำหรับ demo mode',
  };
  await recordUsage('mock', data);
  return { ok: true, data, rateLimit: mockRateLimit('/usage/tweets'), meta: { mode: 'mock' } };
}

async function getTrends(woeid = '1') {
  const mode = await getMode();
  if (mode === 'live-readonly') {
    return liveGet(`/trends/by/woeid/${encodeURIComponent(woeid)}`, {});
  }

  const data = {
    data: [
      { trend_name: '#DemoMarketing', tweet_count: 12400, woeid },
      { trend_name: '#XAPI', tweet_count: 8200, woeid },
      { trend_name: 'dry-run campaign', tweet_count: 4100, woeid },
    ],
    meta: { source: 'mock', woeid },
  };
  const rateLimit = mockRateLimit('/trends/by/woeid/:woeid');
  await recordRateLimit('/trends/by/woeid/:woeid', rateLimit);
  return { ok: true, data, rateLimit, meta: { mode: 'mock' } };
}

async function postTweetDryRun(payload) {
  await recordAudit('composer.dry_run.legacy', 'เรียก dry-run composer ผ่าน compatibility function', {
    payload,
    dryRun: true,
  });
  return {
    ok: true,
    data: {
      dryRun: true,
      message: 'บันทึกแบบจำลองเท่านั้น ระบบไม่ได้โพสต์จริงไปยัง X',
      payload,
    },
    error: null,
    meta: { mode: await getMode() },
  };
}

module.exports = {
  getTrends,
  getUsage,
  getUserByUsername,
  getUserPosts,
  postTweetDryRun,
  searchPosts,
};
