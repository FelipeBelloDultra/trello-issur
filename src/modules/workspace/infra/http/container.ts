import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { CreateWorkspaceController } from "./controllers/create-workspace.controller";
import { GetWorkspaceController } from "./controllers/get-workspace.controller";
import { ListWorkspaceMembersController } from "./controllers/list-workspace-members.controller";
import { RemoveWorkspaceMemberController } from "./controllers/remove-workspace-member.controller";
import { UpdateWorkspaceAvatarController } from "./controllers/update-workspace-avatar.controller";
import { UpdateWorkspaceMemberRoleController } from "./controllers/update-workspace-member-role.controller";

export function setupHTTPWorkspaceContainer(): void {
  container.register<CreateWorkspaceController>(
    InjectionTokens.Controllers.CreateWorkspace,
    { useClass: CreateWorkspaceController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<GetWorkspaceController>(
    InjectionTokens.Controllers.GetWorkspace,
    { useClass: GetWorkspaceController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<UpdateWorkspaceAvatarController>(
    InjectionTokens.Controllers.UpdateWorkspaceAvatar,
    { useClass: UpdateWorkspaceAvatarController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<ListWorkspaceMembersController>(
    InjectionTokens.Controllers.ListWorkspaceMembers,
    { useClass: ListWorkspaceMembersController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<RemoveWorkspaceMemberController>(
    InjectionTokens.Controllers.RemoveWorkspaceMember,
    { useClass: RemoveWorkspaceMemberController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<UpdateWorkspaceMemberRoleController>(
    InjectionTokens.Controllers.UpdateWorkspaceMemberRole,
    { useClass: UpdateWorkspaceMemberRoleController },
    { lifecycle: Lifecycle.Singleton },
  );
}
