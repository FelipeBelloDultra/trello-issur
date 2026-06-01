import { QueuePublisher } from "@/infra/queue/publisher";

interface PublishedEvent {
  exchange: string;
  routingKey: string;
  payload: unknown;
}

export class InMemoryQueuePublisher implements QueuePublisher {
  public readonly events: PublishedEvent[] = [];

  public publish<TPayload>(exchange: string, routingKey: string, payload: TPayload): void {
    this.events.push({ exchange, routingKey, payload });
  }
}
