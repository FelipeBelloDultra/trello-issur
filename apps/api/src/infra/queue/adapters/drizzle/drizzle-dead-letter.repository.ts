import { and, eq, isNull } from "drizzle-orm";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { DatabaseClient } from "@/infra/db/client";
import { failedQueueEvents } from "@/infra/db/schema/failed-queue-events";
import {
  DeadLetterRepository,
  FailedQueueEvent,
  FindPendingOptions,
  StoredFailedQueueEvent,
} from "@/shared/queue/application/repositories/dead-letter.repository";

const DEFAULT_LIMIT = 50;

@injectable()
export class DrizzleDeadLetterRepository implements DeadLetterRepository {
  public constructor(
    @inject(InjectionTokens.Databases.Drizzle)
    private readonly db: DatabaseClient,
  ) {}

  public async save(event: FailedQueueEvent): Promise<void> {
    await this.db.query.insert(failedQueueEvents).values({
      queue: event.queue,
      exchange: event.exchange,
      routingKey: event.routingKey,
      payload: event.payload,
      errorMessage: event.errorMessage,
      retryCount: event.retryCount,
      firstFailedAt: event.firstFailedAt,
      deadAt: event.deadAt,
    });
  }

  public async findById(id: string): Promise<StoredFailedQueueEvent | null> {
    const rows = await this.db.query
      .select()
      .from(failedQueueEvents)
      .where(eq(failedQueueEvents.id, id))
      .limit(1);

    return rows[0] ? this.toStored(rows[0]) : null;
  }

  public async findPending(options: FindPendingOptions = {}): Promise<StoredFailedQueueEvent[]> {
    const limit = options.limit ?? DEFAULT_LIMIT;
    const offset = options.offset ?? 0;

    const conditions = [isNull(failedQueueEvents.replayedAt)];
    if (options.queue) conditions.push(eq(failedQueueEvents.queue, options.queue));

    const rows = await this.db.query
      .select()
      .from(failedQueueEvents)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

    return rows.map((r) => this.toStored(r));
  }

  public async markReplayed(id: string): Promise<void> {
    await this.db.query
      .update(failedQueueEvents)
      .set({ replayedAt: new Date() })
      .where(eq(failedQueueEvents.id, id));
  }

  private toStored(row: typeof failedQueueEvents.$inferSelect): StoredFailedQueueEvent {
    return {
      id: row.id,
      queue: row.queue,
      exchange: row.exchange,
      routingKey: row.routingKey,
      payload: row.payload,
      errorMessage: row.errorMessage,
      retryCount: row.retryCount,
      firstFailedAt: row.firstFailedAt,
      deadAt: row.deadAt,
      replayedAt: row.replayedAt,
      createdAt: row.createdAt,
    };
  }
}
