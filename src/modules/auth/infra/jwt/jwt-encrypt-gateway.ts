import { injectable } from "inversify";
import { jwtVerify, SignJWT } from "jose";

import { env } from "@/config/env";
import { TokenClaims } from "@/modules/auth/domain/value-objects/token-claims";
import { TokenPair } from "@/modules/auth/domain/value-objects/token-pair";

import { EncryptGateway } from "../../application/gateways/encrypt.gateway";

const secret = new TextEncoder().encode(env.JWT_SECRET);

@injectable()
export class JwtEncryptGateway implements EncryptGateway {
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

  public async verifyAccessToken(token: string): Promise<TokenClaims | null> {
    try {
      const { payload } = await jwtVerify(token, secret);
      return TokenClaims.create(String(payload.sub), String(payload["email"]));
    } catch {
      return null;
    }
  }

  public async verifyRefreshToken(token: string): Promise<TokenClaims | null> {
    try {
      const { payload } = await jwtVerify(token, secret);
      return TokenClaims.create(String(payload.sub), String(payload["email"]));
    } catch {
      return null;
    }
  }
}
