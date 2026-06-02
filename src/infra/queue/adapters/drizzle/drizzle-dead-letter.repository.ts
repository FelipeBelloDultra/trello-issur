import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { DatabaseClient } from "@/infra/db/client";
import { failedQueueEvents } from "@/infra/db/schema/failed-queue-events";
import {
  DeadLetterRepository,
  FailedQueueEvent,
} from "@/shared/queue/application/repositories/dead-letter.repository";

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
}
