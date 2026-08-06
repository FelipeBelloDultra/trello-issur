import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { InjectionTokens } from "@/infra/container/tokens";
import { InviteExpiry } from "@/modules/workspace/domain/value-objects/invite-expiry";
import { WorkspaceInviteStatuses } from "@/modules/workspace/domain/value-objects/workspace-invite-status";
import { WorkspaceMemberRoles } from "@/modules/workspace/domain/value-objects/workspace-member-role";
import { QueueEvents } from "@/shared/queue/application/events";
import { makeWorkspaceInvite } from "@/test/factories/make-workspace-invite";
import { InMemoryOutboxRepository } from "@/test/repositories/in-memory-outbox.repository";
import { InMemoryUnitOfWork } from "@/test/repositories/in-memory-unit-of-work";
import { InMemoryWorkspaceInviteRepository } from "@/test/repositories/in-memory-workspace-invite.repository";
import { InMemoryWorkspaceMemberRepository } from "@/test/repositories/in-memory-workspace-member.repository";

import { AlreadyAMemberError } from "../../errors/already-a-member.error";
import { InvalidInviteActionError } from "../../errors/invalid-invite-action.error";
import { InviteAlreadyUsedError } from "../../errors/invite-already-used.error";
import { InviteEmailMismatchError } from "../../errors/invite-email-mismatch.error";
import { InviteExpiredError } from "../../errors/invite-expired.error";
import { InviteNotFoundError } from "../../errors/invite-not-found.error";

import { RespondToInviteCommand, RespondToInviteProps } from "./command";
import { RespondToInviteHandler } from "./handler";

