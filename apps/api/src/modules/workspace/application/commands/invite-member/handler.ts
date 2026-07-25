import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { InjectionTokens } from "@/infra/container/tokens";
import { WorkspaceInvite } from "@/modules/workspace/domain/entities/workspace-invite";
import { InviteExpiry } from "@/modules/workspace/domain/value-objects/invite-expiry";
import { WorkspaceInviteStatuses } from "@/modules/workspace/domain/value-objects/workspace-invite-status";
import { UnitOfWork } from "@/shared/database/application/repositories/unit-of-work";
import { QueueEvents } from "@/shared/queue/application/events";
import { OutboxRepository } from "@/shared/queue/application/repositories/outbox.repository";

import { AlreadyAMemberError } from "../../errors/already-a-member.error";
import { InviteAlreadyPendingError } from "../../errors/invite-already-pending.error";
import { TokenGeneratorGateway } from "../../gateways/token-generator.gateway";
import { WorkspaceInviteRepository } from "../../repositories/workspace-invite.repository";
import { WorkspaceMemberRepository } from "../../repositories/workspace-member.repository";

import { InviteMemberCommand } from "./command";

type OnError = InviteAlreadyPendingError | AlreadyAMemberError;
type OnSuccess = { invite: WorkspaceInvite };
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class InviteMemberHandler implements CommandHandler<
  InviteMemberCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.WorkspaceInvite)
    private readonly inviteRepository: WorkspaceInviteRepository,
    @inject(InjectionTokens.Gateways.TokenGenerator)
    private readonly tokenGenerator: TokenGeneratorGateway,
    @inject(InjectionTokens.Repositories.WorkspaceMember)
    private readonly memberRepository: WorkspaceMemberRepository,
    @inject(InjectionTokens.Databases.UnitOfWork)
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public async execute(command: InviteMemberCommand): Output {
    const { workspaceId, invitedByAccountId, email, role } = command.props;

    const normalizedEmail = email.trim().toLowerCase();

    const isMember = await this.memberRepository.existsByEmailAndWorkspace(
      normalizedEmail,
      workspaceId,
    );

    if (isMember) {
      return left(new AlreadyAMemberError());
    }

    const existing = await this.inviteRepository.findPendingByEmailAndWorkspace(
      normalizedEmail,
      workspaceId,
    );

    if (existing) {
      return left(new InviteAlreadyPendingError());
    }

    const invite = WorkspaceInvite.create({
      workspaceId: UniqueEntityID.create(workspaceId),
      invitedByAccountId: UniqueEntityID.create(invitedByAccountId),
      email: normalizedEmail,
      role,
      token: this.tokenGenerator.generate(),
      status: WorkspaceInviteStatuses.Pending,
      expiresAt: InviteExpiry.create(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Invite row + its own outbox event land in one transaction — the
    // outbox relay publishes it afterward, so a crash right after commit
    // can delay the invitee's notification but never lose it silently
    // (see OutboxRelay).
    await this.unitOfWork.execute(async (scope) => {
      const invites = scope.get<WorkspaceInviteRepository>(
        InjectionTokens.Repositories.WorkspaceInvite,
      );
      const outbox = scope.get<OutboxRepository>(InjectionTokens.Queue.OutboxRepository);

      await invites.create(invite);

      await outbox.save({
        routingKey: QueueEvents.WorkspaceInvite.Created,
        payload: { inviteId: invite.id.toValue() },
      });
    });

    return right({ invite });
  }
}
