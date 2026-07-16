export type WorkspaceMemberRole = "owner" | "admin" | "member" | "viewer";

export const WorkspaceMemberRoles = {
  Owner: "owner",
  Admin: "admin",
  Member: "member",
  Viewer: "viewer",
} as const satisfies Record<string, WorkspaceMemberRole>;
