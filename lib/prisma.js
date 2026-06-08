let prisma = null;

function getPrisma() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (prisma !== null) {
    return prisma;
  }

  try {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  } catch (error) {
    prisma = false;
  }

  return prisma || null;
}

module.exports = { getPrisma };
