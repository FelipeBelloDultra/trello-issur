---
name: safe-migration
description: Checklist for generating and reviewing a Drizzle/Postgres migration in this repo without downtime — expand/contract, lock_timeout awareness, no-enum rule. Use whenever a schema change is needed (new column, NOT NULL, rename, type change, dropping a column/table, adding an index).
---

# Safe (zero-downtime) migration

This API runs with old and new code briefly coexisting during every deploy (rolling deploy, two processes: `index.http.ts` + `index.queue.ts`). A migration must never require the *new* schema to already exist for the *currently running old* code, and must never hold a long lock on a hot table. See `CLAUDE.md` → Database.

## 1. Classify the change

| Change | Safe in one deploy? |
|---|---|
| New nullable column, new table, new index (`CONCURRENTLY` where supported) | Yes |
| New `NOT NULL` column, column rename, type change, dropping a column/table used by running code | **No — needs expand/contract (2 deploys)** |
| New enum-like field | Use a `text` column + app-layer validation — **never a Postgres enum** (see rule below) |

## 2. If it's a two-phase (expand/contract) change

**Expand deploy** (ships first, must be backward-compatible with the *currently deployed* old code):
- Add the new column as **nullable** (or with a safe default), or add the new table — never drop/rename/tighten anything the old code still touches.
- Update application code to write to both old and new shape if needed (dual-write), and to read the new shape with a fallback.
- Deploy. Let it run until you're confident old code is fully drained (all instances/processes on new code).

**Contract deploy** (ships only after expand is fully rolled out everywhere, including the separate `index.queue.ts` process):
- Backfill data if needed (in batches, not a single giant `UPDATE`).
- Add the `NOT NULL` constraint / drop the old column / finish the rename.
- Remove the dual-write/fallback code from the expand phase.

Never combine expand and contract in the same PR/migration unless the change is additive-only (nullable column, new table).

## 3. Generate the migration

1. Edit the table definition in `apps/api/src/infra/db/schema/<table>.ts` (see `new-repository` skill for the table-authoring conventions: `text` not enum, `uuid` PK with `UniqueEntityID.create()` default, no DB-side `gen_random_uuid()`).
2. `pnpm --filter api run db:generate` (drizzle-kit) — produces a new numbered `.sql` file under `apps/api/src/infra/db/migrations/` plus a `meta/_journal.json` entry. **Read the generated SQL** — drizzle-kit sometimes infers a destructive statement (e.g. drop+recreate a column on a "rename") that isn't actually what you want; edit the generated `.sql` by hand if so.
3. For an index on a large/hot table, add `CONCURRENTLY` by hand in the generated SQL (drizzle-kit doesn't emit it) and make sure the statement is not wrapped in a transaction block that would reject `CONCURRENTLY`.

## 4. Respect the runner's constraints

`apps/api/src/index.migrate.ts` runs every migration under `SET lock_timeout = '3s'` and `SET statement_timeout = '120s'`. A migration that can't acquire its DDL lock in 3s aborts — this is deliberate (fails fast instead of queueing behind a long-running transaction and blocking other queries). Implications:
- Don't run a migration expected to hold an exclusive lock for a long time (e.g. adding a `NOT NULL` with a default on a huge existing table) without first backfilling in the contract-phase batches mentioned above.
- If a migration might legitimately need more than 3s to acquire its lock (rare, e.g. off-peak-only heavy DDL), that's a signal to split it further or schedule it deliberately — don't just raise the timeout in the shared runner.

## 5. Verify

- `pnpm --filter api run db:migrate` locally against the docker-compose Postgres.
- Run `pnpm --filter api run test:e2e` — `apps/api/test/e2e-setup.ts` replays every migration into a fresh isolated schema per run, so a broken migration fails the whole e2e suite immediately.
- Sanity-check the generated SQL is idempotent/safe to re-run if the migration runner is ever interrupted mid-way (Drizzle's migration table tracks applied migrations, but the SQL itself should not assume it's the first attempt).

## Non-goals

- Don't add a Postgres `enum` type, ever — `ALTER TYPE ... ADD VALUE` cannot safely run inside all transaction contexts across supported Postgres versions. Use `text` + validate in the domain value object / Zod DTO instead.
- Don't hand-write raw migration SQL from scratch when a schema change will do — let `db:generate` produce it, then review/edit.