describe("RespondToInviteHandler", () => {
  let inviteRepository: InMemoryWorkspaceInviteRepository;
  let memberRepository: InMemoryWorkspaceMemberRepository;
  let outboxRepository: InMemoryOutboxRepository;
  let unitOfWork: InMemoryUnitOfWork;
  let sut: RespondToInviteHandler;

  beforeEach(() => {
    inviteRepository = new InMemoryWorkspaceInviteRepository();
    memberRepository = new InMemoryWorkspaceMemberRepository();
    outboxRepository = new InMemoryOutboxRepository();
    unitOfWork = new InMemoryUnitOfWork(
      new Map<symbol, unknown>([
        [InjectionTokens.Repositories.WorkspaceMember, memberRepository],
        [InjectionTokens.Repositories.WorkspaceInvite, inviteRepository],
        [InjectionTokens.Queue.OutboxRepository, outboxRepository],
      ]),
    );
    sut = new RespondToInviteHandler(inviteRepository, unitOfWork);
  });

  it("accepts a pending invite, creates the membership and publishes WorkspaceInvite.Accepted", async () => {
    const accountId = UniqueEntityID.create().toValue();
    const email = faker.internet.email().toLowerCase();
    const invite = makeWorkspaceInvite({ email });
    inviteRepository.items.push(invite);

    const result = await sut.execute(
      new RespondToInviteCommand({
        token: invite.token,
        accountId,
        accountEmail: email,
        action: "accept",
      }),
    );

    expect(result.isRight()).toBe(true);
    expect(memberRepository.items).toHaveLength(1);
    expect(memberRepository.items[0]?.accountId).toBe(accountId);
    expect(memberRepository.items[0]?.workspaceId).toBe(invite.workspaceId.toValue());
    expect(inviteRepository.items[0]?.status).toBe("accepted");
    expect(outboxRepository.items).toHaveLength(1);
    expect(outboxRepository.items[0]?.routingKey).toBe(QueueEvents.WorkspaceInvite.Accepted);
    expect(outboxRepository.items[0]?.payload).toEqual({
      inviteId: invite.id.toValue(),
      accountId,
    });
  });

  it("rejects a pending invite without creating a membership or publishing an event", async () => {
    const email = faker.internet.email().toLowerCase();
    const invite = makeWorkspaceInvite({ email });
    inviteRepository.items.push(invite);

    const result = await sut.execute(
      new RespondToInviteCommand({
        token: invite.token,
        accountId: UniqueEntityID.create().toValue(),
        accountEmail: email,
        action: "reject",
      }),
    );

    expect(result.isRight()).toBe(true);
    expect(memberRepository.items).toHaveLength(0);
    expect(inviteRepository.items[0]?.status).toBe("rejected");
    expect(outboxRepository.items).toHaveLength(0);
  });

  it("returns InviteNotFoundError when the token doesn't match any invite", async () => {
    const result = await sut.execute(
      new RespondToInviteCommand({
        token: "unknown-token",
        accountId: UniqueEntityID.create().toValue(),
        accountEmail: faker.internet.email(),
        action: "accept",
      }),
    );

    expect(result.value).toBeInstanceOf(InviteNotFoundError);
  });

  it("returns InviteAlreadyUsedError when the invite is no longer pending", async () => {
    const email = faker.internet.email().toLowerCase();
    const invite = makeWorkspaceInvite({ email, status: WorkspaceInviteStatuses.Accepted });
    inviteRepository.items.push(invite);

    const result = await sut.execute(
      new RespondToInviteCommand({
        token: invite.token,
        accountId: UniqueEntityID.create().toValue(),
        accountEmail: email,
        action: "accept",
      }),
    );

    expect(result.value).toBeInstanceOf(InviteAlreadyUsedError);
  });

  it("returns InviteExpiredError when the invite has expired", async () => {
    const email = faker.internet.email().toLowerCase();
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1);
    const invite = makeWorkspaceInvite({ email, expiresAt: InviteExpiry.restore(expiredDate) });
    inviteRepository.items.push(invite);

    const result = await sut.execute(
      new RespondToInviteCommand({
        token: invite.token,
        accountId: UniqueEntityID.create().toValue(),
        accountEmail: email,
        action: "accept",
      }),
    );

    expect(result.value).toBeInstanceOf(InviteExpiredError);
  });

  it("returns InviteEmailMismatchError when the responder's email differs from the invite's", async () => {
    const invite = makeWorkspaceInvite({ email: "invited@example.com" });
    inviteRepository.items.push(invite);

    const result = await sut.execute(
      new RespondToInviteCommand({
        token: invite.token,
        accountId: UniqueEntityID.create().toValue(),
        accountEmail: "someone-else@example.com",
        action: "accept",
      }),
    );

    expect(result.value).toBeInstanceOf(InviteEmailMismatchError);
  });

  it("returns AlreadyAMemberError when accepting and the account is already a member (race)", async () => {
    const accountId = UniqueEntityID.create().toValue();
    const email = faker.internet.email().toLowerCase();
    const invite = makeWorkspaceInvite({ email });
    inviteRepository.items.push(invite);
    memberRepository.items.push({
      id: UniqueEntityID.create().toValue(),
      workspaceId: invite.workspaceId.toValue(),
      accountId,
      role: WorkspaceMemberRoles.Member,
    });

    const result = await sut.execute(
      new RespondToInviteCommand({
        token: invite.token,
        accountId,
        accountEmail: email,
        action: "accept",
      }),
    );

    expect(result.value).toBeInstanceOf(AlreadyAMemberError);
    expect(inviteRepository.items[0]?.status).toBe("pending");
    expect(outboxRepository.items).toHaveLength(0);
  });

  it("returns InvalidInviteActionError for an unrecognized action", async () => {
    const email = faker.internet.email().toLowerCase();
    const invite = makeWorkspaceInvite({ email });
    inviteRepository.items.push(invite);

    const result = await sut.execute(
      new RespondToInviteCommand({
        token: invite.token,
        accountId: UniqueEntityID.create().toValue(),
        accountEmail: email,
        action: "cancel" as unknown as RespondToInviteProps["action"],
      }),
    );

    expect(result.value).toBeInstanceOf(InvalidInviteActionError);
  });
});
