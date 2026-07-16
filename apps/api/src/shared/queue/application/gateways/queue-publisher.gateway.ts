export interface QueuePublisherGateway {
  publish<TPayload>(routingKey: string, payload: TPayload): void;
}
