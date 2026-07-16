import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";

import { logger } from "@/infra/logger";

import { Middleware } from "../contracts/middleware";

type MiddlewareHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

interface RequestMeta {
  id: string;
  start: number;
}

const requestMeta = new WeakMap<Request, RequestMeta>();

@injectable()
export class LoggerMiddleware implements Middleware<void> {
  public handle(): MiddlewareHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
      const id = crypto.randomUUID();
      requestMeta.set(req, { id, start: Date.now() });
      logger.info({ requestId: id, method: req.method, url: req.url }, "request");

      res.on("finish", () => {
        const meta = requestMeta.get(req);
        logger.info(
          {
            requestId: meta?.id,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: meta !== undefined ? Date.now() - meta.start : undefined,
          },
          "response",
        );
        requestMeta.delete(req);
      });

      next();
    };
  }
}
