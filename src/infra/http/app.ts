import { node } from "@elysiajs/node";
import { Elysia } from "elysia";

export const createApp = () =>
  new Elysia({ adapter: node() }).get("/health", () => ({ status: "ok" }));
