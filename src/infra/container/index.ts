import "reflect-metadata";

import { setupAccountModule } from "@/modules/account/infra/container";
import { setupAuthModule } from "@/modules/auth/infra/container";

import { setupBusContainer } from "../bus/container";
import { setupCacheContainer } from "../cache/container";
import { setupDatabaseContainer } from "../db/container";
import { setupEmailContainer } from "../email/container";
import { setupMiddlewaresContainer } from "../http/middlewares/container";
import { setupQueueContainer } from "../queue/container";
import { setupValkeyContainer } from "../valkey/container";

setupValkeyContainer();
setupCacheContainer();
setupDatabaseContainer();
setupEmailContainer();
setupMiddlewaresContainer();
setupBusContainer();
setupQueueContainer();
setupAccountModule();
setupAuthModule();
