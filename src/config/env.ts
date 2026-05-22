import os from "os";

import { z } from "zod";

export const env = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    INSTANCE_ID: z.string().default(os.hostname()),

    // Logging
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

    // Tracing
    OTEL_ENDPOINT: z.string().url().optional(),

    // HTTP server
    HTTP_SERVER_PORT: z.coerce.number().default(3000),

    // CORS
    CORS_ORIGIN: z.string().default("*"),

    // Auth
    JWT_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES: z.string().default("15m"),
    JWT_REFRESH_EXPIRES: z.string().default("7d"),

    // Valkey
    VALKEY_URL: z.string().url().default("redis://localhost:6379"),

    // Database
    DB_HOST: z.string().min(1).default("localhost"),
    DB_PORT: z.coerce.number().default(5432),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),
    DB_POOL_MAX: z.coerce.number().min(1).default(10),
    DB_IDLE_TIMEOUT: z.coerce.number().min(0).default(30),
    DB_CONNECT_TIMEOUT: z.coerce.number().min(1).default(10),
  })
  .transform((data) => ({
    ...data,
    DATABASE_URL: `postgresql://${data.DB_USER}:${data.DB_PASSWORD}@${data.DB_HOST}:${data.DB_PORT}/${data.DB_NAME}`,
  }))
  .parse(process.env);
