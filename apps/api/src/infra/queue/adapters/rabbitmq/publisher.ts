import { randomUUID } from "node:crypto";

import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { QueuePublisherGateway } from "@/shared/queue/application/gateways/queue-publisher.gateway";

import { RabbitMQClient } from "./client";
import { Exchanges } from "./exchanges";

@injectable()
export class RabbitMQPublisher implements QueuePublisherGateway {
  public constructor(
    @inject(InjectionTokens.Queue.Client)
    private readonly client: RabbitMQClient,
  ) {}

  public publish<TPayload>(routingKey: string, payload: TPayload, idempotencyKey?: string): void {
    this.client.channel.publish(Exchanges.Main, routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      contentType: "application/json",
      headers: { "x-idempotency-key": idempotencyKey ?? randomUUID() },
    });
  }
}
