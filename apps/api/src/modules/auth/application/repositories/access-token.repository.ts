export type SaveAccessTokenOptions = {
  accountId: string;
  accessToken: string;
  ttlSeconds: number;
};

export interface AccessTokenRepository {
  save(options: SaveAccessTokenOptions): Promise<void>;
  find(accountId: string): Promise<string | null>;
  delete(accountId: string): Promise<void>;
}
