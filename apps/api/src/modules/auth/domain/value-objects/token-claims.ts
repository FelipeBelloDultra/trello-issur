import { ValueObject } from "@/core/entity/value-object";

interface TokenClaimsProps {
  sub: string;
  email: string;
}

export class TokenClaims extends ValueObject<TokenClaimsProps> {
  public get sub(): string {
    return this.props.sub;
  }

  public get email(): string {
    return this.props.email;
  }

  private constructor(props: TokenClaimsProps) {
    super(props);
  }

  public static create(sub: string, email: string): TokenClaims {
    return new TokenClaims({ sub, email });
  }
}
