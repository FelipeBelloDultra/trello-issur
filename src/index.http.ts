import "dotenv/config";

import { env } from "@/config/env";
import { createApp } from "@/infra/http/app";

createApp().listen(env.PORT);
