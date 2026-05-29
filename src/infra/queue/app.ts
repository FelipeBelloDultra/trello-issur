import "@/infra/container";

import { container } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { DatabaseClient } from "@/infra/db/client";
import { logger } from "@/infra/logger";
import { shutdownTracing } from "@/infra/tracing/adapters/otel";
import { ValkeyClient } from "@/infra/valkey/client";

import { RabbitMQClient } from "./adapters/rabbitmq/client";
import { ConsumerRegistry } from "./consumer-registry";

export class QueueApp {
  private readonly drizzleConnection = container.resolve<DatabaseClient>(
    InjectionTokens.Databases.Drizzle,
  );
  private readonly valkeyConnection = container.resolve<ValkeyClient>(
    InjectionTokens.Databases.Valkey,
  );
  private readonly rabbitMQClient = container.resolve<RabbitMQClient>(InjectionTokens.Queue.Client);
  private readonly consumerRegistry = container.resolve<ConsumerRegistry>(
    InjectionTokens.Queue.ConsumerRegistry,
  );

  public async startServices(): Promise<void> {
    this.drizzleConnection.connect();
    this.valkeyConnection.connect();
    await this.rabbitMQClient.connect();

    const channel = this.rabbitMQClient.channel;
    const consumers = this.consumerRegistry.getAll();

    for (const consumer of consumers) {
      await consumer.start(channel);
    }

    logger.info({ consumers: consumers.length }, "queue process started");
  }

  public async stopServices(): Promise<void> {
    await this.rabbitMQClient.disconnect();
    await this.drizzleConnection.disconnect();
    await this.valkeyConnection.disconnect();
    await shutdownTracing();
  }

  public async boot(): Promise<void> {
    try {
      await this.startServices();

      const shutdown = async () => {
        logger.info("shutting down queue process");
        await this.stopServices();
        process.exit(0);
      };

      process.on("SIGTERM", () => {
        shutdown().catch(() => process.exit(1));
      });
      process.on("SIGINT", () => {
        shutdown().catch(() => process.exit(1));
      });
    } catch (err: unknown) {
      logger.error({ err }, "queue process failed to start");
      await this.stopServices();
      process.exit(1);
    }
  }
}
