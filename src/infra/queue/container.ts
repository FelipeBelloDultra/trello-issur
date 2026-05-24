import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { RabbitMQClient } from "./adapters/rabbitmq/client";
import { RabbitMQPublisher } from "./adapters/rabbitmq/publisher";
import { ConsumerRegistry } from "./consumer-registry";
import { QueuePublisher } from "./publisher";

export function setupQueueContainer(): void {
  container.register<RabbitMQClient>(
    InjectionTokens.Queue.Client,
    { useClass: RabbitMQClient },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<ConsumerRegistry>(
    InjectionTokens.Queue.ConsumerRegistry,
    { useClass: ConsumerRegistry },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<QueuePublisher>(
    InjectionTokens.Queue.Publisher,
    { useClass: RabbitMQPublisher },
    { lifecycle: Lifecycle.Singleton },
  );
}
