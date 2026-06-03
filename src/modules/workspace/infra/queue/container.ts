import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { ConsumerRegistry } from "@/infra/queue/consumer-registry";

import { WorkspacePersonalCreationRequestedConsumer } from "./consumers/workspace-personal-creation-requested.consumer";

export function setupQueueWorkspaceContainer(): void {
  container.register<WorkspacePersonalCreationRequestedConsumer>(
    InjectionTokens.Consumers.WorkspacePersonalCreationRequested,
    { useClass: WorkspacePersonalCreationRequestedConsumer },
    { lifecycle: Lifecycle.Singleton },
  );

  const registry = container.resolve<ConsumerRegistry>(InjectionTokens.Queue.ConsumerRegistry);
  registry.register(
    container.resolve<WorkspacePersonalCreationRequestedConsumer>(
      InjectionTokens.Consumers.WorkspacePersonalCreationRequested,
    ),
  );
}
