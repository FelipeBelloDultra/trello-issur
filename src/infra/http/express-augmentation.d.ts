import "express";

import { TokenClaims } from "@/modules/auth/domain/value-objects/token-claims";

declare module "express" {
  interface Request {
    account?: TokenClaims;
  }
}
