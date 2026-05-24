import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";

import { httpRequestDurationSeconds, httpRequestsTotal } from "@/infra/metrics/adapters/prometheus";

import { Middleware } from "../middleware";
import { resolveRoutePath } from "../request";

type MiddlewareHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

const requestStart = new WeakMap<Request, number>();

@injectable()
export class MetricsMiddleware implements Middleware<void> {
  public handle(): MiddlewareHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
      requestStart.set(req, Date.now());

      res.on("finish", () => {
        const start = requestStart.get(req);
        const route = req.baseUrl + resolveRoutePath(req);
        const labels = { method: req.method, route, status_code: String(res.statusCode) };

        httpRequestsTotal.inc(labels);

        if (start !== undefined) {
          httpRequestDurationSeconds.observe(labels, (Date.now() - start) / 1000);
        }

        requestStart.delete(req);
      });

      next();
    };
  }
}
