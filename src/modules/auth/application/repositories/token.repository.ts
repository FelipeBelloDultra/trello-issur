export interface TokenRepository {
  save(accountId: string, refreshToken: string, ttlSeconds: number): Promise<void>;
  find(accountId: string): Promise<string | null>;
  delete(accountId: string): Promise<void>;
}
