import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { QueuePublisherGateway } from "@/shared/queue/application/gateways/queue-publisher.gateway";
import { DeadLetterRepository } from "@/shared/queue/application/repositories/dead-letter.repository";
import { OutboxRepository } from "@/shared/queue/application/repositories/outbox.repository";

import { DrizzleDeadLetterRepository } from "./adapters/drizzle/drizzle-dead-letter.repository";
import { DrizzleOutboxRepository } from "./adapters/drizzle/drizzle-outbox.repository";
import { RabbitMQClient } from "./adapters/rabbitmq/client";
import { DeadLetterConsumer } from "./adapters/rabbitmq/dead-letter.consumer";
import { RabbitMQPublisher } from "./adapters/rabbitmq/publisher";
import { ConsumerRegistry } from "./consumer-registry";

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

  container.register<QueuePublisherGateway>(
    InjectionTokens.Queue.Publisher,
    { useClass: RabbitMQPublisher },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<DeadLetterRepository>(
    InjectionTokens.Queue.DeadLetterRepository,
    { useClass: DrizzleDeadLetterRepository },
    { lifecycle: Lifecycle.Singleton },
  );

  // Deliberately NOT Singleton: it's constructed against DrizzleExecutor,
  // which resolves to the pool by default but is overridden per-transaction
  // by a UnitOfWork's child container (see infra/db/unit-of-work.ts). A
  // cached singleton instance would be shared by reference between parent
  // and child containers (tsyringe registrations aren't copied into child
  // containers, only looked up through them) — the first resolve, whichever
  // scope it happens in, would "win" and stick for every later resolve from
  // any scope, silently reusing a pool-bound instance inside a transaction
  // or (worse) leaking a transaction-bound instance back into normal
  // request handling after that transaction has already committed.
  container.register<OutboxRepository>(InjectionTokens.Queue.OutboxRepository, {
    useClass: DrizzleOutboxRepository,
  });

  container.register<DeadLetterConsumer>(
    InjectionTokens.Queue.DeadLetterConsumer,
    { useClass: DeadLetterConsumer },
    { lifecycle: Lifecycle.Singleton },
  );

  const registry = container.resolve<ConsumerRegistry>(InjectionTokens.Queue.ConsumerRegistry);
  registry.register(
    container.resolve<DeadLetterConsumer>(InjectionTokens.Queue.DeadLetterConsumer),
  );
}
