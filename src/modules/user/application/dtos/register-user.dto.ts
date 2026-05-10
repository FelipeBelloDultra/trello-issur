import { z } from "zod";

export const RegisterUserDto = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
});

export type RegisterUserInput = z.infer<typeof RegisterUserDto>;
