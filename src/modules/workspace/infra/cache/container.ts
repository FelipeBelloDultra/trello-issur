import { container, Lifecycle } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import { WorkspaceMemberCacheRepository } from "@/modules/workspace/application/repositories/workspace-member-cache.repository";

import { ValkeyWorkspaceMemberCacheRepository } from "./repositories/valkey-workspace-member-cache.repository";

export function setupCacheWorkspaceContainer(): void {
  container.register<WorkspaceMemberCacheRepository>(
    InjectionTokens.Cache.WorkspaceMember,
    { useClass: ValkeyWorkspaceMemberCacheRepository },
    { lifecycle: Lifecycle.Singleton },
  );
}
