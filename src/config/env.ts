import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // HTTP server
  PORT: z.coerce.number().default(3000),
});

export const env = EnvSchema.parse(process.env);
