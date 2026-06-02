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

export interface DeadLetterRepository {
  save(event: FailedQueueEvent): Promise<void>;
}
