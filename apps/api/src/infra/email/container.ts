import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { EmailGateway } from "@/shared/email/application/gateways/email.gateway";

import { NodemailerEmailGateway } from "./adapters/nodemailer/nodemailer-email.gateway";

export function setupEmailContainer(): void {
  container.register<EmailGateway>(
    InjectionTokens.Email.Gateway,
    { useClass: NodemailerEmailGateway },
    { lifecycle: Lifecycle.Singleton },
  );
}
