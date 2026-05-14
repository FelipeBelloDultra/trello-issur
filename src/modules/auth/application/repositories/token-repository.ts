export interface TokenRepository {
  save(userId: string, refreshToken: string, ttlSeconds: number): Promise<void>;
  find(userId: string): Promise<string | null>;
  delete(userId: string): Promise<void>;
}
