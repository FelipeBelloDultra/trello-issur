import { TokenClaims } from "@/modules/auth/domain/value-objects/token-claims";
import { TokenPair } from "@/modules/auth/domain/value-objects/token-pair";

export interface EncryptGateway {
  generatePair(claims: TokenClaims): Promise<TokenPair>;
  verifyAccessToken(token: string): Promise<TokenClaims | null>;
  verifyRefreshToken(token: string): Promise<TokenClaims | null>;
}
