import { Elysia } from "elysia";

import { httpRequestDurationSeconds, httpRequestsTotal, registry } from "@/infra/metrics";

const requestStart = new WeakMap<Request, number>();

function record(method: string, route: string, status: number, start: number | undefined): void {
  const labels = { method, route, status_code: String(status) };
  httpRequestsTotal.inc(labels);
  if (start !== undefined) {
    httpRequestDurationSeconds.observe(labels, (Date.now() - start) / 1000);
  }
}

export const metricsPlugin = new Elysia({ name: "metrics" })
  .get("/metrics", async ({ set }) => {
    set.headers["content-type"] = registry.contentType;
    return registry.metrics();
  })
  .onRequest(({ request }) => {
    requestStart.set(request, Date.now());
  })
  .onAfterHandle({ as: "global" }, ({ request, set, route }) => {
    record(request.method, route, Number(set.status ?? 200), requestStart.get(request));
    requestStart.delete(request);
  })
  .onError({ as: "global" }, ({ request, set, route }) => {
    record(request.method, route, Number(set.status ?? 500), requestStart.get(request));
    requestStart.delete(request);
  });
