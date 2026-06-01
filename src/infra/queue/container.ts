import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { DrizzleDeadLetterRepository } from "./adapters/drizzle/drizzle-dead-letter.repository";
import { RabbitMQClient } from "./adapters/rabbitmq/client";
import { DeadLetterConsumer } from "./adapters/rabbitmq/dead-letter.consumer";
import { RabbitMQPublisher } from "./adapters/rabbitmq/publisher";
import { ConsumerRegistry } from "./consumer-registry";
import { DeadLetterRepository } from "./dead-letter.repository";
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

  container.register<DeadLetterRepository>(
    InjectionTokens.Queue.DeadLetterRepository,
    { useClass: DrizzleDeadLetterRepository },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<DeadLetterConsumer>(
    InjectionTokens.Consumers.DeadLetter,
    { useClass: DeadLetterConsumer },
    { lifecycle: Lifecycle.Singleton },
  );

  const registry = container.resolve<ConsumerRegistry>(InjectionTokens.Queue.ConsumerRegistry);
  registry.register(container.resolve<DeadLetterConsumer>(InjectionTokens.Consumers.DeadLetter));
}
