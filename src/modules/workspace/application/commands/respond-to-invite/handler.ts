import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";
import { WorkspaceInvite } from "@/modules/workspace/domain/entities/workspace-invite";
import { QueueEvents } from "@/shared/queue/application/events";
import { QueuePublisherGateway } from "@/shared/queue/application/gateways/queue-publisher.gateway";

import { AlreadyAMemberError } from "../../errors/already-a-member.error";
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
  | AlreadyAMemberError;
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
    @inject(InjectionTokens.Repositories.WorkspaceMember)
    private readonly memberRepository: WorkspaceMemberRepository,
    @inject(InjectionTokens.Queue.Publisher)
    private readonly publisher: QueuePublisherGateway,
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
      throw new Error(`unknown invite action: ${action}`);
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
    const existingMember = await this.memberRepository.findByAccountAndWorkspace(
      accountId,
      invite.workspaceId.toValue(),
    );

    if (existingMember) {
      return left(new AlreadyAMemberError());
    }

    await this.memberRepository.create({
      workspaceId: invite.workspaceId.toValue(),
      accountId,
      role: invite.role,
    });

    invite.accept();
    await this.inviteRepository.save(invite);

    this.publisher.publish(QueueEvents.WorkspaceInvite.Accepted, {
      workspaceId: invite.workspaceId.toValue(),
      accountId,
    });

    return right(undefined);
  }

  private async reject(invite: WorkspaceInvite): Output {
    invite.reject();
    await this.inviteRepository.save(invite);

    return right(undefined);
  }
}
