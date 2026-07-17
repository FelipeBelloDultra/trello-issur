import { faker } from "@faker-js/faker";
import supertest from "supertest";

import { App } from "@/infra/http/app";
import { makeAccount } from "@/test/factories/make-account";

describe("[E2E] - My workspaces - [GET /workspaces, GET /workspaces/:workspaceId/me]", () => {
  let app: App;

  beforeAll(async () => {
    app = new App();
    await app.startServices();
  });

  async function registerAndSignIn() {
    const password = "test-password";
    const account = makeAccount();
    await supertest(app.expressInstance)
      .post("/api/accounts")
      .send({ name: account.name, email: account.email, password });

    const agent = supertest.agent(app.expressInstance);
    await agent.post("/api/auth/authenticate").send({ email: account.email, password });

    return agent;
  }

  it("lists workspaces the account belongs to with its role", async () => {
    const agent = await registerAndSignIn();

    const created = await agent
      .post("/api/workspaces")
      .send({ name: faker.company.name() })
      .expect(201);
    const createdBody = created.body as { data: { id: string } };

    const sut = await agent.get("/api/workspaces");
    const body = sut.body as { data: Array<{ id: string; role: string }> };

    expect(sut.status).toBe(200);
    expect(body.data).toContainEqual(
      expect.objectContaining({ id: createdBody.data.id, role: "owner" }),
    );
  });

  it("returns role + permissions for a workspace the account is a member of", async () => {
    const agent = await registerAndSignIn();
    const created = await agent
      .post("/api/workspaces")
      .send({ name: faker.company.name() })
      .expect(201);
    const createdBody = created.body as { data: { id: string } };

    const sut = await agent.get(`/api/workspaces/${createdBody.data.id}/me`);
    const body = sut.body as { data: { role: string; permissions: string[] } };

    expect(sut.status).toBe(200);
    expect(body.data.role).toBe("owner");
    expect(body.data.permissions).toEqual(expect.arrayContaining(["workspace:manage"]));
  });

  it("returns 404 (not 500) for a malformed workspaceId instead of a raw uuid", async () => {
    const agent = await registerAndSignIn();

    const sut = await agent.get("/api/workspaces/not-a-uuid/me");

    expect(sut.status).toBe(404);
  });

  it("returns 404 for a well-formed uuid the account is not a member of", async () => {
    const agent = await registerAndSignIn();

    const sut = await agent.get("/api/workspaces/018f2c8e-6b8b-7c3e-8a2e-3f6b1e9d2c4a/me");

    expect(sut.status).toBe(404);
  });

  afterAll(async () => {
    await app.stopServices();
  });
});
