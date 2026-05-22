import "reflect-metadata";

import { setupAuthModule } from "@/modules/auth/infra/container";
import { setupUserModule } from "@/modules/user/infra/container";

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
setupUserModule();
setupAuthModule();
