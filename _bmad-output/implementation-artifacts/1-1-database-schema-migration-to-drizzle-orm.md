# Story 1.1: Database Schema Migration to Drizzle ORM

Status: done

## Story

As a developer,
I want the existing PostgreSQL schema migrated to Drizzle ORM with all new required columns,
so that the project has a type-safe, version-controlled database schema ready for all subsequent features.

## Acceptance Criteria

1. `libs/db` package exists in the monorepo and is consumable by `apps/api` via `@arrathon/db`
2. All 6 existing tables are reflected as Drizzle schema TypeScript (users, arrathons, locations, user_arrathon, location_user, arrathon_location)
3. New columns added: `invite_token` (unique, nullable) in arrathons; `status` enum (active/abandoned/returned/partial) + `pack_included` (bool) + `pack_paid` (bool) + `pack_price` (int, cents) in user_arrathon
4. New table `device_tokens` created (id, user_id, expo_push_token, platform, created_at)
5. `geography(Point, 4326)` column added to locations for PostGIS
6. TypeScript types exported from `libs/db/index.ts` (db client + all schemas)
7. `drizzle-kit generate` produces a valid migration SQL file
8. `drizzle-kit migrate` applies the migration against a running PostgreSQL + PostGIS instance without errors
9. Turborepo pipeline builds `libs/db` before `apps/api`

## Tasks / Subtasks

