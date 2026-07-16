import { z } from "zod";

export const UpdateWorkspaceMemberRoleSchema = z.object({
  role: z.enum(["admin", "member", "viewer"]),
});

export type UpdateWorkspaceMemberRoleDto = z.infer<typeof UpdateWorkspaceMemberRoleSchema>;
