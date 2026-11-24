import { PrismaClient } from "@prisma/client";

const FALLBACK_DB_URL =
  "postgresql://neondb_owner:npg_DbG5pZQNdk6x@ep-square-shadow-bj1rycnk-pooler.c-3.eu-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  FALLBACK_DB_URL;

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = dbUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    dbUrl
      ? {
          datasources: {
            db: {
              url: dbUrl,
            },
          },
        }
      : undefined
  );

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
