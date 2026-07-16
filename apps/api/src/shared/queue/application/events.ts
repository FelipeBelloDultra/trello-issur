export const QueueEvents = {
  Account: {
    Created: "account.created",
  },
  Workspace: {
    PersonalCreationRequested: "workspace.personal-creation-requested",
  },
  WorkspaceInvite: {
    Created: "workspace-invite.created",
    Accepted: "workspace-invite.accepted",
  },
} as const;
