import { Channel, ConsumeMessage } from "amqplib";
import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { logger } from "@/infra/logger";
import { Consumer } from "@/infra/queue/contracts/consumer";
import {
  DeadLetterRepository,
  FailedQueueEvent,
} from "@/shared/queue/application/repositories/dead-letter.repository";

import { Exchanges } from "./exchanges";

const DEAD_LETTERS_QUEUE = "dead-letters";

@injectable()
export class DeadLetterConsumer implements Consumer {
  public constructor(
    @inject(InjectionTokens.Queue.DeadLetterRepository)
    private readonly deadLetterRepository: DeadLetterRepository,
  ) {}

  public async start(channel: Channel): Promise<void> {
    await channel.assertExchange(Exchanges.Dead, "topic", { durable: true });
    await channel.assertQueue(DEAD_LETTERS_QUEUE, { durable: true });
    await channel.bindQueue(DEAD_LETTERS_QUEUE, Exchanges.Dead, "#");

    await channel.consume(DEAD_LETTERS_QUEUE, (msg) => {
      if (!msg) return;

      this.processMessage(msg)
        .then(() => channel.ack(msg))
        .catch((err: unknown) => {
          logger.error(
            { err, queue: DEAD_LETTERS_QUEUE },
            "failed to persist dead letter — acking to prevent requeue loop",
          );
          channel.ack(msg);
        });
    });

    logger.info("dead letter consumer started");
  }

  private async processMessage(msg: ConsumeMessage): Promise<void> {
    const event = this.buildEvent(msg);
    await this.deadLetterRepository.save(event);
    logger.warn({ queue: event.queue, routingKey: event.routingKey }, "dead letter persisted");
  }

  private buildEvent(msg: ConsumeMessage): FailedQueueEvent {
    const headers = (msg.properties.headers ?? {}) as Record<string, unknown>;

    return {
      queue: this.parseString(headers["x-original-queue"]) ?? msg.fields.routingKey,
      exchange: msg.fields.exchange,
      routingKey: msg.fields.routingKey,
      payload: this.parsePayload(msg),
      errorMessage:
        this.parseString(headers["x-last-error"]) ??
        this.parseString(headers["x-dead-reason"]) ??
        "unknown",
      retryCount: typeof headers["x-retry-count"] === "number" ? headers["x-retry-count"] : 0,
      firstFailedAt: this.parseDate(headers["x-first-failed-at"]),
      deadAt: this.parseDate(headers["x-dead-at"]),
    };
  }

  private parseString(value: unknown): string | null {
    if (typeof value === "string") return value;
    return null;
  }

  private parsePayload(msg: ConsumeMessage): unknown {
    try {
      return JSON.parse(msg.content.toString()) as unknown;
    } catch {
      return { _raw: msg.content.toString() };
    }
  }

  private parseDate(value: unknown): Date {
    if (typeof value === "string") return new Date(value);
    return new Date();
  }
}
