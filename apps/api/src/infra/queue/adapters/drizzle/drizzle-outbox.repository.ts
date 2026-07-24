import { eq, isNull } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { outboxEvents } from "@/infra/db/schema/outbox-events";
import { DrizzleExecutor } from "@/infra/db/transaction";
import {
  FindPendingOutboxEventsOptions,
  OutboxEvent,
  OutboxRepository,
  StoredOutboxEvent,
} from "@/shared/queue/application/repositories/outbox.repository";

const DEFAULT_LIMIT = 50;

@injectable()
export class DrizzleOutboxRepository implements OutboxRepository {
  public constructor(
    @inject(InjectionTokens.Databases.DrizzleExecutor)
    private readonly db: DrizzleExecutor,
  ) {}

  public async save(event: OutboxEvent): Promise<void> {
    await this.db.insert(outboxEvents).values({
      routingKey: event.routingKey,
      payload: event.payload,
    });
  }

  // `for("update", { skipLocked: true })` only actually holds the row lock
  // when run inside a transaction (an unwrapped SELECT runs in its own
  // implicit single-statement transaction and releases immediately) — this
  // is meant to be called from within a UnitOfWork alongside markPublished,
  // so two OutboxRelay instances (if the queue process ever runs more than
  // one replica) don't both pick up and publish the same pending row.
  public async findPending(
    options: FindPendingOutboxEventsOptions = {},
  ): Promise<StoredOutboxEvent[]> {
    const limit = options.limit ?? DEFAULT_LIMIT;

    const rows = await this.db
      .select()
      .from(outboxEvents)
      .where(isNull(outboxEvents.publishedAt))
      .limit(limit)
      .for("update", { skipLocked: true });

    return rows.map((row) => this.toStored(row));
  }

  public async markPublished(id: string): Promise<void> {
    await this.db
      .update(outboxEvents)
      .set({ publishedAt: new Date() })
      .where(eq(outboxEvents.id, id));
  }

  private toStored(row: typeof outboxEvents.$inferSelect): StoredOutboxEvent {
    return {
      id: row.id,
      routingKey: row.routingKey,
      payload: row.payload,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
    };
  }
}
