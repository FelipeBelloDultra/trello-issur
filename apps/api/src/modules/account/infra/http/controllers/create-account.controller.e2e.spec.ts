import { count } from "drizzle-orm";
import supertest from "supertest";
import { container } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { DatabaseClient } from "@/infra/db/client";
import { accounts } from "@/infra/db/schema";
import { App } from "@/infra/http/app";
import { makeAccount } from "@/test/factories/make-account";

describe("[E2E] - Create account - [POST /accounts]", () => {
  let app: App;
  let dbClient: DatabaseClient;

  beforeAll(async () => {
    app = new App();
    dbClient = container.resolve<DatabaseClient>(InjectionTokens.Databases.Drizzle);
    await app.startServices();
  });

  it("should create account", async () => {
    const PASSWORD = "test-password";
    const account = makeAccount();

    const sut = await supertest(app.expressInstance).post("/api/accounts").send({
      name: account.name,
      email: account.email,
      password: PASSWORD,
    });

    expect(sut.status).toBe(201);
    const [{ value }] = await dbClient.query.select({ value: count() }).from(accounts);
    expect(value).toBeGreaterThan(0);
  });

  afterAll(async () => {
    await app.stopServices();
  });
});
