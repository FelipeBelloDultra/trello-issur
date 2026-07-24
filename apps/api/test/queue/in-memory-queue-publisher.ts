import { QueuePublisherGateway } from "@/shared/queue/application/gateways/queue-publisher.gateway";

interface PublishedEvent {
  routingKey: string;
  payload: unknown;
  idempotencyKey?: string;
}

export class InMemoryQueuePublisher implements QueuePublisherGateway {
  public readonly events: PublishedEvent[] = [];

  public publish<TPayload>(routingKey: string, payload: TPayload, idempotencyKey?: string): void {
    this.events.push({ routingKey, payload, idempotencyKey });
  }
}
