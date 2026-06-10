import { z } from "zod";

export const RespondToInviteSchema = z.object({
  action: z.enum(["accept", "reject"]),
});

export type RespondToInviteDto = z.infer<typeof RespondToInviteSchema>;
