import { Router } from "express";
import { container } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { QueuePublisherGateway } from "@/shared/queue/application/gateways/queue-publisher.gateway";
import { DeadLetterRepository } from "@/shared/queue/application/repositories/dead-letter.repository";

import { Middleware } from "./contracts/middleware";
import { HttpException } from "./http-exception";

export const queueRouter = Router();

const internalTokenMiddleware = container.resolve<Middleware>(
  InjectionTokens.Middlewares.InternalToken,
);

queueRouter.use("/queue/dead-letters", internalTokenMiddleware.handle());

queueRouter.get("/queue/dead-letters", async (req, res) => {
  const repo = container.resolve<DeadLetterRepository>(InjectionTokens.Queue.DeadLetterRepository);

  const queue = typeof req.query["queue"] === "string" ? req.query["queue"] : undefined;
  const limit = Number(req.query["limit"]) || 50;
  const offset = Number(req.query["offset"]) || 0;

  const items = await repo.findPending({ queue, limit, offset });

  return res.status(200).json({
    data: items.map((item) => ({
      id: item.id,
      queue: item.queue,
      routing_key: item.routingKey,
      payload: item.payload,
      error_message: item.errorMessage,
      retry_count: item.retryCount,
      first_failed_at: item.firstFailedAt,
      dead_at: item.deadAt,
      replayed_at: item.replayedAt,
      created_at: item.createdAt,
    })),
  });
});

queueRouter.post("/queue/dead-letters/:id/replay", async (req, res) => {
  const repo = container.resolve<DeadLetterRepository>(InjectionTokens.Queue.DeadLetterRepository);
  const publisher = container.resolve<QueuePublisherGateway>(InjectionTokens.Queue.Publisher);

  const { id } = req.params;

  const event = await repo.findById(id);

  if (!event) {
    throw new HttpException({ statusCode: 404, message: "dead letter not found" });
  }

  if (event.replayedAt) {
    throw new HttpException({ statusCode: 409, message: "dead letter already replayed" });
  }

  // Deterministic key prefixed to distinguish it from whatever idempotency
  // key the original (pre-dead-letter) publish may have used — mirrors the
  // OutboxRelay's use of the row's own id (see outbox-relay.ts). A race
  // between two concurrent replay calls for the same event now publishes
  // under the same key, so the consumer's idempotency check collapses them
  // into a single effective processing instead of duplicating the side
  // effect.
  publisher.publish(event.routingKey, event.payload, `replay:${event.id}`);
  await repo.markReplayed(id);

  return res.status(200).json({ data: { replayed: true } });
});
