import { context, propagation, Span, SpanKind, SpanStatusCode } from "@opentelemetry/api";
import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";

import { tracer } from "@/infra/tracing";

import { Middleware } from "../middleware";
import { resolveRoutePath } from "../request";

type MiddlewareHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

const activeSpans = new WeakMap<Request, Span>();

@injectable()
export class TracingMiddleware implements Middleware<void> {
  public handle(): MiddlewareHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
      const parentContext = propagation.extract(context.active(), {
        get: (_c: unknown, key: string) => {
          const val = req.headers[key];
          return Array.isArray(val) ? val[0] : val;
        },
        keys: () => Object.keys(req.headers),
      });

      const span = tracer.startSpan(
        `${req.method} ${req.path}`,
        {
          kind: SpanKind.SERVER,
          attributes: { "http.request.method": req.method, "url.path": req.path },
        },
        parentContext,
      );

      activeSpans.set(req, span);
      res.setHeader("x-trace-id", span.spanContext().traceId);

      res.on("finish", () => {
        const currentSpan = activeSpans.get(req);
        if (!currentSpan) return;

        const route = req.baseUrl + resolveRoutePath(req);
        currentSpan.updateName(`${req.method} ${route}`);
        currentSpan.setAttributes({
          "http.route": route,
          "http.response.status_code": res.statusCode,
        });
        currentSpan.setStatus({
          code: res.statusCode >= 500 ? SpanStatusCode.ERROR : SpanStatusCode.OK,
        });
        currentSpan.end();
        activeSpans.delete(req);
      });

      next();
    };
  }
}
