import { Request, RequestHandler, Response } from "express";

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export interface Controller {
  readonly path: string;
  readonly method: HttpMethod;
  readonly middlewares: RequestHandler[];
  handler(req: Request, res: Response): Promise<Response>;
}
