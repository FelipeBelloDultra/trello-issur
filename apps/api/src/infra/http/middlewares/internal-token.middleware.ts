import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";

import { env } from "@/config/env";
import { safeEqualHex } from "@/core/utils/hash";

import { Middleware } from "../contracts/middleware";
import { HttpException } from "../http-exception";

const INTERNAL_TOKEN_HEADER = "x-internal-token";

@injectable()
export class InternalTokenMiddleware implements Middleware {
  public handle() {
    return (req: Request, _res: Response, next: NextFunction): void => {
      const token = req.headers[INTERNAL_TOKEN_HEADER];

      if (typeof token !== "string" || !safeEqualHex(token, env.QUEUE_ADMIN_TOKEN)) {
        throw new HttpException({ statusCode: 401, message: "Missing or invalid internal token" });
      }

      next();
    };
  }
}
