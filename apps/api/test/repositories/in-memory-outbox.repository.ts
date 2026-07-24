import { randomUUID } from "node:crypto";

import {
  FindPendingOutboxEventsOptions,
  OutboxEvent,
  OutboxRepository,
  StoredOutboxEvent,
} from "@/shared/queue/application/repositories/outbox.repository";

export class InMemoryOutboxRepository implements OutboxRepository {
  public items: StoredOutboxEvent[] = [];

  public save(event: OutboxEvent): Promise<void> {
    this.items.push({
      id: randomUUID(),
      routingKey: event.routingKey,
      payload: event.payload,
      publishedAt: null,
      createdAt: new Date(),
    });
    return Promise.resolve();
  }

  public findPending(options: FindPendingOutboxEventsOptions = {}): Promise<StoredOutboxEvent[]> {
    const limit = options.limit ?? this.items.length;
    return Promise.resolve(this.items.filter((item) => item.publishedAt === null).slice(0, limit));
  }

  public markPublished(id: string): Promise<void> {
    const item = this.items.find((i) => i.id === id);
    if (item) item.publishedAt = new Date();
    return Promise.resolve();
  }
}
