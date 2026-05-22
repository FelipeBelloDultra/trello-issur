import { jwtVerify, SignJWT } from "jose";
import { injectable } from "tsyringe";

import { env } from "@/config/env";
import { TokenClaims } from "@/modules/auth/domain/value-objects/token-claims";
import { TokenPair } from "@/modules/auth/domain/value-objects/token-pair";

import { CryptographGateway } from "../../application/gateways/cryptograph.gateway";

const secret = new TextEncoder().encode(env.JWT_SECRET);

@injectable()
export class JwtCryptographGateway implements CryptographGateway {
  public async generatePair(claims: TokenClaims): Promise<TokenPair> {
    const now = Math.floor(Date.now() / 1000);

    const accessToken = await new SignJWT({ email: claims.email })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(claims.sub)
      .setIssuedAt(now)
      .setExpirationTime(env.JWT_ACCESS_EXPIRES)
      .sign(secret);

    const refreshToken = await new SignJWT({ email: claims.email })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(claims.sub)
      .setIssuedAt(now)
      .setExpirationTime(env.JWT_REFRESH_EXPIRES)
      .sign(secret);

    return TokenPair.create(accessToken, refreshToken);
  }

  public async verify(token: string): Promise<TokenClaims | null> {
    try {
      const { payload } = await jwtVerify(token, secret);
      return TokenClaims.create(String(payload.sub), String(payload["email"]));
    } catch {
      return null;
    }
  }
}
