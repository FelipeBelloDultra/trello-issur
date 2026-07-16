import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { injectable } from "tsyringe";

import { env } from "@/config/env";
import {
  StorageGateway,
  UploadFileOptions,
} from "@/shared/storage/application/gateways/storage.gateway";

import { StorageLifecycle } from "../../contracts/storage-lifecycle";

@injectable()
export class LocalStorageGateway implements StorageGateway, StorageLifecycle {
  public async initialize(): Promise<void> {
    await mkdir(env.STORAGE_LOCAL_PATH, { recursive: true });
  }

  public async upload(options: UploadFileOptions): Promise<{ url: string }> {
    const dest = path.join(env.STORAGE_LOCAL_PATH, options.key);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, options.buffer);
    return { url: `${env.STORAGE_LOCAL_BASE_URL}/${options.key}` };
  }

  public getPublicUrl(key: string): string {
    return `${env.STORAGE_LOCAL_BASE_URL}/${key}`;
  }

  public async delete(key: string): Promise<void> {
    await unlink(path.join(env.STORAGE_LOCAL_PATH, key));
  }

  public getSignedUrl(key: string, _expiresInSeconds: number): Promise<string> {
    return Promise.resolve(`${env.STORAGE_LOCAL_BASE_URL}/${key}`);
  }
}
