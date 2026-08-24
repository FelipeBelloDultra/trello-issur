export const QueueEvents = {
  Account: {
    Created: "account.created",
  },
  WorkspaceInvite: {
    Created: "workspace-invite.created",
    Accepted: "workspace-invite.accepted",
    Rejected: "workspace-invite.rejected",
  },
} as const;
