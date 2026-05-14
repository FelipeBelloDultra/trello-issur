import "reflect-metadata";

import { Container } from "inversify";

import { setupUserContainerModule } from "@/modules/user/infra/container";

import { setupDatabaseContainer } from "../db/container";

export const container = new Container();

container.load(setupDatabaseContainer, setupUserContainerModule);
