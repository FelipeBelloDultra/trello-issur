export type SaveTokenOptions = {
  accountId: string;
  refreshToken: string;
  ttlSeconds: number;
};

export interface TokenRepository {
  save(options: SaveTokenOptions): Promise<void>;
  find(accountId: string): Promise<string | null>;
  delete(accountId: string): Promise<void>;
}
