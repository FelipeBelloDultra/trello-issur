import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { WorkspaceInvite } from "@/modules/workspace/domain/entities/workspace-invite";
import { UnitOfWork } from "@/shared/database/application/repositories/unit-of-work";
import { QueueEvents } from "@/shared/queue/application/events";
import { OutboxRepository } from "@/shared/queue/application/repositories/outbox.repository";

import { AlreadyAMemberError } from "../../errors/already-a-member.error";
import { InvalidInviteActionError } from "../../errors/invalid-invite-action.error";
import { InviteAlreadyUsedError } from "../../errors/invite-already-used.error";
import { InviteEmailMismatchError } from "../../errors/invite-email-mismatch.error";
import { InviteExpiredError } from "../../errors/invite-expired.error";
import { InviteNotFoundError } from "../../errors/invite-not-found.error";
import { WorkspaceInviteRepository } from "../../repositories/workspace-invite.repository";
import { WorkspaceMemberRepository } from "../../repositories/workspace-member.repository";

import { RespondToInviteCommand, RespondToInviteProps } from "./command";

type OnError =
  | InviteNotFoundError
  | InviteExpiredError
  | InviteAlreadyUsedError
  | InviteEmailMismatchError
  | AlreadyAMemberError
  | InvalidInviteActionError;
type OnSuccess = void;
type Output = Promise<Either<OnError, OnSuccess>>;
type Strategy = (invite: WorkspaceInvite, accountId: string) => Output;

@injectable()
export class RespondToInviteHandler implements CommandHandler<
  RespondToInviteCommand,
  Either<OnError, OnSuccess>
> {
  private readonly strategies: Record<RespondToInviteProps["action"], Strategy>;

  public constructor(
    @inject(InjectionTokens.Repositories.WorkspaceInvite)
    private readonly inviteRepository: WorkspaceInviteRepository,
    @inject(InjectionTokens.Databases.UnitOfWork)
    private readonly unitOfWork: UnitOfWork,
  ) {
    this.strategies = {
      accept: (invite, accountId) => this.accept(invite, accountId),
      reject: (invite) => this.reject(invite),
    };
  }

  public async execute(command: RespondToInviteCommand): Output {
    const { token, accountId, accountEmail, action } = command.props;

    const strategy = this.strategies[action];

    if (!strategy) {
      return left(new InvalidInviteActionError());
    }

    const invite = await this.inviteRepository.findByToken(token);

    if (!invite) {
      return left(new InviteNotFoundError());
    }

    if (!invite.isPending()) {
      return left(new InviteAlreadyUsedError());
    }

    if (invite.isExpired()) {
      return left(new InviteExpiredError());
    }

    if (invite.email !== accountEmail.trim().toLowerCase()) {
      return left(new InviteEmailMismatchError());
    }

    return strategy(invite, accountId);
  }

  private async accept(invite: WorkspaceInvite, accountId: string): Output {
    // Membership + invite status + its own outbox event land in one
    // transaction — the outbox relay publishes it afterward, so a crash
    // right after commit can delay the inviter's notification but never
    // lose it silently (see OutboxRelay).
    const created = await this.unitOfWork.execute(async (scope) => {
      const members = scope.get<WorkspaceMemberRepository>(
        InjectionTokens.Repositories.WorkspaceMember,
      );
      const invites = scope.get<WorkspaceInviteRepository>(
        InjectionTokens.Repositories.WorkspaceInvite,
      );
      const outbox = scope.get<OutboxRepository>(InjectionTokens.Queue.OutboxRepository);

      const created = await members.create({
        workspaceId: invite.workspaceId.toValue(),
        accountId,
        role: invite.role,
      });

      if (!created) return false;

      invite.accept();
      await invites.save(invite);

      await outbox.save({
        routingKey: QueueEvents.WorkspaceInvite.Accepted,
        payload: { inviteId: invite.id.toValue(), accountId },
      });

      return true;
    });

    if (!created) {
      return left(new AlreadyAMemberError());
    }

    return right(undefined);
  }

  private async reject(invite: WorkspaceInvite): Output {
    invite.reject();
    await this.inviteRepository.save(invite);

    return right(undefined);
  }
}
