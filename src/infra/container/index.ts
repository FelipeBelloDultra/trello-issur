import "reflect-metadata";

import { setupAccountModule } from "@/modules/account/infra/container";
import { setupAuthModule } from "@/modules/auth/infra/container";

import { setupBusContainer } from "../bus/container";
import { setupCacheContainer } from "../cache/container";
import { setupDatabaseContainer } from "../db/container";
import { setupMiddlewaresContainer } from "../http/middlewares/container";
import { setupValkeyContainer } from "../valkey/container";

setupValkeyContainer();
setupCacheContainer();
setupDatabaseContainer();
setupMiddlewaresContainer();
setupBusContainer();
setupAccountModule();
setupAuthModule();
