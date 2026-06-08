let prisma = null;
let prismaDisabled = false;
let healthChecked = false;

function isPrismaRelatedError(error) {
  const message = String(error?.message || '');
  const code = String(error?.code || '');
  return (
    /prisma/i.test(error?.name || '') ||
    /PrismaClientInitializationError|PrismaClientKnownRequestError|PrismaClientUnknownRequestError|PrismaClientRustPanicError|PrismaClientValidationError/i.test(message) ||
    /^P\d{4}$/.test(code) ||
    /authentication failed|can't reach database server|connect|connection|timeout|ECONNREFUSED|database/i.test(message)
  );
}

function disablePrisma() {
  prismaDisabled = true;
  prisma = false;
}

async function ensurePrismaHealthy(client) {
  if (healthChecked) {
    return true;
  }
  await client.$queryRaw`SELECT 1`;
  healthChecked = true;
  return true;
}

function getPrisma() {
  if (prismaDisabled) {
    return null;
  }

  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (prisma !== null) {
    return prisma || null;
  }

  try {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  } catch (error) {
    disablePrisma();
  }

  return prisma || null;
}

async function withPrisma(operation, fallback) {
  const client = getPrisma();
  if (!client) {
    return fallback();
  }

  try {
    await ensurePrismaHealthy(client);
    return await operation(client);
  } catch (error) {
    if (isPrismaRelatedError(error)) {
      disablePrisma();
      return fallback();
    }
    throw error;
  }
}

function isPrismaEnabled() {
  return Boolean(getPrisma());
}

module.exports = { getPrisma, withPrisma, disablePrisma, isPrismaEnabled, isPrismaRelatedError };
