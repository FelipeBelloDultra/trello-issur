export type SaveAccessTokenOptions = {
  accountId: string;
  accessToken: string;
  ttlSeconds: number;
};

export interface AccessTokenRepository {
  save(options: SaveAccessTokenOptions): Promise<void>;
  matches(accountId: string, accessToken: string): Promise<boolean>;
  delete(accountId: string): Promise<void>;
}
