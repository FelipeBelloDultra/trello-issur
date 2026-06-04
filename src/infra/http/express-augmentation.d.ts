import "express";

import { UploadedFile } from "@/infra/http/middlewares/file-upload.middleware";
import { TokenClaims } from "@/modules/auth/domain/value-objects/token-claims";

declare module "express" {
  interface Request {
    account?: TokenClaims;
    uploadedFile?: UploadedFile;
  }
}
