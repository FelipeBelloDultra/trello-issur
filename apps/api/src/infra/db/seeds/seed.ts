import "dotenv/config";

import { DatabaseClient } from "@/infra/db/client";

import { createPermissions } from "./create-permissions";
import { createRoles } from "./create-roles";

type SeedFn = (client: DatabaseClient) => Promise<void>;

async function bootstrap(client: DatabaseClient): Promise<void> {
  await createPermissions(client);
  await createRoles(client);
}

const seeds: Record<string, SeedFn> = {
  bootstrap,
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

  const client = new DatabaseClient();
  client.connect();

  try {
    await run(client);
  } finally {
    await client.disconnect();
  }

  process.exit(0);
}

main().catch((err: unknown) => {
  process.stderr.write(`${String(err)}\n`);
  process.exit(1);
});
