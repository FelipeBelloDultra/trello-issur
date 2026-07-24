import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DatabaseClient } from "./client";
import * as schema from "./schema";

// Extracted via the transaction() callback's own parameter instead of
// hand-spelling NodePgTransaction<...>'s generics — stays correct if
// Drizzle's internal transaction type ever changes shape.
export type Transaction = Parameters<NodePgDatabase<typeof schema>["transaction"]>[0] extends (
  tx: infer Tx,
) => unknown
  ? Tx
  : never;

// NodePgDatabase (the pool) and Transaction are sibling subclasses of
// Drizzle's PgDatabase, not one a subtype of the other — repositories that
// must work both as normal pooled singletons and inside a transaction take
// this union instead of NodePgDatabase directly.
export type DrizzleExecutor = NodePgDatabase<typeof schema> | Transaction;

export function withTransaction<T>(
  db: DatabaseClient,
  work: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return db.query.transaction(work);
}
