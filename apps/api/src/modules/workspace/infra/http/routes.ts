import { InjectionTokens } from "@/infra/container/tokens";

export const workspaceControllers = [
  InjectionTokens.Controllers.CreateWorkspace,
  InjectionTokens.Controllers.GetWorkspace,
  InjectionTokens.Controllers.UpdateWorkspaceAvatar,
  InjectionTokens.Controllers.ListWorkspaceMembers,
  InjectionTokens.Controllers.ListMyWorkspaces,
  InjectionTokens.Controllers.GetMyWorkspaceMembership,
  InjectionTokens.Controllers.RemoveWorkspaceMember,
  InjectionTokens.Controllers.UpdateWorkspaceMemberRole,
  InjectionTokens.Controllers.InviteMember,
  InjectionTokens.Controllers.ListWorkspaceInvites,
  InjectionTokens.Controllers.RespondToInvite,
];
