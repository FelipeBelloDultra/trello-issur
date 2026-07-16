import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { WorkspaceInviteCreatedConsumer } from "./consumers/workspace-invite-created.consumer";
import { WorkspacePersonalCreationRequestedConsumer } from "./consumers/workspace-personal-creation-requested.consumer";

export function setupQueueWorkspaceContainer(): void {
  container.register<WorkspacePersonalCreationRequestedConsumer>(
    InjectionTokens.Consumers.WorkspacePersonalCreationRequested,
    { useClass: WorkspacePersonalCreationRequestedConsumer },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<WorkspaceInviteCreatedConsumer>(
    InjectionTokens.Consumers.WorkspaceInviteCreated,
    { useClass: WorkspaceInviteCreatedConsumer },
    { lifecycle: Lifecycle.Singleton },
  );
}
