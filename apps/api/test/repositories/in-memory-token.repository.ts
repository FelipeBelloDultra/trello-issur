import {
  SaveTokenOptions,
  TokenRepository,
} from "@/modules/auth/application/repositories/token.repository";

export class InMemoryTokenRepository implements TokenRepository {
  public items: Map<string, string> = new Map();

  public save({ accountId, refreshToken }: SaveTokenOptions): Promise<void> {
    this.items.set(accountId, refreshToken);
    return Promise.resolve();
  }

  public matches(accountId: string, refreshToken: string): Promise<boolean> {
    return Promise.resolve(this.items.get(accountId) === refreshToken);
  }

  public delete(accountId: string): Promise<void> {
    this.items.delete(accountId);
    return Promise.resolve();
  }
}
