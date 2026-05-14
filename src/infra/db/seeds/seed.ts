import "dotenv/config";

import { databaseClient } from "@/infra/db/client";

import { createPermissions } from "./create-permissions";
import { createRoles } from "./create-roles";

type SeedFn = () => Promise<void>;

const seeds: Record<string, SeedFn> = {
  "create-permissions": createPermissions,
  "create-roles": createRoles,
};

async function main(): Promise<void> {
  const command = process.argv[2];
  const run = command !== undefined ? seeds[command] : undefined;

  if (run === undefined) {
    process.stderr.write(
      `Unknown seed: "${command ?? ""}". Available: ${Object.keys(seeds).join(", ")}\n`,
    );
    process.exit(1);
  }

  databaseClient.connect();

  try {
    await run();
  } finally {
    await databaseClient.disconnect();
  }

  process.exit(0);
}

main().catch((err: unknown) => {
  process.stderr.write(`${String(err)}\n`);
  process.exit(1);
});
