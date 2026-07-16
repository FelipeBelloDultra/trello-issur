import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import {
  FindMemberPageOptions,
  StoreMemberPageOptions,
  WorkspaceMemberCacheRepository,
  WorkspaceMemberPage,
} from "@/modules/workspace/application/repositories/workspace-member-cache.repository";
import { CacheRepository } from "@/shared/cache/application/repositories/cache.repository";

const TTL = 60 * 5;

@injectable()
export class ValkeyWorkspaceMemberCacheRepository implements WorkspaceMemberCacheRepository {
  public constructor(
    @inject(InjectionTokens.Cache.Repository)
    private readonly cache: CacheRepository,
  ) {}

  public async findPage(options: FindMemberPageOptions): Promise<WorkspaceMemberPage | null> {
    const raw = await this.cache.get(this.pageKey(options));
    if (!raw) return null;
    return JSON.parse(raw) as WorkspaceMemberPage;
  }

  public async storePage(options: StoreMemberPageOptions): Promise<void> {
    await this.cache.set(this.pageKey(options), JSON.stringify(options.data), TTL);
  }

  public async invalidate(workspaceId: string): Promise<void> {
    await this.cache
      .deleteByPrefix(this.cache.createKey(["workspace", workspaceId, "members"]))
      .catch(() => null);
  }

  private pageKey({ workspaceId, page, limit }: FindMemberPageOptions): string {
    return this.cache.createKey(["workspace", workspaceId, "members", String(page), String(limit)]);
  }
}
