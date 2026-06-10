import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { renderInviteEmail } from "@/infra/email/templates/invite-email";
import {
  SendInviteEmailGateway,
  SendInviteEmailOptions,
} from "@/modules/workspace/application/gateways/send-invite-email.gateway";
import { EmailGateway } from "@/shared/email/application/gateways/email.gateway";

@injectable()
export class WorkspaceSendInviteEmailGateway implements SendInviteEmailGateway {
  public constructor(
    @inject(InjectionTokens.Email.Gateway)
    private readonly emailGateway: EmailGateway,
  ) {}

  public async send(options: SendInviteEmailOptions): Promise<void> {
    const html = await renderInviteEmail({
      invitedByName: options.invitedByName,
      workspaceName: options.workspaceName,
      role: options.role,
      token: options.token,
      expiresAt: options.expiresAt,
    });

    await this.emailGateway.send({
      to: options.invitedEmail,
      subject: `You have been invited to join ${options.workspaceName}`,
      html,
    });
  }
}
