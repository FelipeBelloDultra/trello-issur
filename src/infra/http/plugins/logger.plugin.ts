import { Elysia } from "elysia";

import { logger } from "@/infra/logger";

type RequestMeta = { id: string; start: number };

const requestMeta = new WeakMap<Request, RequestMeta>();

export const loggerPlugin = new Elysia({ name: "logger" })
  .onRequest(({ request }) => {
    const id = crypto.randomUUID();
    requestMeta.set(request, { id, start: Date.now() });
    logger.info({ requestId: id, method: request.method, url: request.url }, "request");
  })
  .onAfterHandle({ as: "global" }, ({ request, set }) => {
    const meta = requestMeta.get(request);
    logger.info(
      {
        requestId: meta?.id,
        method: request.method,
        url: request.url,
        status: set.status,
        duration: meta !== undefined ? Date.now() - meta.start : undefined,
      },
      "response",
    );
    requestMeta.delete(request);
  })
  .onError({ as: "global" }, ({ request, error }) => {
    const meta = requestMeta.get(request);
    logger.error(
      {
        requestId: meta?.id,
        method: request.method,
        url: request.url,
        error:
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : { raw: JSON.stringify(error) },
        duration: meta !== undefined ? Date.now() - meta.start : undefined,
      },
      "error",
    );
    requestMeta.delete(request);
  });
