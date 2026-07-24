export interface OutboxEvent {
  routingKey: string;
  payload: unknown;
}

export interface StoredOutboxEvent extends OutboxEvent {
  id: string;
  publishedAt: Date | null;
  createdAt: Date;
}

export interface FindPendingOutboxEventsOptions {
  limit?: number;
}

export interface OutboxRepository {
  save(event: OutboxEvent): Promise<void>;
  findPending(options?: FindPendingOutboxEventsOptions): Promise<StoredOutboxEvent[]>;
  markPublished(id: string): Promise<void>;
}
