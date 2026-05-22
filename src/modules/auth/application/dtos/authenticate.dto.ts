import { z } from "zod";

export const AuthenticateDto = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type AuthenticateInput = z.infer<typeof AuthenticateDto>;
