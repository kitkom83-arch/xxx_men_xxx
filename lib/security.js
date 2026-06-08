const crypto = require('crypto');

const SESSION_COOKIE = 'xmc_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function getSecret(name, fallback) {
  return process.env[name] || fallback;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!password || !storedHash || !storedHash.includes(':')) {
    return false;
  }

  const [salt, expected] = storedHash.split(':');
  const actual = hashPassword(password, salt).split(':')[1];
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(value) {
  const secret = getSecret('SESSION_SECRET', 'dev-session-secret-change-me');
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function createSessionToken(payload) {
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = base64url(JSON.stringify(body));
  return `${encoded}.${sign(encoded)}`;
}

function parseCookies(req) {
  const header = req.headers?.cookie || '';
  return header.split(';').reduce((cookies, pair) => {
    const [rawKey, ...rawValue] = pair.trim().split('=');
    if (rawKey) {
      cookies[rawKey] = decodeURIComponent(rawValue.join('='));
    }
    return cookies;
  }, {});
}

function readSession(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token || !token.includes('.')) {
    return null;
  }

  const [encoded, signature] = token.split('.');
  if (sign(encoded) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

function setSessionCookie(res, payload) {
  const token = createSessionToken(payload);
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`
  );
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function deriveEncryptionKey() {
  const raw = getSecret('ENCRYPTION_KEY', 'dev-encryption-key-change-me');
  if (/^[a-f0-9]{64}$/i.test(raw)) {
    return Buffer.from(raw, 'hex');
  }
  try {
    const decoded = Buffer.from(raw, 'base64');
    if (decoded.length === 32) {
      return decoded;
    }
  } catch (error) {
    // Fall through to a deterministic local-dev derivation.
  }
  return crypto.createHash('sha256').update(raw).digest();
}

function encryptJson(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return {
    alg: 'AES-256-GCM',
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    value: encrypted.toString('base64'),
  };
}

function decryptJson(envelope) {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    deriveEncryptionKey(),
    Buffer.from(envelope.iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(envelope.value, 'base64')),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString('utf8'));
}

function redactSecrets(value) {
  if (Array.isArray(value)) {
    return value.map(redactSecrets);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        if (/secret|token|key|password|credential/i.test(key)) {
          return [key, item ? '[REDACTED]' : item];
        }
        return [key, redactSecrets(item)];
      })
    );
  }
  if (typeof value === 'string' && value.length > 24 && /[A-Za-z0-9_-]{24,}/.test(value)) {
    return '[REDACTED]';
  }
  return value;
}

function maskSecret(value) {
  if (!value) {
    return 'not configured';
  }
  const text = String(value);
  if (text.length <= 8) {
    return 'configured';
  }
  return `${text.slice(0, 4)}...${text.slice(-4)}`;
}

module.exports = {
  SESSION_COOKIE,
  clearSessionCookie,
  decryptJson,
  encryptJson,
  hashPassword,
  maskSecret,
  readSession,
  redactSecrets,
  setSessionCookie,
  verifyPassword,
};
