import { faker } from "@faker-js/faker";
import supertest from "supertest";
import { container } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { App } from "@/infra/http/app";
import { WorkspaceMemberRepository } from "@/modules/workspace/application/repositories/workspace-member.repository";
import { CacheRepository } from "@/shared/cache/application/repositories/cache.repository";
import { makeAccount } from "@/test/factories/make-account";

describe("[E2E] - Update workspace member role - [PATCH /workspaces/:workspaceId/members/:memberId]", () => {
  let app: App;
  let workspaceMemberRepository: WorkspaceMemberRepository;

  beforeAll(async () => {
    app = new App();
    await app.startServices();
    workspaceMemberRepository = container.resolve<WorkspaceMemberRepository>(
      InjectionTokens.Repositories.WorkspaceMember,
    );

    // The e2e harness doesn't reset the app's own Valkey db between spec files
    // (test/e2e-setup.ts flushes a different logical db), so rate-limit counters
    // accumulate across the whole suite run — reset this file's budget explicitly.
    const cache = container.resolve<CacheRepository>(InjectionTokens.Cache.Repository);
    await cache.deleteByPrefix("rate-limit");
  });

  afterAll(async () => {
    await app.stopServices();
  });

  async function registerAndSignIn() {
    const password = "test-password";
    const account = makeAccount();
    await supertest(app.expressInstance)
      .post("/api/accounts")
      .send({ name: account.name, email: account.email, password });

    const agent = supertest.agent(app.expressInstance);
    await agent.post("/api/auth/authenticate").send({ email: account.email, password });

    const me = await agent.get("/api/auth/me");
    const meBody = me.body as { data: { id: string } };

    return { agent, accountId: meBody.data.id };
  }

  it("reflects a role change on the very next authorization check, without waiting for the cache TTL", async () => {
    const owner = await registerAndSignIn();
    const member = await registerAndSignIn();

    const workspace = await owner.agent
      .post("/api/workspaces")
      .send({ name: faker.company.name() })
      .expect(201);
    const workspaceBody = workspace.body as { data: { id: string } };
    const workspaceId = workspaceBody.data.id;

    await workspaceMemberRepository.create({
      workspaceId,
      accountId: member.accountId,
      role: "member",
    });

    const beforeUpdate = await member.agent.get(`/api/workspaces/${workspaceId}/me`);
    const beforeBody = beforeUpdate.body as { data: { role: string; permissions: string[] } };
    expect(beforeBody.data.role).toBe("member");
    expect(beforeBody.data.permissions).not.toContain("workspace:manage");

    const list = await owner.agent.get(`/api/workspaces/${workspaceId}/members`);
    const listBody = list.body as { data: Array<{ id: string; account_id: string }> };
    const memberRow = listBody.data.find((m) => m.account_id === member.accountId);

    await owner.agent
      .patch(`/api/workspaces/${workspaceId}/members/${memberRow?.id}`)
      .send({ role: "admin" })
      .expect(204);

    const afterUpdate = await member.agent.get(`/api/workspaces/${workspaceId}/me`);
    const afterBody = afterUpdate.body as { data: { role: string; permissions: string[] } };
    expect(afterBody.data.role).toBe("admin");
    expect(afterBody.data.permissions).toContain("workspace:manage");
  });
});
