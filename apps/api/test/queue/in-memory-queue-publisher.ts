import { QueuePublisherGateway } from "@/shared/queue/application/gateways/queue-publisher.gateway";

interface PublishedEvent {
  routingKey: string;
  payload: unknown;
}

export class InMemoryQueuePublisher implements QueuePublisherGateway {
  public readonly events: PublishedEvent[] = [];

  public publish<TPayload>(routingKey: string, payload: TPayload): void {
    this.events.push({ routingKey, payload });
  }
}
