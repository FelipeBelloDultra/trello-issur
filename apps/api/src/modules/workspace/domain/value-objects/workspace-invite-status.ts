export type WorkspaceInviteStatus = "pending" | "accepted" | "rejected" | "expired";

export const WorkspaceInviteStatuses = {
  Pending: "pending",
  Accepted: "accepted",
  Rejected: "rejected",
  Expired: "expired",
} as const satisfies Record<string, WorkspaceInviteStatus>;
