import { cors } from "@elysiajs/cors";

import { env } from "@/config/env";

const origins = env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map((o) => o.trim());

export const corsPlugin = cors({
  origin: origins,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  maxAge: 86400,
});
