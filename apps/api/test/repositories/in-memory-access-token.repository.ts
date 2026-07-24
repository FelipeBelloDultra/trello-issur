import {
  AccessTokenRepository,
  SaveAccessTokenOptions,
} from "@/modules/auth/application/repositories/access-token.repository";

export class InMemoryAccessTokenRepository implements AccessTokenRepository {
  public items: Map<string, string> = new Map();

  public save({ accountId, accessToken }: SaveAccessTokenOptions): Promise<void> {
    this.items.set(accountId, accessToken);
    return Promise.resolve();
  }

  public matches(accountId: string, accessToken: string): Promise<boolean> {
    return Promise.resolve(this.items.get(accountId) === accessToken);
  }

  public delete(accountId: string): Promise<void> {
    this.items.delete(accountId);
    return Promise.resolve();
  }
}
