const { withPrisma } = require('./prisma');
const { encryptJson, decryptJson, hashPassword, maskSecret, redactSecrets } = require('./security');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), '.xmc-data.json');

const memory = {
  admins: [],
  settings: new Map([['mode', 'mock'], ['setupComplete', false]]),
  credentials: null,
  searchHistory: [],
  drafts: [],
  rateLimits: [],
  usage: [],
  audit: [],
};

function serializeMemory() {
  return {
    admins: memory.admins,
    settings: Object.fromEntries(memory.settings.entries()),
    credentials: memory.credentials,
    searchHistory: memory.searchHistory,
    drafts: memory.drafts,
    rateLimits: memory.rateLimits,
    usage: memory.usage,
    audit: memory.audit,
  };
}

function loadMemory() {
  if (!fs.existsSync(DATA_FILE)) {
    memory.admins = [];
    memory.settings = new Map([['mode', 'mock'], ['setupComplete', false]]);
    memory.credentials = null;
    memory.searchHistory = [];
    memory.drafts = [];
    memory.rateLimits = [];
    memory.usage = [];
    memory.audit = [];
    return;
  }
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    memory.admins = data.admins || [];
    memory.settings = new Map(Object.entries(data.settings || { mode: 'mock', setupComplete: false }));
    memory.credentials = data.credentials || null;
    memory.searchHistory = data.searchHistory || [];
    memory.drafts = data.drafts || [];
    memory.rateLimits = data.rateLimits || [];
    memory.usage = data.usage || [];
    memory.audit = data.audit || [];
  } catch (error) {
    // Corrupt local fallback data should not crash production; Prisma is the durable store.
  }
}

function persistMemory() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(serializeMemory(), null, 2));
}

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

async function getSetting(key, fallback = null) {
  return withPrisma(
    async (prisma) => {
      const row = await prisma.appSetting.findUnique({ where: { key } });
      return row ? row.value : fallback;
    },
    async () => {
      loadMemory();
      return memory.settings.has(key) ? memory.settings.get(key) : fallback;
    }
  );
}

async function setSetting(key, value) {
  return withPrisma(
    async (prisma) =>
      prisma.appSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      }),
    async () => {
      loadMemory();
      memory.settings.set(key, value);
      persistMemory();
      return { key, value };
    }
  );
}

async function getSetupStatus() {
  return withPrisma(
    async (prisma) => {
      const adminCount = await prisma.adminUser.count();
      const setupComplete = await getSetting('setupComplete', false);
      const mode = await getSetting('mode', 'mock');
      const credential = await prisma.credentialVault.findUnique({ where: { name: 'x-default' } });
      return {
        setupComplete: Boolean(setupComplete),
        adminExists: adminCount > 0,
        mode,
        credential: credential
          ? {
              configured: true,
              maskedLabel: credential.maskedLabel,
              lastUpdatedAt: credential.lastUpdatedAt,
              mode: credential.mode,
            }
          : { configured: false, maskedLabel: 'not configured', lastUpdatedAt: null, mode },
      };
    },
    async () => {
      loadMemory();
      return {
        setupComplete: Boolean(memory.settings.get('setupComplete')),
        adminExists: memory.admins.length > 0,
        mode: memory.settings.get('mode') || 'mock',
        credential: memory.credentials
          ? {
              configured: true,
              maskedLabel: memory.credentials.maskedLabel,
              lastUpdatedAt: memory.credentials.lastUpdatedAt,
              mode: memory.credentials.mode,
            }
          : { configured: false, maskedLabel: 'not configured', lastUpdatedAt: null, mode: memory.settings.get('mode') || 'mock' },
      };
    }
  );
}

async function createAdmin({ username, password }) {
  const passwordHash = hashPassword(password);
  return withPrisma(
    async (prisma) => prisma.adminUser.create({ data: { username, passwordHash } }),
    async () => {
      loadMemory();
      const admin = { id: makeId('admin'), username, passwordHash, createdAt: nowIso(), updatedAt: nowIso() };
      memory.admins.push(admin);
      persistMemory();
      return admin;
    }
  );
}

