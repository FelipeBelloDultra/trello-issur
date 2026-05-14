import "reflect-metadata";

import { Container } from "inversify";

import { setupAuthContainerModule } from "@/modules/auth/infra/container";
import { setupUserContainerModule } from "@/modules/user/infra/container";

import { setupDatabaseContainer } from "../db/container";
import { setupValkeyContainer } from "../valkey/container";

export const container = new Container();

container.load(
  setupDatabaseContainer,
  setupValkeyContainer,
  setupUserContainerModule,
  setupAuthContainerModule,
);
