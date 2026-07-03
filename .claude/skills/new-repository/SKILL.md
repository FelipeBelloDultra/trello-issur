---
name: new-repository
description: Add a new persistence repository — application-layer port interface, Drizzle table schema (if needed), entity<->row mapper, and the Drizzle adapter implementation, following this repo's ports & adapters pattern. Use when a use case needs to persist or query a new entity/aggregate.
---

# New repository (port + Drizzle adapter)

Repositories are a **port** (interface in `application/repositories/`) implemented by an **adapter** (`infra/db/repositories/`, Drizzle-backed). Handlers depend only on the port. See `CLAUDE.md` → domain design / database sections first.

## Steps

1. **Table schema**, if persisting a new entity — schema lives centrally in `src/infra/db/schema/<table>.ts` (not per-module):

   ```ts
   import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
   import { UniqueEntityID } from "@/core/entity/unique-entity-id";

   export const <table> = pgTable("<table>", {
     id: uuid("id").primaryKey().$defaultFn(() => UniqueEntityID.create().toValue()),
     // columns...
     createdAt: timestamp("created_at").defaultNow().notNull(),
     updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
   });
   ```

   Rules (see `CLAUDE.md` → Database):
   - **No Postgres enums** — `text` + application-layer validation.
   - IDs are **UUID v7 generated app-side** via `UniqueEntityID`, not `gen_random_uuid()`.
   - Export the table from `src/infra/db/schema/index.ts` and add any FK relations to `src/infra/db/schema/relations.ts` if applicable.
   - Run `pnpm run db:generate` to produce the migration — read the `safe-migration` skill before applying anything that alters an existing table.

2. **Port interface** — `application/repositories/<entity>.repository.ts`:

   ```ts
   import { <Entity> } from "@/modules/<module>/domain/entities/<entity>";

   export interface <Entity>Repository {
     findById(id: string): Promise<<Entity> | null>;
     create(entity: <Entity>): Promise<void>;
     // only the methods actual use cases need — don't add speculative CRUD
   }
   ```

3. **Mapper** — `infra/db/mappers/<entity>.mapper.ts`, the only place that translates between DB rows and domain entities:

   ```ts
   import { InferInsertModel, InferSelectModel } from "drizzle-orm";
   import { UniqueEntityID } from "@/core/entity/unique-entity-id";
   import { <table> } from "@/infra/db/schema/<table>";
   import { <Entity> } from "@/modules/<module>/domain/entities/<entity>";

   type Row = InferSelectModel<typeof <table>>;
   type Insert = InferInsertModel<typeof <table>>;

   export class <Entity>Mapper {
     public static toDomain(raw: Row): <Entity> {
       return <Entity>.create(
         { /* VO.restore(raw.field) for each value object prop, plain fields as-is */ },
         UniqueEntityID.create(raw.id),
       );
     }

     public static toPersistence(entity: <Entity>): Insert {
       return { id: entity.id.toValue(), /* ... */ };
     }
   }
   ```

   Use `VO.restore(...)`, not `VO.create(...)`, when rehydrating from a DB row — the value was already validated once at write time; re-validating on every read is redundant and can wrongly reject legacy data if the rule tightens later.

4. **Drizzle adapter** — `infra/db/repositories/drizzle-<entity>.repository.ts`:

   ```ts
   import { eq } from "drizzle-orm";
   import { inject, injectable } from "tsyringe";
   import { InjectionTokens } from "@/infra/container/tokens";
   import { DatabaseClient } from "@/infra/db/client";
   import { <table> } from "@/infra/db/schema/<table>";
   import { <Entity>Repository } from "@/modules/<module>/application/repositories/<entity>.repository";
   import { <Entity> } from "@/modules/<module>/domain/entities/<entity>";
   import { <Entity>Mapper } from "../mappers/<entity>.mapper";

   @injectable()
   export class Drizzle<Entity>Repository implements <Entity>Repository {
     public constructor(
       @inject(InjectionTokens.Databases.Drizzle)
       private readonly db: DatabaseClient,
     ) {}

     public async findById(id: string): Promise<<Entity> | null> {
       const [row] = await this.db.query.select().from(<table>).where(eq(<table>.id, id)).limit(1);
       return row ? <Entity>Mapper.toDomain(row) : null;
     }

     public async create(entity: <Entity>): Promise<void> {
       await this.db.query.insert(<table>).values(<Entity>Mapper.toPersistence(entity));
     }
   }
   ```

   If this entity is read frequently, add a cache-aside layer instead of querying Postgres on every read — see `src/modules/account/infra/cache/repositories/valkey-account-cache.repository.ts` and how `DrizzleAccountRepository` checks the cache before the DB and populates it after a miss. That's a separate `<Entity>CacheRepository` port injected into the Drizzle repository, not a change to the port interface consumers see.

5. **DI wiring** — add a token under `InjectionTokens.Repositories.<Entity>` in `tokens.ts`, then in the module's `infra/db/container.ts`:

   ```ts
   container.register<<Entity>Repository>(
     InjectionTokens.Repositories.<Entity>,
     { useClass: Drizzle<Entity>Repository },
     { lifecycle: Lifecycle.Singleton },
   );
   ```

   Handlers inject via `@inject(InjectionTokens.Repositories.<Entity>) private readonly repo: <Entity>Repository` — never the concrete `Drizzle<Entity>Repository` class.

## Non-goals

- Don't let a handler or controller import `drizzle-orm` or the schema directly — only `infra/db/` may.
- Don't add methods to the port "just in case" — add them when a use case actually needs them.