async function findAdminByUsername(username) {
  return withPrisma(
    async (prisma) => prisma.adminUser.findUnique({ where: { username } }),
    async () => {
      loadMemory();
      return memory.admins.find((admin) => admin.username === username) || null;
    }
  );
}

async function saveCredentials({ mode = 'mock', credentials = {} }) {
  const safeCredentials = {
    bearerToken: credentials.bearerToken || '',
    apiKey: credentials.apiKey || '',
    apiSecret: credentials.apiSecret || '',
    clientId: credentials.clientId || '',
    clientSecret: credentials.clientSecret || '',
  };
  const encryptedPayload = encryptJson(safeCredentials);
  const maskedLabel = maskSecret(safeCredentials.bearerToken || safeCredentials.apiKey || safeCredentials.clientId);
  return withPrisma(
    async (prisma) => {
      const record = await prisma.credentialVault.upsert({
        where: { name: 'x-default' },
        create: {
          name: 'x-default',
          mode,
          encryptedPayload,
          maskedLabel,
        },
        update: {
          mode,
          encryptedPayload,
          maskedLabel,
          lastUpdatedAt: new Date(),
        },
      });
      return credentialPublic(record);
    },
    async () => {
      loadMemory();
      memory.credentials = {
        id: makeId('cred'),
        name: 'x-default',
        mode,
        encryptedPayload,
        maskedLabel,
        lastUpdatedAt: nowIso(),
      };
      persistMemory();
      return credentialPublic(memory.credentials);
    }
  );
}

function credentialPublic(record) {
  return {
    configured: Boolean(record),
    maskedLabel: record?.maskedLabel || 'not configured',
    lastUpdatedAt: record?.lastUpdatedAt || null,
    mode: record?.mode || 'mock',
  };
}

async function getCredentialPublic() {
  return withPrisma(
    async (prisma) => credentialPublic(await prisma.credentialVault.findUnique({ where: { name: 'x-default' } })),
    async () => {
      loadMemory();
      return credentialPublic(memory.credentials);
    }
  );
}

async function getDecryptedCredentials() {
  return withPrisma(
    async (prisma) => {
      const record = await prisma.credentialVault.findUnique({ where: { name: 'x-default' } });
      if (!record) return null;
      return decryptJson(record.encryptedPayload);
    },
    async () => {
      loadMemory();
      if (!memory.credentials) return null;
      return decryptJson(memory.credentials.encryptedPayload);
    }
  );
}

async function deleteCredentials() {
  return withPrisma(
    async (prisma) => {
      await prisma.credentialVault.deleteMany({ where: { name: 'x-default' } });
      return credentialPublic(null);
    },
    async () => {
      loadMemory();
      memory.credentials = null;
      persistMemory();
      return credentialPublic(null);
    }
  );
}

async function recordAudit(action, summary, metadata = {}) {
  const cleanMetadata = redactSecrets(metadata);
  return withPrisma(
    async (prisma) => prisma.auditEvent.create({ data: { action, summary, metadata: cleanMetadata } }),
    async () => {
      loadMemory();
      const event = { id: makeId('audit'), action, summary, metadata: cleanMetadata, createdAt: nowIso() };
      memory.audit.unshift(event);
      memory.audit = memory.audit.slice(0, 50);
      persistMemory();
      return event;
    }
  );
}

async function listAudit(limit = 20) {
  return withPrisma(
    async (prisma) => prisma.auditEvent.findMany({ orderBy: { createdAt: 'desc' }, take: limit }),
    async () => {
      loadMemory();
      return memory.audit.slice(0, limit);
    }
  );
}

async function recordSearch(type, query, resultSummary) {
  return withPrisma(
    async (prisma) => prisma.searchHistory.create({ data: { type, query, resultSummary } }),
    async () => {
      loadMemory();
      const item = { id: makeId('search'), type, query, resultSummary, createdAt: nowIso() };
      memory.searchHistory.unshift(item);
      memory.searchHistory = memory.searchHistory.slice(0, 100);
      persistMemory();
      return item;
    }
  );
}

async function listSearchHistory(limit = 20) {
  return withPrisma(
    async (prisma) => prisma.searchHistory.findMany({ orderBy: { createdAt: 'desc' }, take: limit }),
    async () => {
      loadMemory();
      return memory.searchHistory.slice(0, limit);
    }
  );
}

