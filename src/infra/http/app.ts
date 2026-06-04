import "../container";

import path from "node:path";

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
import { RabbitMQClient } from "../queue/adapters/rabbitmq/client";
import { StorageLifecycle } from "../storage/contracts/storage-lifecycle";
import { shutdownTracing } from "../tracing/adapters/otel";
import { ValkeyClient } from "../valkey/client";

import { Middleware } from "./contracts/middleware";
import { HttpException } from "./http-exception";
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
  private readonly rabbitMQClient = container.resolve<RabbitMQClient>(InjectionTokens.Queue.Client);

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
    await this.rabbitMQClient.connect();
    await container.resolve<StorageLifecycle>(InjectionTokens.Storage.Lifecycle).initialize();
    this.registerMiddlewares();
  }

  public async stopServices(): Promise<void> {
    await this.rabbitMQClient.disconnect();
    await this.drizzleConnection.disconnect();
    await this.valkeyConnection.disconnect();
    await shutdownTracing();
  }

  private registerRoutes() {
    if (env.STORAGE_DRIVER === "local") {
      this.expressInstance.use(
        "/uploads",
        express.static(path.resolve(env.STORAGE_LOCAL_PATH), { dotfiles: "deny" }),
      );
    }

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
