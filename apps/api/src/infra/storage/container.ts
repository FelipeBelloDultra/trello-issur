import { container, Lifecycle } from "tsyringe";

import { env } from "@/config/env";
import { InjectionTokens } from "@/infra/container/tokens";
import { StorageGateway } from "@/shared/storage/application/gateways/storage.gateway";

import { LocalStorageGateway } from "./adapters/local/local-storage.gateway";
import { S3StorageGateway } from "./adapters/s3/s3-storage.gateway";
import { StorageLifecycle } from "./contracts/storage-lifecycle";

export function setupStorageContainer(): void {
  const GatewayClass = env.STORAGE_DRIVER === "s3" ? S3StorageGateway : LocalStorageGateway;

  container.register<StorageGateway>(
    InjectionTokens.Storage.Gateway,
    { useClass: GatewayClass },
    { lifecycle: Lifecycle.Singleton },
  );

  container.register<StorageLifecycle>(InjectionTokens.Storage.Lifecycle, {
    useFactory: (c) => c.resolve(InjectionTokens.Storage.Gateway),
  });
}
