import supertest from "supertest";

import { App } from "@/infra/http/app";
import { makeAccount } from "@/test/factories/make-account";

describe("[E2E] - Authenticate - [POST /auth/authenticate]", () => {
  let app: App;

  beforeAll(async () => {
    app = new App();
    await app.startServices();
  });

  async function registerAccount() {
    const password = "test-password";
    const account = makeAccount();

    await supertest(app.expressInstance)
      .post("/api/accounts")
      .send({ name: account.name, email: account.email, password });

    return { email: account.email, password };
  }

  it("sets httpOnly access + refresh cookies and never returns tokens in the body", async () => {
    const { email, password } = await registerAccount();

    const sut = await supertest(app.expressInstance)
      .post("/api/auth/authenticate")
      .send({ email, password });

    expect(sut.status).toBe(200);
    expect(sut.body).toEqual({ data: { authenticated: true } });

    const cookies = sut.headers["set-cookie"] as unknown as string[];
    const hasAccessCookie = cookies.some(
      (c) => c.startsWith("access_token=") && c.includes("HttpOnly"),
    );
    const hasRefreshCookie = cookies.some(
      (c) => c.startsWith("refresh_token=") && c.includes("HttpOnly"),
    );
    expect(hasAccessCookie).toBe(true);
    expect(hasRefreshCookie).toBe(true);
  });

  it("lets the cookie authenticate a subsequent request to a protected route", async () => {
    const { email, password } = await registerAccount();
    const agent = supertest.agent(app.expressInstance);

    await agent.post("/api/auth/authenticate").send({ email, password });
    const me = await agent.get("/api/auth/me");
    const body = me.body as { data: { email: string } };

    expect(me.status).toBe(200);
    expect(body.data.email).toBe(email);
  });

  it("revokes the access token immediately on logout, even though the JWT signature is still valid", async () => {
    const { email, password } = await registerAccount();
    const agent = supertest.agent(app.expressInstance);

    await agent.post("/api/auth/authenticate").send({ email, password });
    await agent.get("/api/auth/me").expect(200);

    await agent.post("/api/auth/logout").expect(204);

    const meAfterLogout = await agent.get("/api/auth/me");
    expect(meAfterLogout.status).toBe(401);
  });

  afterAll(async () => {
    await app.stopServices();
  });
});
