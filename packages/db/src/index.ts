import { PrismaClient } from "@prisma/client";
import path from "path";

// Resolve the SQLite file path relative to this source file so it works
// regardless of which directory the Node.js process is started from.
// __dirname here = packages/db/src  →  db file = packages/db/prisma/dev.db
const absoluteDbPath = path.resolve(__dirname, "..", "prisma", "dev.db");
const databaseUrl =
  process.env.DATABASE_URL ?? `file:${absoluteDbPath}`;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type { Todo } from "@prisma/client";
