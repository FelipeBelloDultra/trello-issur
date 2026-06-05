import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";

import { Pagination } from "@/core/entity/pagination";

import { Middleware } from "../contracts/middleware";

type MiddlewareHandler = (req: Request, res: Response, next: NextFunction) => void;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@injectable()
export class PaginationMiddleware implements Middleware {
  public handle(): MiddlewareHandler {
    return (req: Request, _res: Response, next: NextFunction): void => {
      const rawPage = Number(req.query.page);
      const rawLimit = Number(req.query.limit);

      const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : DEFAULT_PAGE;
      const limit =
        Number.isFinite(rawLimit) && rawLimit >= 1
          ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
          : DEFAULT_LIMIT;

      req.pagination = Pagination.create({ page, limit });

      next();
    };
  }
}
