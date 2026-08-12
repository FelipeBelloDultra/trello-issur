import supertest from "supertest";

import { env } from "@/config/env";

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
});
