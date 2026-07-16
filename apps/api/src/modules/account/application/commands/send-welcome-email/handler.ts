import { inject, injectable } from "tsyringe";

import { CommandHandler } from "@/core/commands/command-handler";
import { InjectionTokens } from "@/infra/container/tokens";

import { SendWelcomeEmailGateway } from "../../gateways/send-welcome-email.gateway";

import { SendWelcomeEmailCommand } from "./command";

@injectable()
export class SendWelcomeEmailHandler implements CommandHandler<SendWelcomeEmailCommand, void> {
  public constructor(
    @inject(InjectionTokens.Gateways.SendWelcomeEmail)
    private readonly sendWelcomeEmail: SendWelcomeEmailGateway,
  ) {}

  public async execute(command: SendWelcomeEmailCommand): Promise<void> {
    await this.sendWelcomeEmail.send(command.props.name, command.props.email);
  }
}
