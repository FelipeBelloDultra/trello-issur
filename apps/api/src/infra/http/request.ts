import { Request } from "express";

export function resolveRoutePath(req: Request): string {
  const route: unknown = req.route;
  if (
    route !== null &&
    typeof route === "object" &&
    "path" in route &&
    typeof route.path === "string"
  ) {
    return route.path;
  }
  return req.path;
}
