import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { InjectionTokens } from "@/infra/container/tokens";
import { WorkspaceMemberRoles } from "@/modules/workspace/domain/value-objects/workspace-member-role";
import { QueueEvents } from "@/shared/queue/application/events";
import { InMemoryTokenGeneratorGateway } from "@/test/gateways/in-memory-token-generator.gateway";
import { InMemoryOutboxRepository } from "@/test/repositories/in-memory-outbox.repository";
import { InMemoryUnitOfWork } from "@/test/repositories/in-memory-unit-of-work";
import { InMemoryWorkspaceInviteRepository } from "@/test/repositories/in-memory-workspace-invite.repository";
import { InMemoryWorkspaceMemberRepository } from "@/test/repositories/in-memory-workspace-member.repository";

import { AlreadyAMemberError } from "../../errors/already-a-member.error";
import { InviteAlreadyPendingError } from "../../errors/invite-already-pending.error";

import { InviteMemberCommand } from "./command";
import { InviteMemberHandler } from "./handler";

describe("InviteMemberHandler", () => {
  let inviteRepository: InMemoryWorkspaceInviteRepository;
  let tokenGenerator: InMemoryTokenGeneratorGateway;
  let memberRepository: InMemoryWorkspaceMemberRepository;
  let outboxRepository: InMemoryOutboxRepository;
  let unitOfWork: InMemoryUnitOfWork;
  let sut: InviteMemberHandler;

  beforeEach(() => {
    inviteRepository = new InMemoryWorkspaceInviteRepository();
    tokenGenerator = new InMemoryTokenGeneratorGateway();
    memberRepository = new InMemoryWorkspaceMemberRepository();
    outboxRepository = new InMemoryOutboxRepository();
    unitOfWork = new InMemoryUnitOfWork(
      new Map<symbol, unknown>([
        [InjectionTokens.Repositories.WorkspaceInvite, inviteRepository],
        [InjectionTokens.Queue.OutboxRepository, outboxRepository],
      ]),
    );
    sut = new InviteMemberHandler(inviteRepository, tokenGenerator, memberRepository, unitOfWork);
  });

  function makeCommand(overrides?: Partial<InviteMemberCommand["props"]>) {
    return new InviteMemberCommand({
      workspaceId: UniqueEntityID.create().toValue(),
      invitedByAccountId: UniqueEntityID.create().toValue(),
      email: faker.internet.email(),
      role: WorkspaceMemberRoles.Member,
      ...overrides,
    });
  }

  it("creates a pending invite and enqueues WorkspaceInvite.Created in the outbox on success", async () => {
    const command = makeCommand();

    const result = await sut.execute(command);

    expect(result.isRight()).toBe(true);
    expect(inviteRepository.items).toHaveLength(1);
    expect(inviteRepository.items[0]?.status).toBe("pending");
    expect(outboxRepository.items).toHaveLength(1);
    expect(outboxRepository.items[0]?.routingKey).toBe(QueueEvents.WorkspaceInvite.Created);
    expect(outboxRepository.items[0]?.payload).toEqual({
      inviteId: inviteRepository.items[0]?.id.toValue(),
    });
  });

  it("normalizes the email (trim + lowercase) before storing and checking", async () => {
    const command = makeCommand({ email: "  Someone@Example.com  " });

    const result = await sut.execute(command);

    expect(result.isRight()).toBe(true);
    expect(inviteRepository.items[0]?.email).toBe("someone@example.com");
  });

  it("returns AlreadyAMemberError when the email already belongs to a workspace member", async () => {
    const workspaceId = UniqueEntityID.create().toValue();
    memberRepository.items.push({
      id: UniqueEntityID.create().toValue(),
      workspaceId,
      accountId: UniqueEntityID.create().toValue(),
      accountEmail: "member@example.com",
      role: WorkspaceMemberRoles.Member,
    });
    const command = makeCommand({ workspaceId, email: "member@example.com" });

    const result = await sut.execute(command);

    expect(result.value).toBeInstanceOf(AlreadyAMemberError);
    expect(inviteRepository.items).toHaveLength(0);
    expect(outboxRepository.items).toHaveLength(0);
  });

  it("returns InviteAlreadyPendingError when a pending invite already exists for the email in this workspace", async () => {
    const workspaceId = UniqueEntityID.create().toValue();
    const command = makeCommand({ workspaceId, email: "pending@example.com" });
    await sut.execute(command);

    const result = await sut.execute(command);

    expect(result.value).toBeInstanceOf(InviteAlreadyPendingError);
    expect(inviteRepository.items).toHaveLength(1);
    expect(outboxRepository.items).toHaveLength(1);
  });
});
