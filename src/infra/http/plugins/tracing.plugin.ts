import { context, propagation, Span, SpanKind, SpanStatusCode } from "@opentelemetry/api";
import { Elysia } from "elysia";

import { tracer } from "@/infra/tracing";

const activeSpans = new WeakMap<Request, Span>();

function extractParentContext(request: Request) {
  return propagation.extract(context.active(), {
    get: (_carrier: unknown, key: string) => request.headers.get(key) ?? undefined,
    keys: () => [...request.headers.keys()],
  });
}

export const tracingPlugin = new Elysia({ name: "tracing" })
  .onRequest(({ request }) => {
    const url = new URL(request.url);
    const parentContext = extractParentContext(request);
    const span = tracer.startSpan(
      `${request.method} ${url.pathname}`,
      {
        kind: SpanKind.SERVER,
        attributes: { "http.request.method": request.method, "url.path": url.pathname },
      },
      parentContext,
    );
    activeSpans.set(request, span);
  })
  .onAfterHandle({ as: "global" }, ({ request, set, route }) => {
    const span = activeSpans.get(request);
    if (!span) return;
    const status = Number(set.status ?? 200);
    span.updateName(`${request.method} ${route}`);
    span.setAttributes({ "http.route": route, "http.response.status_code": status });
    span.setStatus({ code: status >= 500 ? SpanStatusCode.ERROR : SpanStatusCode.OK });
    set.headers["x-trace-id"] = span.spanContext().traceId;
    span.end();
    activeSpans.delete(request);
  })
  .onError({ as: "global" }, ({ request, set, route, error }) => {
    const span = activeSpans.get(request);
    if (!span) return;
    const status = Number(set.status ?? 500);
    const routeLabel = route || "/*";
    span.updateName(`${request.method} ${routeLabel}`);
    span.setAttributes({ "http.route": routeLabel, "http.response.status_code": status });
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : undefined,
    });
    if (error instanceof Error) span.recordException(error);
    set.headers["x-trace-id"] = span.spanContext().traceId;
    span.end();
    activeSpans.delete(request);
  });
