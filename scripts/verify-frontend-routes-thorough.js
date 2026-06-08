const { completeSetup, resetMemoryStoreForTests } = require('../lib/store');

function getBaseUrl() {
  const env = process.env.APP_BASE_URL;
  if (env && /^https?:\/\//.test(env)) return env.replace(/\/$/, '');
  return ['http://localhost:3000', 'http://localhost:3001'];
}

async function httpGet(url, { headers = {}, followRedirect = false } = {}) {
  return fetch(url, {
    method: 'GET',
    headers,
    redirect: followRedirect ? 'follow' : 'manual',
  });
}

async function httpPost(url, { headers = {}, body = null, followRedirect = false } = {}) {
  return fetch(url, {
    method: 'POST',
    headers,
    body,
    redirect: followRedirect ? 'follow' : 'manual',
  });
}

function looksLikeSecretInHtml(html) {
  const text = html || '';
  const patterns = [
    /\bxox[a-zA-Z]-[A-Za-z0-9-]{10,}\b/,
    /\bsk-[A-Za-z0-9]{20,}\b/,
    /\bBearer\s+[A-Za-z0-9\-_=]{30,}\b/,
    /\b(api[_-]?key|apikey|secret|token|password)\b\s*[:=]\s*['"]?[A-Za-z0-9_\-]{16,}['"]?/i,
    /-----BEGIN (?:[A-Z ]+)?PRIVATE KEY-----/i,
    /\bAKIA[0-9A-Z]{16}\b/,
  ];
  return patterns.some((r) => r.test(text));
}

async function pickWorkingBaseUrl() {
  const base = getBaseUrl();
  if (typeof base === 'string') return base;

  for (const b of base) {
    try {
      const res = await httpGet(`${b}/api/health`, { followRedirect: true });
      if (res && res.ok) return b;
    } catch {}
  }
  return base[0];
}

async function fetchTextSafe(res) {
  try {
    return await res.text();
  } catch {
    return '';
  }
}

function isProtectedPath(path) {
  return path.startsWith('/dashboard') || path.startsWith('/settings');
}

function isPublicPath(path) {
  return path === '/login' || path === '/setup';
}

async function verifyUnauthRoute(baseUrl, path) {
  const url = `${baseUrl}${path}`;
  const res = await httpGet(url, { followRedirect: false });
  const status = res.status;
  const location = res.headers.get('location') || '';
  const html = await fetchTextSafe(res);

  const notFound = status === 404;
  const serverError = status >= 500;
  const secretLeak = looksLikeSecretInHtml(html);

  let pass = !notFound && !serverError && !secretLeak;
  let reason = 'ok';

  if (isProtectedPath(path)) {
    const blocked = (status >= 300 && status < 400 && (location.includes('/login') || location.includes('/setup')))
      || status === 401
      || status === 403;
    if (!blocked) {
      pass = false;
      reason = `unauth not blocked/redirected (status=${status}, location=${location})`;
    }
  } else if (isPublicPath(path)) {
    if (status === 404 || status >= 500) {
      pass = false;
      reason = `public route unavailable (status=${status})`;
    }
  }

  if (notFound) reason = '404';
  if (serverError) reason = `server-error-${status}`;
  if (secretLeak) reason = 'secret-leak-in-html';

  return { mode: 'unauth', path, status, location, pass, reason, secretLeak };
}

function parseSetCookie(headers) {
  const raw = headers.get('set-cookie');
  if (!raw) return '';
  return raw.split(';')[0];
}

async function loginAndGetCookie(baseUrl) {
  const loginRes = await httpPost(`${baseUrl}/api/auth/login`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password123' }),
    followRedirect: false,
  });

  const cookie = parseSetCookie(loginRes.headers);
  let body = {};
  try {
    body = await loginRes.json();
  } catch {}

  return {
    ok: loginRes.ok && !!cookie && body?.ok !== false,
    status: loginRes.status,
    cookie,
    body,
  };
}

async function verifyAuthRoute(baseUrl, path, cookie) {
  const url = `${baseUrl}${path}`;
  const res = await httpGet(url, {
    followRedirect: false,
    headers: { cookie },
  });
  const status = res.status;
  const location = res.headers.get('location') || '';
  const html = await fetchTextSafe(res);

  const notFound = status === 404;
  const serverError = status >= 500;
  const secretLeak = looksLikeSecretInHtml(html);
  const redirectedToAuth = status >= 300 && status < 400 && (location.includes('/login') || location.includes('/setup'));

  const pass = !notFound && !serverError && !secretLeak && !redirectedToAuth;
  let reason = 'ok';
  if (notFound) reason = '404';
  else if (serverError) reason = `server-error-${status}`;
  else if (secretLeak) reason = 'secret-leak-in-html';
  else if (redirectedToAuth) reason = `auth-user-redirected-unexpectedly(${location})`;

  return { mode: 'post-login', path, status, location, pass, reason, secretLeak };
}

async function main() {
  process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'verify-encryption-key';
  process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'verify-session-key';

  resetMemoryStoreForTests();
  await completeSetup({
    username: 'admin',
    password: 'password123',
    mode: 'mock',
    credentials: {},
  });

  const baseUrl = await pickWorkingBaseUrl();

  const paths = [
    '/setup',
    '/login',
    '/dashboard',
    '/dashboard/search',
    '/dashboard/users',
    '/dashboard/user-posts',
    '/dashboard/trends',
    '/dashboard/composer',
    '/dashboard/rate-limits',
    '/dashboard/usage',
    '/settings/x-keys',
    '/settings/system',
  ];

  const unauthResults = [];
  for (const path of paths) {
    const result = await verifyUnauthRoute(baseUrl, path);
    unauthResults.push(result);
    console.log(`[${result.pass ? 'PASS' : 'FAIL'}][unauth] ${path} -> ${result.status} ${result.reason}`);
  }

  const login = await loginAndGetCookie(baseUrl);
  if (!login.ok) {
    console.error('❌ Unable to create post-login session for thorough route checks');
    console.error(JSON.stringify(login, null, 2));
    process.exit(1);
  }

  const authResults = [];
  for (const path of paths.filter((p) => isProtectedPath(p))) {
    const result = await verifyAuthRoute(baseUrl, path, login.cookie);
    authResults.push(result);
    console.log(`[${result.pass ? 'PASS' : 'FAIL'}][post-login] ${path} -> ${result.status} ${result.reason}`);
  }

  const logoutRes = await httpPost(`${baseUrl}/api/auth/logout`, {
    headers: { cookie: login.cookie },
    followRedirect: false,
  });
  const postLogoutProtected = await verifyUnauthRoute(baseUrl, '/dashboard');
  const logoutPass = logoutRes.status < 500 && postLogoutProtected.pass;

  const all = [...unauthResults, ...authResults];
  const failRows = all.filter((r) => !r.pass);

  const summary = {
    baseUrl,
    totals: {
      unauthChecked: unauthResults.length,
      postLoginChecked: authResults.length,
      pass: all.length - failRows.length,
      fail: failRows.length,
    },
    logout: {
      status: logoutRes.status,
      postLogoutProtected,
      pass: logoutPass,
    },
    details: { unauth: unauthResults, postLogin: authResults },
  };

  console.log('\n=== Frontend Routes Thorough QA Summary ===');
  console.log(JSON.stringify(summary, null, 2));

  if (failRows.length > 0 || !logoutPass) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ verify-frontend-routes-thorough failed:', error);
  process.exit(1);
});
