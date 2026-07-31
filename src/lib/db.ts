import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

function sqlitePathFromUrl(url: string): string {
  if (!url.startsWith("file:")) {
    throw new Error('DATABASE_URL must start with "file:" for SQLite');
  }
  return url.slice("file:".length);
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  sqliteAdapter?: PrismaBetterSqlite3;
};

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const sqlitePath = sqlitePathFromUrl(dbUrl);
const adapter =
  globalForPrisma.sqliteAdapter ?? new PrismaBetterSqlite3({ url: sqlitePath });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.sqliteAdapter = adapter;
}
