import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { SendWelcomeEmailGateway } from "../../application/gateways/send-welcome-email.gateway";

import { AccountSendWelcomeEmailGateway } from "./account-send-welcome-email.gateway";

export function setupEmailAccountContainer(): void {
  container.register<SendWelcomeEmailGateway>(
    InjectionTokens.Gateways.SendWelcomeEmail,
    { useClass: AccountSendWelcomeEmailGateway },
    { lifecycle: Lifecycle.Singleton },
  );
}