- [x] **Task 1 — Create `libs/db` package** (AC: 1, 9)
  - [x] Create `libs/db/package.json` with name `@arrathon/db`, exporting `./src/index.ts`
  - [x] Create `libs/db/tsconfig.json` extending root `tsconfig.base.json`
  - [ ] Add `@arrathon/db: "workspace:*"` dependency to `apps/api/package.json` (prep for Story 1.2 — skipped, apps/api doesn't exist yet)
  - [x] Update root `turbo.json` `build` task to include `libs/db` with `outputs: ["dist/**"]`
  - [x] Run `pnpm install` to link workspace

- [x] **Task 2 — Write manual PostGIS bootstrap migration** (AC: 7, 8)
  - [x] Create `libs/db/migrations/0000_init_postgis.sql` with `CREATE EXTENSION IF NOT EXISTS postgis;`
  - [x] This file must run before any Drizzle-generated migration

- [x] **Task 3 — Write Drizzle schema files** (AC: 2, 3, 4, 5, 6)
  - [x] Create `libs/db/src/schema/users.ts` — migrate `users` table
  - [x] Create `libs/db/src/schema/arrathons.ts` — migrate `arrathons` table + add `invite_token` + pack columns + `pack_commander_id` FK
  - [x] Create `libs/db/src/schema/locations.ts` — migrate `locations` table + add `geography(Point, 4326)` column via `customType`
  - [x] Create `libs/db/src/schema/user-arrathon.ts` — migrate `user_arrathon` + `participantStatusEnum` + `pack_paid` + `starting_location_id`
  - [x] Create `libs/db/src/schema/location-user.ts` — migrate `location_user` junction table
  - [x] Create `libs/db/src/schema/arrathon-location.ts` — migrate `arrathon_location` + updated `locationTypeEnum` with `pit_stand`
  - [x] Create `libs/db/src/schema/device-tokens.ts` — new table `device_tokens`
  - [x] Create `libs/db/src/index.ts` — export db client + all schema tables + enums

- [x] **Task 4 — Configure drizzle-kit** (AC: 7, 8)
  - [x] Create `libs/db/drizzle.config.ts` with `extensionsFilters: ["postgis"]`, `schemaFilter: ["public"]`, `strict: true`
  - [x] Add `DATABASE_URL` to root `.env`

- [x] **Task 5 — Generate and apply migration** (AC: 7, 8)
  - [x] Run `pnpm --filter @arrathon/db drizzle-kit generate`
  - [x] Verify the generated SQL is correct (inspect `libs/db/migrations/*.sql`)
  - [x] Fix geography type quoting in `0001_schema_init.sql` (Drizzle generates quoted type; must be unquoted for PostGIS)
  - [x] Run `pnpm --filter @arrathon/db drizzle-kit migrate` against local PostgreSQL + PostGIS
  - [x] Confirm all 7 tables exist with correct columns via psql

- [x] **Task 6 — Verify TypeScript types exported** (AC: 6)
  - [x] Confirm `import { db } from "@arrathon/db"` works
  - [x] Confirm `import { users, arrathons, locations } from "@arrathon/db/schema"` works
  - [x] Run `tsc --noEmit` on libs/db — 0 TypeScript errors

## Dev Notes

### Architecture Compliance

**Hexagonal architecture** — `libs/db` is an **infrastructure adapter**. It must:
- Export pure Drizzle schema definitions and the `db` client
- NOT import anything from `apps/api` or domain layer
- Be the single source of truth for all DB types across the monorepo

**Naming conventions** (from `_bmad-output/planning-artifacts/architecture.md`):
- Tables: `snake_case` plural → `users`, `arrathons`, `device_tokens`
- Columns: `snake_case` → `created_at`, `invite_token`, `expo_push_token`
- FK columns: `{singular_table}_id` → `user_id`, `arrathon_id`
- Index names: `idx_{table}_{column}` → `idx_users_email`
- TypeScript exports: `camelCase` for instances, `PascalCase` for types

**File naming**: `kebab-case.ts` → `user-arrathon.ts`, `device-tokens.ts`

---

### Package Manager

The project uses **pnpm 9.0.0** (from root `package.json`). Use `workspace:*` protocol for internal dependencies.

```json
// libs/db/package.json
{
  "name": "@arrathon/db",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema/index.ts"
  },
  "dependencies": {
    "drizzle-orm": "^0.45.1",
    "postgres": "^3.4.5"
  },
  "devDependencies": {
    "drizzle-kit": "^0.31.9",
    "@arrathon/typescript-config": "workspace:*"
  }
}
```

> ⚠️ Use **source export pattern** (pointing exports directly to `./src/*.ts`) — this avoids a build step for `libs/db`. Consuming apps (Hono API) will transpile via their own TypeScript compilation. This is simpler for a monorepo with tsc.

---

### Library Versions

| Package | Version | Notes |
|---|---|---|
| `drizzle-orm` | `^0.45.1` | Stable. Do NOT use `1.0.0-beta.*` — it's still beta |
| `drizzle-kit` | `^0.31.9` | CLI for migrations |
| `postgres` | `^3.4.5` | postgres.js driver (lighter than `pg`) |

---

### Drizzle Schema Patterns

**Standard table:**
```typescript
import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

> The existing SQL uses `SERIAL` PKs (integers). **Migrate to `uuid` PKs** for all tables — cleaner, no sequential ID leakage. The existing test data will be cleared (dev only).

**Enum definition:**
```typescript
import { pgEnum } from "drizzle-orm/pg-core";

export const participantStatusEnum = pgEnum("participant_status", [
  "active", "abandoned", "returned", "partial"
]);

export const locationTypeEnum = pgEnum("location_type", [
  "bar", "apartment", "monument", "pit_stand"
]);
```

**PostGIS `geography` column via `customType`:**
```typescript
import { customType } from "drizzle-orm/pg-core";

const geography = customType<{
  data: string;
  config: { type?: string; srid?: number };
}>({
  dataType(config) {
    return `geography(${config?.type ?? "Point"}, ${config?.srid ?? 4326})`;
  },
});

export const locations = pgTable("locations", {
  // ...other columns
  coordinates: geography({ type: "Point", srid: 4326 }),
});
```

**`device_tokens` new table:**
```typescript
export const deviceTokens = pgTable("device_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expoPushToken: text("expo_push_token").notNull(),
  platform: varchar("platform", { length: 10 }).notNull(), // 'ios' | 'android'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

### drizzle.config.ts

```typescript
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config({ path: "../../.env" }); // root .env

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/*.ts",
  out: "./migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  extensionsFilters: ["postgis"],  // CRITICAL — prevents PostGIS system table interference
  schemaFilter: ["public"],
  strict: true,
  verbose: true,
});
```

---

### PostGIS Bootstrap Migration

Create `libs/db/migrations/0000_init_postgis.sql` **manually** (not generated by drizzle-kit):

```sql
-- This migration must run before all Drizzle-generated migrations
CREATE EXTENSION IF NOT EXISTS postgis;
```

Drizzle cannot auto-generate `CREATE EXTENSION` statements. This file is run first by `drizzle-kit migrate` because `0000_` sorts before `0001_`.

---

### Existing Schema → Drizzle Migration Notes

The existing SQL (`init-scripts/01-create-table.sql`) has:
- `SERIAL PRIMARY KEY` → migrate to `uuid().primaryKey().defaultRandom()`
- `JSONB DEFAULT '{}'` for `metadata` columns → keep as `jsonb("metadata").default({})` or drop if unused in MVP
- `location_type` enum in SQL was `('apartment', 'bar', 'monument', 'aid_station', 'other')` → **change to** `('bar', 'apartment', 'monument', 'pit_stand')`
- `user_arrathon.role` was `('participant', 'organisator')` → keep as pgEnum `participantRoleEnum`

**New columns to add:**
| Table | Column | Type | Notes |
|---|---|---|---|
| `arrathons` | `invite_token` | `text` unique nullable | Generated UUID string |
| `arrathons` | `pack_price` | `integer` nullable | In cents |
| `arrathons` | `pack_contents` | `text` nullable | Description |
| `arrathons` | `pack_mandatory` | `boolean` default false | |
| `arrathons` | `pack_commander_id` | `uuid` FK users.id nullable | |
| `user_arrathon` | `status` | `participantStatusEnum` default `active` | |
| `user_arrathon` | `pack_paid` | `boolean` default false | |
| `user_arrathon` | `starting_location_id` | `uuid` FK locations.id nullable | For partial join |
| `locations` | `coordinates` | `geography(Point, 4326)` nullable | PostGIS |
| — | `device_tokens` | new table | See above |

---

### Turborepo Configuration

Update root `turbo.json` to ensure `libs/db` builds before `apps/api`:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    }
  }
}
```

Add to `libs/db/package.json` scripts:
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

### Testing Standards

Tests are **co-located** with source files (`*.test.ts` next to `*.ts`). For this story, schema-level tests are limited — focus on type compilation:

- No runtime unit tests needed for schema definitions (Drizzle types are validated at compile time)
- Verify TypeScript exports compile correctly: `pnpm type:check` from root
- Integration test (manual): run `drizzle-kit migrate` and verify all tables in psql

---

### Project Structure — Files to Create

```
libs/db/
├── package.json              ← @arrathon/db, exports ./src/index.ts
├── tsconfig.json             ← extends ../../tsconfig.base.json
├── drizzle.config.ts         ← drizzle-kit config with extensionsFilters
├── migrations/
│   └── 0000_init_postgis.sql ← manual: CREATE EXTENSION IF NOT EXISTS postgis
├── src/
│   ├── index.ts              ← exports: db client + all schema tables
│   └── schema/
│       ├── index.ts          ← re-exports all schema files
│       ├── users.ts
│       ├── arrathons.ts      ← includes pack + invite_token columns
│       ├── locations.ts      ← includes geography customType
│       ├── user-arrathon.ts  ← includes status enum + pack columns
│       ├── location-user.ts
│       ├── arrathon-location.ts ← updated location_type enum
│       └── device-tokens.ts  ← new table
```

**Root `.env` additions** (document in `.env.example`):
```
DATABASE_URL=postgresql://devuser:devpassword@localhost:5432/devdb
```

---

### References

- Architecture decisions: [Source: `_bmad-output/planning-artifacts/architecture.md` — Data Architecture, Structure Patterns, Naming Patterns]
- Existing SQL schema: [Source: `init-scripts/01-create-table.sql`]
- Story requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 1, Story 1.1]
- Drizzle ORM docs: https://orm.drizzle.team/docs/overview
- PostGIS customType pattern: drizzle-orm `customType` from `drizzle-orm/pg-core`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- PostGIS `customType` generates double-quoted type in migration SQL (`"geography(Point, 4326)"`), which PostgreSQL rejects. Manually fixed in `0001_schema_init.sql` to use unquoted `geography(Point,4326)`.
- Switched `docker-compose.yaml` from `postgres:latest` to `postgis/postgis:17-3.5`. Required clearing the old Docker volume (dev data only, per story spec).
- `libs/db` tsconfig uses `allowImportingTsExtensions: true` + `noEmit: true` to support the source-export pattern with `.ts` import paths.
- `apps/api` doesn't exist yet (still `apps/backend`); the workspace dependency will be added in Story 1.2.

### File List

- `libs/db/package.json`
- `libs/db/tsconfig.json`
- `libs/db/drizzle.config.ts`
- `libs/db/migrations/0000_init_postgis.sql`
- `libs/db/migrations/0001_schema_init.sql`
- `libs/db/migrations/meta/_journal.json`
- `libs/db/src/index.ts`
- `libs/db/src/schema/index.ts`
- `libs/db/src/schema/users.ts`
- `libs/db/src/schema/arrathons.ts`
- `libs/db/src/schema/locations.ts`
- `libs/db/src/schema/user-arrathon.ts`
- `libs/db/src/schema/location-user.ts`
- `libs/db/src/schema/arrathon-location.ts`
- `libs/db/src/schema/device-tokens.ts`
- `turbo.json` (updated: `outputs: ["dist/**"]` + `db:generate`/`db:migrate` tasks)
- `docker-compose.yaml` (updated: `postgis/postgis:17-3.5`, removed init-scripts mount)
- `.env` (added `DATABASE_URL`)
