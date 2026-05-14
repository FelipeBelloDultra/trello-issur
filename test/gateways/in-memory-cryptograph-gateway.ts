import { CryptographGateway } from "@/modules/auth/application/gateways/cryptograph.gateway";
import { TokenClaims } from "@/modules/auth/domain/value-objects/token-claims";
import { TokenPair } from "@/modules/auth/domain/value-objects/token-pair";

export class InMemoryCryptographGateway implements CryptographGateway {
  private counter = 0;

  public generatePair(claims: TokenClaims): Promise<TokenPair> {
    const nonce = ++this.counter;
    const accessToken = `access:${claims.sub}:${claims.email}:${nonce}`;
    const refreshToken = `refresh:${claims.sub}:${claims.email}:${nonce}`;
    return Promise.resolve(TokenPair.create(accessToken, refreshToken));
  }

  public verify(token: string): Promise<TokenClaims | null> {
    const parts = token.split(":");
    if (parts.length !== 4) return Promise.resolve(null);
    const [, sub, email] = parts;
    if (!sub || !email) return Promise.resolve(null);
    return Promise.resolve(TokenClaims.create(sub, email));
  }
}
