import "dotenv/config";

import { defineConfig } from "drizzle-kit";

import { env } from "./src/config/env";

export default defineConfig({
  schema: "./src/infra/db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL },
});
