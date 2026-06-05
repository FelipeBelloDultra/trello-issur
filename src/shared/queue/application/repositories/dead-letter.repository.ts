export interface FailedQueueEvent {
  queue: string;
  exchange: string;
  routingKey: string;
  payload: unknown;
  errorMessage: string;
  retryCount: number;
  firstFailedAt: Date;
  deadAt: Date;
}

export interface StoredFailedQueueEvent extends FailedQueueEvent {
  id: string;
  replayedAt: Date | null;
  createdAt: Date;
}

export interface FindPendingOptions {
  queue?: string;
  limit?: number;
  offset?: number;
}

export interface DeadLetterRepository {
  save(event: FailedQueueEvent): Promise<void>;
  findById(id: string): Promise<StoredFailedQueueEvent | null>;
  findPending(options?: FindPendingOptions): Promise<StoredFailedQueueEvent[]>;
  markReplayed(id: string): Promise<void>;
}
