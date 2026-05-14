import { TokenRepository } from "@/modules/auth/application/repositories/token-repository";

export class InMemoryTokenRepository implements TokenRepository {
  public items: Map<string, string> = new Map();

  public save(userId: string, refreshToken: string, _ttlSeconds: number): Promise<void> {
    this.items.set(userId, refreshToken);
    return Promise.resolve();
  }

  public find(userId: string): Promise<string | null> {
    return Promise.resolve(this.items.get(userId) ?? null);
  }

  public delete(userId: string): Promise<void> {
    this.items.delete(userId);
    return Promise.resolve();
  }
}