async function recordRateLimit(endpoint, rateLimit = {}) {
  const data = {
    endpoint,
    limit: rateLimit.limit ? Number(rateLimit.limit) : null,
    remaining: rateLimit.remaining ? Number(rateLimit.remaining) : null,
    resetAt: rateLimit.reset ? new Date(Number(rateLimit.reset) * 1000) : null,
  };
  return withPrisma(
    async (prisma) => prisma.rateLimitSnapshot.create({ data }),
    async () => {
      loadMemory();
      const item = { id: makeId('rate'), ...data, createdAt: nowIso() };
      memory.rateLimits.unshift(item);
      memory.rateLimits = memory.rateLimits.slice(0, 50);
      persistMemory();
      return item;
    }
  );
}

async function listRateLimits(limit = 10) {
  return withPrisma(
    async (prisma) => prisma.rateLimitSnapshot.findMany({ orderBy: { createdAt: 'desc' }, take: limit }),
    async () => {
      loadMemory();
      return memory.rateLimits.slice(0, limit);
    }
  );
}

async function recordUsage(source, payload = {}) {
  const data = {
    source,
    postsRead: Number(payload.postsRead || payload.projectUsage || 0),
    cap: payload.cap ? Number(payload.cap) : null,
    payload,
  };
  return withPrisma(
    async (prisma) => prisma.usageSnapshot.create({ data }),
    async () => {
      loadMemory();
      const item = { id: makeId('usage'), ...data, createdAt: nowIso() };
      memory.usage.unshift(item);
      memory.usage = memory.usage.slice(0, 50);
      persistMemory();
      return item;
    }
  );
}

async function listUsage(limit = 10) {
  return withPrisma(
    async (prisma) => prisma.usageSnapshot.findMany({ orderBy: { createdAt: 'desc' }, take: limit }),
    async () => {
      loadMemory();
      return memory.usage.slice(0, limit);
    }
  );
}

async function saveDraft({ text, payload, safetyStatus }) {
  return withPrisma(
    async (prisma) =>
      prisma.postDraft.create({
        data: { text, dryRun: true, safetyStatus, payload },
      }),
    async () => {
      loadMemory();
      const draft = { id: makeId('draft'), text, dryRun: true, safetyStatus, payload, createdAt: nowIso() };
      memory.drafts.unshift(draft);
      memory.drafts = memory.drafts.slice(0, 50);
      persistMemory();
      return draft;
    }
  );
}

async function listDrafts(limit = 10) {
  return withPrisma(
    async (prisma) => prisma.postDraft.findMany({ orderBy: { createdAt: 'desc' }, take: limit }),
    async () => {
      loadMemory();
      return memory.drafts.slice(0, limit);
    }
  );
}

async function completeSetup({ username, password, mode, credentials }) {
  const status = await getSetupStatus();
  if (!status.adminExists) {
    await createAdmin({ username, password });
  }
  await setSetting('mode', mode || 'mock');
  await setSetting('setupComplete', true);
  if (credentials && Object.values(credentials).some(Boolean)) {
    await saveCredentials({ mode: mode || 'mock', credentials });
  }
  await recordAudit('setup.complete', 'ตั้งค่าระบบครั้งแรกสำเร็จ', { mode });
  return getSetupStatus();
}

function resetMemoryStoreForTests() {
  memory.admins = [];
  memory.settings = new Map([['mode', 'mock'], ['setupComplete', false]]);
  memory.credentials = null;
  memory.searchHistory = [];
  memory.drafts = [];
  memory.rateLimits = [];
  memory.usage = [];
  memory.audit = [];
  persistMemory();
}

module.exports = {
  completeSetup,
  createAdmin,
  deleteCredentials,
  findAdminByUsername,
  getCredentialPublic,
  getDecryptedCredentials,
  getSetting,
  getSetupStatus,
  listAudit,
  listDrafts,
  listRateLimits,
  listSearchHistory,
  listUsage,
  makeId,
  recordAudit,
  recordRateLimit,
  recordSearch,
  recordUsage,
  resetMemoryStoreForTests,
  saveCredentials,
  saveDraft,
  setSetting,
};
