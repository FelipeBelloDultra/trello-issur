import { NextFunction, Request, Response } from "express";
import { injectable } from "tsyringe";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

import { DomainError } from "@/core/errors/domain-error";
import { logger } from "@/infra/logger";

import { ErrorMiddleware } from "../contracts/error-middleware";
import { HttpException } from "../http-exception";
import { HttpMessages } from "../http-messages";

@injectable()
export class ErrorHandlerMiddleware implements ErrorMiddleware {
  public handle() {
    return (err: Error, _req: Request, response: Response, _next: NextFunction): void => {
      if (err instanceof ZodError) {
        response.status(422).json({
          message: HttpMessages.General.ValidationFailed,
          errors: fromZodError(err).details.map((d) => ({
            field: d.path.join("."),
            message: d.message.toLowerCase(),
          })),
        });
        return;
      }

      if (err instanceof HttpException) {
        response.status(err.statusCode).json({ message: err.message });
        return;
      }

      if (err instanceof DomainError) {
        logger.error(
          { err, code: err.code },
          "domain invariant violated — possible data corruption or validation gap",
        );
        response.status(500).json({ message: HttpMessages.General.InternalServerError });
        return;
      }

      logger.error({ err }, "unhandled error");
      response.status(500).json({ message: HttpMessages.General.InternalServerError });
    };
  }
}
