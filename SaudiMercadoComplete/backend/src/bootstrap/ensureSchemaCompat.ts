import prisma from '../lib/prisma';

const compatStatements = [
  'ALTER TABLE IF EXISTS "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;',
  'ALTER TABLE IF EXISTS "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;',
  'ALTER TABLE IF EXISTS "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;',
];

export const ensureSchemaCompat = async () => {
  try {
    for (const statement of compatStatements) {
      await prisma.$executeRawUnsafe(statement);
    }
  } catch (error: any) {
    const prismaCode = error?.code;
    const sqlState = error?.meta?.code;

    // Some pooled PostgreSQL providers can reject prepared statements used in raw SQL.
    // Do not block startup if compat SQL cannot run in that environment.
    if (prismaCode === 'P2010' && sqlState === '42P05') {
      console.warn('Skipping schema compatibility raw SQL due to pooled prepared-statement conflict (42P05).');
      return;
    }

    throw error;
  }
};
