import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { NodemailerEmailGateway } from "./adapters/nodemailer/nodemailer-email.gateway";
import { EmailGateway } from "./email.gateway";

export function setupEmailContainer(): void {
  container.register<EmailGateway>(
    InjectionTokens.Email.Gateway,
    { useClass: NodemailerEmailGateway },
    { lifecycle: Lifecycle.Singleton },
  );
}
