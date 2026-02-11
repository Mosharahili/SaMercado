import prisma from '../lib/prisma';

const compatStatements = [
  'ALTER TABLE IF EXISTS "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;',
  'ALTER TABLE IF EXISTS "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;',
  'ALTER TABLE IF EXISTS "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;',
];

export const ensureSchemaCompat = async () => {
  for (const statement of compatStatements) {
    await prisma.$executeRawUnsafe(statement);
  }
};

