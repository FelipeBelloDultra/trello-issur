import { jwtVerify, SignJWT } from "jose";
import { injectable } from "tsyringe";

import { env } from "@/config/env";
import { TokenClaims } from "@/modules/auth/domain/value-objects/token-claims";
import { TokenPair } from "@/modules/auth/domain/value-objects/token-pair";

import { CryptographGateway } from "../../application/gateways/cryptograph.gateway";

const secret = new TextEncoder().encode(env.JWT_SECRET);

interface SignToken {
  sub: string;
  issuedAt: Date | string | number;
  expirationTime: Date | string | number;
  claims: {
    [key: string]: unknown;
  };
}

@injectable()
export class JwtCryptographGateway implements CryptographGateway {
  private async signToken({ claims, expirationTime, issuedAt, sub }: SignToken) {
    return new SignJWT(claims)
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(sub)
      .setIssuedAt(issuedAt)
      .setExpirationTime(expirationTime)
      .sign(secret);
  }

  public async generatePair(claims: TokenClaims): Promise<TokenPair> {
    const now = Math.floor(Date.now() / 1000);
    const { email, sub } = claims;

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken({
        claims: { email },
        expirationTime: env.JWT_ACCESS_EXPIRES,
        issuedAt: now,
        sub,
      }),
      this.signToken({
        claims: { email },
        expirationTime: env.JWT_REFRESH_EXPIRES,
        issuedAt: now,
        sub,
      }),
    ]);

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
