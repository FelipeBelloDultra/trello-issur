import { faker } from "@faker-js/faker";
import supertest from "supertest";
import { container } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { App } from "@/infra/http/app";
import { WorkspaceInviteRepository } from "@/modules/workspace/application/repositories/workspace-invite.repository";
import { WorkspaceInviteRejectedConsumer } from "@/modules/workspace/infra/queue/consumers/workspace-invite-rejected.consumer";
import { CacheRepository } from "@/shared/cache/application/repositories/cache.repository";
import { QueueEvents } from "@/shared/queue/application/events";
import { OutboxRepository } from "@/shared/queue/application/repositories/outbox.repository";
import { makeAccount } from "@/test/factories/make-account";

describe("[E2E] - Respond to invite (reject) - [PATCH /invites/:token]", () => {
  let app: App;
  let workspaceInviteRepository: WorkspaceInviteRepository;
  let outboxRepository: OutboxRepository;

  beforeAll(async () => {
    app = new App();
    await app.startServices();
    workspaceInviteRepository = container.resolve<WorkspaceInviteRepository>(
      InjectionTokens.Repositories.WorkspaceInvite,
    );
    outboxRepository = container.resolve<OutboxRepository>(InjectionTokens.Queue.OutboxRepository);

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

    return { agent, accountId: meBody.data.id, email: account.email };
  }

  it("rejects a pending invite atomically and notifies the inviter once the event is consumed", async () => {
    const inviter = await registerAndSignIn();
    const invitee = await registerAndSignIn();

    const workspace = await inviter.agent
      .post("/api/workspaces")
      .send({ name: faker.company.name() })
      .expect(201);
    const workspaceBody = workspace.body as { data: { id: string } };
    const workspaceId = workspaceBody.data.id;

    const invite = await inviter.agent
      .post(`/api/workspaces/${workspaceId}/invites`)
      .send({ email: invitee.email, role: "member" })
      .expect(201);
    const inviteBody = invite.body as { id: string };
    const inviteId = inviteBody.id;

    const inviteDetails = await workspaceInviteRepository.findDetailsById(inviteId);
    const token = inviteDetails?.token;

    await invitee.agent.patch(`/api/invites/${token}`).send({ action: "reject" }).expect(204);

    const rejectedInvite = await workspaceInviteRepository.findByToken(token as string);
    expect(rejectedInvite?.status).toBe("rejected");

    const pendingOutbox = await outboxRepository.findPending();
    const outboxEvent = pendingOutbox.find(
      (e) =>
        e.routingKey === QueueEvents.WorkspaceInvite.Rejected &&
        (e.payload as { inviteId: string }).inviteId === inviteId,
    );
    expect(outboxEvent).toBeDefined();

    // Simulates what the queue consumer does when it picks up the outbox
    // event above — exercised directly (real Postgres, no live RabbitMQ
    // round-trip) so the test stays fast and deterministic.
    const rejectedConsumer = container.resolve<WorkspaceInviteRejectedConsumer>(
      InjectionTokens.Consumers.WorkspaceInviteRejected,
    );
    await rejectedConsumer.handle({ inviteId, accountId: invitee.accountId });

    const notifications = await inviter.agent.get("/api/notifications");
    const notificationsBody = notifications.body as {
      data: Array<{ type: string; metadata: { workspaceInviteId: string } }>;
    };
    const notification = notificationsBody.data.find(
      (n) => n.type === "workspace_invite_rejected" && n.metadata.workspaceInviteId === inviteId,
    );
    expect(notification).toBeDefined();
  });
});
