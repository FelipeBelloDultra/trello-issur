import { NextFunction, Request, Response } from "express";

type MiddlewareHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export interface Middleware<HandleData = void> {
  handle(data: HandleData): MiddlewareHandler;
}
