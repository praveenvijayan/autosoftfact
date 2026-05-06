# ParayMD Todo

A full-stack Todo app built with **Turborepo**, **Next.js 14 (App Router)**, **Prisma + SQLite**, **TanStack Query**, and **Tailwind CSS**.

## Prerequisites

- Node.js 20+
- pnpm 9+

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Generate Prisma client
pnpm --filter @paraymd/db db:generate

# 3. Run migration (creates dev.db)
pnpm --filter @paraymd/db db:migrate

# 4. Seed the database
pnpm --filter @paraymd/db db:seed

# 5. Start the dev server
pnpm dev
```

The app runs at http://localhost:3000.

## Available scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps and packages |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm test` | Run unit tests |
| `pnpm db:reset` | Drop DB, re-migrate, re-seed |
| `pnpm --filter @paraymd/web test:e2e` | Run Playwright E2E tests |

## Project structure

```
apps/
  web/          # Next.js App Router application
packages/
  db/           # Prisma client + schema + migrations
  types/        # Shared TypeScript interfaces
  utils/        # Shared utility functions
  api-client/   # Typed fetch wrappers for the API
```

## Features

- Create, read, update, delete todos
- Status toggle (TODO ↔ COMPLETE)
- Filter by All / TODO / COMPLETE
- Optimistic UI updates via TanStack Query
- Zod validation on all API routes
- Keyboard-first UX (Enter to add, Escape to clear)
- Loading skeletons and error states
