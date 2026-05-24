import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { QueuePublisher } from "../../publisher";

import { RabbitMQClient } from "./client";

@injectable()
export class RabbitMQPublisher implements QueuePublisher {
  public constructor(
    @inject(InjectionTokens.Queue.Client)
    private readonly client: RabbitMQClient,
  ) {}

  public publish<TPayload>(exchange: string, routingKey: string, payload: TPayload): void {
    this.client.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      contentType: "application/json",
    });
  }
}
