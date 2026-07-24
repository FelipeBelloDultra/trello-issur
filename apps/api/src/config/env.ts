import os from "node:os";

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
    APP_URL: z.string().url().default("http://localhost:3000"),

    // CORS
    CORS_ORIGIN: z.string().default("*"),

    // Auth
    JWT_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES: z.string().default("15m"),
    JWT_REFRESH_EXPIRES: z.string().default("7d"),

    // Circuit breaker (Valkey + Postgres) — provisional defaults, no production
    // failure data to calibrate against yet; revisit once there is some.
    CIRCUIT_BREAKER_TIMEOUT_MS: z.coerce.number().min(1).default(3000),
    CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENTAGE: z.coerce.number().min(1).max(100).default(50),
    CIRCUIT_BREAKER_RESET_TIMEOUT_MS: z.coerce.number().min(1).default(10_000),
    CIRCUIT_BREAKER_VOLUME_THRESHOLD: z.coerce.number().min(1).default(10),

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

    // Queue (RabbitMQ)
    RABBITMQ_URL: z.string().url().default("amqp://guest:guest@localhost:5672"),
    RABBITMQ_PREFETCH: z.coerce.number().min(1).default(10),
    OUTBOX_RELAY_INTERVAL_MS: z.coerce.number().min(1).default(5000),

    // Email (SMTP)
    SMTP_HOST: z.string().min(1).default("localhost"),
    SMTP_PORT: z.coerce.number().default(1025),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().email().default("noreply@trello-issur.dev"),

    // Storage
    STORAGE_DRIVER: z.enum(["s3", "local"]).default("local"),
    S3_BUCKET: z.string().optional(),
    S3_REGION: z.string().default("us-east-1"),
    S3_ENDPOINT: z.string().url().optional(),
    S3_ACCESS_KEY: z.string().optional(),
    S3_SECRET_KEY: z.string().optional(),
    S3_PUBLIC_URL: z.string().optional(),
    STORAGE_LOCAL_PATH: z.string().default("./uploads"),
    STORAGE_LOCAL_BASE_URL: z.string().default("http://localhost:3000/uploads"),
  })
  .superRefine((data, ctx) => {
    if (data.STORAGE_DRIVER !== "s3") return;

    const required = {
      S3_BUCKET: data.S3_BUCKET,
      S3_ACCESS_KEY: data.S3_ACCESS_KEY,
      S3_SECRET_KEY: data.S3_SECRET_KEY,
      S3_PUBLIC_URL: data.S3_PUBLIC_URL,
    };

    for (const [key, value] of Object.entries(required)) {
      if (value === undefined) {
        ctx.addIssue({ code: "custom", path: [key], message: "Required when STORAGE_DRIVER=s3." });
      }
    }
  })
  .transform((data) => ({
    ...data,
    DATABASE_URL: `postgresql://${data.DB_USER}:${data.DB_PASSWORD}@${data.DB_HOST}:${data.DB_PORT}/${data.DB_NAME}`,
  }))
  .parse(process.env);
