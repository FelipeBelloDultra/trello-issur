import { Channel, ConsumeMessage } from "amqplib";
import { inject } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { logger } from "@/infra/logger";
import { Consumer } from "@/infra/queue/contracts/consumer";
import { CacheRepository } from "@/shared/cache/application/repositories/cache.repository";

import { Exchanges } from "./exchanges";

export interface QueueConsumerConfig {
  readonly exchange: string;
  readonly queue: string;
  readonly routingKey: string;
  readonly retryDelays?: readonly number[];
}

const DEFAULT_RETRY_DELAYS: readonly number[] = [5_000, 30_000, 300_000];
const IDEMPOTENCY_TTL_SECONDS = 86_400;

export abstract class QueueConsumer<TPayload = unknown> implements Consumer {
  protected abstract readonly config: QueueConsumerConfig;

  public constructor(
    @inject(InjectionTokens.Cache.Repository)
    private readonly cache: CacheRepository,
  ) {}

  public abstract handle(payload: TPayload): Promise<void>;

  public async start(channel: Channel): Promise<void> {
    await this.setupTopology(channel);

    await channel.consume(this.config.queue, (msg) => {
      if (!msg) return;

      this.processMessage(channel, msg).catch((err: unknown) => {
        logger.error({ err, queue: this.config.queue }, "unhandled error in consumer");
        channel.nack(msg, false, true);
      });
    });
  }

  private async setupTopology(channel: Channel): Promise<void> {
    const { exchange, queue, routingKey } = this.config;
    const delays = this.retryDelays;

    await channel.assertExchange(exchange, "direct", { durable: true });
    await channel.assertExchange(Exchanges.Dead, "topic", { durable: true });

    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    for (let i = 0; i < delays.length; i++) {
      await channel.assertQueue(`${queue}.retry.${i + 1}`, {
        durable: true,
        arguments: {
          "x-message-ttl": delays[i],
          "x-dead-letter-exchange": exchange,
          "x-dead-letter-routing-key": routingKey,
        },
      });
    }

    await channel.assertQueue(`${queue}.dead`, { durable: true });
    await channel.bindQueue(`${queue}.dead`, Exchanges.Dead, `${queue}.dead`);
  }

  private async processMessage(channel: Channel, msg: ConsumeMessage): Promise<void> {
    const retryCount = this.getRetryCount(msg);
    const { queue } = this.config;

    logger.info({ queue, retryCount }, "message received");

    const idempotencyKey = this.getIdempotencyKey(msg);

    if (idempotencyKey && (await this.isAlreadyProcessed(idempotencyKey))) {
      logger.info({ queue, idempotencyKey }, "duplicate message — skipping");
      channel.ack(msg);
      return;
    }

    const payload = this.parsePayload(msg);

    if (!payload) {
      logger.error({ queue }, "unparseable message — routing to dead queue");
      this.sendToDead(channel, msg, "invalid_json");
      channel.ack(msg);
      return;
    }

    try {
      await this.handle(payload);
      if (idempotencyKey) await this.markProcessed(idempotencyKey);
      channel.ack(msg);
      logger.info({ queue, retryCount }, "message processed");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.warn({ queue, retryCount, err }, "message processing failed");
      this.handleFailure(channel, msg, retryCount, errorMessage);
      channel.ack(msg);
    }
  }

  private async isAlreadyProcessed(idempotencyKey: string): Promise<boolean> {
    const cacheKey = this.cache.createKey(["idempotency", this.config.queue, idempotencyKey]);
    try {
      return (await this.cache.get(cacheKey)) !== null;
    } catch (err: unknown) {
      logger.warn({ err, queue: this.config.queue }, "idempotency check failed — proceeding");
      return false;
    }
  }

  private async markProcessed(idempotencyKey: string): Promise<void> {
    const cacheKey = this.cache.createKey(["idempotency", this.config.queue, idempotencyKey]);
    try {
      await this.cache.set(cacheKey, "1", IDEMPOTENCY_TTL_SECONDS);
    } catch (err: unknown) {
      logger.warn({ err, queue: this.config.queue }, "failed to store idempotency key");
    }
  }

  private handleFailure(
    channel: Channel,
    msg: ConsumeMessage,
    retryCount: number,
    errorMessage: string,
  ): void {
    if (retryCount < this.retryDelays.length) {
      this.sendToRetry(channel, msg, retryCount, errorMessage);
      return;
    }

    logger.error({ queue: this.config.queue, retryCount }, "max retries reached — dead queue");
    this.sendToDead(channel, msg, errorMessage);
  }

  private sendToRetry(
    channel: Channel,
    msg: ConsumeMessage,
    retryCount: number,
    errorMessage: string,
  ): void {
    const { queue } = this.config;
    const nextCount = retryCount + 1;
    const retryQueue = `${queue}.retry.${nextCount}`;

    logger.info(
      { queue, retryCount: nextCount, delayMs: this.retryDelays[retryCount] },
      "scheduling retry",
    );

    channel.sendToQueue(retryQueue, msg.content, {
      persistent: true,
      headers: {
        ...(msg.properties.headers ?? {}),
        "x-retry-count": nextCount,
        "x-last-error": errorMessage,
        "x-first-failed-at": this.getFirstFailedAt(msg),
        "x-original-queue": queue,
      },
    });
  }

  private sendToDead(channel: Channel, msg: ConsumeMessage, errorMessage: string): void {
    const { queue } = this.config;
    const deadQueue = `${queue}.dead`;

    logger.warn({ queue, deadQueue }, "routing message to dead queue");

    channel.publish(Exchanges.Dead, deadQueue, msg.content, {
      persistent: true,
      headers: {
        ...(msg.properties.headers ?? {}),
        "x-dead-reason": errorMessage,
        "x-dead-at": new Date().toISOString(),
        "x-original-queue": queue,
      },
    });
  }

  private parsePayload(msg: ConsumeMessage): TPayload | null {
    try {
      return JSON.parse(msg.content.toString()) as TPayload;
    } catch {
      return null;
    }
  }

  private getIdempotencyKey(msg: ConsumeMessage): string | null {
    const headers = msg.properties.headers as Record<string, unknown> | null | undefined;
    const key = headers?.["x-idempotency-key"];
    return typeof key === "string" ? key : null;
  }

  private getRetryCount(msg: ConsumeMessage): number {
    const headers = msg.properties.headers as Record<string, unknown> | null | undefined;
    const count = headers?.["x-retry-count"];
    return typeof count === "number" ? count : 0;
  }

  private getFirstFailedAt(msg: ConsumeMessage): string {
    const headers = msg.properties.headers as Record<string, unknown> | null | undefined;
    const ts = headers?.["x-first-failed-at"];
    return typeof ts === "string" ? ts : new Date().toISOString();
  }

  private get retryDelays(): readonly number[] {
    return this.config.retryDelays?.length ? this.config.retryDelays : DEFAULT_RETRY_DELAYS;
  }
}
