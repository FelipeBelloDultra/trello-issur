import { z } from "zod";

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]),
});

export type InviteMemberDto = z.infer<typeof InviteMemberSchema>;
