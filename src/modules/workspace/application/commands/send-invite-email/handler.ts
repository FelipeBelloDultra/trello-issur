import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { Either, left, right } from "@/core/either";
import { InjectionTokens } from "@/infra/container/tokens";

import { InviteNotFoundError } from "../../errors/invite-not-found.error";
import { SendInviteEmailGateway } from "../../gateways/send-invite-email.gateway";
import { WorkspaceInviteRepository } from "../../repositories/workspace-invite.repository";

import { SendInviteEmailCommand } from "./command";

type OnError = InviteNotFoundError;
type OnSuccess = void;
type Output = Promise<Either<OnError, OnSuccess>>;

@injectable()
export class SendInviteEmailHandler implements CommandHandler<
  SendInviteEmailCommand,
  Either<OnError, OnSuccess>
> {
  public constructor(
    @inject(InjectionTokens.Repositories.WorkspaceInvite)
    private readonly inviteRepository: WorkspaceInviteRepository,
    @inject(InjectionTokens.Gateways.SendInviteEmail)
    private readonly sendInviteEmail: SendInviteEmailGateway,
  ) {}

  public async execute(command: SendInviteEmailCommand): Output {
    const details = await this.inviteRepository.findDetailsById(command.inviteId);

    if (!details) {
      return left(new InviteNotFoundError());
    }

    await this.sendInviteEmail.send({
      invitedEmail: details.email,
      invitedByName: details.invitedByName,
      workspaceName: details.workspaceName,
      role: details.role,
      token: details.token,
      expiresAt: details.expiresAt,
    });

    return right();
  }
}
