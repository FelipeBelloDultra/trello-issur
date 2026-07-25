import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { WorkspaceMemberRoles } from "@/modules/workspace/domain/value-objects/workspace-member-role";
import { QueueEvents } from "@/shared/queue/application/events";
import { InMemoryTokenGeneratorGateway } from "@/test/gateways/in-memory-token-generator.gateway";
import { InMemoryQueuePublisher } from "@/test/queue/in-memory-queue-publisher";
import { InMemoryWorkspaceInviteRepository } from "@/test/repositories/in-memory-workspace-invite.repository";
import { InMemoryWorkspaceMemberRepository } from "@/test/repositories/in-memory-workspace-member.repository";

import { AlreadyAMemberError } from "../../errors/already-a-member.error";
import { InviteAlreadyPendingError } from "../../errors/invite-already-pending.error";

import { InviteMemberCommand } from "./command";
import { InviteMemberHandler } from "./handler";

describe("InviteMemberHandler", () => {
  let inviteRepository: InMemoryWorkspaceInviteRepository;
  let tokenGenerator: InMemoryTokenGeneratorGateway;
  let publisher: InMemoryQueuePublisher;
  let memberRepository: InMemoryWorkspaceMemberRepository;
  let sut: InviteMemberHandler;

  beforeEach(() => {
    inviteRepository = new InMemoryWorkspaceInviteRepository();
    tokenGenerator = new InMemoryTokenGeneratorGateway();
    publisher = new InMemoryQueuePublisher();
    memberRepository = new InMemoryWorkspaceMemberRepository();
    sut = new InviteMemberHandler(inviteRepository, tokenGenerator, publisher, memberRepository);
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

  it("creates a pending invite and publishes WorkspaceInvite.Created on success", async () => {
    const command = makeCommand();

    const result = await sut.execute(command);

    expect(result.isRight()).toBe(true);
    expect(inviteRepository.items).toHaveLength(1);
    expect(inviteRepository.items[0]?.status).toBe("pending");
    expect(publisher.events).toHaveLength(1);
    expect(publisher.events[0]?.routingKey).toBe(QueueEvents.WorkspaceInvite.Created);
    expect(publisher.events[0]?.payload).toEqual({
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
    expect(publisher.events).toHaveLength(0);
  });

  it("returns InviteAlreadyPendingError when a pending invite already exists for the email in this workspace", async () => {
    const workspaceId = UniqueEntityID.create().toValue();
    const command = makeCommand({ workspaceId, email: "pending@example.com" });
    await sut.execute(command);

    const result = await sut.execute(command);

    expect(result.value).toBeInstanceOf(InviteAlreadyPendingError);
    expect(inviteRepository.items).toHaveLength(1);
    expect(publisher.events).toHaveLength(1);
  });
});
