import { node } from "@elysiajs/node";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";

export const createApp = () =>
  new Elysia({ adapter: node() }).use(openapi()).get("/health", () => ({ status: "ok" }));
