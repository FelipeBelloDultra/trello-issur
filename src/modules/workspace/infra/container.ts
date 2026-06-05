import { container, Lifecycle } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { QueryBus } from "@/core/queries/query-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { CreateWorkspaceCommand } from "@/modules/workspace/application/commands/create-workspace/command";
import { CreateWorkspaceHandler } from "@/modules/workspace/application/commands/create-workspace/handler";
import { RemoveWorkspaceMemberCommand } from "@/modules/workspace/application/commands/remove-workspace-member/command";
import { RemoveWorkspaceMemberHandler } from "@/modules/workspace/application/commands/remove-workspace-member/handler";
import { UpdateWorkspaceAvatarCommand } from "@/modules/workspace/application/commands/update-workspace-avatar/command";
import { UpdateWorkspaceAvatarHandler } from "@/modules/workspace/application/commands/update-workspace-avatar/handler";
import { UpdateWorkspaceMemberRoleCommand } from "@/modules/workspace/application/commands/update-workspace-member-role/command";
import { UpdateWorkspaceMemberRoleHandler } from "@/modules/workspace/application/commands/update-workspace-member-role/handler";
import { GetWorkspaceHandler } from "@/modules/workspace/application/queries/get-workspace/handler";
import { GetWorkspaceQuery } from "@/modules/workspace/application/queries/get-workspace/query";
import { ListWorkspaceMembersHandler } from "@/modules/workspace/application/queries/list-workspace-members/handler";
import { ListWorkspaceMembersQuery } from "@/modules/workspace/application/queries/list-workspace-members/query";

import { setupCacheWorkspaceContainer } from "./cache/container";
import { setupDatabaseWorkspaceContainer } from "./db/container";
import { setupHTTPWorkspaceContainer } from "./http/container";
import { setupQueueWorkspaceContainer } from "./queue/container";

function wireWorkspaceBuses(): void {
  const commandBus = container.resolve<CommandBus>(InjectionTokens.Bus.Command);
  commandBus.register(
    CreateWorkspaceCommand,
    container.resolve<CreateWorkspaceHandler>(InjectionTokens.Handlers.CreateWorkspace),
  );
  commandBus.register(
    UpdateWorkspaceAvatarCommand,
    container.resolve<UpdateWorkspaceAvatarHandler>(InjectionTokens.Handlers.UpdateWorkspaceAvatar),
  );
  commandBus.register(
    RemoveWorkspaceMemberCommand,
    container.resolve<RemoveWorkspaceMemberHandler>(InjectionTokens.Handlers.RemoveWorkspaceMember),
  );
  commandBus.register(
    UpdateWorkspaceMemberRoleCommand,
    container.resolve<UpdateWorkspaceMemberRoleHandler>(
      InjectionTokens.Handlers.UpdateWorkspaceMemberRole,
    ),
  );

  const queryBus = container.resolve<QueryBus>(InjectionTokens.Bus.Query);
  queryBus.register(
    GetWorkspaceQuery,
    container.resolve<GetWorkspaceHandler>(InjectionTokens.Handlers.GetWorkspace),
  );
  queryBus.register(
    ListWorkspaceMembersQuery,
    container.resolve<ListWorkspaceMembersHandler>(InjectionTokens.Handlers.ListWorkspaceMembers),
  );
}

export function setupWorkspaceModule(): void {
  setupCacheWorkspaceContainer();
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

  container.register<UpdateWorkspaceAvatarHandler>(
    InjectionTokens.Handlers.UpdateWorkspaceAvatar,
    { useClass: UpdateWorkspaceAvatarHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<ListWorkspaceMembersHandler>(
    InjectionTokens.Handlers.ListWorkspaceMembers,
    { useClass: ListWorkspaceMembersHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<RemoveWorkspaceMemberHandler>(
    InjectionTokens.Handlers.RemoveWorkspaceMember,
    { useClass: RemoveWorkspaceMemberHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<UpdateWorkspaceMemberRoleHandler>(
    InjectionTokens.Handlers.UpdateWorkspaceMemberRole,
    { useClass: UpdateWorkspaceMemberRoleHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  wireWorkspaceBuses();

  setupHTTPWorkspaceContainer();
  setupQueueWorkspaceContainer();
}
