import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "password is required"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
