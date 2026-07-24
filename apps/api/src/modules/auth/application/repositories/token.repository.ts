export type SaveTokenOptions = {
  accountId: string;
  refreshToken: string;
  ttlSeconds: number;
};

export interface TokenRepository {
  save(options: SaveTokenOptions): Promise<void>;
  matches(accountId: string, refreshToken: string): Promise<boolean>;
  delete(accountId: string): Promise<void>;
}
