import { PrismaClient } from "@prisma/client";
import path from "path";

// Convert any relative `file:` SQLite URL to an absolute path before passing
// it to PrismaClient. The Prisma native query engine receives the URL from
// Node.js and resolves relative paths using its own CWD (which may differ from
// the Node.js process CWD inside Next.js). Forcing an absolute path eliminates
// that ambiguity entirely.
//
// Priority:
//   1. DATABASE_URL env var (set in apps/web/.env for local dev; injected in CI/prod)
//   2. Absolute path derived from the monorepo root (hardcoded fallback for
//      environments where DATABASE_URL is absent, e.g. running `packages/db`
//      scripts in isolation). The fallback path is computed from the package's
//      own directory — confirmed to be packages/db when run via pnpm scripts.
function resolveDbUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (raw) {
    if (raw.startsWith("file:") && !path.isAbsolute(raw.slice(5))) {
      // Relative path — resolve against Node.js process.cwd() (Next.js CWD =
      // apps/web/, so file:../../packages/db/prisma/dev.db → absolute path).
      return `file:${path.resolve(process.cwd(), raw.slice(5))}`;
    }
    return raw; // already absolute or non-file scheme
  }
  // Fallback: db is always at <monorepo-root>/packages/db/prisma/dev.db.
  // Use INIT_CWD (pnpm sets this to the directory where the command was
  // originally invoked) or walk up from process.cwd().
  const monorepoRoot = path.resolve(__dirname, "..", "..", "..", "..");
  return `file:${path.join(monorepoRoot, "packages", "db", "prisma", "dev.db")}`;
}

const databaseUrl = resolveDbUrl();

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
