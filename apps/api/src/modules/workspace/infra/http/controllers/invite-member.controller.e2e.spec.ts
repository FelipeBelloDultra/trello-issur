import { faker } from "@faker-js/faker";
import supertest from "supertest";
import { container } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { App } from "@/infra/http/app";
import { WorkspaceMemberRepository } from "@/modules/workspace/application/repositories/workspace-member.repository";
import { CacheRepository } from "@/shared/cache/application/repositories/cache.repository";
import { makeAccount } from "@/test/factories/make-account";

describe("[E2E] - Invite member - [POST /workspaces/:workspaceId/invites]", () => {
  let app: App;
  let workspaceMemberRepository: WorkspaceMemberRepository;

  beforeAll(async () => {
    app = new App();
    await app.startServices();
    workspaceMemberRepository = container.resolve<WorkspaceMemberRepository>(
      InjectionTokens.Repositories.WorkspaceMember,
    );
  });

  beforeEach(async () => {
    // Each test registers/signs in 3 accounts (owner + member + viewer) — reset
    // the shared rate-limit budget before every test, not just once for the
    // whole file, since the harness never resets it on its own.
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

  async function createWorkspaceWithMembers() {
    const owner = await registerAndSignIn();
    const member = await registerAndSignIn();
    const viewer = await registerAndSignIn();

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
    await workspaceMemberRepository.create({
      workspaceId,
      accountId: viewer.accountId,
      role: "viewer",
    });

    return { owner, member, viewer, workspaceId };
  }

  it("lets a member (has workspace:invite, not workspace:manage) invite someone", async () => {
    const { member, workspaceId } = await createWorkspaceWithMembers();

    const sut = await member.agent
      .post(`/api/workspaces/${workspaceId}/invites`)
      .send({ email: faker.internet.email(), role: "member" });

    expect(sut.status).toBe(201);
  });

  it("blocks a viewer (no workspace:invite) from inviting someone", async () => {
    const { viewer, workspaceId } = await createWorkspaceWithMembers();

    const sut = await viewer.agent
      .post(`/api/workspaces/${workspaceId}/invites`)
      .send({ email: faker.internet.email(), role: "member" });

    expect(sut.status).toBe(403);
  });

  it("still lets the owner invite someone", async () => {
    const { owner, workspaceId } = await createWorkspaceWithMembers();

    const sut = await owner.agent
      .post(`/api/workspaces/${workspaceId}/invites`)
      .send({ email: faker.internet.email(), role: "member" });

    expect(sut.status).toBe(201);
  });

  it("still requires workspace:manage to list invites — a member (workspace:invite only) is blocked", async () => {
    const { member, workspaceId } = await createWorkspaceWithMembers();

    const sut = await member.agent.get(`/api/workspaces/${workspaceId}/invites`);

    expect(sut.status).toBe(403);
  });
});
