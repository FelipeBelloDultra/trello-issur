import { InjectionTokens } from "@/infra/container/tokens";

export const workspaceControllers = [
  InjectionTokens.Controllers.CreateWorkspace,
  InjectionTokens.Controllers.GetWorkspace,
  InjectionTokens.Controllers.UpdateWorkspaceAvatar,
  InjectionTokens.Controllers.ListWorkspaceMembers,
  InjectionTokens.Controllers.RemoveWorkspaceMember,
  InjectionTokens.Controllers.UpdateWorkspaceMemberRole,
];
