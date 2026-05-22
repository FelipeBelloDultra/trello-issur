import "dotenv/config";

import { App } from "./infra/http/app";

void new App().boot();
