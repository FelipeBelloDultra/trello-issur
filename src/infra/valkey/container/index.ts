import { ContainerModule } from "inversify";

import { TOKENS } from "@/infra/container/tokens";

import { valkeyClient } from "../client";

export const setupValkeyContainer = new ContainerModule(({ bind }) => {
  bind(TOKENS.ValkeyClient).toDynamicValue(() => valkeyClient.client);
});
