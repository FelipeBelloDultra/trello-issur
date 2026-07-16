import { randomUUID } from "node:crypto";
import path from "node:path";

import { env } from "@/config/env";

export class StorageUrlService {
  public static buildKey(prefix: string, originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    const base = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    return `${prefix}/${randomUUID()}-${base}${ext}`;
  }

  public static resolve(key: string | null): string | null {
    if (!key) return null;

    if (env.STORAGE_DRIVER === "s3") {
      return env.S3_PUBLIC_URL ? `${env.S3_PUBLIC_URL}/${key}` : null;
    }

    return `${env.STORAGE_LOCAL_BASE_URL}/${key}`;
  }
}
