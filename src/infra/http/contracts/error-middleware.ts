import { ErrorRequestHandler } from "express";

export interface ErrorMiddleware {
  handle(): ErrorRequestHandler;
}
