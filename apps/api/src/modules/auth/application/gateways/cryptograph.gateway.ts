import { TokenClaims } from "@/modules/auth/domain/value-objects/token-claims";
import { TokenPair } from "@/modules/auth/domain/value-objects/token-pair";

export interface CryptographGateway {
  generatePair(claims: TokenClaims): Promise<TokenPair>;
  verify(token: string): Promise<TokenClaims | null>;
}
