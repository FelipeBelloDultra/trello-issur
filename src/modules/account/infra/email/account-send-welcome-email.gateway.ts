import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { EmailGateway } from "@/infra/email/email.gateway";
import { renderWelcomeEmail } from "@/infra/email/templates/welcome-email";

import { SendWelcomeEmailGateway } from "../../application/gateways/send-welcome-email.gateway";

@injectable()
export class AccountSendWelcomeEmailGateway implements SendWelcomeEmailGateway {
  public constructor(
    @inject(InjectionTokens.Email.Gateway)
    private readonly emailGateway: EmailGateway,
  ) {}

  public async send(name: string, email: string): Promise<void> {
    const html = await renderWelcomeEmail(name);

    await this.emailGateway.send({
      to: email,
      subject: "Welcome to Trello Issur!",
      html,
    });
  }
}
