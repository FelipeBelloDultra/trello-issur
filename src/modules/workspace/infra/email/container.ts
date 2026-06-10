import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { SendInviteEmailGateway } from "@/modules/workspace/application/gateways/send-invite-email.gateway";

import { WorkspaceSendInviteEmailGateway } from "./send-invite-email.gateway";

export function setupEmailWorkspaceContainer(): void {
  container.register<SendInviteEmailGateway>(
    InjectionTokens.Gateways.SendInviteEmail,
    { useClass: WorkspaceSendInviteEmailGateway },
    { lifecycle: Lifecycle.Singleton },
  );
}
