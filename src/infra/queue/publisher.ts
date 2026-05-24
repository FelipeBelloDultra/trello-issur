export interface QueuePublisher {
  publish<TPayload>(exchange: string, routingKey: string, payload: TPayload): void;
}
