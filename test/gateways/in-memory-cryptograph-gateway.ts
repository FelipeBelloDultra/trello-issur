import { CryptographGateway } from "@/modules/auth/application/gateways/cryptograph.gateway";
import { TokenClaims } from "@/modules/auth/domain/value-objects/token-claims";
import { TokenPair } from "@/modules/auth/domain/value-objects/token-pair";

export class InMemoryCryptographGateway implements CryptographGateway {
  private counter = 0;

  public async generatePair(claims: TokenClaims): Promise<TokenPair> {
    const nonce = ++this.counter;
    const accessToken = `access:${claims.sub}:${claims.email}:${nonce}`;
    const refreshToken = `refresh:${claims.sub}:${claims.email}:${nonce}`;
    return TokenPair.create(accessToken, refreshToken);
  }

  public async verify(token: string): Promise<TokenClaims | null> {
    const parts = token.split(":");
    if (parts.length !== 4) return null;
    const [, sub, email] = parts;
    if (!sub || !email) return null;
    return TokenClaims.create(sub, email);
  }
}
