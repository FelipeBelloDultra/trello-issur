import { inject, injectable } from "tsyringe";

import { InjectionTokens } from "@/infra/container/tokens";
import {
  FindInvitePageOptions,
  StoreInvitePageOptions,
  WorkspaceInviteCacheRepository,
  WorkspaceInvitePage,
} from "@/modules/workspace/application/repositories/workspace-invite-cache.repository";
import { CacheRepository } from "@/shared/cache/application/repositories/cache.repository";

const TTL = 60 * 5;

@injectable()
export class ValkeyWorkspaceInviteCacheRepository implements WorkspaceInviteCacheRepository {
  public constructor(
    @inject(InjectionTokens.Cache.Repository)
    private readonly cache: CacheRepository,
  ) {}

  public async findPage(options: FindInvitePageOptions): Promise<WorkspaceInvitePage | null> {
    const raw = await this.cache.get(this.pageKey(options));
    if (!raw) return null;
    return JSON.parse(raw) as WorkspaceInvitePage;
  }

  public async storePage(options: StoreInvitePageOptions): Promise<void> {
    await this.cache.set(this.pageKey(options), JSON.stringify(options.data), TTL);
  }

  public async invalidate(workspaceId: string): Promise<void> {
    await this.cache
      .deleteByPrefix(this.cache.createKey(["workspace", workspaceId, "invites"]))
      .catch(() => null);
  }

  private pageKey({ workspaceId, page, limit }: FindInvitePageOptions): string {
    return this.cache.createKey(["workspace", workspaceId, "invites", String(page), String(limit)]);
  }
}
