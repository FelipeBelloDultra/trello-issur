import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { WorkspaceInviteAcceptedConsumer } from "./consumers/workspace-invite-accepted.consumer";
import { WorkspaceInviteCreatedConsumer } from "./consumers/workspace-invite-created.consumer";
import { WorkspaceInviteRejectedConsumer } from "./consumers/workspace-invite-rejected.consumer";

export function setupQueueWorkspaceContainer(): void {
  container.register<WorkspaceInviteCreatedConsumer>(
    InjectionTokens.Consumers.WorkspaceInviteCreated,
    { useClass: WorkspaceInviteCreatedConsumer },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<WorkspaceInviteAcceptedConsumer>(
    InjectionTokens.Consumers.WorkspaceInviteAccepted,
    { useClass: WorkspaceInviteAcceptedConsumer },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<WorkspaceInviteRejectedConsumer>(
    InjectionTokens.Consumers.WorkspaceInviteRejected,
    { useClass: WorkspaceInviteRejectedConsumer },
    { lifecycle: Lifecycle.Singleton },
  );
}
