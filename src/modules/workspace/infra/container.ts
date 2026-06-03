import { container, Lifecycle } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { QueryBus } from "@/core/queries/query-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { CreateWorkspaceCommand } from "@/modules/workspace/application/commands/create-workspace/command";
import { CreateWorkspaceHandler } from "@/modules/workspace/application/commands/create-workspace/handler";
import { GetWorkspaceHandler } from "@/modules/workspace/application/queries/get-workspace/handler";
import { GetWorkspaceQuery } from "@/modules/workspace/application/queries/get-workspace/query";

import { setupDatabaseWorkspaceContainer } from "./db/container";
import { setupHTTPWorkspaceContainer } from "./http/container";

export function setupWorkspaceModule(): void {
  setupDatabaseWorkspaceContainer();

  container.register<CreateWorkspaceHandler>(
    InjectionTokens.Handlers.CreateWorkspace,
    { useClass: CreateWorkspaceHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<GetWorkspaceHandler>(
    InjectionTokens.Handlers.GetWorkspace,
    { useClass: GetWorkspaceHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  const commandBus = container.resolve<CommandBus>(InjectionTokens.Bus.Command);
  commandBus.register(
    CreateWorkspaceCommand,
    container.resolve<CreateWorkspaceHandler>(InjectionTokens.Handlers.CreateWorkspace),
  );

  const queryBus = container.resolve<QueryBus>(InjectionTokens.Bus.Query);
  queryBus.register(
    GetWorkspaceQuery,
    container.resolve<GetWorkspaceHandler>(InjectionTokens.Handlers.GetWorkspace),
  );

  setupHTTPWorkspaceContainer();
}
