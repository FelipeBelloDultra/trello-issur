import "../container";

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { container } from "tsyringe";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

import { env } from "@/config/env";

import { InjectionTokens } from "../container/tokens";
import { DatabaseClient } from "../db/client";
import { shutdownTracing } from "../tracing";
import { ValkeyClient } from "../valkey/client";

import { HttpException } from "./http-exception";
import { Middleware } from "./middleware";
import { Routes } from "./routes";

export class App {
  public readonly expressInstance = express();
  private readonly routes = new Routes();
  private readonly drizzleConnection = container.resolve<DatabaseClient>(
    InjectionTokens.Databases.Drizzle,
  );
  private readonly valkeyConnection = container.resolve<ValkeyClient>(
    InjectionTokens.Databases.Valkey,
  );

  private registerMiddlewares() {
    this.expressInstance.use(express.json());
    this.expressInstance.use(cookieParser());
    this.expressInstance.use(helmet());
    this.expressInstance.use(
      cors({
        origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map((o) => o.trim()),
        credentials: true,
      }),
    );

    const loggerMiddleware = container.resolve<Middleware>(InjectionTokens.Middlewares.Logger);
    const tracingMiddleware = container.resolve<Middleware>(InjectionTokens.Middlewares.Tracing);
    const metricsMiddleware = container.resolve<Middleware>(InjectionTokens.Middlewares.Metrics);

    this.expressInstance.use(loggerMiddleware.handle());
    this.expressInstance.use(tracingMiddleware.handle());
    this.expressInstance.use(metricsMiddleware.handle());

    this.registerRoutes();
    this.setGlobalErrorHandler();
  }

  public async startServices(): Promise<void> {
    this.drizzleConnection.connect();
    this.valkeyConnection.connect();
    this.registerMiddlewares();
    await Promise.resolve();
  }

  public async stopServices(): Promise<void> {
    await this.drizzleConnection.disconnect();
    await this.valkeyConnection.disconnect();
    await shutdownTracing();
  }

  private registerRoutes() {
    this.expressInstance.use("/api", this.routes.router);
  }

  public async boot(): Promise<void> {
    try {
      await this.startServices();

      const server = this.expressInstance.listen(env.HTTP_SERVER_PORT);
      const shutdown = () => {
        server.close(() => {
          this.stopServices().catch(() => process.exit(1));
        });
      };

      process.on("SIGTERM", shutdown);
      process.on("SIGINT", shutdown);
    } catch (err: unknown) {
      await this.stopServices();

      process.stderr.write(`${String(err)}\n`);
      process.exit(1);
    }
  }

  private setGlobalErrorHandler() {
    this.expressInstance.use(
      (err: Error, _req: Request, response: Response, _next: NextFunction) => {
        if (err instanceof ZodError) {
          return response.status(400).json({
            status_code: 400,
            message: "Validation failed",
            errors: fromZodError(err).details,
          });
        }

        if (err instanceof HttpException) {
          return response.status(err.statusCode).json({
            status_code: err.statusCode,
            message: err.message,
            errors: err.errors,
          });
        }

        return response.status(500).json({
          status_code: 500,
          message: "Internal server error",
          errors: [],
        });
      },
    );
  }
}
