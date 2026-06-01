import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { EmailGateway } from "@/infra/email/email.gateway";

import { SendWelcomeEmailGateway } from "../../application/gateways/send-welcome-email.gateway";

function buildHtml(name: string): string {
  return `
    <h1>Welcome to Trello Issur, ${name}!</h1>
    <p>Your account has been created successfully.</p>
    <p>Start managing your projects and collaborating with your team today.</p>
  `;
}

@injectable()
export class AccountSendWelcomeEmailGateway implements SendWelcomeEmailGateway {
  public constructor(
    @inject(InjectionTokens.Email.Gateway)
    private readonly emailGateway: EmailGateway,
  ) {}

  public async send(name: string, email: string): Promise<void> {
    await this.emailGateway.send({
      to: email,
      subject: "Welcome to Trello Issur!",
      html: buildHtml(name),
    });
  }
}
