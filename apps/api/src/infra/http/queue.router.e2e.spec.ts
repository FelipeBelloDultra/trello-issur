import supertest from "supertest";
import { container } from "tsyringe";

import { env } from "@/config/env";
import { InjectionTokens } from "@/infra/container/tokens";
import { QueuePublisherGateway } from "@/shared/queue/application/gateways/queue-publisher.gateway";
import { DeadLetterRepository } from "@/shared/queue/application/repositories/dead-letter.repository";

import { App } from "./app";

describe("[E2E] - Queue admin routes - [/queue/dead-letters]", () => {
  let app: App;

  beforeAll(async () => {
    app = new App();
    await app.startServices();
  });

  afterAll(async () => {
    await app.stopServices();
  });

  it("rejects GET /queue/dead-letters without an x-internal-token header", async () => {
    const sut = await supertest(app.expressInstance).get("/api/queue/dead-letters");

    expect(sut.status).toBe(401);
    expect(sut.body).not.toHaveProperty("data");
  });

  it("rejects GET /queue/dead-letters with an invalid x-internal-token header", async () => {
    const sut = await supertest(app.expressInstance)
      .get("/api/queue/dead-letters")
      .set("x-internal-token", "not-the-right-token");

    expect(sut.status).toBe(401);
    expect(sut.body).not.toHaveProperty("data");
  });

  it("allows GET /queue/dead-letters with a valid x-internal-token header", async () => {
    const sut = await supertest(app.expressInstance)
      .get("/api/queue/dead-letters")
      .set("x-internal-token", env.QUEUE_ADMIN_TOKEN);

    expect(sut.status).toBe(200);
    expect(sut.body).toHaveProperty("data");
  });

  it("rejects POST /queue/dead-letters/:id/replay without an x-internal-token header", async () => {
    const sut = await supertest(app.expressInstance).post(
      "/api/queue/dead-letters/00000000-0000-0000-0000-000000000000/replay",
    );

    expect(sut.status).toBe(401);
  });

  it("lets a valid x-internal-token header reach the replay business logic (404 for unknown id)", async () => {
    const sut = await supertest(app.expressInstance)
      .post("/api/queue/dead-letters/00000000-0000-0000-0000-000000000000/replay")
      .set("x-internal-token", env.QUEUE_ADMIN_TOKEN);

    expect(sut.status).toBe(404);
  });

  it("publishes a replay under a deterministic key, so a second replay of the same event still 409s without publishing again", async () => {
    const deadLetterRepository = container.resolve<DeadLetterRepository>(
      InjectionTokens.Queue.DeadLetterRepository,
    );
    const originalPublisher = container.resolve<QueuePublisherGateway>(
      InjectionTokens.Queue.Publisher,
    );

    await deadLetterRepository.save({
      queue: "test-queue",
      exchange: "trello-issur.events",
      routingKey: "test.event",
      payload: { foo: "bar" },
      errorMessage: "boom",
      retryCount: 3,
      firstFailedAt: new Date(),
      deadAt: new Date(),
    });
    const [event] = await deadLetterRepository.findPending({ queue: "test-queue" });

    const publishSpy = vi.fn();
    container.register<QueuePublisherGateway>(InjectionTokens.Queue.Publisher, {
      useValue: { publish: publishSpy },
    });

    try {
      await supertest(app.expressInstance)
        .post(`/api/queue/dead-letters/${event.id}/replay`)
        .set("x-internal-token", env.QUEUE_ADMIN_TOKEN)
        .expect(200);

      expect(publishSpy).toHaveBeenCalledTimes(1);
      expect(publishSpy).toHaveBeenCalledWith(
        event.routingKey,
        event.payload,
        `replay:${event.id}`,
      );

      await supertest(app.expressInstance)
        .post(`/api/queue/dead-letters/${event.id}/replay`)
        .set("x-internal-token", env.QUEUE_ADMIN_TOKEN)
        .expect(409);

      expect(publishSpy).toHaveBeenCalledTimes(1);
    } finally {
      container.register<QueuePublisherGateway>(InjectionTokens.Queue.Publisher, {
        useValue: originalPublisher,
      });
    }
  });
});
