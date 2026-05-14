import { z } from "zod";

export const LogoutDto = z.object({
  refreshToken: z.string().min(1),
});

export type LogoutInput = z.infer<typeof LogoutDto>;
