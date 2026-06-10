import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { UniqueEntityID } from "@/core/entity/unique-entity-id";
import { InjectionTokens } from "@/infra/container/tokens";
import { WorkspaceInvite } from "@/modules/workspace/domain/entities/workspace-invite";
import { InviteExpiry } from "@/modules/workspace/domain/value-objects/invite-expiry";
import { WorkspaceInviteStatuses } from "@/modules/workspace/domain/value-objects/workspace-invite-status";
import { QueueEvents } from "@/shared/queue/application/events";
import { QueuePublisherGateway } from "@/shared/queue/application/gateways/queue-publisher.gateway";

import { InviteAlreadyPendingError } from "../../errors/invite-already-pending.error";
import { TokenGeneratorGateway } from "../../gateways/token-generator.gateway";
import { WorkspaceInviteRepository } from "../../repositories/workspace-invite.repository";

import { InviteMemberCommand } from "./command";

type OnError = InviteAlreadyPendingError;
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
    @inject(InjectionTokens.Queue.Publisher)
    private readonly publisher: QueuePublisherGateway,
  ) {}

  public async execute(command: InviteMemberCommand): Output {
    const { workspaceId, invitedByAccountId, email, role } = command.props;

    const normalizedEmail = email.trim().toLowerCase();

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

    await this.inviteRepository.create(invite);

    this.publisher.publish(QueueEvents.WorkspaceInvite.Created, {
      inviteId: invite.id.toValue(),
    });

    return right({ invite });
  }
}
