import { container, Lifecycle } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { QueryBus } from "@/core/queries/query-bus";
import { InjectionTokens } from "@/infra/container/tokens";
import { ConsumerRegistry } from "@/infra/queue/consumer-registry";
import { CreateWorkspaceCommand } from "@/modules/workspace/application/commands/create-workspace/command";
import { CreateWorkspaceHandler } from "@/modules/workspace/application/commands/create-workspace/handler";
import { InviteMemberCommand } from "@/modules/workspace/application/commands/invite-member/command";
import { InviteMemberHandler } from "@/modules/workspace/application/commands/invite-member/handler";
import { RemoveWorkspaceMemberCommand } from "@/modules/workspace/application/commands/remove-workspace-member/command";
import { RemoveWorkspaceMemberHandler } from "@/modules/workspace/application/commands/remove-workspace-member/handler";
import { RespondToInviteCommand } from "@/modules/workspace/application/commands/respond-to-invite/command";
import { RespondToInviteHandler } from "@/modules/workspace/application/commands/respond-to-invite/handler";
import { SendInviteEmailCommand } from "@/modules/workspace/application/commands/send-invite-email/command";
import { SendInviteEmailHandler } from "@/modules/workspace/application/commands/send-invite-email/handler";
import { UpdateWorkspaceAvatarCommand } from "@/modules/workspace/application/commands/update-workspace-avatar/command";
import { UpdateWorkspaceAvatarHandler } from "@/modules/workspace/application/commands/update-workspace-avatar/handler";
import { UpdateWorkspaceMemberRoleCommand } from "@/modules/workspace/application/commands/update-workspace-member-role/command";
import { UpdateWorkspaceMemberRoleHandler } from "@/modules/workspace/application/commands/update-workspace-member-role/handler";
import { GetWorkspaceHandler } from "@/modules/workspace/application/queries/get-workspace/handler";
import { GetWorkspaceQuery } from "@/modules/workspace/application/queries/get-workspace/query";
import { ListWorkspaceInvitesHandler } from "@/modules/workspace/application/queries/list-workspace-invites/handler";
import { ListWorkspaceInvitesQuery } from "@/modules/workspace/application/queries/list-workspace-invites/query";
import { ListWorkspaceMembersHandler } from "@/modules/workspace/application/queries/list-workspace-members/handler";
import { ListWorkspaceMembersQuery } from "@/modules/workspace/application/queries/list-workspace-members/query";

import { setupCacheWorkspaceContainer } from "./cache/container";
import { setupCryptoWorkspaceContainer } from "./crypto/container";
import { setupDatabaseWorkspaceContainer } from "./db/container";
import { setupEmailWorkspaceContainer } from "./email/container";
import { setupHTTPWorkspaceContainer } from "./http/container";
import { WorkspaceInviteCreatedConsumer } from "./queue/consumers/workspace-invite-created.consumer";
import { WorkspacePersonalCreationRequestedConsumer } from "./queue/consumers/workspace-personal-creation-requested.consumer";
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
  commandBus.register(
    InviteMemberCommand,
    container.resolve<InviteMemberHandler>(InjectionTokens.Handlers.InviteMember),
  );
  commandBus.register(
    RespondToInviteCommand,
    container.resolve<RespondToInviteHandler>(InjectionTokens.Handlers.RespondToInvite),
  );
  commandBus.register(
    SendInviteEmailCommand,
    container.resolve<SendInviteEmailHandler>(InjectionTokens.Handlers.SendInviteEmail),
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
  queryBus.register(
    ListWorkspaceInvitesQuery,
    container.resolve<ListWorkspaceInvitesHandler>(InjectionTokens.Handlers.ListWorkspaceInvites),
  );
}

function registerWorkspaceHandlers(): void {
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

  container.register<InviteMemberHandler>(
    InjectionTokens.Handlers.InviteMember,
    { useClass: InviteMemberHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<RespondToInviteHandler>(
    InjectionTokens.Handlers.RespondToInvite,
    { useClass: RespondToInviteHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<SendInviteEmailHandler>(
    InjectionTokens.Handlers.SendInviteEmail,
    { useClass: SendInviteEmailHandler },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<ListWorkspaceInvitesHandler>(
    InjectionTokens.Handlers.ListWorkspaceInvites,
    { useClass: ListWorkspaceInvitesHandler },
    { lifecycle: Lifecycle.Singleton },
  );
}

export function setupWorkspaceModule(): void {
  setupCacheWorkspaceContainer();
  setupDatabaseWorkspaceContainer();
  setupCryptoWorkspaceContainer();
  setupEmailWorkspaceContainer();

  registerWorkspaceHandlers();
  wireWorkspaceBuses();

  setupHTTPWorkspaceContainer();
  setupQueueWorkspaceContainer();

  const registry = container.resolve<ConsumerRegistry>(InjectionTokens.Queue.ConsumerRegistry);
  registry.register(
    container.resolve<WorkspacePersonalCreationRequestedConsumer>(
      InjectionTokens.Consumers.WorkspacePersonalCreationRequested,
    ),
  );
  registry.register(
    container.resolve<WorkspaceInviteCreatedConsumer>(
      InjectionTokens.Consumers.WorkspaceInviteCreated,
    ),
  );
}
