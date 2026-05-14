import { TokenRepository } from "@/modules/auth/application/repositories/token-repository";

export class InMemoryTokenRepository implements TokenRepository {
  public items: Map<string, string> = new Map();

  public async save(userId: string, refreshToken: string, _ttlSeconds: number): Promise<void> {
    this.items.set(userId, refreshToken);
  }

  public async find(userId: string): Promise<string | null> {
    return this.items.get(userId) ?? null;
  }

  public async delete(userId: string): Promise<void> {
    this.items.delete(userId);
  }
}
