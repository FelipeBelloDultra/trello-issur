import pino, { Logger, TransportSingleOptions } from "pino";

import { env } from "@/config/env";

const transport: TransportSingleOptions | undefined =
  env.NODE_ENV === "development"
    ? { target: "pino-pretty", options: { colorize: true, ignore: "pid,hostname" } }
    : undefined;

export const logger: Logger = pino({ level: env.LOG_LEVEL, transport });
