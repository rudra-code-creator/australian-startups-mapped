import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function resolveSqliteFileUrl(url: string): string {
  if (!url.startsWith("file:")) {
    throw new Error('DATABASE_URL must start with "file:" for SQLite');
  }

  const raw = url.slice("file:".length);
  // LibSQL needs an absolute file URL on Windows.
  const absolute = path.isAbsolute(raw)
    ? raw
    : path.resolve(/* turbopackIgnore: true */ process.cwd(), raw);
  return `file:${absolute.replace(/\\/g, "/")}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaLibSql({ url: resolveSqliteFileUrl(dbUrl) });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
