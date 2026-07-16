import "dotenv/config";

import { QueueApp } from "./infra/queue/app";

void new QueueApp().boot();
