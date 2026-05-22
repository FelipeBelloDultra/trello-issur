import { Request, RequestHandler, Response, Router } from "express";

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export interface Controller {
  readonly path: string;
  readonly method: HttpMethod;
  readonly middlewares: RequestHandler[];
  handler(req: Request, res: Response): Promise<Response>;
}

export function registerController(router: Router, ctrl: Controller): void {
  router[ctrl.method](ctrl.path, ...ctrl.middlewares, (req, res) => ctrl.handler(req, res));
}
