import { PrismaClient } from '@prisma/client';

const normalizeDatabaseUrl = (rawUrl?: string) => {
  if (!rawUrl) return rawUrl;

  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();
    const isPooler =
      host.includes('pooler') ||
      host.includes('pgbouncer') ||
      parsed.searchParams.get('pgbouncer') === 'true';

    if (isPooler) {
      if (!parsed.searchParams.has('pgbouncer')) {
        parsed.searchParams.set('pgbouncer', 'true');
      }

      if (!parsed.searchParams.has('connection_limit')) {
        parsed.searchParams.set('connection_limit', '1');
      }
    }

    return parsed.toString();
  } catch {
    return rawUrl;
  }
};

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

const prisma = new PrismaClient(
  databaseUrl
    ? {
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      }
    : undefined
);

export default prisma;
