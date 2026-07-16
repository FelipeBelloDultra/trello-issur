import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";

import { CreateWorkspaceController } from "./controllers/create-workspace.controller";
import { GetWorkspaceController } from "./controllers/get-workspace.controller";
import { InviteMemberController } from "./controllers/invite-member.controller";
import { ListWorkspaceInvitesController } from "./controllers/list-workspace-invites.controller";
import { ListWorkspaceMembersController } from "./controllers/list-workspace-members.controller";
import { RemoveWorkspaceMemberController } from "./controllers/remove-workspace-member.controller";
import { RespondToInviteController } from "./controllers/respond-to-invite.controller";
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

  container.register<InviteMemberController>(
    InjectionTokens.Controllers.InviteMember,
    { useClass: InviteMemberController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<RespondToInviteController>(
    InjectionTokens.Controllers.RespondToInvite,
    { useClass: RespondToInviteController },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<ListWorkspaceInvitesController>(
    InjectionTokens.Controllers.ListWorkspaceInvites,
    { useClass: ListWorkspaceInvitesController },
    { lifecycle: Lifecycle.Singleton },
  );
}
